import Navbar from "../components/Navbar.jsx";
import { useState, useEffect } from "react";
import { productsAPI } from "../api/index.js";

const T = {
  primary:"#ff6900", primaryHover:"#e55e00", primaryLight:"#fff3ee",
  bg:"#fff8f5", bgWhite:"#ffffff", bgGray:"#f5f5f5",
  border:"#eee", borderHover:"#ddd", text:"#111", textMid:"#444", textMuted:"#888",
  success:"#16a34a", error:"#dc2626", sans:"'Inter','DM Sans',sans-serif",
};

function ProductCard({ product, onAddToCart, onNavigate }) {
  const [added, setAdded] = useState(false);
  const handleAdd = () => { onAddToCart(product); if (product.stock > 0) { setAdded(true); setTimeout(() => setAdded(false), 1500); } };
  return (
    <div style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:"12px", overflow:"hidden", transition:"all 0.2s", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.04)"; }}
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
      <div style={{ padding:"0.9rem" }}>
        <div style={{ fontFamily:T.sans, fontSize:"0.68rem", color:T.textMuted, letterSpacing:"0.06em", marginBottom:"0.25rem", textTransform:"uppercase" }}>{product.category}</div>
        <div onClick={() => onNavigate("product", product.id)} style={{ fontFamily:T.sans, color:T.text, fontWeight:600, fontSize:"0.875rem", marginBottom:"0.25rem", cursor:"pointer" }}>{product.name}</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontFamily:T.sans, color:T.primary, fontSize:"1rem", fontWeight:700 }}>${product.price.toFixed(2)}</span>
          <button onClick={handleAdd} style={{ background: added?"#dcfce7":T.primaryLight, border:`1px solid ${added?"#86efac":"#ffd4b8"}`, color: added?T.success:T.primary, padding:"0.35rem 0.75rem", borderRadius:"6px", fontFamily:T.sans, fontSize:"0.75rem", fontWeight:600, cursor:"pointer", transition:"all 0.2s" }}>{added ? "✓ Added" : "+ Cart"}</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, visible }) {
  return (
    <div style={{ position:"fixed", bottom:"2rem", right:"2rem", zIndex:9999, background:T.success, color:"white", padding:"0.75rem 1.25rem", borderRadius:"8px", fontFamily:T.sans, fontSize:"0.875rem", fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,0.15)", transform: visible?"translateY(0)":"translateY(80px)", opacity: visible?1:0, transition:"all 0.3s ease", pointerEvents:"none" }}>
      ✓ {message}
    </div>
  );
}

export default function ShopPage({ cart, setCart, onNavigate, user, navProps }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [toast, setToast] = useState({ visible: false, message: "" });
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    productsAPI.getAll().then(res => { if (res.success) setProducts(res.data); }).finally(() => setLoading(false));
    productsAPI.getCategories().then(res => { if (res.success) setCategories(res.data); });
  }, []);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const showToast = (msg) => { setToast({ visible: true, message: msg }); setTimeout(() => setToast({ visible: false, message: "" }), 2000); };

  const handleAddToCart = (product) => {
    if (!user) {
      onNavigate("login");
      return;
    }
    setCart(prev => { const ex = prev.find(i => i.id === product.id); if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i); return [...prev, { ...product, qty: 1 }]; });
    showToast(`${product.name} added to cart`);
  };

  return (
    <div style={{ background:T.bg, minHeight:"100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap'); *{margin:0;padding:0;box-sizing:border-box;}`}</style>

      <Navbar {...navProps} />

      {/* Content */}
      <div className="page-container" style={{ maxWidth:"1100px", margin:"0 auto", padding:"2.5rem 2rem" }}>
        <div style={{ marginBottom:"1.5rem" }}>
          <p style={{ fontFamily:T.sans, fontSize:"0.72rem", color:T.primary, letterSpacing:"0.12em", fontWeight:600, marginBottom:"0.3rem" }}>CATALOGUE</p>
          <h1 style={{ fontFamily:T.sans, fontSize:"1.8rem", color:T.text, fontWeight:700 }}>All Products</h1>
        </div>

        {/* Search */}
        <div style={{ position:"relative", marginBottom:"1.25rem" }}>
          <span style={{ position:"absolute", left:"1rem", top:"50%", transform:"translateY(-50%)" }}>🔍</span>
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width:"100%", padding:"0.8rem 1rem 0.8rem 2.8rem", background:"white", border:`1px solid ${T.border}`, borderRadius:"10px", color:T.text, fontFamily:T.sans, fontSize:"0.9rem", outline:"none" }}
            onFocus={e => e.target.style.borderColor = T.primary}
            onBlur={e => e.target.style.borderColor = T.border}
          />
          {search && <button onClick={() => setSearch("")} style={{ position:"absolute", right:"1rem", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:T.textMuted, cursor:"pointer", fontSize:"1rem" }}>✕</button>}
        </div>

        {/* Category filters */}
        <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
          {["All", ...categories.map(c => c.category)].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding:"0.35rem 0.9rem", borderRadius:"100px", border:`1px solid ${activeCategory===cat ? T.primary : T.border}`, background: activeCategory===cat ? T.primaryLight : "white", color: activeCategory===cat ? T.primary : T.textMid, fontFamily:T.sans, fontSize:"0.8rem", fontWeight: activeCategory===cat ? 600 : 400, cursor:"pointer", transition:"all 0.15s" }}>{cat}</button>
          ))}
        </div>

        <div style={{ fontFamily:T.sans, fontSize:"0.8rem", color:T.textMuted, marginBottom:"1.25rem" }}>
          {loading ? "Loading..." : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} found`}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="product-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:"1rem" }}>
            {[1,2,3,4,5,6].map(i => <div key={i} style={{ background:"white", borderRadius:"12px", height:"260px", border:`1px solid ${T.border}` }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"5rem 2rem" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🔍</div>
            <div style={{ fontFamily:T.sans, color:T.textMid, fontSize:"1rem", marginBottom:"1rem" }}>No products found for "<span style={{ color:T.primary }}>{search}</span>"</div>
            <button onClick={() => { setSearch(""); setActiveCategory("All"); }} style={{ background:T.primaryLight, border:`1px solid #ffd4b8`, color:T.primary, padding:"0.5rem 1.2rem", borderRadius:"8px", fontFamily:T.sans, cursor:"pointer", fontWeight:600 }}>Clear filters</button>
          </div>
        ) : (
          <div className="product-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:"1rem" }}>
            {filtered.map(p => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} onNavigate={onNavigate} />)}
          </div>
        )}
      </div>
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
