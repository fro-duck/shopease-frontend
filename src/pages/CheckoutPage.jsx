import Navbar from "../components/Navbar.jsx";
import { useState, useEffect } from "react";
import { cardsAPI } from "../api/index.js";

const T = {
  primary:"#ff6900", primaryHover:"#e55e00", primaryLight:"#fff3ee",
  bg:"#fff8f5", bgGray:"#f5f5f5", border:"#eee",
  text:"#111", textMid:"#444", textMuted:"#888",
  success:"#16a34a", error:"#dc2626", sans:"'Inter','DM Sans',sans-serif",
};

const steps = [{step:1,label:"Cart",done:true},{step:2,label:"Checkout",active:true},{step:3,label:"QR Auth"},{step:4,label:"Confirmed"}];

export default function CheckoutPage({ cart, onNavigate, navProps }) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName]     = useState("");
  const [expiry, setExpiry]         = useState("");
  const [cvv, setCvv]               = useState("");
  const [saveCard, setSaveCard]     = useState(false);
  const [errors, setErrors]         = useState({});
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [paying, setPaying]             = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax      = subtotal * 0.09; // 9% GST
  const total    = subtotal + tax;

  // Fetch saved cards on mount so user can select one instead of entering details manually
  useEffect(() => {
    cardsAPI.getAll().then(res => {
      if (res.success) setSavedCards(res.data);
    });
  }, []);

  const handleSelectSavedCard = (card) => {
    setSelectedCard(card);
    setCardName(card.card_name);
    setExpiry(card.expiry);
    setCardNumber(`**** **** **** ${card.card_last4}`);
  };

  const handleRemoveSavedCard = async (id) => {
    await cardsAPI.remove(id);
    setSavedCards(prev => prev.filter(c => c.id !== id));
    if (selectedCard?.id === id) {
      setSelectedCard(null);
      setCardNumber(""); setCardName(""); setExpiry("");
    }
  };

  const formatCard   = v => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const formatExpiry = v => { const d = v.replace(/\D/g,"").slice(0,4); return d.length >= 3 ? d.slice(0,2)+"/"+d.slice(2) : d; };

  const validate = () => {
    const e = {};
    if (!selectedCard) {
      if (cardNumber.replace(/\s/g,"").length !== 16) e.cardNumber = "Enter a valid 16-digit card number";
      if (!cardName.trim()) e.cardName = "Cardholder name is required";
      if (expiry.length !== 5) {
        e.expiry = "Enter a valid expiry (MM/YY)";
      } else {
        const [mm, yy] = expiry.split("/").map(Number);
        if (mm < 1 || mm > 12) { e.expiry = "Invalid month — must be 01 to 12"; }
        else {
          const now = new Date();
          const cy = now.getFullYear() % 100, cm = now.getMonth() + 1;
          if (yy < cy || (yy === cy && mm < cm)) e.expiry = "This card has expired";
        }
      }
    }
    if (!cvv || cvv.length < 3) e.cvv = "Enter a valid CVV";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    // paying flag prevents double-submission if the user clicks the button twice
    if (paying || !validate()) return;
    setPaying(true);
    const last4 = selectedCard ? selectedCard.card_last4 : cardNumber.replace(/\s/g,"").slice(-4);
    const name  = selectedCard ? selectedCard.card_name  : cardName;

    // Saved card sends a token to the bank server instead of raw card details.
    // saveCard is only set when entering a new card — never for an already-saved card.
    const cardDetails = selectedCard
      ? { card_token: selectedCard.card_token, cvv }
      : { card_number: cardNumber.replace(/\s/g,""), card_name: cardName, expiry_date: expiry, cvv };

    onNavigate("qr", { total, cardLast4: last4, cardName: name, cardDetails, saveCard: saveCard && !selectedCard, expiry, cart });
  };

  const inp = (field) => ({
    width:"100%", padding:"0.8rem 1rem", minHeight:"44px", background:"white",
    border:`1px solid ${errors[field] ? T.error : T.border}`,
    borderRadius:"10px", color:T.text, fontFamily:T.sans, fontSize:"0.9rem", outline:"none",
  });

  return (
    <div style={{ background:T.bg, minHeight:"100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap'); *{margin:0;padding:0;box-sizing:border-box;}`}</style>

      <Navbar {...navProps} />

      {/* Progress */}
      <div style={{ background:"white", borderBottom:`1px solid ${T.border}`, padding:"0.85rem 2rem" }}>
        <div style={{ maxWidth:"700px", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem" }}>
          {steps.map((s, i) => (
            <div key={s.step} style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
                <div style={{ width:"24px", height:"24px", borderRadius:"50%", background: s.done?"#dcfce7": s.active?T.primary:T.bgGray, border:`1px solid ${s.done?"#86efac": s.active?T.primary:T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", fontWeight:700, color: s.done?T.success: s.active?"white":T.textMuted }}>{s.done?"✓":s.step}</div>
                <span className="step-label" style={{ fontFamily:T.sans, fontSize:"0.78rem", color: s.active?T.primary: s.done?T.success:T.textMuted, fontWeight: s.active||s.done?600:400 }}>{s.label}</span>
              </div>
              {i < 3 && <span className="step-separator" style={{ color:T.border }}>──</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="checkout-grid page-container" style={{ maxWidth:"900px", margin:"0 auto", padding:"2.5rem 2rem", display:"grid", gridTemplateColumns:"1fr 300px", gap:"2rem", alignItems:"start" }}>

        {/* Left — Form */}
        <div>
          <div style={{ marginBottom:"1.75rem" }}>
            <p style={{ fontFamily:T.sans, fontSize:"0.72rem", color:T.primary, letterSpacing:"0.12em", fontWeight:600, marginBottom:"0.3rem" }}>PAYMENT DETAILS</p>
            <h1 style={{ fontFamily:T.sans, fontSize:"1.8rem", color:T.text, fontWeight:700 }}>Enter Card Details</h1>
            <p style={{ fontFamily:T.sans, fontSize:"0.85rem", color:T.textMuted, marginTop:"0.4rem" }}>A QR code will appear after submitting for you to scan with your bank app.</p>
          </div>

          {/* Saved Cards */}
          {savedCards.length > 0 && (
            <div style={{ marginBottom:"1.5rem" }}>
              <p style={{ fontFamily:T.sans, fontSize:"0.82rem", color:T.textMid, fontWeight:600, marginBottom:"0.75rem" }}>💳 Saved Cards</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                {savedCards.map(card => (
                  <div key={card.id} style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"0.85rem 1rem", background:"white",
                    border:`2px solid ${selectedCard?.id === card.id ? T.primary : T.border}`,
                    borderRadius:"10px", cursor:"pointer", transition:"all 0.15s",
                  }} onClick={() => handleSelectSavedCard(card)}>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                      <div style={{ width:"36px", height:"36px", background: selectedCard?.id === card.id ? T.primaryLight : T.bgGray, borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem" }}>💳</div>
                      <div>
                        <div style={{ fontFamily:T.sans, fontSize:"0.875rem", fontWeight:600, color:T.text }}>•••• •••• •••• {card.card_last4}</div>
                        <div style={{ fontFamily:T.sans, fontSize:"0.75rem", color:T.textMuted }}>{card.card_name} · {card.expiry}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                      {selectedCard?.id === card.id && <span style={{ fontFamily:T.sans, fontSize:"0.72rem", color:T.primary, fontWeight:600 }}>Selected</span>}
                      <button onClick={e => { e.stopPropagation(); handleRemoveSavedCard(card.id); }} style={{ background:"transparent", border:"none", color:T.textMuted, cursor:"pointer", fontSize:"0.85rem", padding:"0.2rem 0.4rem" }}
                        onMouseEnter={e => e.currentTarget.style.color = T.error}
                        onMouseLeave={e => e.currentTarget.style.color = T.textMuted}
                      >✕</button>
                    </div>
                  </div>
                ))}

                {/* Option to use a different card */}
                {selectedCard && (
                  <button onClick={() => { setSelectedCard(null); setCardNumber(""); setCardName(""); setExpiry(""); }} style={{ background:"transparent", border:`1px dashed ${T.border}`, color:T.textMid, padding:"0.6rem", borderRadius:"10px", fontFamily:T.sans, fontSize:"0.82rem", cursor:"pointer" }}>
                    + Use a different card
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Card preview */}
          {!selectedCard && (
            <>
              <div style={{ background:"linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius:"14px", padding:"1.5rem 1.75rem", marginBottom:"1.75rem", minHeight:"150px", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:"-20px", right:"-20px", width:"100px", height:"100px", borderRadius:"50%", background:"rgba(255,105,0,0.15)" }} />
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"1.25rem" }}>
                  <span style={{ fontSize:"1.6rem" }}>💳</span>
                  <span style={{ fontFamily:T.sans, fontSize:"0.7rem", color:"rgba(255,255,255,0.5)", letterSpacing:"0.1em" }}>CREDIT CARD</span>
                </div>
                <div style={{ fontFamily:T.sans, color:"white", fontSize:"1.1rem", letterSpacing:"0.18em", marginBottom:"1rem" }}>{cardNumber || "•••• •••• •••• ••••"}</div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ fontFamily:T.sans, fontSize:"0.6rem", color:"rgba(255,255,255,0.4)", marginBottom:"0.15rem" }}>CARDHOLDER</div>
                    <div style={{ fontFamily:T.sans, color:"white", fontSize:"0.82rem" }}>{cardName || "YOUR NAME"}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily:T.sans, fontSize:"0.6rem", color:"rgba(255,255,255,0.4)", marginBottom:"0.15rem" }}>EXPIRES</div>
                    <div style={{ fontFamily:T.sans, color:"white", fontSize:"0.82rem" }}>{expiry || "MM/YY"}</div>
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem" }}>
                <div>
                  <label style={{ fontFamily:T.sans, fontSize:"0.8rem", color:T.textMid, marginBottom:"0.4rem", display:"block", fontWeight:500 }}>Card Number</label>
                  <input type="text" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} style={inp("cardNumber")}
                    onFocus={e => e.target.style.borderColor = T.primary} onBlur={e => e.target.style.borderColor = errors.cardNumber ? T.error : T.border} />
                  {errors.cardNumber && <p style={{ fontFamily:T.sans, fontSize:"0.74rem", color:T.error, marginTop:"0.3rem" }}>{errors.cardNumber}</p>}
                </div>
                <div>
                  <label style={{ fontFamily:T.sans, fontSize:"0.8rem", color:T.textMid, marginBottom:"0.4rem", display:"block", fontWeight:500 }}>Cardholder Name</label>
                  <input type="text" placeholder="John Doe" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} style={inp("cardName")}
                    onFocus={e => e.target.style.borderColor = T.primary} onBlur={e => e.target.style.borderColor = errors.cardName ? T.error : T.border} />
                  {errors.cardName && <p style={{ fontFamily:T.sans, fontSize:"0.74rem", color:T.error, marginTop:"0.3rem" }}>{errors.cardName}</p>}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                  <div>
                    <label style={{ fontFamily:T.sans, fontSize:"0.8rem", color:T.textMid, marginBottom:"0.4rem", display:"block", fontWeight:500 }}>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} style={inp("expiry")}
                      onFocus={e => e.target.style.borderColor = T.primary} onBlur={e => e.target.style.borderColor = errors.expiry ? T.error : T.border} />
                    {errors.expiry && <p style={{ fontFamily:T.sans, fontSize:"0.74rem", color:T.error, marginTop:"0.3rem" }}>{errors.expiry}</p>}
                  </div>
                  <div>
                    <label style={{ fontFamily:T.sans, fontSize:"0.8rem", color:T.textMid, marginBottom:"0.4rem", display:"block", fontWeight:500 }}>CVV</label>
                    <input type="password" placeholder="•••" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,"").slice(0,4))} style={inp("cvv")}
                      onFocus={e => e.target.style.borderColor = T.primary} onBlur={e => e.target.style.borderColor = errors.cvv ? T.error : T.border} />
                    {errors.cvv && <p style={{ fontFamily:T.sans, fontSize:"0.74rem", color:T.error, marginTop:"0.3rem" }}>{errors.cvv}</p>}
                  </div>
                </div>

                {/* Save card checkbox */}
                <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", padding:"0.85rem 1rem", background:"white", border:`1px solid ${T.border}`, borderRadius:"10px", cursor:"pointer" }} onClick={() => setSaveCard(!saveCard)}>
                  <div style={{ width:"20px", height:"20px", borderRadius:"5px", border:`2px solid ${saveCard ? T.primary : T.border}`, background: saveCard ? T.primary : "transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s", flexShrink:0 }}>
                    {saveCard && <span style={{ color:"white", fontSize:"0.7rem", fontWeight:800 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontFamily:T.sans, color:T.text, fontSize:"0.875rem", fontWeight:500 }}>Save card for future purchases</div>
                    <div style={{ fontFamily:T.sans, color:T.textMuted, fontSize:"0.75rem" }}>Only last 4 digits stored — never full card number</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* CVV for saved card */}
          {selectedCard && (
            <div style={{ marginTop:"1rem" }}>
              <label style={{ fontFamily:T.sans, fontSize:"0.8rem", color:T.textMid, marginBottom:"0.4rem", display:"block", fontWeight:500 }}>CVV</label>
              <input type="password" placeholder="•••" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,"").slice(0,4))} style={{ ...inp("cvv"), maxWidth:"160px" }}
                onFocus={e => e.target.style.borderColor = T.primary} onBlur={e => e.target.style.borderColor = errors.cvv ? T.error : T.border} />
              {errors.cvv && <p style={{ fontFamily:T.sans, fontSize:"0.74rem", color:T.error, marginTop:"0.3rem" }}>{errors.cvv}</p>}
            </div>
          )}

          {/* Pay button */}
          <button onClick={handlePay} disabled={paying} style={{
            width:"100%", background: paying ? T.bgGray : T.primary, border:"none", color: paying ? T.textMuted : "white",
            padding:"0.95rem", borderRadius:"10px", fontFamily:T.sans, fontSize:"0.95rem", fontWeight:700,
            cursor: paying ? "not-allowed" : "pointer", transition:"all 0.15s", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem", marginTop:"1.5rem",
          }}
            onMouseEnter={e => { if (!paying) { e.currentTarget.style.background = T.primaryHover; e.currentTarget.style.transform = "translateY(-1px)"; }}}
            onMouseLeave={e => { if (!paying) { e.currentTarget.style.background = T.primary; e.currentTarget.style.transform = "translateY(0)"; }}}
          >{paying ? "Redirecting..." : `🔐 Pay $${total.toFixed(2)} — Generate QR Code`}</button>
          <p style={{ fontFamily:T.sans, fontSize:"0.74rem", color:T.textMuted, textAlign:"center", marginTop:"0.75rem" }}>A QR code will appear for you to scan with your bank app.</p>
        </div>

        {/* Right — Summary */}
        <div className="checkout-summary" style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:"16px", padding:"1.5rem", position:"sticky", top:"76px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontFamily:T.sans, color:T.text, fontSize:"1rem", fontWeight:700, marginBottom:"1.25rem" }}>Order Summary</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem", marginBottom:"1rem" }}>
            {cart.map(item => (
              <div key={item.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:"0.5rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.4rem", flex:1, minWidth:0 }}>
                  <span style={{ fontSize:"1rem", flexShrink:0 }}>{item.image_emoji}</span>
                  <span style={{ fontFamily:T.sans, color:T.textMid, fontSize:"0.8rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name} × {item.qty}</span>
                </div>
                <span style={{ fontFamily:T.sans, color:T.text, fontSize:"0.8rem", flexShrink:0 }}>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:"0.75rem", display:"flex", flexDirection:"column", gap:"0.5rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontFamily:T.sans, color:T.textMuted, fontSize:"0.85rem" }}>Subtotal</span>
              <span style={{ fontFamily:T.sans, color:T.text, fontSize:"0.85rem" }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontFamily:T.sans, color:T.textMuted, fontSize:"0.85rem" }}>Tax (9%)</span>
              <span style={{ fontFamily:T.sans, color:T.text, fontSize:"0.85rem" }}>${tax.toFixed(2)}</span>
            </div>
            <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:"0.75rem", display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontFamily:T.sans, color:T.text, fontWeight:700 }}>Total</span>
              <span style={{ fontFamily:T.sans, color:T.primary, fontWeight:700, fontSize:"1.2rem" }}>${total.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ marginTop:"1.25rem", padding:"0.85rem", background:T.primaryLight, border:`1px solid #ffd4b8`, borderRadius:"10px" }}>
            <div style={{ fontFamily:T.sans, fontSize:"0.75rem", color:T.primary, fontWeight:600, marginBottom:"0.35rem" }}>🔐 How QR Auth works</div>
            <div style={{ fontFamily:T.sans, fontSize:"0.72rem", color:T.textMid, lineHeight:1.6 }}>After entering card details, scan the QR with your bank app and approve with biometrics.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
