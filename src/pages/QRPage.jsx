import { useState, useEffect, useRef } from "react";
import { ordersAPI, paymentsAPI, productsAPI, cardsAPI } from "../api/index.js";

const T = {
  primary:"#ff6900", primaryHover:"#e55e00", primaryLight:"#fff3ee",
  bg:"#fff8f5", bgGray:"#f5f5f5", border:"#eee",
  text:"#111", textMid:"#444", textMuted:"#888",
  success:"#16a34a", error:"#dc2626", sans:"'Inter','DM Sans',sans-serif",
};

// QR codes expire after 2 minutes — matched here for the countdown ring
const QR_DURATION = 120;

function CountdownRing({ seconds, total }) {
  const r = 28, c = 2 * Math.PI * r;
  const color = seconds > 15 ? T.success : seconds > 5 ? T.primary : T.error;
  return (
    <div style={{ position:"relative", width:"70px", height:"70px", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <svg width="70" height="70" style={{ position:"absolute", transform:"rotate(-90deg)" }}>
        <circle cx="35" cy="35" r={r} fill="none" stroke={T.border} strokeWidth="4"/>
        <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={c*(1-seconds/total)}
          style={{ transition:"stroke-dashoffset 1s linear, stroke 0.3s" }} strokeLinecap="round"/>
      </svg>
      <div style={{ textAlign:"center", zIndex:1 }}>
        <div style={{ fontFamily:T.sans, fontSize:"1.1rem", fontWeight:700, color, lineHeight:1 }}>{seconds}</div>
        <div style={{ fontFamily:T.sans, fontSize:"0.55rem", color:T.textMuted, marginTop:"1px" }}>SEC</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    LOADING:  { bg:"#f5f5f5",      border:T.border,    color:T.textMuted, icon:"⏳", text:"Generating QR code..." },
    PENDING:  { bg:"#eff6ff",      border:"#bfdbfe",   color:"#3b82f6",   icon:"⏳", text:"Waiting for scan..." },
    SCANNING: { bg:"#fefce8",      border:"#fde047",   color:"#ca8a04",   icon:"🔄", text:"Processing payment..." },
    APPROVED: { bg:"#dcfce7",      border:"#86efac",   color:T.success,   icon:"✅", text:"Transaction approved!" },
    REJECTED: { bg:"#fee2e2",      border:"#fca5a5",   color:T.error,     icon:"❌", text:"Transaction rejected" },
    EXPIRED:  { bg:T.bgGray,       border:T.border,    color:T.textMuted, icon:"⏱️", text:"QR code expired" },
    ERROR:    { bg:"#fee2e2",      border:"#fca5a5",   color:T.error,     icon:"⚠️", text:"Something went wrong" },
  };
  const c = cfg[status] || cfg.PENDING;
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", background:c.bg, border:`1px solid ${c.border}`, borderRadius:"100px", padding:"0.45rem 1rem" }}>
      <span>{c.icon}</span>
      <span style={{ fontFamily:T.sans, fontSize:"0.82rem", color:c.color, fontWeight:600 }}>{c.text}</span>
    </div>
  );
}

const steps = [
  {step:1,label:"Cart",done:true},
  {step:2,label:"Checkout",done:true},
  {step:3,label:"QR Auth",active:true},
  {step:4,label:"Confirmed"}
];

export default function QRPage({ txData, onNavigate, setCart }) {
  const [status, setStatus]         = useState("LOADING");
  const [countdown, setCountdown]   = useState(QR_DURATION);
  const [qrImage, setQrImage]       = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  // refreshCount triggers generateQR via useEffect — incrementing it re-runs QR generation
  const [refreshCount, setRefreshCount]   = useState(0);
  const [attemptCount, setAttemptCount]   = useState(1);
  const MAX_ATTEMPTS = 3;
  const [error, setError]           = useState("");
  const [auditLog, setAuditLog]     = useState([]);
  const [pollErrors, setPollErrors] = useState(0);
  const [slowLoad, setSlowLoad]     = useState(false);
  const timerRef      = useRef(null);
  const pollRef       = useRef(null);
  // Ref instead of state — prevents the save-card API call from firing twice on re-renders
  const cardSavedRef  = useRef(false);
  // Ref mirrors pollErrors state so the interval callback always reads the latest count
  // without needing pollErrors in its dependency array (which would restart the interval)
  const pollErrRef    = useRef(0);
  const slowLoadRef   = useRef(null);

  // Deduplicates by event name — prevents the same step appearing twice in the timeline
  const addLog = (event, detail = "") => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-SG", { hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:true, timeZone:"Asia/Singapore" });
    setAuditLog(prev => {
      if (prev.find(l => l.event === event)) return prev;
      return [...prev, { event, detail, time }];
    });
  };

  const { total=0, cardLast4="••••", cardDetails=null, saveCard=false, expiry="", cardName="", cart=[] } = txData || {};
  // orderId is generated once when the component mounts — stable for the lifetime of this QR session
  const orderId = `SE-${Date.now().toString().slice(-8)}`;

  // ── Generate QR on mount ────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    generateQR();
  }, [refreshCount]);

  const generateQR = async () => {
    setStatus("LOADING");
    setQrImage(null);
    setError("");
    setPollErrors(0);
    setSlowLoad(false);
    pollErrRef.current = 0;
    clearInterval(timerRef.current);
    clearInterval(pollRef.current);
    clearTimeout(slowLoadRef.current);
    cardSavedRef.current = false;

    // Show slow-load message after 12s
    slowLoadRef.current = setTimeout(() => setSlowLoad(true), 12000);

    try {
      if (!cardDetails) {
        setError("Please re-enter your card details to proceed");
        setStatus("ERROR");
        return;
      }

      const res = await paymentsAPI.initiate(
        cardDetails,
        parseFloat(total.toFixed(2)),
        orderId
      );

      if (!res.success) {
        setError(res.message || "Failed to generate QR");
        setStatus("ERROR");
        return;
      }

      // Use expires_at from the bank server to calculate the real remaining time.
      // The bank server is the source of truth — the QR may already be a few seconds
      // old by the time it arrives (Render cold start delay).
      const remaining = res.expires_at
        ? Math.floor((new Date(res.expires_at) - Date.now()) / 1000)
        : QR_DURATION;

      if (remaining <= 0) {
        setError("QR code expired before it could be shown. Please try again.");
        setStatus("ERROR");
        return;
      }

      clearTimeout(slowLoadRef.current);
      setSlowLoad(false);
      setQrImage(res.qr_code);
      // Bank server returns both ids; transaction_id is used for status polling
      setTransactionId(res.transaction_id || res.qr_session_id);

      // cardSavedRef prevents a double-save if generateQR re-runs mid-flow
      if (saveCard && res.card_token && !cardSavedRef.current) {
        cardSavedRef.current = true;
        const last4 = cardDetails.card_number?.slice(-4) || cardLast4;
        cardsAPI.save(last4, cardName, expiry, res.card_token)
          .catch(err => console.log("Card save error:", err));
      }

      setCountdown(remaining);
      setStatus("PENDING");
      setAuditLog([]);
      addLog("QR Generated", `Amount: $${total.toFixed(2)} · Card: ···· ${cardLast4}`);

    } catch (err) {
      setError("Could not reach bank server. Please try again.");
      setStatus("ERROR");
    }
  };

  // ── Countdown timer ─────────────────────────────────────────────────────────
  // Runs only while the QR is active. Re-starts if status changes (e.g. PENDING → SCANNING).
  // Expiry is handled here rather than from the bank server's expires_at to avoid
  // the extra poll roundtrip.
  useEffect(() => {
    if (status !== "PENDING" && status !== "SCANNING") return;
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setStatus("EXPIRED");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [status, transactionId]);

  // ── Poll bank server every 3 seconds ─────────────────────────────────────────
  // Polls ShopEase backend → bank server (server-to-server, avoids CORS).
  // Stops automatically when a terminal status is received (APPROVED/REJECTED/EXPIRED).
  useEffect(() => {
    if (status !== "PENDING" && status !== "SCANNING") return;
    if (!transactionId) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await paymentsAPI.getStatus(transactionId);
        if (!res.success) return;

        const bankStatus = res.status?.toUpperCase();
        // Any successful poll resets the consecutive-error counter
        pollErrRef.current = 0;
        setPollErrors(0);

        if (bankStatus === "APPROVED" || bankStatus === "COMPLETED") {
          clearInterval(pollRef.current);
          clearInterval(timerRef.current);
          addLog("Transaction Approved", "Payment authorised by bank server");
          setStatus("APPROVED");
        } else if (bankStatus === "REJECTED" || bankStatus === "FAILED") {
          clearInterval(pollRef.current);
          clearInterval(timerRef.current);
          addLog("Transaction Rejected", "Cardholder rejected the payment");
          setStatus("REJECTED");
        } else if (bankStatus === "EXPIRED") {
          clearInterval(pollRef.current);
          clearInterval(timerRef.current);
          setStatus("EXPIRED");
        } else if (bankStatus === "SCANNING" || bankStatus === "PROCESSING") {
          if (status !== "SCANNING") {
            addLog("⏳ Processing Payment", "Awaiting authorisation from bank");
          }
          setStatus("SCANNING");
        }
      } catch (err) {
        // Track consecutive failures — show a warning banner after 3 in a row
        // so the user knows their connection dropped (not that the payment failed)
        pollErrRef.current += 1;
        setPollErrors(pollErrRef.current);
        console.log("Status poll error:", err);
      }
    }, 3000);

    return () => clearInterval(pollRef.current);
  }, [status, transactionId]);

  // ── On APPROVED — save order, update stock, send receipt, then navigate ─────
  // All three API calls are fire-and-forget (.catch swallowed) so a receipt failure
  // doesn't block navigation. Cart is cleared immediately so the user can't retry.
  // 1.5s delay gives the success overlay time to animate before navigating away.
  useEffect(() => {
    if (status === "APPROVED") {
      setCart([]);
      ordersAPI.create(total, transactionId, cart).catch(err => console.log("Order save error:", err));
      cart.forEach(item => {
        productsAPI.updateStock(item.id, item.qty).catch(err => console.log("Stock update error:", err));
      });
      try {
        // User object is read from localStorage — not passed as a prop to avoid prop-drilling
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.email) {
          ordersAPI.sendReceipt({
            userEmail: user.email,
            userName: user.name || "",
            orderItems: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty, image_emoji: i.image_emoji })),
            total,
            orderId,
            sessionId: transactionId,
          }).catch(err => console.log("Receipt email error:", err));
        }
      } catch (err) {
        console.log("Receipt setup error:", err);
      }
      setTimeout(() => onNavigate("confirmation", { ...txData, sessionId: transactionId }), 1500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleRefresh = () => {
    clearInterval(timerRef.current);
    clearInterval(pollRef.current);
    setAttemptCount(a => a + 1);
    setRefreshCount(r => r + 1);
  };

  const isExpiredOrRejected = status === "EXPIRED" || status === "REJECTED" || status === "ERROR";
  const isActive = status === "PENDING" || status === "SCANNING";
  const attemptsExhausted = isExpiredOrRejected && attemptCount >= MAX_ATTEMPTS;

  return (
    <div style={{ background:T.bg, minHeight:"100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap'); *{margin:0;padding:0;box-sizing:border-box;}`}</style>

      {/* Navbar */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:"white", borderBottom:`1px solid ${T.border}`, padding:"0 2rem", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
          <div style={{ width:"28px", height:"28px", background:T.primary, borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"white", fontSize:"0.85rem", fontWeight:700, fontFamily:T.sans }}>S</span>
          </div>
          <span style={{ fontFamily:T.sans, fontSize:"1.1rem", fontWeight:700, color:T.text }}>ShopEase</span>
        </div>
        <span style={{ fontFamily:T.sans, fontSize:"0.78rem", color:T.textMuted }}>
          {transactionId ? `TXN: ${transactionId.slice(0,8)}...` : "Generating..."}
        </span>
      </nav>

      {/* Progress */}
      <div style={{ background:"white", borderBottom:`1px solid ${T.border}`, padding:"0.85rem 2rem" }}>
        <div style={{ maxWidth:"700px", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem" }}>
          {steps.map((s, i) => (
            <div key={s.step} style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
                <div style={{ width:"24px", height:"24px", borderRadius:"50%", background: s.done?"#dcfce7": s.active?T.primary:T.bgGray, border:`1px solid ${s.done?"#86efac": s.active?T.primary:T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", fontWeight:700, color: s.done?T.success: s.active?"white":T.textMuted }}>{s.done?"✓":s.step}</div>
                <span style={{ fontFamily:T.sans, fontSize:"0.78rem", color: s.active?T.primary: s.done?T.success:T.textMuted, fontWeight: s.active||s.done?600:400 }}>{s.label}</span>
              </div>
              {i < 3 && <span className="step-separator" style={{ color:T.border }}>──</span>}
            </div>
          ))}
        </div>
      </div>

      {/* #9 — Full-screen success overlay after APPROVED */}
      {status === "APPROVED" && (
        <div style={{
          position:"fixed", inset:0, zIndex:999,
          background:"rgba(255,255,255,0.97)",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1.5rem",
          animation:"fadeIn 0.3s ease",
        }}>
          <style>{`
            @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
            @keyframes scaleIn { from { transform:scale(0.5); opacity:0 } to { transform:scale(1); opacity:1 } }
            @keyframes pulse { 0%,100% { transform:scale(1) } 50% { transform:scale(1.08) } }
          `}</style>
          <div style={{
            width:"100px", height:"100px", borderRadius:"50%",
            background:"#dcfce7", border:"3px solid #86efac",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"3rem",
            animation:"scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.1s both, pulse 1.5s ease 0.5s infinite",
          }}>✅</div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:T.sans, fontSize:"1.6rem", fontWeight:700, color:T.success, marginBottom:"0.4rem" }}>Payment Approved!</div>
            <div style={{ fontFamily:T.sans, fontSize:"0.875rem", color:T.textMuted }}>Redirecting to your order confirmation...</div>
          </div>
          <div style={{ display:"flex", gap:"6px" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width:"8px", height:"8px", borderRadius:"50%", background:T.success,
                animation:`pulse 1s ease ${i*0.2}s infinite`,
              }}/>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth:"700px", margin:"0 auto", padding:"2.5rem 2rem" }}>
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <p style={{ fontFamily:T.sans, fontSize:"0.72rem", color:T.primary, letterSpacing:"0.12em", fontWeight:600, marginBottom:"0.3rem" }}>STEP 3 — QR AUTHORISATION</p>
          <h1 style={{ fontFamily:T.sans, fontSize:"1.8rem", color:T.text, fontWeight:700, marginBottom:"0.5rem" }}>Scan to Authorise Payment</h1>
          <p style={{ fontFamily:T.sans, fontSize:"0.875rem", color:T.textMuted }}>Open your bank app and scan the QR code below to approve the transaction</p>
        </div>

        {/* QR Card */}
        <div style={{ background:"white", border:`1px solid ${status==="APPROVED"?"#86efac": status==="REJECTED"||status==="ERROR"?"#fca5a5":T.border}`, borderRadius:"16px", padding:"2rem", display:"flex", flexDirection:"column", alignItems:"center", gap:"1.5rem", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", transition:"border-color 0.3s" }}>

          <StatusBadge status={status} />

          {/* QR Image */}
          <div style={{ position:"relative" }}>
            {status === "LOADING" ? (
              <div className="qr-placeholder" style={{ width:"200px", height:"200px", background:T.bgGray, borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"1rem" }}>
                <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
                <div style={{
                  width:"44px", height:"44px", borderRadius:"50%",
                  border:`4px solid ${T.border}`,
                  borderTopColor: T.primary,
                  animation:"spin 0.8s linear infinite",
                }}/>
                <div style={{ fontFamily:T.sans, fontSize:"0.78rem", color:T.textMuted, textAlign:"center", padding:"0 1rem" }}>
                  {slowLoad ? "Still connecting to bank server, please wait..." : "Generating QR code..."}
                </div>
              </div>
            ) : qrImage ? (
              <div style={{ position:"relative" }}>
                <img
                  src={qrImage}
                  alt="QR Code"
                  className="qr-image"
                  style={{
                    width:"200px", height:"200px", borderRadius:"12px",
                    filter: isExpiredOrRejected ? "blur(8px)" : "none",
                    opacity: isExpiredOrRejected ? 0.4 : 1,
                    transition:"all 0.3s",
                  }}
                />
                {isExpiredOrRejected && (
                  <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderRadius:"12px" }}>
                    <span style={{ fontSize:"1.75rem", marginBottom:"0.3rem" }}>⏱️</span>
                    <span style={{ fontFamily:T.sans, fontSize:"0.72rem", color:"white", fontWeight:700, background:"rgba(0,0,0,0.65)", padding:"0.25rem 0.6rem", borderRadius:"6px" }}>
                      {status === "EXPIRED" ? "EXPIRED" : status === "ERROR" ? "ERROR" : "REJECTED"}
                    </span>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Countdown + Transaction details */}
          {isActive && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"1rem" }}>
              <CountdownRing seconds={countdown} total={QR_DURATION} />
              <div style={{ fontFamily:T.sans, fontSize:"0.78rem", color: countdown>30?T.textMuted: countdown>10?T.primary:T.error }}>
                {countdown>30 ? "QR code is valid" : countdown>10 ? "⚠️ Expiring soon!" : "🚨 Almost expired!"}
              </div>
            </div>
          )}

          {/* Transaction details */}
          <div style={{ background:T.bgGray, border:`1px solid ${T.border}`, borderRadius:"10px", padding:"1rem", minWidth:"200px", width:"100%", maxWidth:"280px" }}>
            <div style={{ fontFamily:T.sans, fontSize:"0.68rem", color:T.textMuted, letterSpacing:"0.08em", marginBottom:"0.75rem", textTransform:"uppercase" }}>Transaction Details</div>
            {[
              ["Amount",   <span style={{ fontFamily:T.sans, color:T.primary, fontWeight:700 }}>${total.toFixed(2)}</span>],
              ["Card",     `•••• ${cardLast4}`],
              ["Items",    cart.reduce((s,i)=>s+i.qty,0)],
              ["Merchant", "ShopEase"],
              ["Order",    orderId],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", gap:"1rem", marginBottom:"0.35rem" }}>
                <span style={{ fontFamily:T.sans, fontSize:"0.75rem", color:T.textMuted }}>{k}</span>
                <span style={{ fontFamily:T.sans, fontSize:"0.75rem", color:T.text }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Bug #1 fix — poll error warning */}
          {pollErrors >= 3 && isActive && (
            <div style={{ background:"#fef3c7", border:`1px solid #fcd34d`, borderRadius:"8px", padding:"0.75rem 1rem", fontFamily:T.sans, fontSize:"0.82rem", color:"#92400e", textAlign:"center" }}>
              ⚠️ Having trouble connecting to the bank server. Your payment is still pending — please wait.
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{ background:"#fee2e2", border:`1px solid #fca5a5`, borderRadius:"8px", padding:"0.75rem 1rem", fontFamily:T.sans, fontSize:"0.82rem", color:T.error, textAlign:"center" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Expired/Rejected actions */}
          {isExpiredOrRejected && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"0.75rem" }}>
              <p style={{ fontFamily:T.sans, fontSize:"0.85rem", color:T.textMid, textAlign:"center" }}>
                {attemptsExhausted
                  ? "Maximum attempts reached. Please return to cart and try again."
                  : status==="EXPIRED" ? "Your QR code has expired. Generate a new one to continue."
                  : status==="ERROR"   ? "Failed to generate QR. Please try again."
                  : "Transaction was rejected. Try again or return to cart."}
              </p>
              {/* Last attempt warning */}
              {!attemptsExhausted && attemptCount === MAX_ATTEMPTS && (
                <div style={{ background:"#fef3c7", border:"1px solid #fcd34d", borderRadius:"8px", padding:"0.6rem 1rem", fontFamily:T.sans, fontSize:"0.78rem", color:"#92400e", textAlign:"center" }}>
                  ⚠️ Last attempt — if rejected again, you'll need to return to cart.
                </div>
              )}
              <div style={{ display:"flex", gap:"0.75rem", flexWrap:"wrap", justifyContent:"center" }}>
                {!attemptsExhausted && (
                  <button onClick={handleRefresh} style={{ background:T.primary, border:"none", color:"white", padding:"0.7rem 1.5rem", borderRadius:"8px", fontFamily:T.sans, fontSize:"0.875rem", fontWeight:600, cursor:"pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.primaryHover}
                    onMouseLeave={e => e.currentTarget.style.background = T.primary}
                  >🔄 Generate New QR</button>
                )}
                <button onClick={() => onNavigate("cart")} style={{ background:"white", border:`1px solid ${T.border}`, color:T.textMid, padding:"0.7rem 1.5rem", borderRadius:"8px", fontFamily:T.sans, fontSize:"0.875rem", cursor:"pointer" }}>← Return to Cart</button>
              </div>
            </div>
          )}

          {/* Steps instruction */}
          {isActive && (
            <>
              <div style={{ display:"flex", gap:"1.25rem", flexWrap:"wrap", justifyContent:"center" }}>
                {[["1","Open bank app"],["2","Tap Scan QR"],["3","Scan this code"],["4","Approve + biometrics"]].map(([n,t]) => (
                  <div key={n} style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
                    <div style={{ width:"20px", height:"20px", borderRadius:"50%", background:T.primaryLight, border:`1px solid #ffd4b8`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontFamily:T.sans, fontSize:"0.65rem", color:T.primary, fontWeight:700 }}>{n}</span>
                    </div>
                    <span style={{ fontFamily:T.sans, fontSize:"0.75rem", color:T.textMuted }}>{t}</span>
                  </div>
                ))}
              </div>
              {/* Mobile tip — shown only on mobile via CSS */}
              <div className="qr-mobile-tip" style={{ alignItems:"center", gap:"0.5rem", background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:"8px", padding:"0.6rem 0.9rem", marginTop:"0.25rem" }}>
                <span style={{ fontSize:"0.9rem" }}>💡</span>
                <span style={{ fontFamily:T.sans, fontSize:"0.78rem", color:"#3b82f6", fontWeight:500 }}>Tip: screenshot QR then scan from bank app gallery</span>
              </div>
            </>
          )}
        </div>

        {/* Audit Log Timeline */}
        {auditLog.length > 0 && (
          <div style={{ marginTop:"1.5rem", background:"white", border:`1px solid ${T.border}`, borderRadius:"12px", padding:"1.25rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"1rem" }}>
              <span style={{ fontFamily:T.sans, fontSize:"0.78rem", fontWeight:700, color:T.text, letterSpacing:"0.08em" }}>TRANSACTION AUDIT LOG</span>
              <span style={{ fontFamily:T.sans, fontSize:"0.68rem", background:"#dcfce7", color:T.success, padding:"2px 8px", borderRadius:"100px", fontWeight:600 }}>Live</span>
            </div>
            <div style={{ position:"relative", paddingLeft:"24px" }}>
              <div style={{ position:"absolute", left:"7px", top:"10px", bottom:"10px", width:"1.5px", background:T.border }}></div>
              {auditLog.map((log, i) => {
                const isLast = i === auditLog.length - 1;
                const iconMap = {
                  "QR Generated":        "🔐",
                  "Transaction Approved":"✅",
                  "Transaction Rejected":"❌",
                };
                const colorMap = {
                  "Transaction Approved": T.success,
                  "Transaction Rejected": T.error,
                };
                return (
                  <div key={i} style={{ position:"relative", marginBottom: isLast ? 0 : "1rem" }}>
                    <div style={{ position:"absolute", left:"-24px", top:"2px", width:"16px", height:"16px", background: colorMap[log.event] ? colorMap[log.event] : T.primary, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"8px" }}>✓</div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontFamily:T.sans, fontSize:"0.8rem", fontWeight:600, color: colorMap[log.event] || T.text, marginBottom:"2px" }}>
                          {iconMap[log.event] || "•"} {log.event}
                        </div>
                        {log.detail && <div style={{ fontFamily:T.sans, fontSize:"0.72rem", color:T.textMuted }}>{log.detail}</div>}
                      </div>
                      <div style={{ fontFamily:T.sans, fontSize:"0.7rem", color:T.textMuted, whiteSpace:"nowrap", marginLeft:"12px" }}>{log.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
