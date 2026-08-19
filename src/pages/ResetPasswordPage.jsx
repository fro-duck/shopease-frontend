import { useState } from "react";
import { authAPI } from "../api/index.js";

const T = {
  primary:"#ff6900", primaryHover:"#e55e00", primaryLight:"#fff3ee",
  bg:"#fff8f5", bgGray:"#f5f5f5", border:"#eee",
  text:"#111", textMid:"#444", textMuted:"#888",
  success:"#16a34a", error:"#dc2626", sans:"'Inter','DM Sans',sans-serif",
};

export default function ResetPasswordPage({ onNavigate, resetToken }) {
  const [password, setPassword]       = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [apiError, setApiError]       = useState("");
  const [success, setSuccess]         = useState(false);

  const validate = () => {
    const e = {};
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    if (!confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      const res = await authAPI.resetPassword(resetToken, password);
      if (res.success) {
        setSuccess(true);
        // Auto-redirect to login after 3s so the user sees the success message
        setTimeout(() => onNavigate("login"), 3000);
      } else {
        setApiError(res.message || "Failed to reset password. The link may have expired.");
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
      </nav>

      {/* Content */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
        <div style={{ width:"100%", maxWidth:"420px" }}>

          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:"2rem" }}>
            <div style={{ width:"56px", height:"56px", background:T.primaryLight, border:`1px solid #ffd4b8`, borderRadius:"14px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem", fontSize:"1.5rem" }}>
              {success ? "✅" : "🔑"}
            </div>
            <h1 style={{ fontFamily:T.sans, fontSize:"1.6rem", fontWeight:700, color:T.text, marginBottom:"0.4rem" }}>
              {success ? "Password Reset!" : "Set New Password"}
            </h1>
            <p style={{ fontFamily:T.sans, fontSize:"0.875rem", color:T.textMuted }}>
              {success ? "Redirecting to login..." : "Enter your new password below"}
            </p>
          </div>

          {/* Card */}
          <div style={{ background:"white", border:`1px solid ${T.border}`, borderRadius:"16px", padding:"2rem", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>

            {success ? (
              <div style={{ textAlign:"center" }}>
                <div style={{ background:"#dcfce7", border:`1px solid #86efac`, borderRadius:"8px", padding:"1rem", marginBottom:"1.25rem", fontFamily:T.sans, fontSize:"0.85rem", color:T.success }}>
                  ✅ Your password has been reset successfully!
                </div>
                <p style={{ fontFamily:T.sans, fontSize:"0.82rem", color:T.textMuted, marginBottom:"1.25rem" }}>
                  You will be redirected to the login page in a few seconds.
                </p>
                <button
                  onClick={() => onNavigate("login")}
                  style={{
                    width:"100%", background:T.primary, border:"none", color:"white",
                    padding:"0.9rem", borderRadius:"10px", fontFamily:T.sans, fontSize:"0.95rem",
                    fontWeight:600, cursor:"pointer",
                  }}
                >
                  Go to Login →
                </button>
              </div>
            ) : (
              <>
                {/* API error */}
                {apiError && (
                  <div style={{ background:"#fee2e2", border:`1px solid #fca5a5`, borderRadius:"8px", padding:"0.75rem 1rem", marginBottom:"1.25rem", fontFamily:T.sans, fontSize:"0.85rem", color:T.error }}>
                    ⚠️ {apiError}
                  </div>
                )}

                <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem" }}>
                  {/* New password */}
                  <div>
                    <label style={{ fontFamily:T.sans, fontSize:"0.82rem", color:T.textMid, marginBottom:"0.4rem", display:"block", fontWeight:500 }}>New Password</label>
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={inp("password")}
                      onFocus={e => e.target.style.borderColor = T.primary}
                      onBlur={e => e.target.style.borderColor = errors.password ? T.error : T.border}
                    />
                    {errors.password && <p style={{ fontFamily:T.sans, fontSize:"0.74rem", color:T.error, marginTop:"0.3rem" }}>{errors.password}</p>}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label style={{ fontFamily:T.sans, fontSize:"0.82rem", color:T.textMid, marginBottom:"0.4rem", display:"block", fontWeight:500 }}>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={e => setConfirm(e.target.value)}
                      style={inp("confirmPassword")}
                      onFocus={e => e.target.style.borderColor = T.primary}
                      onBlur={e => e.target.style.borderColor = errors.confirmPassword ? T.error : T.border}
                      onKeyDown={e => e.key === "Enter" && handleReset()}
                    />
                    {errors.confirmPassword && <p style={{ fontFamily:T.sans, fontSize:"0.74rem", color:T.error, marginTop:"0.3rem" }}>{errors.confirmPassword}</p>}
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleReset}
                    disabled={loading}
                    style={{
                      width:"100%", background: loading ? "#ffb380" : T.primary, border:"none", color:"white",
                      padding:"0.9rem", borderRadius:"10px", fontFamily:T.sans, fontSize:"0.95rem", fontWeight:600,
                      cursor: loading ? "not-allowed" : "pointer", transition:"all 0.15s", marginTop:"0.25rem",
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = T.primaryHover; }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = T.primary; }}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </>
            )}
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
