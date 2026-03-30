# Axon — Next Steps

## Status
Rebranding from Raven → Axon is complete. Docker setup is configured. Currently implementing LiveKit video calling integration.

---

## 1. Firebase (iOS Push Notifications)

`apps/mobile/GoogleService-Info.plist` still references the old Firebase project (`raven-c2659`). To fix:
1. Create a new Firebase project named `axon` (or reuse existing)
2. Register the iOS app with the new bundle ID (`axon.thecommit.company`)
3. Download the new `GoogleService-Info.plist` and replace the existing one

---

## 2. LiveKit Video Calling Integration

Full plan: 1:1 DM calls + group channel calls, audio/video/screen share, chat+video split UI, web + mobile.

### Phase 1 — Backend ← IN PROGRESS

#### 1.1 Docker: Add LiveKit server
File: `docker/docker-compose.yml`
- Add `livekit/livekit-server` service on ports 7880/7881/7882

#### 1.2 Axon Settings: Add LiveKit config fields
File: `axon/axon/doctype/axon_settings/axon_settings.json`
- Add fields: `livekit_host`, `livekit_api_key`, `livekit_api_secret`

#### 1.3 New Doctype: `Axon Call`
Location: `axon/axon/doctype/axon_call/`
- Fields: `channel_id`, `initiated_by`, `status`, `livekit_room_name`, `start_time`, `end_time`
- Child table: `Axon Call Participant` (user, joined_at, left_at)

#### 1.4 New API: `axon/api/calls.py`
- `initiate_call(channel_id)` — creates doc, generates LiveKit token, emits realtime event
- `join_call(call_id)` — returns token for joining user
- `end_call(call_id)` — updates status, emits end event
- `get_active_call(channel_id)` — returns active call or None

#### 1.5 Realtime events
Emit via `frappe.publish_realtime`:
- `axon:call_initiated` → channel room
- `axon:call_ended` → channel room
- `axon:call_incoming` → each member's user room (for mobile push ring)

#### 1.6 Register in `axon/hooks.py`
- Add `axon_call` doc events
- Add `livekit-api` to Python dependencies

---

### Phase 2 — Web Frontend

#### 2.1 Install packages
```bash
cd frontend
yarn add @livekit/react-components @livekit/client
```

#### 2.2 Call state atoms
New file: `frontend/src/utils/callAtoms.ts`
- `activeCallAtom`, `callTokenAtom`, `callUIStateAtom` ('hidden' | 'pip' | 'split')

#### 2.3 Start Call button
File: `frontend/src/components/feature/chat-header/ChannelHeader.tsx`
- Add video camera icon button
- Disabled if call already active in channel

#### 2.4 Chat+Video split layout
New files: `frontend/src/components/feature/call/`
- `CallLayout.tsx` — resizable side-by-side chat + video
- `ParticipantGrid.tsx` — LiveKit participant tiles
- `IncomingCallBanner.tsx` — "Alice started a call — Join" toast
- `ScreenShareTile.tsx` — promoted screen share view

#### 2.5 Realtime listeners
File: `frontend/src/pages/MainPage.tsx`
- Listen to `axon:call_initiated` and `axon:call_ended`

---

### Phase 3 — Mobile (Expo) ✅ COMPLETE

Packages installed: `@livekit/react-native`, `@livekit/react-native-webrtc`

Files created:
- `apps/mobile/utils/callAtoms.ts` — Jotai atoms
- `apps/mobile/hooks/call/useCallActions.ts` — API hooks
- `apps/mobile/hooks/call/useCallEvents.ts` — realtime listeners
- `apps/mobile/components/features/call/CallScreen.tsx` — full-screen video UI
- `apps/mobile/components/features/call/IncomingCallBanner.tsx` — floating ring banner
- `apps/mobile/components/features/call/StartCallButton.tsx` — header button
- `apps/mobile/app/[site_id]/call/incoming.tsx` — full-screen incoming call route (FCM deep-link)

Modified:
- `ChatHeader/ChannelHeader.tsx` + `DMChannelHeader.tsx` — StartCallButton added
- `app/[site_id]/_layout.tsx` — CallScreen, IncomingCallBanner, useCallEvents mounted
- `app.json` — camera/mic permissions (iOS infoPlist + Android)

---

### Phase 5 — Testing & Quality Assurance ✅ COMPLETE

- **Backend (Frappe)**: Added comprehensive tests for `AXON Mention` and fixed `initiate_call` settings bug.
- **Frontend (Web)**: Configured **Vitest** + **React Testing Library**.
- **Mobile (Expo)**: Configured **Jest** + **jest-expo**.
- **Issue Fixes**: Resolved `Axon Channel` validation duplicates in test mode.

---

## Completed

| Item | Detail |
|------|--------|
| Raven → Axon rebranding | All Python, frontend, mobile, Docker, CI fully renamed |
| `axon/pyproject.toml` | Created — fixes Docker pip install crash |
| `.github/helper/install.sh` | `raven` → `axon`, `raven.test` → `axon.localhost` |
| `frontend/.env.production` | `VITE_BASE_NAME='axon'` |
| `MANIFEST.in` | All `raven` → `axon` |
| `.gitignore` | All `raven/` paths → `axon/` |
| Docker setup | `docker-compose.yml` and `init.sh` use `axon` |
| TypeScript types | All `Raven*` types renamed to `Axon*` |
| Test Infrastructure | Backend, Frontend (Vitest), Mobile (Jest) setup complete |
| Video Calling Bug | Fixed `initiate_call` hardcoded provider bug |
