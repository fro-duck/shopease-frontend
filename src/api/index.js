// ── API base URL ──────────────────────────────────────────────────────────────
// Production points to Railway via REACT_APP_API_URL set in Vercel env vars.
// Falls back to Railway URL directly for local dev when the env var is missing.
const BASE_URL = process.env.REACT_APP_API_URL || "https://shopease-backend-production.up.railway.app/api";

// ── Auth helpers ──────────────────────────────────────────────────────────────
// Token is read fresh on every call so it always reflects the current session
const getToken = () => localStorage.getItem("token");

// Omits the Authorization header entirely when no token exists (guest requests)
const authHeaders = () => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// ── Auth API ──────────────────────────────────────────────────────────────────
// register and login don't need auth headers — they're public endpoints
export const authAPI = {
  register: async (name, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders() });
    return res.json();
  },

  forgotPassword: async (email) => {
    // 15s timeout guards against Railway cold start on this low-traffic endpoint
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });
      return res.json();
    } finally {
      clearTimeout(timeout);
    }
  },

  resetPassword: async (token, password) => {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    return res.json();
  },
};

// ── Products API ──────────────────────────────────────────────────────────────
export const productsAPI = {
  getFeatured: async () => {
    const res = await fetch(`${BASE_URL}/products/featured`);
    return res.json();
  },

  getAll: async (search = "", category = "") => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    const res = await fetch(`${BASE_URL}/products?${params}`);
    return res.json();
  },

  getCategories: async () => {
    const res = await fetch(`${BASE_URL}/products/categories`);
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    return res.json();
  },

  updateStock: async (id, quantity) => {
    const res = await fetch(`${BASE_URL}/products/${id}/stock`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ quantity }),
    });
    return res.json();
  },
};

// ── Cards API ─────────────────────────────────────────────────────────────────
export const cardsAPI = {
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/cards`, { headers: authHeaders() });
    return res.json();
  },
  save: async (card_last4, card_name, expiry, card_token) => {
    const res = await fetch(`${BASE_URL}/cards`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ card_last4, card_name, expiry, card_token }),
    });
    return res.json();
  },
  remove: async (id) => {
    const res = await fetch(`${BASE_URL}/cards/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return res.json();
  },
};

// ── Orders API ────────────────────────────────────────────────────────────────
export const ordersAPI = {
  // Strips down cart items to only what the backend/receipt needs — avoids sending full product objects
  create: async (total_amount, transaction_id, items) => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        total_amount,
        transaction_id,
        status: "approved",
        items: items ? items.map(i => ({ name: i.name, price: i.price, qty: i.qty, image_emoji: i.image_emoji })) : []
      }),
    });
    return res.json();
  },
  getAll: async () => {
    const res = await fetch(`${BASE_URL}/orders`, { headers: authHeaders() });
    return res.json();
  },
  sendReceipt: async (payload) => {
    const res = await fetch(`${BASE_URL}/receipt`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};

// ── Payments API ──────────────────────────────────────────────────────────────
export const paymentsAPI = {
  initiate: async (cardDetails, amount, merchant_reference) => {
    // 30s timeout — bank server (Render free tier) can take ~19s to wake from cold start
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(`${BASE_URL}/payments/initiate`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ ...cardDetails, amount, merchant_reference }),
        signal: controller.signal,
      });
      return res.json();
    } catch (err) {
      if (err.name === "AbortError") throw new Error("Bank server took too long to respond. Please try again.");
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  },
  getStatus: async (transaction_id) => {
    const res = await fetch(`${BASE_URL}/payments/${transaction_id}`, {
      headers: authHeaders(),
    });
    return res.json();
  },
};

export default BASE_URL;
