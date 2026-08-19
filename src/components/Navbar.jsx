import { useState, useRef, useEffect } from "react";

const T = {
  primary:"#ff6900", primaryHover:"#e55e00", primaryLight:"#fff3ee",
  bg:"#fff8f5", bgGray:"#f5f5f5", border:"#eee",
  text:"#111", textMid:"#444", textMuted:"#888",
  success:"#16a34a", error:"#dc2626", sans:"'Inter','DM Sans',sans-serif",
};

export default function Navbar({ onNavigate, user, onLogout, cart = [] }) {
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef   = useRef(null);
  const hamburgerRef  = useRef(null);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // Close dropdown and mobile menu when clicking anywhere outside their containers
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (hamburgerRef.current && !hamburgerRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  // Always close all menus before navigating so they don't persist on the new page
  const nav = (dest) => { setMobileMenuOpen(false); setDropdownOpen(false); onNavigate(dest); };
  const logout = () => { setMobileMenuOpen(false); setDropdownOpen(false); onLogout(); };

  return (
    <nav style={{
      position:"sticky", top:0, zIndex:1000,
      background:"white", borderBottom:`1px solid ${T.border}`,
      padding:"0 1.5rem", height:"64px",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      boxShadow:"0 2px 12px rgba(0,0,0,0.06)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        .nav-link:hover { color: #ff6900 !important; }
        .dropdown-item:hover { background: #fff8f5 !important; color: #ff6900 !important; }
        .dropdown-item:hover span { color: #ff6900 !important; }
        @keyframes dropIn {
          from { opacity:0; transform:translateY(-8px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>

      {/* Logo */}
      <div onClick={() => nav("home")} style={{ display:"flex", alignItems:"center", gap:"0.5rem", cursor:"pointer", userSelect:"none", flexShrink:0 }}>
        <div style={{ width:"32px", height:"32px", background:`linear-gradient(135deg, ${T.primary}, #e55e00)`, borderRadius:"9px", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(255,105,0,0.3)" }}>
          <span style={{ color:"white", fontSize:"0.9rem", fontWeight:800, fontFamily:T.sans }}>S</span>
        </div>
        <span style={{ fontFamily:T.sans, fontSize:"1.1rem", fontWeight:800, color:T.text, letterSpacing:"-0.02em" }}>ShopEase</span>
      </div>

      {/* Center nav links — hidden on mobile via CSS */}
      <div className="nav-center-links" style={{ alignItems:"center", gap:"2rem" }}>
        {["home","shop"].map(page => (
          <span key={page} className="nav-link" onClick={() => nav(page)} style={{ fontFamily:T.sans, fontSize:"0.875rem", fontWeight:500, color:T.textMid, cursor:"pointer", textTransform:"capitalize", transition:"color 0.15s" }}>
            {page === "home" ? "Home" : "Shop"}
          </span>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>

        {/* Cart button */}
        <button onClick={() => nav("cart")} style={{
          position:"relative", background: cartCount>0?T.primaryLight:"transparent",
          border:`1px solid ${cartCount>0?"#ffd4b8":T.border}`,
          borderRadius:"10px", padding:"0.45rem 0.85rem",
          color: cartCount>0?T.primary:T.textMid,
          cursor:"pointer", fontFamily:T.sans, fontSize:"0.875rem",
          fontWeight:600, display:"flex", alignItems:"center", gap:"0.4rem",
          transition:"all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor=T.primary; e.currentTarget.style.color=T.primary; e.currentTarget.style.background=T.primaryLight; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor=cartCount>0?"#ffd4b8":T.border; e.currentTarget.style.color=cartCount>0?T.primary:T.textMid; e.currentTarget.style.background=cartCount>0?T.primaryLight:"transparent"; }}
        >
          🛒
          {cartCount > 0 && (
            <span style={{ background:T.primary, color:"white", borderRadius:"100px", padding:"0.1rem 0.5rem", fontSize:"0.7rem", fontWeight:800, animation:"pulse 0.3s ease" }}>{cartCount}</span>
          )}
        </button>

        {/* Guest buttons — hidden on mobile (hamburger covers these) */}
        {!user && (
          <div className="nav-center-links" style={{ gap:"0.5rem" }}>
            <button onClick={() => nav("login")} style={{
              background:"transparent", border:`1px solid ${T.border}`,
              color:T.textMid, padding:"0.45rem 1rem", borderRadius:"10px",
              fontFamily:T.sans, fontSize:"0.875rem", cursor:"pointer", fontWeight:500,
              transition:"all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=T.primary; e.currentTarget.style.color=T.primary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.textMid; }}
            >Log in</button>
            <button onClick={() => nav("register")} style={{
              background:T.primary, border:"none",
              color:"white", padding:"0.45rem 1rem", borderRadius:"10px",
              fontFamily:T.sans, fontSize:"0.875rem", cursor:"pointer", fontWeight:600,
              transition:"all 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background=T.primaryHover}
              onMouseLeave={e => e.currentTarget.style.background=T.primary}
            >Register</button>
          </div>
        )}

        {/* Logged in — Profile dropdown (desktop) */}
        {user && (
          <div ref={dropdownRef} style={{ position:"relative" }}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{
              display:"flex", alignItems:"center", gap:"0.5rem",
              background: dropdownOpen?T.primaryLight:"transparent",
              border:`1px solid ${dropdownOpen?"#ffd4b8":T.border}`,
              borderRadius:"10px", padding:"0.35rem 0.75rem 0.35rem 0.4rem",
              cursor:"pointer", transition:"all 0.15s",
            }}
              onMouseEnter={e => { if (!dropdownOpen) { e.currentTarget.style.borderColor="#ffd4b8"; e.currentTarget.style.background=T.primaryLight; }}}
              onMouseLeave={e => { if (!dropdownOpen) { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.background="transparent"; }}}
            >
              <div style={{
                width:"30px", height:"30px", borderRadius:"8px",
                background:`linear-gradient(135deg, ${T.primary}, #e55e00)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"0.7rem", fontWeight:800, color:"white", flexShrink:0,
              }}>
                {getInitials(user.name)}
              </div>
              <span style={{ fontFamily:T.sans, fontSize:"0.875rem", fontWeight:600, color:T.text, maxWidth:"80px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {user.name.split(" ")[0]}
              </span>
              <span style={{ fontSize:"0.6rem", color:T.textMuted, transition:"transform 0.2s", transform: dropdownOpen?"rotate(180deg)":"rotate(0)" }}>▼</span>
            </button>

            {dropdownOpen && (
              <div style={{
                position:"absolute", top:"calc(100% + 8px)", right:0,
                background:"white", border:`1px solid ${T.border}`,
                borderRadius:"14px", minWidth:"220px",
                boxShadow:"0 8px 32px rgba(0,0,0,0.12)",
                overflow:"hidden", animation:"dropIn 0.15s ease",
                zIndex:9999,
              }}>
                <div style={{ padding:"1rem 1.25rem", background:T.bg, borderBottom:`1px solid ${T.border}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                    <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:`linear-gradient(135deg, ${T.primary}, #e55e00)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.85rem", fontWeight:800, color:"white", flexShrink:0 }}>
                      {getInitials(user.name)}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontFamily:T.sans, fontSize:"0.875rem", fontWeight:700, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</div>
                      <div style={{ fontFamily:T.sans, fontSize:"0.72rem", color:T.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.email}</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding:"0.4rem" }}>
                  {[
                    { icon:"📦", label:"My Orders",   dest:"orders"  },
                    { icon:"👤", label:"My Profile",  dest:"profile" },
                    { icon:"🛍️", label:"Browse Shop", dest:"shop"    },
                  ].map(({ icon, label, dest }) => (
                    <button key={dest} className="dropdown-item" onClick={() => nav(dest)} style={{
                      width:"100%", background:"transparent", border:"none",
                      padding:"0.65rem 0.85rem", borderRadius:"8px",
                      display:"flex", alignItems:"center", gap:"0.75rem",
                      cursor:"pointer", transition:"all 0.12s", textAlign:"left",
                    }}>
                      <span style={{ fontSize:"1rem" }}>{icon}</span>
                      <span style={{ fontFamily:T.sans, fontSize:"0.875rem", color:T.textMid, fontWeight:500 }}>{label}</span>
                    </button>
                  ))}
                </div>

                <div style={{ height:"1px", background:T.border, margin:"0 0.4rem" }} />

                <div style={{ padding:"0.4rem" }}>
                  <button onClick={logout} style={{
                    width:"100%", background:"transparent", border:"none",
                    padding:"0.65rem 0.85rem", borderRadius:"8px",
                    display:"flex", alignItems:"center", gap:"0.75rem",
                    cursor:"pointer", transition:"all 0.12s", textAlign:"left",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background="#fee2e2"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    <span style={{ fontSize:"1rem" }}>🚪</span>
                    <span style={{ fontFamily:T.sans, fontSize:"0.875rem", color:T.error, fontWeight:500 }}>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Hamburger button — visible on mobile only (CSS shows it) ── */}
        <div ref={hamburgerRef} style={{ position:"relative" }}>
          <button className="nav-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? "✕" : "☰"}
          </button>

          {/* Mobile menu panel */}
          <div className={`nav-mobile-menu${mobileMenuOpen ? " open" : ""}`}>
            {/* Nav links */}
            {[
              { icon:"🏠", label:"Home",  dest:"home" },
              { icon:"🛍️", label:"Shop",  dest:"shop" },
            ].map(({ icon, label, dest }) => (
              <button key={dest} className="nav-mobile-item" onClick={() => nav(dest)}>
                <span>{icon}</span>{label}
              </button>
            ))}

            {user && (
              <>
                <div className="nav-mobile-divider" />
                {[
                  { icon:"📦", label:"My Orders",  dest:"orders"  },
                  { icon:"👤", label:"My Profile", dest:"profile" },
                ].map(({ icon, label, dest }) => (
                  <button key={dest} className="nav-mobile-item" onClick={() => nav(dest)}>
                    <span>{icon}</span>{label}
                  </button>
                ))}
                <div className="nav-mobile-divider" />
                <button className="nav-mobile-item nav-mobile-logout" onClick={logout}>
                  <span>🚪</span>Log out
                </button>
              </>
            )}

            {!user && (
              <>
                <div className="nav-mobile-divider" />
                <button className="nav-mobile-item" onClick={() => nav("login")}>
                  <span>🔑</span>Log in
                </button>
                <button className="nav-mobile-item" onClick={() => nav("register")}>
                  <span>✨</span>Register
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}
