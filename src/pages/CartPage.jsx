import Navbar from "../components/Navbar.jsx";
import { useState } from "react";

const T = {
  primary:"#ff6900", primaryHover:"#e55e00", primaryLight:"#fff3ee",
  bg:"#fff8f5", bgWhite:"#ffffff", bgGray:"#f5f5f5",
  border:"#eee", text:"#111", textMid:"#444", textMuted:"#888",
  success:"#16a34a", error:"#dc2626", sans:"'Inter','DM Sans',sans-serif",
};

function CartItem({ item, onUpdateQty, onRemove, onStockWarning }) {
  const atMax = item.qty >= item.stock;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
      <div className="cart-item-row" style={{ display:"flex", alignItems:"center", gap:"1rem", padding:"1rem", background:"white", border:`1px solid ${T.border}`, borderRadius:"12px", transition:"all 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#ffd4b8"}
        onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
      >
        <div style={{ width:"64px", height:"64px", borderRadius:"10px", background:T.bgGray, overflow:"hidden", flexShrink:0 }}>
          {item.image_url
            ? <img src={item.image_url} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"contain", padding:"4px" }} />
            : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem" }}>{item.image_emoji}</div>
          }
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:T.sans, color:T.text, fontWeight:600, fontSize:"0.9rem", marginBottom:"0.15rem" }}>{item.name}</div>
          <div style={{ fontFamily:T.sans, color:T.textMuted, fontSize:"0.75rem", textTransform:"uppercase", letterSpacing:"0.05em" }}>{item.category}</div>
          <div style={{ fontFamily:T.sans, color:T.textMuted, fontSize:"0.72rem", marginTop:"0.15rem" }}>{item.stock} in stock</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", flexShrink:0 }}>
          {/* Minus button */}
          <button onClick={() => onUpdateQty(item.id, item.qty - 1)} className="cart-qty-btn" style={{ width:"30px", height:"30px", borderRadius:"6px", background:T.bgGray, border:`1px solid ${T.border}`, color:T.text, fontSize:"1rem", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.primary}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
          >−</button>
          <span style={{ fontFamily:T.sans, color:T.text, fontWeight:600, fontSize:"0.9rem", minWidth:"24px", textAlign:"center" }}>{item.qty}</span>
          {/* Plus button — disabled at stock limit */}
          <button
            onClick={() => { if (atMax) { onStockWarning(item.name, item.stock); } else { onUpdateQty(item.id, item.qty + 1); } }}
            className="cart-qty-btn" style={{ width:"30px", height:"30px", borderRadius:"6px", background: atMax ? T.bgGray : T.bgGray, border:`1px solid ${atMax ? "#fca5a5" : T.border}`, color: atMax ? T.error : T.text, fontSize:"1rem", cursor: atMax ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s", opacity: atMax ? 0.6 : 1 }}
          >+</button>
        </div>
        <div style={{ fontFamily:T.sans, color:T.primary, fontSize:"1rem", fontWeight:700, minWidth:"70px", textAlign:"right", flexShrink:0 }}>${(item.price * item.qty).toFixed(2)}</div>
        <button onClick={() => onRemove(item.id)} style={{ background:"transparent", border:"none", color:T.textMuted, cursor:"pointer", fontSize:"1rem", padding:"0.3rem", transition:"color 0.15s", flexShrink:0 }}
          onMouseEnter={e => e.currentTarget.style.color = T.error}
          onMouseLeave={e => e.currentTarget.style.color = T.textMuted}
        >✕</button>
      </div>
      {/* Stock warning inline */}
      {atMax && (
        <div style={{ fontFamily:T.sans, fontSize:"0.75rem", color:T.error, paddingLeft:"0.5rem", display:"flex", alignItems:"center", gap:"0.3rem" }}>
          ⚠️ Max quantity reached — only {item.stock} in stock
        </div>
      )}
    </div>
  );
}

function Toast({ message, visible }) {
  return (
    <div style={{ position:"fixed", bottom:"2rem", right:"2rem", zIndex:9999, background:T.error, color:"white", padding:"0.75rem 1.25rem", borderRadius:"8px", fontFamily:T.sans, fontSize:"0.875rem", fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,0.15)", transform: visible?"translateY(0)":"translateY(80px)", opacity: visible?1:0, transition:"all 0.3s ease", pointerEvents:"none" }}>
      ✕ {message}
    </div>
  );
}

export default function CartPage({ cart, setCart, onNavigate, user, navProps }) {
  const [toast, setToast] = useState({ visible: false, message: "" });
  const showToast = (msg) => { setToast({ visible: true, message: msg }); setTimeout(() => setToast({ visible: false, message: "" }), 2000); };

  // Treat qty 0 or below as a remove action so the minus button doubles as remove
  const handleUpdateQty = (id, newQty) => {
    if (newQty <= 0) { handleRemove(id); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: newQty } : i));
  };
  const handleRemove = (id) => {
    const item = cart.find(i => i.id === id);
    setCart(prev => prev.filter(i => i.id !== id));
    showToast(`${item?.name} removed`);
  };
  const handleClearCart = () => { setCart([]); showToast("Cart cleared"); };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * 0.09;
  const total = subtotal + tax;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div style={{ background:T.bg, minHeight:"100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap'); *{margin:0;padding:0;box-sizing:border-box;}`}</style>

      <Navbar {...navProps} />

      {/* Progress */}
      <div style={{ background:"white", borderBottom:`1px solid ${T.border}`, padding:"0.85rem 2rem" }}>
        <div style={{ maxWidth:"700px", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem" }}>
          {[{step:1,label:"Cart",active:true},{step:2,label:"Checkout"},{step:3,label:"QR Auth"},{step:4,label:"Confirmed"}].map((s, i) => (
            <div key={s.step} style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.35rem" }}>
                <div style={{ width:"24px", height:"24px", borderRadius:"50%", background: s.active ? T.primary : T.bgGray, border:`1px solid ${s.active ? T.primary : T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.7rem", fontWeight:700, color: s.active ? "white" : T.textMuted }}>{s.step}</div>
                <span style={{ fontFamily:T.sans, fontSize:"0.78rem", color: s.active ? T.primary : T.textMuted, fontWeight: s.active ? 600 : 400 }}>{s.label}</span>
              </div>
              {i < 3 && <span className="step-separator" style={{ color:T.border, fontSize:"0.8rem" }}>──</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="page-container" style={{ maxWidth:"1000px", margin:"0 auto", padding:"2.5rem 2rem" }}>
        <div style={{ marginBottom:"1.75rem" }}>
          <p style={{ fontFamily:T.sans, fontSize:"0.72rem", color:T.primary, letterSpacing:"0.12em", fontWeight:600, marginBottom:"0.3rem" }}>REVIEW ORDER</p>
          <h1 style={{ fontFamily:T.sans, fontSize:"1.8rem", color:T.text, fontWeight:700 }}>Your Cart {cartCount > 0 && <span style={{ fontSize:"1.1rem", color:T.textMuted, fontWeight:400 }}>({cartCount} {cartCount === 1 ? "item" : "items"})</span>}</h1>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign:"center", padding:"6rem 2rem" }}>
            <div style={{ fontSize:"4rem", marginBottom:"1.5rem" }}>🛒</div>
            <div style={{ fontFamily:T.sans, color:T.text, fontSize:"1.4rem", fontWeight:700, marginBottom:"0.75rem" }}>Your cart is empty</div>
            <div style={{ fontFamily:T.sans, color:T.textMuted, fontSize:"0.9rem", marginBottom:"2rem" }}>Add some products to get started</div>
            <button onClick={() => onNavigate("shop")} style={{ background:T.primary, border:"none", color:"white", padding:"0.8rem 2rem", borderRadius:"8px", fontFamily:T.sans, fontSize:"0.95rem", fontWeight:600, cursor:"pointer" }}>Browse Products</button>
          </div>
        ) : (
          <div className="cart-grid" style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:"2rem", alignItems:"start" }}>
            {/* Cart items */}
            <div>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem", marginBottom:"1rem" }}>
                {cart.map(item => <CartItem key={item.id} item={item} onUpdateQty={handleUpdateQty} onRemove={handleRemove} onStockWarning={(name, stock) => showToast(`Only ${stock} in stock for ${name}`)} />)}
              </div>
              <button onClick={handleClearCart} style={{ background:"transparent", border:`1px solid #fecaca`, color:T.error, padding:"0.4rem 1rem", borderRadius:"6px", fontFamily:T.sans, fontSize:"0.8rem", cursor:"pointer" }}>Clear Cart</button>
            </div>

            {/* Summary */}
            <div className="checkout-summary" style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:"16px", padding:"1.5rem", position:"sticky", top:"76px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
              <h2 style={{ fontFamily:T.sans, color:T.text, fontSize:"1rem", fontWeight:700, marginBottom:"1.25rem" }}>Order Summary</h2>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem", marginBottom:"1rem" }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontFamily:T.sans, color:T.textMid, fontSize:"0.82rem" }}>{item.name} × {item.qty}</span>
                    <span style={{ fontFamily:T.sans, color:T.text, fontSize:"0.82rem" }}>${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:"0.75rem", display:"flex", flexDirection:"column", gap:"0.5rem", marginBottom:"1.25rem" }}>
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
              <button onClick={() => onNavigate("checkout")} style={{ width:"100%", background:T.primary, border:"none", color:"white", padding:"0.9rem", borderRadius:"10px", fontFamily:T.sans, fontSize:"0.95rem", fontWeight:700, cursor:"pointer", transition:"all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = T.primaryHover; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.primary; e.currentTarget.style.transform = "translateY(0)"; }}
              >Proceed to Checkout →</button>
              <div style={{ display:"flex", alignItems:"center", gap:"0.4rem", justifyContent:"center", marginTop:"0.85rem" }}>
                <span style={{ fontSize:"0.75rem" }}>🔐</span>
                <span style={{ fontFamily:T.sans, color:T.textMuted, fontSize:"0.72rem" }}>Secured with QR + Biometric Auth</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
