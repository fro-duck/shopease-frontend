import { useState } from "react";
import { authAPI } from "../api/index.js";

const T = {
  primary:"#ff6900", primaryHover:"#e55e00", primaryLight:"#fff3ee",
  bg:"#fff8f5", bgGray:"#f5f5f5", border:"#eee",
  text:"#111", textMid:"#444", textMuted:"#888",
  success:"#16a34a", error:"#dc2626", sans:"'Inter','DM Sans',sans-serif",
};

export default function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail]       = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return setError("Email is required");
    if (!/\S+@\S+\.\S+/.test(email)) return setError("Enter a valid email");
    setError("");
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(email);
      if (res.success) {
        setSent(true);
      } else {
        setError(res.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        <button onClick={() => onNavigate("login")} style={{ background:"transparent", border:"none", color:T.textMid, fontFamily:T.sans, fontSize:"0.875rem", cursor:"pointer" }}>← Back to Login</button>
      </nav>

      {/* Content */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
        <div style={{ width:"100%", maxWidth:"420px" }}>

          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:"2rem" }}>
            <div style={{ width:"56px", height:"56px", background:T.primaryLight, border:`1px solid #ffd4b8`, borderRadius:"14px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem", fontSize:"1.5rem" }}>
              {sent ? "✉️" : "🔐"}
            </div>
            <h1 style={{ fontFamily:T.sans, fontSize:"1.6rem", fontWeight:700, color:T.text, marginBottom:"0.4rem" }}>
              {sent ? "Check your email" : "Forgot Password?"}
            </h1>
            <p style={{ fontFamily:T.sans, fontSize:"0.875rem", color:T.textMuted }}>
              {sent ? `We sent a reset link to ${email}` : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {/* Card */}
          <div style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:"16px", padding:"2rem", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>

            {!sent ? (
              <>
                {/* Error */}
                {error && (
                  <div style={{ background:"#fee2e2", border:`1px solid #fca5a5`, borderRadius:"8px", padding:"0.75rem 1rem", marginBottom:"1.25rem", fontFamily:T.sans, fontSize:"0.85rem", color:T.error }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Email input */}
                <div style={{ marginBottom:"1.25rem" }}>
                  <label style={{ fontFamily:T.sans, fontSize:"0.82rem", color:T.textMid, marginBottom:"0.4rem", display:"block", fontWeight:500 }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    style={{
                      width:"100%", padding:"0.8rem 1rem",
                      background:"white", border:`1px solid ${error ? T.error : T.border}`,
                      borderRadius:"10px", color:T.text, fontFamily:T.sans, fontSize:"0.9rem", outline:"none",
                    }}
                    onFocus={e => e.target.style.borderColor = T.primary}
                    onBlur={e => e.target.style.borderColor = error ? T.error : T.border}
                  />
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    width:"100%", background: loading ? "#ffb380" : T.primary, border:"none", color:"white",
                    padding:"0.9rem", borderRadius:"10px", fontFamily:T.sans, fontSize:"0.95rem", fontWeight:600,
                    cursor: loading ? "not-allowed" : "pointer", transition:"all 0.15s",
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = T.primaryHover; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = T.primary; }}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </>
            ) : (
              <>
                {/* Sent state */}
                <div style={{ background:"#dcfce7", border:`1px solid #86efac`, borderRadius:"8px", padding:"1rem", marginBottom:"1.25rem", fontFamily:T.sans, fontSize:"0.85rem", color:T.success, textAlign:"center" }}>
                  ✅ Reset link sent! Check your inbox and spam folder.
                </div>
                <p style={{ fontFamily:T.sans, fontSize:"0.82rem", color:T.textMuted, textAlign:"center", marginBottom:"1.25rem", lineHeight:1.6 }}>
                  The link will expire in <strong>1 hour</strong>. Click it to set a new password.
                </p>
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  style={{
                    width:"100%", background:"white", border:`1px solid ${T.border}`,
                    color:T.textMid, padding:"0.85rem", borderRadius:"10px",
                    fontFamily:T.sans, fontSize:"0.9rem", cursor:"pointer",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.color = T.primary; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMid; }}
                >
                  Try a different email
                </button>
              </>
            )}

            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:"1rem", margin:"1.5rem 0 0" }}>
              <div style={{ flex:1, height:"1px", background:T.border }} />
              <span style={{ fontFamily:T.sans, fontSize:"0.78rem", color:T.textMuted }}>Remember your password?</span>
              <div style={{ flex:1, height:"1px", background:T.border }} />
            </div>
            <button
              onClick={() => onNavigate("login")}
              style={{
                width:"100%", background:"white", border:`1px solid ${T.border}`,
                color:T.textMid, padding:"0.85rem", borderRadius:"10px",
                fontFamily:T.sans, fontSize:"0.9rem", cursor:"pointer", marginTop:"1rem",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.color = T.primary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMid; }}
            >
              Back to Login →
            </button>
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
