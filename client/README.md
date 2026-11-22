# MentorLagbe client

Next.js 16 (App Router) frontend for the MentorLagbe tuition platform. See the [root README](../README.md) for setup, credentials and deployment notes.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev   # http://localhost:3000
```

| Variable | Example | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | Backend API base (no trailing slash). Production: `https://mentorlagbe.onrender.com/api` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Auth callback origin. Production: `https://mentorlagbe-drab.vercel.app` |

## Structure

- `src/app` — public pages (`/`, `/tuitions`, `/tuitions/[id]`, `/pricing`, `/payment`, `/payment/history`, `/payment/success`, `/payment/cancel`), auth pages and role dashboards under `/dashboard`.
- `src/components/shared` — navbar (auth-aware, theme toggle) and footer (with X logo).
- `src/lib/api.ts` — `apiFetch`, JWT storage/issuance helper; `src/lib/auth-client.ts` — BetterAuth React client.
- `src/app/loading.tsx`, `error.tsx`, `not-found.tsx` — loading, error and 404 states.

## Scripts

`npm run dev`, `npm run build`, `npm start`, `npm run lint`.

UI: Tailwind CSS 4 + DaisyUI, shadcn-style primitives on `@base-ui/react`, lucide-react icons, react-hot-toast notifications, Manrope font.
