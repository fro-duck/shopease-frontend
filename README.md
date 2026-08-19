# ShopEase 🛍️

A secure ecommerce web application with multi-factor transaction authorisation using QR codes and biometric authentication via the SecurePay mobile app.

## Live Links

- **Shopping Website:** https://shopease-frontend-beta.vercel.app
- **Backend API:** https://shopease-backend-production.up.railway.app

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Database | Supabase (Postgres) |
| Auth | JWT (localStorage) |
| Email | Brevo HTTP API |
| Hosting | Vercel (frontend) · Railway (backend) |

---

## Pages

| Page | Description |
|---|---|
| Home | Featured products |
| Shop | Full product listing with search and category filter |
| Product Detail | Individual product view |
| Cart | Cart management |
| Checkout | Card payment with saved card support |
| QR Page | QR code display, polling, and transaction audit log |
| Confirmation | Order summary after successful payment |
| Order History | Past orders |
| Profile | Account details |
| Login / Register | Authentication |
| Forgot / Reset Password | Password recovery via email token |

---

## Payment Flow

1. User fills in card details at checkout
2. ShopEase backend forwards details to the bank server and returns a QR code
3. QR page displays the code with a 2-minute countdown timer
4. User scans the QR code using the **SecurePay** mobile app
5. User authenticates with biometrics and approves or rejects the transaction
6. ShopEase polls the bank server every 3 seconds for the transaction status
7. On **APPROVED** — order saved to Supabase, stock updated, receipt email sent, navigates to Confirmation
8. On **REJECTED** — user can generate a new QR or return to cart (max 3 attempts per session)

### Transaction Audit Log

The QR page shows a live audit log of each step:
- QR Generated
- ⏳ Processing Payment
- ✅ Transaction Approved / ❌ Transaction Rejected

---

## Key Features

- Card validation — number, name, expiry, CVV with inline error messages
- Saved card support with token-based reuse
- QR expiry countdown with live status polling
- Cold start handling — slow-load warning after 12s, 30s AbortController timeout
- Network drop warning after 3 consecutive poll failures
- Max 3 QR attempts per checkout session
- Receipt email via Brevo after successful payment
- Forgot password / reset password via email token
- JWT-protected routes — unauthenticated users redirected to login
- Rate limiting on login endpoint (max 5 attempts per 15 min per IP)

---

## Test Card Details

Card details must match what is registered in your **SecurePay** account.

To test the payment flow:
- Register as a new user in the SecurePay app and use the card details linked to that account, or
- Log in to an existing SecurePay account and use the card details registered there.

---

## Environment Variables

Create a `.env` file in the project root:

```
REACT_APP_API_URL=https://shopease-backend-production.up.railway.app/api
```

---

## Local Development

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`. The backend must also be running — see the [backend repo](https://github.com/Alien2511/shopease-backend).

---

## Project

**Group:** FYP-26-S1-12 · **Module:** CSIT321 · **University:** University of Wollongong
