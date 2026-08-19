import Navbar from "../components/Navbar.jsx";
import { useState, useEffect } from "react";
import { productsAPI } from "../api/index.js";

const T = {
  primary:"#ff6900", primaryHover:"#e55e00", primaryLight:"#fff3ee",
  bg:"#fff8f5", bgGray:"#f5f5f5", border:"#eee",
  text:"#111", textMid:"#444", textMuted:"#888",
  success:"#16a34a", error:"#dc2626", sans:"'Inter','DM Sans',sans-serif",
};

export default function ProductDetailPage({ productId, cart, setCart, onNavigate, user, navProps }) {
  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [qty, setQty]             = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded]         = useState(false);
  const [toast, setToast]         = useState({ visible: false, message: "" });

  useEffect(() => {
    productsAPI.getById(productId)
      .then(res => { if (res.success) setProduct(res.data); })
      .finally(() => setLoading(false));
  }, [productId]);

  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: "" }), 2000);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) { onNavigate("login"); return; }
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      // Cap quantity at available stock so the cart never exceeds what's in Supabase
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: Math.min(i.qty + qty, product.stock) } : i);
      return [...prev, { ...product, qty }];
    });
    setAdded(true);
    showToast(`${product.name} added to cart!`);
    setTimeout(() => setAdded(false), 1500);
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const inCart = cart.find(i => i.id === product?.id);

  if (loading) return (
    <div style={{ background:T.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:T.sans, color:T.textMuted, fontSize:"0.9rem" }}>Loading product...</div>
    </div>
  );

  if (!product) return (
    <div style={{ background:T.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>😕</div>
        <div style={{ fontFamily:T.sans, color:T.textMid, marginBottom:"1rem" }}>Product not found</div>
        <button onClick={() => onNavigate("shop")} style={{ background:T.primary, border:"none", color:"white", padding:"0.7rem 1.5rem", borderRadius:"8px", fontFamily:T.sans, cursor:"pointer" }}>Back to Shop</button>
      </div>
    </div>
  );

  const images = [product.image_url, product.image_url, product.image_url];
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div style={{ background:T.bg, minHeight:"100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap'); *{margin:0;padding:0;box-sizing:border-box;}`}</style>

      <Navbar {...navProps} />

      {/* Breadcrumb */}
      <div style={{ background:"white", borderBottom:`1px solid ${T.border}`, padding:"0.6rem 2rem" }}>
        <div style={{ maxWidth:"1000px", margin:"0 auto", display:"flex", alignItems:"center", gap:"0.4rem" }}>
          <span onClick={() => onNavigate("home")} style={{ fontFamily:T.sans, fontSize:"0.78rem", color:T.textMuted, cursor:"pointer" }}>Home</span>
          <span style={{ color:T.border }}>›</span>
          <span onClick={() => onNavigate("shop")} style={{ fontFamily:T.sans, fontSize:"0.78rem", color:T.textMuted, cursor:"pointer" }}>Shop</span>
          <span style={{ color:T.border }}>›</span>
          <span style={{ fontFamily:T.sans, fontSize:"0.78rem", color:T.primary }}>{product.name}</span>
        </div>
      </div>

      {/* Content */}
      <div className="product-detail-grid" style={{ maxWidth:"1000px", margin:"0 auto", padding:"2rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2.5rem", alignItems:"start" }}>

        {/* Left — Image Slider */}
        <div>
          {/* Main image */}
          <div style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:"14px", padding:"2rem", display:"flex", alignItems:"center", justifyContent:"center", height:"320px", marginBottom:"0.75rem", overflow:"hidden", position:"relative" }}>
            {product.image_url
              ? <img src={product.image_url} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"contain" }} />
              : <div style={{ fontSize:"6rem" }}>{product.image_emoji}</div>
            }
            {/* Nav arrows */}
            <button onClick={() => setActiveImg(prev => prev === 0 ? 2 : prev - 1)} style={{ position:"absolute", left:"10px", top:"50%", transform:"translateY(-50%)", background:"white", border:`1px solid ${T.border}`, borderRadius:"50%", width:"32px", height:"32px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:"0.85rem" }}>‹</button>
            <button onClick={() => setActiveImg(prev => prev === 2 ? 0 : prev + 1)} style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", background:"white", border:`1px solid ${T.border}`, borderRadius:"50%", width:"32px", height:"32px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:"0.85rem" }}>›</button>
          </div>

          {/* Thumbnails */}
          <div style={{ display:"flex", gap:"0.6rem" }}>
            {images.map((img, i) => (
              <div key={i} onClick={() => setActiveImg(i)} style={{ width:"80px", height:"80px", background:"white", border:`2px solid ${activeImg===i ? T.primary : T.border}`, borderRadius:"10px", cursor:"pointer", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", transition:"border-color 0.15s" }}>
                {img
                  ? <img src={img} alt={`view ${i+1}`} style={{ width:"100%", height:"100%", objectFit:"contain", padding:"6px" }} />
                  : <div style={{ fontSize:"1.5rem" }}>{product.image_emoji}</div>
                }
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          <div style={{ display:"flex", gap:"6px", justifyContent:"center", marginTop:"0.75rem" }}>
            {images.map((_, i) => (
              <div key={i} onClick={() => setActiveImg(i)} style={{ width: activeImg===i?"20px":"8px", height:"8px", background: activeImg===i?T.primary:T.border, borderRadius:"100px", cursor:"pointer", transition:"all 0.2s" }} />
            ))}
          </div>
        </div>

        {/* Right — Product Info */}
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          {/* Tags */}
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
            {product.tag && (
              <span style={{ fontFamily:T.sans, fontSize:"0.7rem", background: product.tag==="Sale"?"#fee2e2": product.tag==="New"?"#dcfce7":T.primaryLight, color: product.tag==="Sale"?T.error: product.tag==="New"?T.success:T.primary, padding:"0.2rem 0.6rem", borderRadius:"100px", fontWeight:600 }}>{product.tag}</span>
            )}
            <span style={{ fontFamily:T.sans, fontSize:"0.7rem", background: isOutOfStock?"#fee2e2": isLowStock?"#fef9c3":"#dcfce7", color: isOutOfStock?T.error: isLowStock?"#854d0e":T.success, padding:"0.2rem 0.6rem", borderRadius:"100px", fontWeight:600 }}>
              {isOutOfStock ? "Out of Stock" : isLowStock ? `Only ${product.stock} left!` : "In Stock"}
            </span>
          </div>

          {/* Name */}
          <h1 style={{ fontFamily:T.sans, fontSize:"1.5rem", fontWeight:700, color:T.text, lineHeight:1.3 }}>{product.name}</h1>

          {/* Category */}
          <div style={{ fontFamily:T.sans, fontSize:"0.75rem", color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.08em" }}>{product.category}</div>

          {/* Price */}
          <div style={{ fontFamily:T.sans, fontSize:"2rem", fontWeight:700, color:T.primary }}>${product.price.toFixed(2)}</div>

          {/* Stock indicator */}
          <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <div style={{ width:"8px", height:"8px", background: isOutOfStock?T.error: isLowStock?"#f59e0b":T.success, borderRadius:"50%" }} />
            <span style={{ fontFamily:T.sans, fontSize:"0.82rem", color:T.textMid }}>{isOutOfStock ? "Out of stock" : `${product.stock} units available`}</span>
          </div>

          <div style={{ borderTop:`1px solid ${T.border}` }} />

          {/* Quantity selector */}
          {!isOutOfStock && (
            <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
              <span style={{ fontFamily:T.sans, fontSize:"0.85rem", color:T.textMid, fontWeight:500 }}>Quantity:</span>
              <div style={{ display:"flex", alignItems:"center", border:`1px solid ${T.border}`, borderRadius:"8px", overflow:"hidden" }}>
                <button onClick={() => setQty(q => Math.max(1, q-1))} style={{ padding:"0.5rem 0.85rem", background:T.bgGray, border:"none", fontSize:"1.1rem", color:T.textMid, cursor:"pointer" }}>−</button>
                <span style={{ padding:"0.5rem 1rem", fontFamily:T.sans, fontSize:"0.9rem", fontWeight:600, color:T.text, minWidth:"40px", textAlign:"center" }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q+1))} style={{ padding:"0.5rem 0.85rem", background:T.bgGray, border:"none", fontSize:"1.1rem", color:T.textMid, cursor:"pointer" }}>+</button>
              </div>
            </div>
          )}

          {/* Add to cart button */}
          <button onClick={handleAddToCart} disabled={isOutOfStock} style={{
            width:"100%", background: isOutOfStock?"#ddd": added?"#dcfce7":T.primary,
            border:"none", color: isOutOfStock?"#999": added?T.success:"white",
            padding:"0.95rem", borderRadius:"10px", fontFamily:T.sans,
            fontSize:"0.95rem", fontWeight:700,
            cursor: isOutOfStock?"not-allowed":"pointer", transition:"all 0.2s",
          }}
            onMouseEnter={e => { if (!isOutOfStock && !added) e.currentTarget.style.background = T.primaryHover; }}
            onMouseLeave={e => { if (!isOutOfStock && !added) e.currentTarget.style.background = T.primary; }}
          >
            {isOutOfStock ? "Out of Stock" : added ? "✓ Added to Cart!" : `+ Add to Cart${inCart ? ` (${inCart.qty} in cart)` : ""}`}
          </button>

          {/* Security badge */}
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", padding:"0.75rem 1rem", background:T.primaryLight, border:`1px solid #ffd4b8`, borderRadius:"10px" }}>
            <span style={{ fontSize:"0.9rem" }}>🔐</span>
            <span style={{ fontFamily:T.sans, fontSize:"0.75rem", color:T.primary, fontWeight:500 }}>Secured with QR + Biometric Authentication</span>
          </div>
        </div>
      </div>

      {/* Description + Info */}
      <div className="product-detail-bottom-grid" style={{ maxWidth:"1000px", margin:"0 auto", padding:"0 2rem 3rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem" }}>

        {/* Description */}
        <div style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:"14px", padding:"1.5rem" }}>
          <h2 style={{ fontFamily:T.sans, fontSize:"1rem", fontWeight:700, color:T.text, marginBottom:"1rem", paddingBottom:"0.75rem", borderBottom:`1px solid ${T.border}` }}>Product Description</h2>
          <p style={{ fontFamily:T.sans, fontSize:"0.875rem", color:T.textMid, lineHeight:1.8 }}>{product.description || "No description available."}</p>
        </div>

        {/* Product Info */}
        <div style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:"14px", padding:"1.5rem" }}>
          <h2 style={{ fontFamily:T.sans, fontSize:"1rem", fontWeight:700, color:T.text, marginBottom:"1rem", paddingBottom:"0.75rem", borderBottom:`1px solid ${T.border}` }}>Product Information</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
            {[
              ["Category", product.category],
              ["Stock", `${product.stock} units`],
              ["Tag", product.tag || "—"],
              ["Price", `$${product.price.toFixed(2)}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:"0.6rem", borderBottom:`1px solid ${T.border}` }}>
                <span style={{ fontFamily:T.sans, fontSize:"0.82rem", color:T.textMuted }}>{k}</span>
                <span style={{ fontFamily:T.sans, fontSize:"0.82rem", color: k==="Price"?T.primary:T.text, fontWeight: k==="Price"?700:400 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toast */}
      <div style={{ position:"fixed", bottom:"2rem", right:"2rem", zIndex:9999, background:T.success, color:"white", padding:"0.75rem 1.25rem", borderRadius:"8px", fontFamily:T.sans, fontSize:"0.875rem", fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,0.15)", transform: toast.visible?"translateY(0)":"translateY(80px)", opacity: toast.visible?1:0, transition:"all 0.3s ease", pointerEvents:"none" }}>
        ✓ {toast.message}
      </div>
    </div>
  );
}
