import { useState } from "react";
import { authAPI } from "../api/index.js";

const T = {
  primary:"#ff6900", primaryHover:"#e55e00", primaryLight:"#fff3ee",
  bg:"#fff8f5", bgGray:"#f5f5f5", border:"#eee",
  text:"#111", textMid:"#444", textMuted:"#888",
  success:"#16a34a", error:"#dc2626", sans:"'Inter','DM Sans',sans-serif",
};

export default function LoginPage({ onNavigate, onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      const res = await authAPI.login(email, password);
      if (res.success) {
        // Persist both token and user object so App.js can restore session on reload
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        onLogin(res.user);
        onNavigate("home");
      } else {
        setApiError(res.message || "Invalid email or password");
      }
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inp = (field) => ({
    width:"100%", padding:"0.8rem 1rem",
    background:"white", border:`1px solid ${errors[field] ? T.error : T.border}`,
    borderRadius:"10px", color:T.text, fontFamily:T.sans, fontSize:"0.9rem", outline:"none",
  });

  return (
    <div style={{ background:T.bg, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap'); *{margin:0;padding:0;box-sizing:border-box;}`}</style>

      {/* Navbar */}
      <nav style={{ background:"white", borderBottom:`1px solid ${T.border}`, padding:"0 2rem", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.4rem", cursor:"pointer" }} onClick={() => onNavigate("home")}>
          <div style={{ width:"28px", height:"28px", background:T.primary, borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"white", fontSize:"0.85rem", fontWeight:700, fontFamily:T.sans }}>S</span>
          </div>
          <span style={{ fontFamily:T.sans, fontSize:"1.1rem", fontWeight:700, color:T.text }}>ShopEase</span>
        </div>
        <button onClick={() => onNavigate("home")} style={{ background:"transparent", border:"none", color:T.textMid, fontFamily:T.sans, fontSize:"0.875rem", cursor:"pointer" }}>← Back to Home</button>
      </nav>

      {/* Content */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
        <div style={{ width:"100%", maxWidth:"420px" }}>

          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:"2rem" }}>
            <div style={{ width:"56px", height:"56px", background:T.primaryLight, border:`1px solid #ffd4b8`, borderRadius:"14px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem", fontSize:"1.5rem" }}>👋</div>
            <h1 style={{ fontFamily:T.sans, fontSize:"1.6rem", fontWeight:700, color:T.text, marginBottom:"0.4rem" }}>Welcome back!</h1>
            <p style={{ fontFamily:T.sans, fontSize:"0.875rem", color:T.textMuted }}>Log in to your ShopEase account</p>
          </div>

          {/* Form card */}
          <div style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:"16px", padding:"2rem", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>

            {/* API error */}
            {apiError && (
              <div style={{ background:"#fee2e2", border:`1px solid #fca5a5`, borderRadius:"8px", padding:"0.75rem 1rem", marginBottom:"1.25rem", fontFamily:T.sans, fontSize:"0.85rem", color:T.error }}>
                ⚠️ {apiError}
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem" }}>
              {/* Email */}
              <div>
                <label style={{ fontFamily:T.sans, fontSize:"0.82rem", color:T.textMid, marginBottom:"0.4rem", display:"block", fontWeight:500 }}>Email</label>
                <input type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} style={inp("email")}
                  onFocus={e => e.target.style.borderColor = T.primary}
                  onBlur={e => e.target.style.borderColor = errors.email ? T.error : T.border}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
                {errors.email && <p style={{ fontFamily:T.sans, fontSize:"0.74rem", color:T.error, marginTop:"0.3rem" }}>{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label style={{ fontFamily:T.sans, fontSize:"0.82rem", color:T.textMid, marginBottom:"0.4rem", display:"block", fontWeight:500 }}>Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={inp("password")}
                  onFocus={e => e.target.style.borderColor = T.primary}
                  onBlur={e => e.target.style.borderColor = errors.password ? T.error : T.border}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
                {errors.password && <p style={{ fontFamily:T.sans, fontSize:"0.74rem", color:T.error, marginTop:"0.3rem" }}>{errors.password}</p>}
              </div>

              {/* Forgot password */}
              <div style={{ textAlign:"right", marginTop:"-0.5rem" }}>
                <button onClick={() => onNavigate("forgot-password")} style={{ background:"transparent", border:"none", color:T.primary, fontFamily:T.sans, fontSize:"0.8rem", cursor:"pointer", padding:0 }}>
                  Forgot password?
                </button>
              </div>

            

              {/* Login button */}
              <button onClick={handleLogin} disabled={loading} style={{
                width:"100%", background: loading ? "#ffb380" : T.primary, border:"none", color:"white",
                padding:"0.9rem", borderRadius:"10px", fontFamily:T.sans, fontSize:"0.95rem", fontWeight:600,
                cursor: loading ? "not-allowed" : "pointer", transition:"all 0.15s", marginTop:"0.25rem",
              }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = T.primaryHover; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = T.primary; }}
              >{loading ? "Logging in..." : "Log In"}</button>
            </div>

            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:"1rem", margin:"1.5rem 0" }}>
              <div style={{ flex:1, height:"1px", background:T.border }} />
              <span style={{ fontFamily:T.sans, fontSize:"0.78rem", color:T.textMuted }}>Don't have an account?</span>
              <div style={{ flex:1, height:"1px", background:T.border }} />
            </div>

            {/* Register link */}
            <button onClick={() => onNavigate("register")} style={{
              width:"100%", background:"white", border:`1px solid ${T.border}`,
              color:T.textMid, padding:"0.85rem", borderRadius:"10px",
              fontFamily:T.sans, fontSize:"0.9rem", cursor:"pointer", transition:"all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.color = T.primary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMid; }}
            >Create an account →</button>
          </div>

          {/* Security note */}
          <div style={{ display:"flex", alignItems:"center", gap:"0.4rem", justifyContent:"center", marginTop:"1.25rem" }}>
            <span style={{ fontSize:"0.75rem" }}>🔐</span>
            <span style={{ fontFamily:T.sans, fontSize:"0.75rem", color:T.textMuted }}>Secured with QR + Biometric Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
