import { useState, useEffect } from "react";
import SharedNavbar from "../components/Navbar.jsx";
import { productsAPI } from "../api/index.js";

const T = {
  primary:"#ff6900", primaryHover:"#e55e00", primaryLight:"#fff3ee",
  bg:"#fff8f5", bgWhite:"#ffffff", bgGray:"#f5f5f5",
  border:"#eee", text:"#111", textMid:"#444", textMuted:"#888",
  sans:"'Inter','DM Sans',sans-serif",
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onNavigate, featuredProducts }) {
  const [animIn, setAnimIn] = useState(false);
  // Short delay before fade-in so the animation is visible on first render
  useEffect(() => { setTimeout(() => setAnimIn(true), 100); }, []);

  // Show real products once loaded; falls back to placeholder cards while fetching
  const heroProducts = featuredProducts.length >= 4
    ? featuredProducts.slice(0, 4).map(p => ({ emoji: p.image_emoji, image_url: p.image_url, name: p.name, price: p.price.toFixed(2), tag: p.tag }))
    : [
        { emoji: "🎧", name: "Wireless Headphones", price: "49.99", tag: "New" },
        { emoji: "⌚", name: "Smart Watch", price: "199.99", tag: "Hot" },
        { emoji: "👟", name: "Running Sneakers", price: "89.99", tag: "Sale" },
        { emoji: "🎒", name: "Backpack", price: "65.00", tag: null },
      ];

  return (
    <section style={{
      background: T.bg, paddingTop: "80px",
      minHeight: "90vh", display: "flex", alignItems: "center",
    }} className="hero-section">
      <div className="hero-grid" style={{
        maxWidth: "1100px", margin: "0 auto", padding: "3rem 2rem",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center",
        opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s ease",
      }}>
        {/* Left */}
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            background: T.primaryLight, border: `1px solid #ffd4b8`,
            borderRadius: "100px", padding: "0.3rem 0.85rem", marginBottom: "1.5rem",
          }}>
            <span style={{ fontSize: "0.7rem" }}>🔒</span>
            <span style={{ fontFamily: T.sans, fontSize: "0.72rem", color: T.primary, fontWeight: 600, letterSpacing: "0.05em" }}>QR-SECURED PAYMENTS</span>
          </div>

          <h1 style={{ fontFamily: T.sans, fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, color: T.text, lineHeight: 1.2, marginBottom: "1rem" }}>
            Discover & shop<br />
            with <span style={{ color: T.primary }}>confidence.</span>
          </h1>

          <p style={{ fontFamily: T.sans, fontSize: "1rem", color: T.textMid, lineHeight: 1.7, marginBottom: "1.75rem", maxWidth: "420px" }}>
            Browse thousands of products and checkout securely — every payment verified with a dynamic QR code and biometric authentication.
          </p>

          <div className="hero-btns" style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap" }}>
            <button onClick={() => onNavigate("shop")} style={{
              background: T.primary, border: "none", color: "white",
              padding: "0.8rem 1.75rem", borderRadius: "8px",
              fontFamily: T.sans, fontSize: "0.95rem", fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.target.style.background = T.primaryHover; e.target.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.target.style.background = T.primary; e.target.style.transform = "translateY(0)"; }}
            >Shop Now →</button>
            <button onClick={() => onNavigate("categories")} style={{
              background: "white", border: `1px solid ${T.border}`, color: T.textMid,
              padding: "0.8rem 1.75rem", borderRadius: "8px",
              fontFamily: T.sans, fontSize: "0.95rem", cursor: "pointer",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.primary}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
            >Browse Categories</button>
          </div>

          {/* Trust pills */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {[
              { icon: "🔐", text: "QR Secured" },
              { icon: "👆", text: "Biometric Auth" },
              { icon: "⚡", text: "Real-time" },
              { icon: "🛡️", text: "Fraud Protected" },
            ].map(({ icon, text }) => (
              <div key={text} style={{
                display: "flex", alignItems: "center", gap: "0.3rem",
                background: "white", border: `1px solid ${T.border}`,
                borderRadius: "100px", padding: "0.25rem 0.75rem",
              }}>
                <span style={{ fontSize: "0.7rem" }}>{icon}</span>
                <span style={{ fontFamily: T.sans, fontSize: "0.72rem", color: T.textMid, fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — product cards */}
        <div className="hero-cards-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          {heroProducts.map((p, i) => (
            <div key={i} onClick={() => onNavigate("shop")} style={{
              background: "white", border: `1px solid ${T.border}`,
              borderRadius: "12px", padding: "1rem", cursor: "pointer",
              transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(255,105,0,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
            >
              <div style={{ height:"90px", borderRadius:"8px", overflow:"hidden", marginBottom:"0.6rem", background:T.bgGray }}>
        {p.image_url
          ? <img src={p.image_url} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"contain", padding:"0.5rem", background:"white" }} />
          : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem" }}>{p.emoji}</div>
        }
      </div>
              <div style={{ fontFamily: T.sans, fontSize: "0.8rem", fontWeight: 600, color: T.text, marginBottom: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: T.sans, color: T.primary, fontWeight: 700, fontSize: "0.9rem" }}>${p.price}</span>
                {p.tag && <span style={{ fontFamily: T.sans, fontSize: "0.62rem", fontWeight: 600, background: p.tag === "Sale" ? "#fee2e2" : p.tag === "New" ? "#dcfce7" : T.primaryLight, color: p.tag === "Sale" ? "#dc2626" : p.tag === "New" ? "#16a34a" : T.primary, padding: "0.15rem 0.5rem", borderRadius: "100px" }}>{p.tag}</span>}
              </div>
            </div>
          ))}
          <div onClick={() => onNavigate("shop")} style={{
            gridColumn: "1 / -1", background: T.primaryLight,
            border: `1px dashed #ffd4b8`, borderRadius: "12px",
            padding: "0.75rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#ffe8d6"; e.currentTarget.style.borderColor = T.primary; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.primaryLight; e.currentTarget.style.borderColor = "#ffd4b8"; }}
          >
            <span style={{ fontFamily: T.sans, fontSize: "0.85rem", color: T.primary, fontWeight: 600 }}>View all products →</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Categories ───────────────────────────────────────────────────────────────
function CategoriesSection({ categories, loading, onNavigate }) {
  return (
    <section style={{ background: "white", padding: "4rem 2rem", borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <p style={{ fontFamily: T.sans, fontSize: "0.72rem", color: T.primary, letterSpacing: "0.12em", fontWeight: 600, marginBottom: "0.3rem" }}>BROWSE BY CATEGORY</p>
            <h2 style={{ fontFamily: T.sans, fontSize: "1.6rem", color: T.text, fontWeight: 700 }}>What are you looking for?</h2>
          </div>
          <span onClick={() => onNavigate("shop")} style={{ fontFamily: T.sans, fontSize: "0.85rem", color: T.primary, cursor: "pointer", fontWeight: 500 }}>See all →</span>
        </div>
        <div className="categories-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
          {loading ? [1,2,3,4].map(i => (
            <div key={i} style={{ background: T.bgGray, borderRadius: "10px", height: "110px" }} />
          )) : categories.map(cat => (
            <div key={cat.category} onClick={() => onNavigate("shop")} style={{
              background: T.bgGray, borderRadius: "10px", padding: "1.25rem 1rem",
              cursor: "pointer", transition: "all 0.2s", textAlign: "center",
              border: `1px solid transparent`,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = T.primaryLight; e.currentTarget.style.borderColor = "#ffd4b8"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.bgGray; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{cat.icon}</div>
              <div style={{ fontFamily: T.sans, color: T.text, fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.2rem" }}>{cat.category}</div>
              <div style={{ fontFamily: T.sans, color: T.textMuted, fontSize: "0.75rem" }}>{cat.count} items</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart, onNavigate }) {
  const [added, setAdded] = useState(false);
  const handleAdd = () => { onAddToCart(product); setAdded(true); setTimeout(() => setAdded(false), 1500); };

  return (
    <div style={{
      background: "white", border: `1px solid ${T.border}`, borderRadius: "12px",
      overflow: "hidden", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; e.currentTarget.style.borderColor = "#ddd"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = T.border; }}
    >
      <div onClick={() => onNavigate("product", product.id)} style={{ height:"160px", background:T.bgGray, position:"relative", overflow:"hidden", cursor:"pointer" }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"contain", padding:"0.5rem", background:"white" }} />
          : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"3.5rem" }}>{product.image_emoji}</div>
        }
        {product.tag && (
          <span style={{
            position:"absolute", top:"10px", right:"10px",
            background: product.tag==="Sale" ? "#fee2e2" : product.tag==="New" ? "#dcfce7" : T.primaryLight,
            color: product.tag==="Sale" ? "#dc2626" : product.tag==="New" ? "#16a34a" : T.primary,
            fontSize:"0.65rem", fontWeight:700, padding:"0.2rem 0.5rem", borderRadius:"100px", fontFamily:T.sans,
          }}>{product.tag}</span>
        )}
      </div>
      <div style={{ padding: "0.9rem" }}>
        <div style={{ fontFamily: T.sans, fontSize: "0.68rem", color: T.textMuted, letterSpacing: "0.06em", marginBottom: "0.25rem", textTransform: "uppercase" }}>{product.category}</div>
        <div onClick={() => onNavigate("product", product.id)} style={{ fontFamily: T.sans, color: T.text, fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.6rem", cursor:"pointer" }}>{product.name}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: T.sans, color: T.primary, fontSize: "1rem", fontWeight: 700 }}>${product.price.toFixed(2)}</span>
          <button onClick={handleAdd} style={{
            background: added ? "#dcfce7" : T.primaryLight,
            border: `1px solid ${added ? "#86efac" : "#ffd4b8"}`,
            color: added ? "#16a34a" : T.primary,
            padding: "0.35rem 0.75rem", borderRadius: "6px",
            fontFamily: T.sans, fontSize: "0.75rem", fontWeight: 600,
            cursor: "pointer", transition: "all 0.2s",
          }}>{added ? "✓ Added" : "+ Cart"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Featured Products ────────────────────────────────────────────────────────
function FeaturedProducts({ products, loading, onAddToCart, onNavigate }) {
  return (
    <section style={{ background: T.bg, padding: "4rem 2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
          <div>
            <p style={{ fontFamily: T.sans, fontSize: "0.72rem", color: T.primary, letterSpacing: "0.12em", fontWeight: 600, marginBottom: "0.3rem" }}>FEATURED PRODUCTS</p>
            <h2 style={{ fontFamily: T.sans, fontSize: "1.6rem", color: T.text, fontWeight: 700 }}>Hand-picked for you</h2>
          </div>
          <span onClick={() => onNavigate("shop")} style={{ fontFamily: T.sans, fontSize: "0.85rem", color: T.primary, cursor: "pointer", fontWeight: 500 }}>View all →</span>
        </div>
        {loading ? (
          <div className="featured-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "1rem" }}>
            {[1,2,3,4,5,6].map(i => <div key={i} style={{ background: T.bgGray, borderRadius: "12px", height: "260px" }} />)}
          </div>
        ) : (
          <div className="featured-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "1rem" }}>
            {products.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onNavigate={onNavigate} />)}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num: "01", icon: "🛒", title: "Add to Cart", desc: "Browse and add your favourite products to the cart." },
    { num: "02", icon: "💳", title: "Enter Card Details", desc: "Securely enter your credit card at checkout." },
    { num: "03", icon: "📱", title: "Scan QR Code", desc: "A unique QR appears. Scan it with your bank app." },
    { num: "04", icon: "👆", title: "Biometric Approval", desc: "Verify with fingerprint or Face ID. Done!" },
  ];
  return (
    <section style={{ background: "white", padding: "4rem 2rem", borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ fontFamily: T.sans, fontSize: "0.72rem", color: T.primary, letterSpacing: "0.12em", fontWeight: 600, marginBottom: "0.3rem" }}>THE PROCESS</p>
          <h2 style={{ fontFamily: T.sans, fontSize: "1.6rem", color: T.text, fontWeight: 700 }}>Secure checkout in 4 steps</h2>
        </div>
        <div className="howitworks-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          {steps.map(step => (
            <div key={step.num} style={{ padding: "1.5rem", background: T.bg, borderRadius: "12px", border: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: T.sans, fontSize: "2rem", color: "#ffd4b8", fontWeight: 700, lineHeight: 1, marginBottom: "0.5rem" }}>{step.num}</div>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{step.icon}</div>
              <div style={{ fontFamily: T.sans, color: T.text, fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.4rem" }}>{step.title}</div>
              <div style={{ fontFamily: T.sans, color: T.textMuted, fontSize: "0.82rem", lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "#111", padding: "2rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div style={{ width: "24px", height: "24px", background: T.primary, borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: "0.75rem", fontWeight: 700, fontFamily: T.sans }}>S</span>
          </div>
          <span style={{ fontFamily: T.sans, fontSize: "1rem", fontWeight: 700, color: "white" }}>ShopEase</span>
        </div>
        <span style={{ fontFamily: T.sans, fontSize: "0.75rem", color: "#666" }}>CSIT321 FYP — Multi-factor QR Transaction Authorisation © 2026</span>
      </div>
    </footer>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, visible, type = "success" }) {
  return (
    <div style={{
      position: "fixed", bottom: "2rem", right: "2rem", zIndex: 9999,
      background: type === "error" ? T.error : T.success,
      color: "white", padding: "0.75rem 1.25rem", borderRadius: "8px",
      fontFamily: T.sans, fontSize: "0.875rem", fontWeight: 600,
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      transform: visible ? "translateY(0)" : "translateY(80px)",
      opacity: visible ? 1 : 0, transition: "all 0.3s ease", pointerEvents: "none",
      display: "flex", alignItems: "center", gap: "0.4rem",
    }}>
      {type === "error" ? "⚠️" : "✓"} {message}
    </div>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
export default function HomePage({ cart, setCart, onNavigate, user, onLogout, navProps }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  // Fetch featured products and categories in parallel on mount
  useEffect(() => {
    productsAPI.getFeatured()
      .then(res => { if (res.success) setFeaturedProducts(res.data); })
      .catch(() => showToast("Could not load products. Is the backend running?", "error"))
      .finally(() => setLoadingProducts(false));
    productsAPI.getCategories()
      .then(res => { if (res.success) setCategories(res.data); })
      .catch(() => {})
      .finally(() => setLoadingCategories(false));
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
  };

  const handleAddToCart = (product) => {
    // Redirect guests to login instead of silently failing
    if (!user) {
      onNavigate("login");
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.name} added to cart`);
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap'); * { margin:0; padding:0; box-sizing:border-box; } ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f5f5f5; } ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }`}</style>
      <SharedNavbar {...navProps} />
      <Hero onNavigate={onNavigate} featuredProducts={featuredProducts} />
      <CategoriesSection categories={categories} loading={loadingCategories} onNavigate={onNavigate} />
      <FeaturedProducts products={featuredProducts} loading={loadingProducts} onAddToCart={handleAddToCart} onNavigate={onNavigate} />
      <HowItWorks />
      <Footer />
      <Toast message={toast.message} visible={toast.visible} type={toast.type} />
    </div>
  );
}
