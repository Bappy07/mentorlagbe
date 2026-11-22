# MentorLagbe — Smart Tuition & Mentorship Platform

MentorLagbe is a full-stack, role-based EdTech marketplace that connects qualified **tutors** with **students** looking for subject-wise tuition batches and 1-on-1 mentorship. **Admins** moderate listings, manage users and track Stripe revenue.

Students search and filter approved tuitions, apply for sessions and track application status. Tutors post batches, manage applicants and upgrade to Pro for unlimited listings. Both tutors and students can purchase the Pro plan through Stripe Checkout.

> **Live site:** `https://<your-deployment-url>.vercel.app` _(replace after deploying the client)_
>
> **API:** `https://<your-api-url>/api` _(replace after deploying the server)_

---

## Quick testing credentials

Seeded by `npm run seed` in the server folder. Change these in production.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@mentorlagbe.com` | `Admin@12345` |
| Tutor | `tutor@mentorlagbe.com` | `Tutor@12345` |
| Student | `student@mentorlagbe.com` | `Student@12345` |

Extra seeded accounts: `tanvir.tutor@mentorlagbe.com`, `nusrat.tutor@mentorlagbe.com` (password `Tutor@12345`) and `karim.student@mentorlagbe.com`, `mim.student@mentorlagbe.com` (password `Student@12345`).

---

## Tech stack

**Client** — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, DaisyUI, shadcn-style UI primitives (`@base-ui/react`), lucide-react, react-hot-toast, BetterAuth React client.

**Server** — Node.js, Express 5, TypeScript, MongoDB (native driver), BetterAuth + Mongo adapter, JWT (`jsonwebtoken`), Stripe Checkout + webhooks, ImgBB direct image upload (`multer`), CORS.

## Key features

- Role-based auth (student / tutor / admin) with BetterAuth cookie sessions **and** JWT Bearer tokens issued at `/api/auth/token`.
- Reusable server guards: `verifyToken`, `verifyStudent`, `verifyTutor`, `verifyAdmin`.
- Server-side search, filter and MongoDB `.skip()`/`.limit()` pagination on the public tuition list.
- Tutor CRUD for tuitions with free-plan cap (2 posts) and admin approval workflow.
- Student application flow with duplicate prevention, cancellation and tutor accept/reject.
- Stripe Checkout: **$15** Pro Tutor / **$10** Pro Student; webhook + session verification write to `payments` and set `plan: pro`.
- Direct ImgBB image upload for profile photos and tuition banners (5 MB limit).
- Admin dashboard: stats, user role management, tuition approval, Stripe transactions.
- Bookmarks, dark/light theme toggle, loading/error/404 pages, toast notifications.
- 12 realistic approved tuitions plus connected tutors, students and sample applications seeded via `npm run seed`.

## Data model (4 collections only)

| Collection | Purpose |
| --- | --- |
| `users` | Accounts, role, profile image, phone, bio, plan, saved tuitions |
| `tuitions` | Tutor listings with approval status, mode, fee, banner, description |
| `applications` | Student enrolments with status, schedule, note and applied date |
| `payments` | Stripe Pro subscription transactions |

---

## Setup

### 1. Server

```bash
cd server
npm install
cp .env.example .env        # fill in your real credentials
npm run seed                # creates demo accounts + 12 approved tuitions
npm run dev                 # http://localhost:5000
```

Required server env vars (see `server/.env.example`):

`PORT`, `MONGODB_URI`, `DB_NAME`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CLIENT_URL`, `CORS_ORIGIN`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `IMGBB_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, plus the seed `ADMIN_*` / `TUTOR_*` / `STUDENT_*` credentials.

Stripe and ImgBB features are implemented but require valid keys in `server/.env` to function.

### 2. Client

```bash
cd client
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL to your API origin
npm run dev                  # http://localhost:3000
```

Client env vars:

| Variable | Example | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | Backend API base (no trailing slash) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Frontend origin used for auth callbacks and Stripe redirects |

### 3. Verify

```bash
# server
npm run typecheck && npm run build

# client
npm run build
```

---

## Deployment notes

- Set `CLIENT_URL` / `CORS_ORIGIN` on the server to the deployed frontend origin (comma-separated values are supported). CORS uses `credentials: true`, and BetterAuth `trustedOrigins` is derived from the same variables — no hardcoded localhost remains in the client.
- Point Stripe webhook events (`checkout.session.completed`) to `https://<api>/api/payments/webhook` and set `STRIPE_WEBHOOK_SECRET`. The raw-body route is mounted **before** `express.json()`.
- The SPA handles hard reloads on private routes: BetterAuth revalidates the httpOnly cookie and protected APIs accept the stored JWT, so logged-in users are not bounced to `/sign-in`.
- Stripe Checkout redirects to `/payment/success?session_id=...` and `/payment/cancel` on the client.

## Submission checklist

- **Admin Email / Password:** `admin@mentorlagbe.com` / `Admin@12345`
- **Tutor Email / Password:** `tutor@mentorlagbe.com` / `Tutor@12345`
- **Live Site Link:** _fill after deployment_
- **GitHub Repository (Server):** _this monorepo — `server/`_
- **GitHub Repository (Client):** _this monorepo — `client/`_

> ⚠️ Security: credentials were committed in an earlier revision of this repository. Rotate the MongoDB, BetterAuth, Google, JWT, Stripe and ImgBB secrets before publishing.
