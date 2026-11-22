# MentorLagbe API (server)

Express 5 + TypeScript + MongoDB backend for the MentorLagbe tuition platform. See the [root README](../README.md) for the full project overview, demo credentials and deployment notes.

## Run locally

```bash
npm install
cp .env.example .env   # fill in real credentials
npm run seed           # demo accounts, 12 approved tuitions, sample applications
npm run dev            # http://localhost:5000
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start with `tsx watch` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm run seed` | Seed accounts, approved tuitions and applications |

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default `5000`) |
| `MONGODB_URI`, `DB_NAME` | MongoDB connection |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | BetterAuth config |
| `CLIENT_URL`, `CORS_ORIGIN`, `FRONTEND_URL` | Allowed CORS / trusted origins (comma-separated) |
| `JWT_SECRET` | Signs Bearer tokens issued by `POST /api/auth/token` |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe Checkout + webhook verification |
| `IMGBB_API_KEY` | Direct image upload |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional Google login |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `TUTOR_*`, `STUDENT_*` | Seed account credentials |

## API overview

| Method | Path | Guard | Purpose |
| --- | --- | --- | --- |
| ALL | `/api/auth/*` | BetterAuth | Sign up, sign in, sign out, session, Google |
| POST | `/api/auth/token` | cookie session | Issue a JWT for protected API calls |
| GET | `/api/health` | public | Health check |
| GET | `/api/tuitions/approved` | public | Search, filter and paginated approved listings |
| GET/POST | `/api/tuitions` | tutor | Own listings / create pending listing |
| GET/PUT/PATCH/DELETE | `/api/tuitions/:id` | tutor (owner) | Detail, update, toggle active, delete |
| GET | `/api/applications` | student | Own applications |
| GET | `/api/applications/tutor` | tutor | Received applications |
| POST | `/api/applications/:tuitionId` | student | Apply (duplicate blocked) |
| PATCH | `/api/applications/:id/status` | tutor (owner) | Accept / reject |
| DELETE | `/api/applications/:id` | student | Cancel pending application |
| GET | `/api/admin/stats` | admin | Platform statistics + revenue |
| GET/PATCH | `/api/admin/tuitions...` | admin | All listings / approve or reject |
| GET/PATCH | `/api/admin/users...` | admin | Users / role management |
| GET | `/api/admin/payments` | admin | Stripe transaction records |
| POST | `/api/payments/checkout` | token | Start Stripe Checkout ($15 tutor / $10 student) |
| GET | `/api/payments/verify/:sessionId` | token | Fallback payment verification |
| POST | `/api/payments/webhook` | Stripe signature | `checkout.session.completed` sync |
| POST | `/api/upload/image`, `/api/upload/banner` | token | ImgBB upload (profile / banner) |
| GET/PATCH | `/api/user/me`, `/api/user/profile` | token | Profile read / update |
| GET/POST/DELETE | `/api/user/saved...` | token | Student bookmarks |

Auth accepts either a `Bearer` JWT (recommended for dashboards) or the BetterAuth httpOnly session cookie (used by public pages and as a fallback). Only four MongoDB collections are used: `users`, `tuitions`, `applications`, `payments`.
