import Navbar from "../components/Navbar.jsx";
import { useState, useEffect } from "react";
import { authAPI, cardsAPI } from "../api/index.js";

const T = {
  primary:"#ff6900", primaryHover:"#e55e00", primaryLight:"#fff3ee",
  bg:"#fff8f5", bgGray:"#f5f5f5", border:"#eee",
  text:"#111", textMid:"#444", textMuted:"#888",
  success:"#16a34a", error:"#dc2626", sans:"'Inter','DM Sans',sans-serif",
};

const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
};

export default function ProfilePage({ onNavigate, user, onLogout, navProps }) {
  const [profile, setProfile]     = useState(null);
  const [cards, setCards]         = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingCards, setLoadingCards]     = useState(true);
  const [removingId, setRemovingId]         = useState(null);

  // Fetch fresh profile and saved cards in parallel on mount
  useEffect(() => {
    authAPI.getMe()
      .then(res => { if (res.success || res.user) setProfile(res.user || res.data); })
      .finally(() => setLoadingProfile(false));

    cardsAPI.getAll()
      .then(res => { if (res.success) setCards(res.data); })
      .finally(() => setLoadingCards(false));
  }, []);

  const handleRemoveCard = async (id) => {
    setRemovingId(id);
    await cardsAPI.remove(id);
    setCards(prev => prev.filter(c => c.id !== id));
    setRemovingId(null);
  };

  const formatMemberSince = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-SG", {
      day: "numeric", month: "long", year: "numeric",
      timeZone: "Asia/Singapore",
    });
  };

  // Falls back to the locally cached user from App.js props while the API call loads
  const displayUser = profile || user;

  return (
    <div style={{ background:T.bg, minHeight:"100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap'); *{margin:0;padding:0;box-sizing:border-box;}`}</style>

      <Navbar {...navProps} />

      <div className="page-container" style={{ maxWidth:"700px", margin:"0 auto", padding:"2.5rem 2rem" }}>

        {/* Header */}
        <div style={{ marginBottom:"2rem" }}>
          <p style={{ fontFamily:T.sans, fontSize:"0.72rem", color:T.primary, letterSpacing:"0.12em", fontWeight:600, marginBottom:"0.3rem" }}>MY ACCOUNT</p>
          <h1 style={{ fontFamily:T.sans, fontSize:"1.8rem", fontWeight:700, color:T.text }}>Profile</h1>
          <p style={{ fontFamily:T.sans, fontSize:"0.875rem", color:T.textMuted, marginTop:"0.4rem" }}>Manage your account details and saved cards</p>
        </div>

        {/* ── User Info Section ── */}
        <div style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:"16px", padding:"1.75rem", marginBottom:"1.25rem" }}>
          <p style={{ fontFamily:T.sans, fontSize:"0.72rem", color:T.textMuted, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"1.25rem" }}>Account Info</p>

          {loadingProfile ? (
            <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
              <div style={{ width:"64px", height:"64px", borderRadius:"16px", background:T.bgGray }} />
              <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
                <div style={{ width:"140px", height:"16px", background:T.bgGray, borderRadius:"6px" }} />
                <div style={{ width:"200px", height:"13px", background:T.bgGray, borderRadius:"6px" }} />
                <div style={{ width:"120px", height:"13px", background:T.bgGray, borderRadius:"6px" }} />
              </div>
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:"1.25rem" }}>
              {/* Avatar */}
              <div style={{
                width:"64px", height:"64px", borderRadius:"16px",
                background:`linear-gradient(135deg, ${T.primary}, #e55e00)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"1.4rem", fontWeight:800, color:"white", flexShrink:0,
                boxShadow:"0 4px 12px rgba(255,105,0,0.25)",
              }}>
                {getInitials(displayUser?.name)}
              </div>
              <div>
                <div style={{ fontFamily:T.sans, fontSize:"1.1rem", fontWeight:700, color:T.text, marginBottom:"0.25rem" }}>{displayUser?.name || "—"}</div>
                <div style={{ fontFamily:T.sans, fontSize:"0.875rem", color:T.textMuted, marginBottom:"0.2rem" }}>{displayUser?.email || "—"}</div>
                <div style={{ fontFamily:T.sans, fontSize:"0.78rem", color:T.textMuted }}>
                  Member since {formatMemberSince(profile?.created_at)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Saved Cards Section ── */}
        <div style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:"16px", padding:"1.75rem", marginBottom:"1.25rem" }}>
          <p style={{ fontFamily:T.sans, fontSize:"0.72rem", color:T.textMuted, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"1.25rem" }}>Saved Cards</p>

          {loadingCards ? (
            <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
              {[1,2].map(i => (
                <div key={i} style={{ height:"62px", background:T.bgGray, borderRadius:"10px" }} />
              ))}
            </div>
          ) : cards.length === 0 ? (
            <div style={{ textAlign:"center", padding:"2rem 1rem" }}>
              <div style={{ fontSize:"2rem", marginBottom:"0.75rem" }}>💳</div>
              <p style={{ fontFamily:T.sans, fontSize:"0.875rem", color:T.textMuted }}>No saved cards yet. Cards are saved during checkout.</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
              {cards.map(card => (
                <div key={card.id} style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"0.85rem 1rem", background:T.bg,
                  border:`1px solid ${T.border}`, borderRadius:"10px",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                    <div style={{ width:"36px", height:"36px", background:"white", border:`1px solid ${T.border}`, borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem" }}>💳</div>
                    <div>
                      <div style={{ fontFamily:T.sans, fontSize:"0.875rem", fontWeight:600, color:T.text }}>•••• •••• •••• {card.card_last4}</div>
                      <div style={{ fontFamily:T.sans, fontSize:"0.75rem", color:T.textMuted }}>{card.card_name} · {card.expiry}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveCard(card.id)}
                    disabled={removingId === card.id}
                    style={{
                      background:"transparent", border:`1px solid ${T.border}`,
                      color: removingId === card.id ? T.textMuted : T.error,
                      fontFamily:T.sans, fontSize:"0.78rem", fontWeight:500,
                      padding:"0.3rem 0.75rem", borderRadius:"6px", cursor: removingId === card.id ? "not-allowed" : "pointer",
                      transition:"all 0.15s",
                    }}
                    onMouseEnter={e => { if (removingId !== card.id) { e.currentTarget.style.background="#fee2e2"; e.currentTarget.style.borderColor=T.error; }}}
                    onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor=T.border; }}
                  >
                    {removingId === card.id ? "Removing…" : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Account Section ── */}
        <div style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:"16px", padding:"1.75rem" }}>
          <p style={{ fontFamily:T.sans, fontSize:"0.72rem", color:T.textMuted, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"1.25rem" }}>Account</p>

          <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
            {/* Change Password */}
            <button
              onClick={() => onNavigate("forgot-password")}
              style={{
                display:"flex", alignItems:"center", gap:"0.75rem",
                background:T.bg, border:`1px solid ${T.border}`,
                borderRadius:"10px", padding:"0.85rem 1rem",
                cursor:"pointer", transition:"all 0.15s", textAlign:"left", width:"100%",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=T.primary; e.currentTarget.style.background=T.primaryLight; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.background=T.bg; }}
            >
              <span style={{ fontSize:"1.1rem" }}>🔑</span>
              <div>
                <div style={{ fontFamily:T.sans, fontSize:"0.875rem", fontWeight:600, color:T.text }}>Change Password</div>
                <div style={{ fontFamily:T.sans, fontSize:"0.75rem", color:T.textMuted }}>Send a password reset link to your email</div>
              </div>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              style={{
                display:"flex", alignItems:"center", gap:"0.75rem",
                background:T.bg, border:`1px solid ${T.border}`,
                borderRadius:"10px", padding:"0.85rem 1rem",
                cursor:"pointer", transition:"all 0.15s", textAlign:"left", width:"100%",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="#fee2e2"; e.currentTarget.style.borderColor="#fca5a5"; }}
              onMouseLeave={e => { e.currentTarget.style.background=T.bg; e.currentTarget.style.borderColor=T.border; }}
            >
              <span style={{ fontSize:"1.1rem" }}>🚪</span>
              <div>
                <div style={{ fontFamily:T.sans, fontSize:"0.875rem", fontWeight:600, color:T.error }}>Log Out</div>
                <div style={{ fontFamily:T.sans, fontSize:"0.75rem", color:T.textMuted }}>Sign out of your ShopEase account</div>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
