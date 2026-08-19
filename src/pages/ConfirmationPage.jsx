import Navbar from "../components/Navbar.jsx";
import { useState, useEffect } from "react";

const T = {
  primary:"#ff6900", primaryHover:"#e55e00", primaryLight:"#fff3ee",
  bg:"#fff8f5", bgGray:"#f5f5f5", border:"#eee",
  text:"#111", textMid:"#444", textMuted:"#888",
  success:"#16a34a", error:"#dc2626", sans:"'Inter','DM Sans',sans-serif",
};

const steps = [{step:1,label:"Cart",done:true},{step:2,label:"Checkout",done:true},{step:3,label:"QR Auth",done:true},{step:4,label:"Confirmed",active:true}];

export default function ConfirmationPage({ txData, onNavigate, navProps }) {
  const [animIn, setAnimIn] = useState(false);
  useEffect(() => { setTimeout(() => setAnimIn(true), 100); }, []);

  const { total=0, cardLast4="••••", sessionId="N/A", cart=[] } = txData || {};
  const orderNumber = `SE-${Date.now().toString().slice(-8)}`;
  const orderDate = new Date().toLocaleString("en-SG", { day:"numeric", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit", timeZone: "Asia/Singapore" });

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
                <span style={{ fontFamily:T.sans, fontSize:"0.78rem", color: s.active?T.primary: s.done?T.success:T.textMuted, fontWeight: s.active||s.done?600:400 }}>{s.label}</span>
              </div>
              {i < 3 && <span className="step-separator" style={{ color:T.border }}>──</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="page-container" style={{ maxWidth:"580px", margin:"0 auto", padding:"3rem 2rem", opacity: animIn?1:0, transform: animIn?"translateY(0)":"translateY(20px)", transition:"all 0.6s ease" }}>

        {/* Success */}
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:"#dcfce7", border:`2px solid #86efac`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem", margin:"0 auto 1.25rem", boxShadow:"0 0 30px rgba(22,163,74,0.15)" }}>✅</div>
          <h1 style={{ fontFamily:T.sans, fontSize:"1.8rem", color:T.text, fontWeight:700, marginBottom:"0.5rem" }}>Order Confirmed!</h1>
          <p style={{ fontFamily:T.sans, fontSize:"0.875rem", color:T.textMuted, lineHeight:1.6 }}>Your payment was authorised via QR + biometric authentication.<br/>Your order is now being processed.</p>
        </div>

        {/* Order card */}
        <div style={{ background:"white", border:`1px solid #86efac`, borderRadius:"16px", overflow:"hidden", marginBottom:"1.25rem", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          {/* Header */}
          <div style={{ background:"#f0fdf4", borderBottom:`1px solid #dcfce7`, padding:"1rem 1.5rem", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"0.5rem" }}>
            <div>
              <div style={{ fontFamily:T.sans, fontSize:"0.68rem", color:T.textMuted, letterSpacing:"0.08em", marginBottom:"0.2rem" }}>ORDER NUMBER</div>
              <div style={{ fontFamily:T.sans, fontSize:"0.9rem", color:T.success, fontWeight:700 }}>{orderNumber}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:T.sans, fontSize:"0.68rem", color:T.textMuted, letterSpacing:"0.08em", marginBottom:"0.2rem" }}>DATE & TIME</div>
              <div style={{ fontFamily:T.sans, fontSize:"0.8rem", color:T.textMid }}>{orderDate}</div>
            </div>
          </div>

          {/* Items */}
          <div style={{ padding:"1.25rem 1.5rem", borderBottom:`1px solid ${T.border}` }}>
            <div style={{ fontFamily:T.sans, fontSize:"0.68rem", color:T.textMuted, letterSpacing:"0.08em", marginBottom:"0.75rem" }}>ITEMS ORDERED</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
              {cart.length > 0 ? cart.map(item => (
                <div key={item.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                    <span style={{ fontSize:"1.4rem" }}>{item.image_emoji}</span>
                    <div>
                      <div style={{ fontFamily:T.sans, color:T.text, fontSize:"0.875rem", fontWeight:500 }}>{item.name}</div>
                      <div style={{ fontFamily:T.sans, color:T.textMuted, fontSize:"0.75rem" }}>Qty: {item.qty}</div>
                    </div>
                  </div>
                  <span style={{ fontFamily:T.sans, color:T.text, fontSize:"0.875rem" }}>${(item.price * item.qty).toFixed(2)}</span>
                </div>
              )) : <div style={{ fontFamily:T.sans, color:T.textMuted, fontSize:"0.85rem" }}>Order details recorded</div>}
            </div>
          </div>

          {/* Payment info */}
          <div style={{ padding:"1.25rem 1.5rem", borderBottom:`1px solid ${T.border}` }}>
            <div style={{ fontFamily:T.sans, fontSize:"0.68rem", color:T.textMuted, letterSpacing:"0.08em", marginBottom:"0.75rem" }}>PAYMENT INFO</div>
            {[["Card", `•••• •••• •••• ${cardLast4}`], ["Auth Method", "🔐 QR + Biometric"], ["Session ID", sessionId]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.4rem" }}>
                <span style={{ fontFamily:T.sans, color:T.textMuted, fontSize:"0.85rem" }}>{k}</span>
                <span style={{ fontFamily:T.sans, color:T.text, fontSize:"0.82rem" }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ padding:"1.25rem 1.5rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:T.sans, color:T.text, fontWeight:700 }}>Total Paid</span>
            <span style={{ fontFamily:T.sans, color:T.primary, fontWeight:700, fontSize:"1.3rem" }}>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Security badge */}
        <div style={{ padding:"1rem 1.25rem", background:T.primaryLight, border:`1px solid #ffd4b8`, borderRadius:"10px", marginBottom:"1.5rem", display:"flex", gap:"0.75rem" }}>
          <span style={{ fontSize:"1.1rem", flexShrink:0 }}>🛡️</span>
          <div>
            <div style={{ fontFamily:T.sans, fontSize:"0.78rem", color:T.primary, fontWeight:600, marginBottom:"0.2rem" }}>Secured by Multi-Factor QR Authentication</div>
            <div style={{ fontFamily:T.sans, fontSize:"0.73rem", color:T.textMid, lineHeight:1.5 }}>This transaction was verified using a dynamic one-time QR code + biometric authentication.</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="confirmation-btns" style={{ display:"flex", gap:"0.75rem" }}>
          <button onClick={() => onNavigate("shop")} style={{ flex:1, background:T.primary, border:"none", color:"white", padding:"0.875rem", borderRadius:"10px", fontFamily:T.sans, fontSize:"0.9rem", fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = T.primaryHover; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.primary; e.currentTarget.style.transform = "translateY(0)"; }}
          >🛍️ Continue Shopping</button>
          <button onClick={() => onNavigate("home")} style={{ flex:1, background:"white", border:`1px solid ${T.border}`, color:T.textMid, padding:"0.875rem", borderRadius:"10px", fontFamily:T.sans, fontSize:"0.9rem", cursor:"pointer" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.primary}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
          >🏠 Back to Home</button>
        </div>
      </div>
    </div>
  );
}
