import Navbar from "../components/Navbar.jsx";
import { useState, useEffect } from "react";
import { ordersAPI } from "../api/index.js";

const T = {
  primary:"#ff6900", primaryHover:"#e55e00", primaryLight:"#fff3ee",
  bg:"#fff8f5", bgGray:"#f5f5f5", border:"#eee",
  text:"#111", textMid:"#444", textMuted:"#888",
  success:"#16a34a", error:"#dc2626", sans:"'Inter','DM Sans',sans-serif",
};

export default function OrderHistoryPage({ onNavigate, user, navProps }) {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState(null);

  // Fetch all orders for the logged-in user; backend filters by JWT user_id
  useEffect(() => {
    ordersAPI.getAll()
      .then(res => { if (res.success) setOrders(res.data); })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-SG", {
      day:"numeric", month:"long", year:"numeric",
      timeZone: "Asia/Singapore"
    }) + " at " + d.toLocaleTimeString("en-SG", {
      hour:"2-digit", minute:"2-digit",
      timeZone: "Asia/Singapore"
    });
  };

  const cartCount = 0;

  return (
    <div style={{ background:T.bg, minHeight:"100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap'); *{margin:0;padding:0;box-sizing:border-box;}`}</style>

      <Navbar {...navProps} />

      {/* Content */}
      <div className="page-container" style={{ maxWidth:"800px", margin:"0 auto", padding:"2.5rem 2rem" }}>

        {/* Header */}
        <div style={{ marginBottom:"2rem" }}>
          <p style={{ fontFamily:T.sans, fontSize:"0.72rem", color:T.primary, letterSpacing:"0.12em", fontWeight:600, marginBottom:"0.3rem" }}>MY ACCOUNT</p>
          <h1 style={{ fontFamily:T.sans, fontSize:"1.8rem", fontWeight:700, color:T.text }}>Order History</h1>
          <p style={{ fontFamily:T.sans, fontSize:"0.875rem", color:T.textMuted, marginTop:"0.4rem" }}>All your past orders and their status</p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background:"white", borderRadius:"12px", height:"100px", border:`1px solid ${T.border}` }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && orders.length === 0 && (
          <div style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:"16px", padding:"4rem 2rem", textAlign:"center" }}>
            <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🛍️</div>
            <h2 style={{ fontFamily:T.sans, fontSize:"1.2rem", fontWeight:700, color:T.text, marginBottom:"0.5rem" }}>No orders yet</h2>
            <p style={{ fontFamily:T.sans, fontSize:"0.875rem", color:T.textMuted, marginBottom:"1.5rem" }}>You haven't placed any orders. Start shopping!</p>
            <button onClick={() => onNavigate("shop")} style={{ background:T.primary, border:"none", color:"white", padding:"0.75rem 2rem", borderRadius:"8px", fontFamily:T.sans, fontSize:"0.875rem", fontWeight:600, cursor:"pointer" }}>
              Browse Products →
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            {/* Summary cards */}
            <div className="orders-summary-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"1rem", marginBottom:"1rem" }}>
              {[
                ["Total Orders", orders.length, "🛍️"],
                ["Completed", orders.filter(o => o.status === "approved").length, "✅"],
                ["Total Spent", `$${orders.reduce((s,o) => s + o.total_amount, 0).toFixed(2)}`, "💰"],
              ].map(([label, value, icon]) => (
                <div key={label} style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:"12px", padding:"1rem", textAlign:"center" }}>
                  <div style={{ fontSize:"1.5rem", marginBottom:"0.4rem" }}>{icon}</div>
                  <div style={{ fontFamily:T.sans, fontSize:"1.2rem", fontWeight:700, color:T.text }}>{value}</div>
                  <div style={{ fontFamily:T.sans, fontSize:"0.75rem", color:T.textMuted }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Order cards */}
            {orders.map((order, idx) => (
              <div key={order.id} style={{ background:"white", border:`1px solid ${expanded===idx?"#ffd4b8":T.border}`, borderRadius:"14px", overflow:"hidden", transition:"all 0.2s", boxShadow: expanded===idx?"0 4px 16px rgba(255,105,0,0.08)":"none" }}>

                {/* Order header */}
                <div onClick={() => setExpanded(expanded===idx ? null : idx)} style={{ padding:"1.25rem 1.5rem", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.bg}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
                    {/* Status icon */}
                    <div style={{ width:"40px", height:"40px", borderRadius:"10px", background: order.status==="approved"?"#dcfce7":"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", flexShrink:0 }}>
                      {order.status==="approved" ? "✅" : "❌"}
                    </div>
                    <div>
                      <div style={{ fontFamily:T.sans, fontSize:"0.9rem", fontWeight:700, color:T.text, marginBottom:"0.2rem" }}>
                        Order #SE-{order.id.slice(-8).toUpperCase()}
                      </div>
                      <div style={{ fontFamily:T.sans, fontSize:"0.75rem", color:T.textMuted }}>{formatDate(order.created_at)}</div>
                    </div>
                  </div>

                  <div style={{ display:"flex", alignItems:"center", gap:"1.5rem" }}>
                    {/* Status badge */}
                    <span style={{ fontFamily:T.sans, fontSize:"0.72rem", background: order.status==="approved"?"#dcfce7":"#fee2e2", color: order.status==="approved"?T.success:T.error, padding:"0.25rem 0.75rem", borderRadius:"100px", fontWeight:600, textTransform:"uppercase" }}>
                      {order.status}
                    </span>
                    {/* Total */}
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:T.sans, fontSize:"1rem", fontWeight:700, color:T.primary }}>${order.total_amount.toFixed(2)}</div>
                      <div style={{ fontFamily:T.sans, fontSize:"0.72rem", color:T.textMuted }}>
                        {order.items?.length > 0 ? `${order.items.reduce((s,i) => s+i.qty, 0)} items` : "—"}
                      </div>
                    </div>
                    {/* Expand arrow */}
                    <span style={{ color:T.textMuted, fontSize:"0.85rem", transition:"transform 0.2s", transform: expanded===idx?"rotate(180deg)":"rotate(0)" }}>▼</span>
                  </div>
                </div>

                {/* Expanded items */}
                {expanded === idx && (
                  <div style={{ borderTop:`1px solid ${T.border}`, padding:"1.25rem 1.5rem", background:T.bg }}>

                    {order.items && order.items.length > 0 ? (
                      <>
                        <p style={{ fontFamily:T.sans, fontSize:"0.78rem", color:T.textMuted, fontWeight:600, marginBottom:"0.75rem", textTransform:"uppercase", letterSpacing:"0.06em" }}>Items Ordered</p>
                        <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem", marginBottom:"1rem" }}>
                          {order.items.map((item, i) => (
                            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"white", border:`1px solid ${T.border}`, borderRadius:"8px", padding:"0.75rem 1rem" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                                <span style={{ fontSize:"1.3rem" }}>{item.image_emoji || "📦"}</span>
                                <div>
                                  <div style={{ fontFamily:T.sans, fontSize:"0.875rem", fontWeight:500, color:T.text }}>{item.name}</div>
                                  <div style={{ fontFamily:T.sans, fontSize:"0.75rem", color:T.textMuted }}>Qty: {item.qty}</div>
                                </div>
                              </div>
                              <span style={{ fontFamily:T.sans, fontSize:"0.875rem", fontWeight:600, color:T.text }}>${(item.price * item.qty).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order total breakdown */}
                        <div style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:"10px", padding:"1rem" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.4rem" }}>
                            <span style={{ fontFamily:T.sans, fontSize:"0.82rem", color:T.textMuted }}>Subtotal</span>
                            {/* Reverse-calculate subtotal from total since only total_amount is stored */}
                            <span style={{ fontFamily:T.sans, fontSize:"0.82rem", color:T.text }}>${(order.total_amount / 1.09).toFixed(2)}</span>
                          </div>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.6rem" }}>
                            <span style={{ fontFamily:T.sans, fontSize:"0.82rem", color:T.textMuted }}>Tax (9%)</span>
                            <span style={{ fontFamily:T.sans, fontSize:"0.82rem", color:T.text }}>${(order.total_amount - order.total_amount/1.09).toFixed(2)}</span>
                          </div>
                          <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:"0.6rem", display:"flex", justifyContent:"space-between" }}>
                            <span style={{ fontFamily:T.sans, fontSize:"0.9rem", fontWeight:700, color:T.text }}>Total Paid</span>
                            <span style={{ fontFamily:T.sans, fontSize:"0.9rem", fontWeight:700, color:T.primary }}>${order.total_amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p style={{ fontFamily:T.sans, fontSize:"0.875rem", color:T.textMuted, textAlign:"center", padding:"1rem" }}>No item details available for this order.</p>
                    )}

                    {/* Payment method */}
                    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginTop:"0.75rem", padding:"0.6rem 0.75rem", background:"white", border:`1px solid ${T.border}`, borderRadius:"8px" }}>
                      <span style={{ fontSize:"0.85rem" }}>🔐</span>
                      <span style={{ fontFamily:T.sans, fontSize:"0.75rem", color:T.textMuted }}>Paid via QR + Biometric Authentication</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
