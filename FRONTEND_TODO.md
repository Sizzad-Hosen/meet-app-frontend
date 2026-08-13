# Meet App Frontend TODO

## Completed

- [x] Created `meet-app-frontend` with Next.js, TypeScript, Tailwind CSS, and ESLint.
- [x] Installed Redux Toolkit, React Redux, RTK Query, Lucide icons, and shadcn-compatible utility packages.
- [x] Added app-level Redux provider wiring.
- [x] Added RTK Query base API configured with `NEXT_PUBLIC_API_BASE_URL`.
- [x] Added auth, meeting, join, and LiveKit token endpoint scaffolding.
- [x] Added shadcn-style `Button`, `Card`, `Badge`, and `Input` primitives.
- [x] Built the first dashboard screen for meeting creation, join code entry, room policy, and session overview.
- [x] Added `.env.example` for the backend API base URL.

## Next Tasks

- [x] Connect the create meeting and join meeting forms to RTK Query mutations.
- [ ] Build `/login` and `/register` pages and persist access tokens safely.
- [ ] Add protected app routes for meetings, participants, polls, recordings, and breakout rooms.
- [ ] Add Socket.IO client integration for live meeting room events.
- [ ] Add LiveKit room UI after token generation.
- [ ] Add form validation with Zod and React Hook Form.
- [ ] Add frontend tests for API hooks and core meeting flows.

## Local Commands

```bash
npm install
npm run dev
```

Default frontend URL:

```text
http://localhost:3000
```
