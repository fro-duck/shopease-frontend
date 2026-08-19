import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import QRPage from './pages/QRPage';
import ConfirmationPage from './pages/ConfirmationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// ── App — client-side router ──────────────────────────────────────────────────
// All navigation is handled via `page` state instead of URL routes.
// pageData carries data between pages (e.g. productId, QR txData, reset token).
function App() {
  const [cart, setCart]         = useState([]);
  const [page, setPage]         = useState("home");
  const [pageData, setPageData] = useState(null);
  // Initialise user from localStorage so session survives page refresh
  const [user, setUser]         = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // ── Handle reset password link from email ──────────────────────────────────
  // The backend embeds ?page=reset-password&token=xxx in the reset link.
  // On load, detect it, extract the token, then clean the URL so the token
  // doesn't stay in the address bar or browser history.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const pg = params.get("page");
    if (pg === "reset-password" && token) {
      setPage("reset-password");
      setPageData(token);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const handleNavigate = (dest, data = null) => {
    setPage(dest);
    setPageData(data);
    window.scrollTo(0, 0);
  };


  const handleLogin = (userData) => setUser(userData);

  // Clear both token and user object from localStorage on logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    handleNavigate("home");
  };

  // Bundle nav-related props so child pages don't need individual prop drilling
  const navProps = { onNavigate: handleNavigate, user, onLogout: handleLogout, cart };

  // Auth pages — no navbar, no guard needed
  if (page === "login")            return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />;
  if (page === "register")         return <RegisterPage onNavigate={handleNavigate} onLogin={handleLogin} />;
  if (page === "forgot-password")  return <ForgotPasswordPage onNavigate={handleNavigate} />;
  if (page === "reset-password")   return <ResetPasswordPage onNavigate={handleNavigate} resetToken={pageData} />;

  if (page === "product") {
    return <ProductDetailPage productId={pageData} cart={cart} setCart={setCart} onNavigate={handleNavigate} user={user} navProps={navProps} />;
  }
  if (page === "orders") {
    // Protected — redirect to login if not authenticated
    if (!user) { handleNavigate("login"); return null; }
    return <OrderHistoryPage onNavigate={handleNavigate} user={user} navProps={navProps} />;
  }
  if (page === "profile") {
    // Protected — redirect to login if not authenticated
    if (!user) { handleNavigate("login"); return null; }
    return <ProfilePage onNavigate={handleNavigate} user={user} onLogout={handleLogout} navProps={navProps} />;
  }
  if (page === "shop" || page === "categories") {
    return <ShopPage cart={cart} setCart={setCart} onNavigate={handleNavigate} user={user} navProps={navProps} />;
  }
  if (page === "cart") {
    return <CartPage cart={cart} setCart={setCart} onNavigate={handleNavigate} user={user} navProps={navProps} />;
  }
  if (page === "checkout") {
    // Protected — redirect to login if not authenticated
    if (!user) { handleNavigate("login"); return null; }
    return <CheckoutPage cart={cart} onNavigate={handleNavigate} navProps={navProps} />;
  }
  if (page === "qr") {
    return <QRPage txData={pageData} onNavigate={handleNavigate} setCart={setCart} />;
  }
  if (page === "confirmation") {
    return <ConfirmationPage txData={pageData} onNavigate={handleNavigate} navProps={navProps} />;
  }

  return (
    <HomePage
      cart={cart}
      setCart={setCart}
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
      navProps={navProps}
    />
  );
}

export default App;
