# FleurEase Deployment Plan

**Target:** Portfolio-ready public deployment  
**Stack:** React (Vite) frontend on Vercel + Express backend on Render + MongoDB Atlas + Cloudinary + Gmail SMTP

---

## Phase 0 — Pre-flight Checks (do before touching any code)

- [ ] Log into MongoDB Atlas and confirm the `FleurEase` cluster is still alive. If the cluster was paused/deleted, create a new free M0 cluster and update the connection string.
- [ ] Rotate the MongoDB Atlas DB user password (the old one was committed to the repo in `.env.example`).
- [ ] Check if the Cloudinary account (`daw004dq5`) is still active. If yes, grab the cloud name, API key, and API secret from the Cloudinary dashboard.
- [ ] Test whether the Gmail SMTP app password in `.env.example` still works — if it fails, go to the Google account → Security → App Passwords and generate a new one.
- [ ] Locate which Google account owns the Firebase project `fleurease-e18ea`. You'll need it in Phase 2.

---

## Phase 1 — Remove Facebook Login

Facebook login is wired into `Login.jsx`, `Register.jsx` (frontend) and `/api/v1/facebook-login` (backend). Remove it cleanly so nothing breaks.

**Backend**
- [ ] In `backend/controllers/auth.js` — delete the `facebookLogin` function.
- [ ] In `backend/routes/auth.js` — remove the `facebookLogin` import and the `router.post('/facebook-login', ...)` line.

**Frontend**
- [ ] In `frontend/src/Components/User/Login.jsx`:
  - Remove the `import FacebookLogin from '@greatsumini/react-facebook-login'` line.
  - Delete the `handleFacebookLogin` function (~lines 109–150).
  - Delete the `<FacebookLogin ...>` JSX block (~lines 344–375).
- [ ] Do the same in `frontend/src/Components/User/Register.jsx` (same pattern, ~lines 11, 130–165, 460–490).
- [ ] Uninstall the package: `npm uninstall @greatsumini/react-facebook-login` inside `frontend/`.
- [ ] Remove `VITE_FACEBOOK_APP_ID` from `frontend/.env.example`.

---

## Phase 2 — Fix Firebase / Google Login Config

The Firebase config is currently hardcoded in `frontend/src/firebase.js`. Before deploying, move it to env vars so it reads from `.env` instead of being baked into the bundle.

- [ ] Update `firebase.js` to read from `import.meta.env.VITE_APP_*` variables instead of hardcoded strings.
- [ ] Find the Firebase project `fleurease-e18ea` in Firebase Console.
- [ ] Add your Vercel frontend domain (e.g. `fleurease.vercel.app`) to Firebase Console → Authentication → Settings → Authorized domains.
- [ ] Create `frontend/.env` with all `VITE_APP_*` values filled in from the Firebase Console web config.

---

## Phase 3 — Fix CORS and Production Config

The backend CORS origin is hardcoded to `http://localhost:5173`. It needs to point to the deployed frontend URL.

- [ ] In `backend/app.js`, change the `origin` value to read from an env var:
  ```js
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  ```
- [ ] Add `FRONTEND_URL` to the backend `.env` (set to your Vercel URL after deploy).
- [ ] In `backend/server.js`, confirm `dotenv.config({path: './config/.env'})` — this is fine for local. On Render you'll set env vars directly in the dashboard (no `.env` file needed there).
- [ ] Change `NODE_ENV=production` in the backend env vars when deploying.

---

## Phase 4 — Create Environment Files Locally

Create the actual `.env` files (these are gitignored) so you can test everything locally before pushing.

**`backend/config/.env`**
```
PORT=4001
NODE_ENV=development
DB_URI=<your Atlas connection string with rotated password>
CLOUDINARY_CLOUD_NAME=<from Cloudinary dashboard>
CLOUDINARY_API_KEY=<from Cloudinary dashboard>
CLOUDINARY_API_SECRET=<from Cloudinary dashboard>
JWT_SECRET=<generate a new long random string>
JWT_EXPIRES_TIME=7d
COOKIE_EXPIRES_TIME=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=<gmail address>
SMTP_PASSWORD=<Gmail App Password>
SMTP_FROM_EMAIL=<gmail address>
SMTP_FROM_NAME=FleurEase
FRONTEND_URL=http://localhost:5173
```

**`frontend/.env`**
```
VITE_API=http://localhost:4001/api/v1
VITE_APP_API_KEY=<from Firebase Console>
VITE_APP_AUTH_DOMAIN=<from Firebase Console>
VITE_APP_PROJECT_ID=<from Firebase Console>
VITE_APP_STORAGE_BUCKET=<from Firebase Console>
VITE_APP_MESSAGING_SENDER_ID=<from Firebase Console>
VITE_APP_APP_ID=<from Firebase Console>
VITE_APP_VAPID_KEY=<from Firebase Console, Cloud Messaging tab>
```

---

## Phase 5 — Local Smoke Test

Before deploying anywhere, verify everything runs locally with the new `.env` files.

- [ ] `cd backend && npm install && npm start` — confirm server starts and MongoDB connects.
- [ ] `cd frontend && npm install && npm run dev` — confirm the app loads.
- [ ] Test: register a new user, log in, Google Sign-In, browse products, add to cart, place an order.
- [ ] Confirm order confirmation email arrives with PDF attachment.
- [ ] Confirm product image upload works (creates a Cloudinary asset).

---

## Phase 6 — Deploy Backend to Render

- [ ] Push all code changes to GitHub (without `.env` files — they are gitignored).
- [ ] Go to [render.com](https://render.com) → New Web Service → connect your GitHub repo.
- [ ] Set **Root Directory** to `backend`.
- [ ] Set **Build Command** to `npm install`.
- [ ] Set **Start Command** to `node server.js` (not `nodemon` — nodemon is for dev only).
- [ ] Add all backend env vars in Render's Environment tab (same keys as `backend/config/.env` but with production values):
  - `NODE_ENV=production`
  - `FRONTEND_URL=<your Vercel URL — fill in after Phase 7>`
  - All others from Phase 4.
- [ ] Deploy and confirm the Render service URL is live (e.g. `https://fleurease-api.onrender.com`).
- [ ] Test `GET https://fleurease-api.onrender.com/api/v1/products` returns data.

> **Note:** Render free tier spins down after 15 minutes of inactivity and takes ~30 seconds to cold start. This is fine for a portfolio demo.

---

## Phase 7 — Deploy Frontend to Vercel

- [ ] Go to [vercel.com](https://vercel.com) → New Project → import the GitHub repo.
- [ ] Set **Root Directory** to `frontend`.
- [ ] Set **Framework Preset** to `Vite`.
- [ ] Add all frontend env vars in Vercel's Environment Variables settings:
  - `VITE_API=https://fleurease-api.onrender.com/api/v1`
  - All `VITE_APP_*` Firebase values.
- [ ] Deploy and note the Vercel URL.
- [ ] Go back to Render and update `FRONTEND_URL` to your Vercel URL, then redeploy the backend.
- [ ] Go to Firebase Console → Authentication → Authorized domains → add your Vercel URL.

---

## Phase 8 — Final Verification

- [ ] Open the live Vercel URL in an incognito window.
- [ ] Register a new account and confirm the verification email arrives.
- [ ] Log in with Google.
- [ ] Browse products, filter by category/price/rating.
- [ ] Place a test order and confirm the email with PDF receipt arrives.
- [ ] Log in as admin and confirm the dashboard, charts, and product CRUD all work.
- [ ] Check that product image uploads go to Cloudinary.

---

## Summary of Services Used

| Service | Purpose | Free Tier |
|---|---|---|
| MongoDB Atlas M0 | Database | Yes |
| Cloudinary | Product/avatar image storage | Yes (25 GB) |
| Gmail SMTP | Order emails + PDF receipts | Yes (App Password) |
| Firebase | Google OAuth | Yes |
| Render | Backend hosting | Yes (spins down on idle) |
| Vercel | Frontend hosting | Yes |
