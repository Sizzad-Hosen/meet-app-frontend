# Meet App Frontend TODO

## Completed

- [x] Created `meet-app-frontend` with Next.js, TypeScript, Tailwind CSS, and ESLint.
- [x] Installed Redux Toolkit, React Redux, RTK Query, Lucide icons, and shadcn-compatible utility packages.
- [x] Added app-level Redux provider wiring.
- [x] Added RTK Query base API configured with `NEXT_PUBLIC_API_BASE_URL`.
- [x] Added automatic refresh-token retry for protected API calls.
- [x] Added Redux auth state with local storage hydration.
- [x] Added auth endpoints: register, login, forgot password, reset password, refresh token, logout.
- [x] Added meeting endpoints: create, get, update, delete, join, leave, waiting room, admit, admit all, deny, kick, end, mute, mute all, co-host, participants.
- [x] Added LiveKit token endpoint.
- [x] Added shadcn-style `Button`, `Card`, `Badge`, and `Input` primitives.
- [x] Built auth pages: `/login`, `/register`, `/forgot-password`, `/reset-password`.
- [x] Built the first dashboard screen with live create meeting, join meeting, logout, and feature API map.
- [x] Added `.env.example` for the backend API base URL.
- [x] Verified `npm run lint`.
- [x] Verified `npm run build`.

## Next Tasks

- [x] Add backend email verification endpoints before building a real verification flow.
- [x] Add route guards that redirect unauthenticated users from protected screens.
- [x] Add breakout room endpoints: create, list, join, end all, broadcast.
- [x] Add poll endpoints: create, list, vote, results, close.
- [x] Add screen share endpoints: status, start, stop, approve, deny.
- [x] Add recording endpoints: start, stop, list, download, delete.
- [x] Build full detail pages for meetings, participants, polls, recordings, breakout rooms, screen share, and LiveKit room entry.
- [x] Add Socket.IO client integration for live meeting room events.
- [x] Add LiveKit room UI after token generation.
- [x] Add form validation with Zod and React Hook Form.
- [x] Add frontend tests for API hooks and core meeting flows.

## Review Notes

- Backend `POST /auth/register` still returns `data.user`; the frontend redirects to `/login` after registration and sends a verification email request.
- Backend email verification is now exposed through `POST /auth/send-verification-email` and `POST /auth/verify-email`.
- Backend reset password currently accepts `{ "email": "...", "newPassword": "..." }`; token-based reset validation can be added later if desired.
- Recording start/stop hooks and UI are implemented. A full local start/stop smoke test requires a reachable LiveKit egress service.

## Local Commands

```bash
npm install
npm run dev
```

Default frontend URL:

```text
http://localhost:3000
```
