# Meet Apps Frontend

A simple browser-based meeting client built with Next.js, RTK Query, and LiveKit. The interface follows a focused Google Meet-style flow without dashboard metrics or placeholder session cards.

## Configuration

Create `.env.local`:




```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```


`NEXT_PUBLIC_LIVEKIT_URL`, `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` must all belong to the same LiveKit project. Restart Next.js after changing environment variables.

## Run



```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Implemented meeting flow

1. Register or sign in.
2. Create a meeting and show the generated join code in a host-ready screen.
3. Copy the code, share it, then select **Join now**. The host obtains a fresh LiveKit token.
4. A guest submits the code and enters the waiting screen.
5. The guest polls meeting state while the host sees the waiting-room list.
6. The host admits or denies the guest.
7. An admitted guest requests their own token from `POST /livekit/token` and connects to the same room.
8. LiveKit supplies camera, microphone, device, and media transport. Screen sharing is routed through the backend policy first.
9. Guests that require screen-share approval send a request; the host approves or denies it from the People panel.
10. The host can mute one user, mute all guests, assign a co-host, remove a user, start/stop an S3-backed recording, or end the meeting.

## Frontend API coverage

| Method | Endpoint | Frontend usage |
|---|---|---|
| POST | `/meetings/create` | Start a meeting and retain the host token |
| GET | `/meetings/:code` | Poll a guest's waiting/admission state |
| PUT | `/meetings/:code` | RTK mutation available |
| DELETE | `/meetings/:code` | RTK mutation available |
| POST | `/meetings/join` | Request entry by join code |
| POST | `/meetings/:code/leave` | Clean up participant state on disconnect |
| GET | `/meetings/:code/waiting-room` | Host panel, refreshed every two seconds |
| POST | `/meetings/:code/admit/:userId` | Host admits one user |
| POST | `/meetings/:code/admit-all` | Host admits everyone waiting |
| POST | `/meetings/:code/deny/:userId` | Host declines a request |
| POST | `/meetings/:code/kick/:userId` | Host removes a participant |
| POST | `/meetings/:code/end` | Host ends the meeting |
| POST | `/meetings/:code/mute/:userId` | Host requests mute for one participant |
| POST | `/meetings/:code/mute-all` | Host requests mute for all participants |
| POST | `/meetings/:code/cohost/:userId` | Host assigns co-host |
| GET | `/meetings/:code/participants` | Live people panel, refreshed every three seconds |
| POST | `/livekit/token` | Admitted guest obtains a connection token |
| GET | `/screen-share/:code/screenshare/status` | Poll active and pending screen shares |
| POST | `/screen-share/:code/screenshare/start` | Start sharing or request host approval |
| POST | `/screen-share/:code/screenshare/stop` | Stop sharing and release the share slot |
| POST | `/screen-share/:code/screenshare/approve/:userId` | Host approves a request |
| POST | `/screen-share/:code/screenshare/deny/:userId` | Host denies a request |
| POST | `/recordings/:code/start` | Host starts an S3-backed room recording |
| POST | `/recordings/:code/stop` | Host stops the active recording |
| GET | `/recordings/:meetingId` | Poll recording state |

## Manual two-user verification

1. Open `http://localhost:3000` in a normal window and register/sign in as the host.
2. Select **New meeting**, copy the displayed code, and select **Join now**.
3. Open a private/incognito window, register/sign in as another user, enter the same code, and select **Join**.
4. Confirm the guest sees **Asking to join** and cannot obtain a LiveKit token yet.
5. In the host People panel, admit the guest. Confirm the guest automatically enters the same room.
6. Test **Mute**, **Mute all**, **Make co-host**, **Remove**, screen-share approval, **Record**, and **End call**.

## Production checklist

- Serve the frontend and API over HTTPS; LiveKit must use `wss://`.
- Set exact `CORS_ORIGINS` values and use secure, HTTP-only refresh cookies.
- Keep `LIVEKIT_API_SECRET` and AWS credentials on the backend only.
- Configure an S3 bucket with private access and lifecycle/retention rules. Recording downloads use 15-minute signed URLs.
- Run PostgreSQL migrations during deployment and run the backend and LiveKit egress as separate managed services.
- Configure `LIVEKIT_TOKEN_TTL` for the maximum supported meeting duration (default: `6h`).
- Add centralized logs, error monitoring, health checks, backups, and load tests before public launch.

## Test report — August 11, 2026

### Frontend checks

| Check | Result |
|---|---|
| `npm run lint` | Passed, no warnings or errors |
| `npm run build` | Passed, TypeScript and production build successful |
| Browser automation | Not available in the current Codex session |

### Backend repository tests

`npm run test:api` passed all 3 suites. These tests use mocked LiveKit clients and cover meeting, token, screen-share, recording, breakout, and poll flows.

### Real API check against `http://localhost:8000/api/v1`

Disposable host and guest accounts were created for the test and removed afterward. The temporary meeting was also deleted.

| Operation | HTTP result |
|---|---|
| Service health | 200 Passed |
| Register host and three guests | 201 Passed |
| Create meeting | 201 Passed |
| Get meeting by code | 200 Passed |
| Update meeting | 200 Passed |
| Three guest join requests | 200 Passed |
| Get waiting room | 200 Passed |
| Admit one guest | **500 Failed: `invalid token`** |
| Delete temporary meeting | 200 Passed |

The live flow currently stops at admission because the LiveKit server rejects the backend credentials. The mocked test passes because it does not contact the configured LiveKit project. Until the API key and secret are corrected, neither Postman nor the frontend can complete a real media connection after host approval.

## Files of interest

- `src/components/meeting-actions.tsx` — authentication, home, waiting room, host moderation, and LiveKit room UI
- `src/services/api.ts` — authenticated meeting API endpoints
- `src/types/api.ts` — API response and participant types
- `src/app/globals.css` — lightweight application and LiveKit styling
