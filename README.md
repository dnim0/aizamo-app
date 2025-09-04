# 🚀 AIzamo — AI Agency Website

Professional website + API for **AIzamo**.

> **Stack:** React 18 + Tailwind CSS (frontend) · FastAPI (backend) · MongoDB Atlas · GoHighLevel (CRM) · SMTP email · Heroku (deploy)

---

## 🌟 Highlights

* **Responsive UI** with tuned gutters and safe-area support (mobile notches).
* **Sticky roadmap progress** bar with smooth fade/slide and intersection-driven updates (no jitter between steps).
* **Testimonials** carousel with **fixed container height** to prevent layout shift when reviews have different lengths.
* **Loading screen** with centered phrase + progress bar and **randomized phrases** per load.
* **About** section headshot properly centered on mobile (object-fit/position).
* **Accessible** color tokens and motion-reduction friendly animations.

---

## 📁 Project Structure

```
.
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Navigation.jsx
│       │   ├── LoadingScreen/LogoLoadingScreen.jsx
│       │   ├── Testimonials.jsx
│       │   ├── About.jsx
│       │   └── Roadmap.jsx
│       ├── data/mock.js
│       ├── index.css
│       └── main entry (e.g., index.jsx / App.jsx)
└── backend/ (FastAPI)
    ├── app/
    │   ├── main.py
    │   ├── routes/
    │   ├── models/
    │   └── services/
    └── requirements.txt
```

> Adjust paths if your repo differs; filenames above match the updated components we edited.

---

## 🧩 Features

* **Modern React Frontend** — Tailwind CSS, fluid typography, utility presets.
* **FastAPI Backend** — Async endpoints, background tasks, Pydantic validation.
* **GoHighLevel Integration** — Automatic contact creation + follow-up task scheduling.
* **Email Notifications** — SMTP alerts on new contacts.
* **MongoDB Persistence** — Stores contact submissions; ready for analytics.
* **Heroku Ready** — Procfile/Config Vars friendly; logs + health checks.

---

## 🔗 API Endpoints (Backend)

* `GET /` — Serves app (or health page depending on setup)
* `GET /api/health` — Health check
* `POST /api/contact` — Submit contact form
* `GET /api/contact-submissions` — Admin-only (list submissions)

> If you also add a "Reviews" proxy later, prefer **server-side** (FastAPI) to keep API keys secret. Example path: `GET /api/reviews` (Google Places/Business Profile).

---

## 📋 Environment Variables

| Variable                | Description                                 | Required |
| ----------------------- | ------------------------------------------- | -------- |
| `MONGO_URL`             | MongoDB connection string                   | ✅        |
| `DB_NAME`               | MongoDB database name                       | ✅        |
| `SMTP_USERNAME`         | SMTP user/email                             | ✅        |
| `SMTP_PASSWORD`         | SMTP password                               | ✅        |
| `GHL_API_KEY`           | GoHighLevel API key                         | ✅        |
| `GHL_LOCATION_ID`       | GoHighLevel location ID                     | ✅        |
| `SECRET_KEY`            | App secret (sessions/signing)               | ✅        |
| `ORIGINS`               | CORS allowed origins (comma‑sep)            | ➖        |
| `PORT`                  | Heroku sets automatically                   | ➖        |
| `GOOGLE_PLACES_API_KEY` | *(Optional)* if adding server reviews proxy | ➖        |
| `GOOGLE_PLACE_ID`       | *(Optional)* place id for reviews           | ➖        |

> Keep all secrets **server-side**. Do not expose API keys in frontend code.

---

## 🛠️ Local Development

### Prereqs

* **Node.js 18+** (frontend)
* **Python 3.10+** (backend)

### Frontend

```bash
cd frontend
npm install
# dev (desktop)
npm run dev
# dev (mobile testing on your phone)
# Vite example: expose on LAN
npm run dev -- --host --port 3000
# open on phone: http://<your-LAN-IP>:3000
```

> If using CRA: `HOST=0.0.0.0 PORT=3000 npm start`. For HMR issues on phone, set Vite `server.hmr.host` to your LAN IP.

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Full-stack (concurrently)

Run both processes; configure frontend to call backend via env (e.g. `VITE_API_BASE=http://localhost:8000`).

---

## 🧪 QA Checklist (what we fixed / how to test)

* **Nav gutters**: desktop has comfortable side padding; mobile uses tighter gutters.
* **Anchor/offset**: sections aren’t hidden under fixed nav (uses `scroll-margin-top`).
* **Timeline**: sticky bar stays visible across the whole section; progress updates smoothly when a card becomes majority-visible.
* **Testimonials**: main card height is constrained (min/max or fixed) so page doesn’t twitch when the text changes length.
* **Loading screen**: phrase + bar are horizontally centered and vertically grouped; phrases rotate randomly per session; respects iOS safe areas.
* **About headshot**: centered crop on mobile.

---

## 🎨 Frontend Notes

* **Tailwind config**: explicit breakpoints; container padding; fluid font sizes; color tokens bound to CSS vars.
* **CSS utilities** (in `index.css`):

  * `.page-pad` / `.page-pad-nav` — responsive gutters
  * `.container-fluid` — full-bleed wrapper
  * `.anchor-offset` — prevents fixed-header overlap
  * `.hero-vh` — viewport-height calc minus nav
* **Animations** are GPU-friendly; respect `prefers-reduced-motion` if you extend them.
* **Loading phrases** live in `LogoLoadingScreen.jsx` → `PHRASES` array.

---

## 🚀 Deploy (Heroku)

### Backend (FastAPI)

1. Add a **Procfile** in `/backend`:

   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
2. Set Heroku **Config Vars** from the table above.
3. Push the backend to Heroku app (Python buildpack). Check logs: `heroku logs -t`.

### Frontend

Two common approaches:

* **A. Static hosting elsewhere** (Netlify/Vercel/S3):

  ```bash
  cd frontend
  npm run build
  # deploy the /dist or /build folder
  ```
* **B. Serve static from FastAPI**: copy the frontend build into a `static/` folder and mount with `StaticFiles` in FastAPI.

> Ensure frontend **API base URL** points to your backend app domain (env‑driven).

---

## 🔒 Security

* Validate inputs (Pydantic schemas).
* CORS restricted to required origins.
* Secrets via env only (12-factor).
* Consider basic rate limiting (e.g., Starlette middleware) for `/api/contact`.

---

## 🧰 Troubleshooting

* **Mobile preview not loading**: make sure dev server binds `0.0.0.0`, confirm phone & laptop on same Wi‑Fi, firewall allows node/python.
* **HMR on phone unreliable**: configure Vite `server.hmr.host` to your LAN IP.
* **Layout twitch** in testimonials: keep the main card at a fixed/min height and only transition opacity when rotating text.
* **Sticky bar flickers**: raise IntersectionObserver threshold (e.g., `0.66`) and debounce updates.

---

## 📝 License & Credits

* Internal project (choose a license when ready).
* Photography via Unsplash (avatars) — use direct `images.unsplash.com` or Source endpoints; consider local hosting for reliability.

---

## 💬 Support

* **Email:** [automate@aizamo.com](mailto:automate@aizamo.com)
* **Phone:** +1 (403) 800-3135

> Built with ❤️ by **AIzamo** — *Automate the Ordinary, Scale the Extraordinary.*
