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
- [x] Added shadcn-style `Button`, `Card`, `Badge`, and `Input` primitives.
- [x] Built auth pages: `/login`, `/register`, `/forgot-password`, `/reset-password`.
- [x] Built the first dashboard screen with live create meeting, join meeting, logout, and feature API map.
- [x] Added `.env.example` for the backend API base URL.
- [x] Verified `npm run lint`.
- [x] Verified `npm run build`.

## Next Tasks

- [ ] Add backend email verification endpoints before building a real verification flow.
- [ ] Add route guards that redirect unauthenticated users from protected screens.
- [ ] Add breakout room endpoints: create, list, join, end all, broadcast.
- [ ] Add poll endpoints: create, list, vote, results, close.
- [ ] Add screen share endpoints: status, start, stop, approve, deny.
- [ ] Add recording endpoints: start, stop, list, download, delete.
- [ ] Add LiveKit token endpoint.
- [ ] Build full detail pages for meetings, participants, polls, recordings, breakout rooms, screen share, and LiveKit room entry.
- [ ] Add Socket.IO client integration for live meeting room events.
- [ ] Add LiveKit room UI after token generation.
- [ ] Add form validation with Zod and React Hook Form.
- [ ] Add frontend tests for API hooks and core meeting flows.

## Review Notes

- Backend `POST /auth/register` currently sets the refresh cookie but returns only `data.user`; it does not return `accessToken` in the response body. The frontend redirects users to `/login` after registration so protected calls have a token.
- Backend README mentions email verification conceptually through `isVerified`, but no email verification route is exposed yet. This remains pending.
- Backend reset password currently accepts `{ "email": "...", "newPassword": "..." }`; token-based reset validation can be added when the backend exposes token validation.

## Local Commands

```bash
npm install
npm run dev
```

Default frontend URL:

```text
http://localhost:3000
```
