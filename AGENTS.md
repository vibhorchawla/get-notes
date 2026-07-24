# Anchored Summary

## Objective
Production readiness for GetNotes v2.0.0 (React Native Expo + Express backend).

## Important Details
- **Server**: `src/index.js`, routes in `src/modules/*/`, Express + Mongoose
- **Client**: Expo Router in `app/`, hooks in `hooks/`, context in `context/`
- **Auth**: JWT stored in expo-secure-store key `authToken`, context at `context/AuthContext.tsx`
- **API calls**: `hooks/useApi.ts` — `apiFetch<T>(url, opts?)` returns `{success, data, message}`
- **Types**: `types/note.ts` — `Note`, `Review`, `Course`, `PdfFile`, `apiResponse<T>`
- **Admin role**: User model has `role` field (`'user'` | `'admin'`), checked by `requireAdmin` middleware

## Fixed Bugs (Session 2 — App Fixes)

### Auth
- Login/signup error messages surfaced to user
- `/auth/me` response shape mismatch in `refreshUser`
- `splashPromise` resolved in catch/finally

### Settings/Profile
- Settings toggle inversion fixed
- Profile edit now saves via API + calls `refreshUser()`
- `premiumPlan.charAt(0)` null crash guarded

### Backend
- `likeNote`/`incrementDownloads` null `uploadedBy.id` crash fixed
- `getCategories` error handler returns 500 instead of 200
- Badge system fixed with `getBadgeForPoints()` for lean docs
- Login/signup return `{success, message}` for error paths

### Notes & Community
- Note detail download opens URL via `Linking.openURL`
- `saveNote`/`unsaveNote` checks API success before updating state
- `useSaved` returns `Promise<boolean>`
- Community error state displayed; search messages user-friendly
- Rating/Report buttons gated on auth

### Misc
- College cards navigate to community; help "No" dismisses
- Dead feedback input code removed

## Fixed Bugs (Session 3 — Release Engineering)

### Security — CRITICAL
1. **Admin routes had no role check** — added `requireAdmin` middleware + `role` field to User model
2. **`publishNote` upsert vulnerability** — added ownership check before update
3. **Download endpoint unauthenticated** — added `verifyToken` middleware
4. **Global error handler** added to Express server

### Security — HIGH
5. **Leaderboard badge always undefined** — fixed `.lean()` virtual loss with `getBadgeForPoints()`

### Client Bugs
6. **`profile.tsx` stale context** — now calls `refreshUser()` after profile save
7. **`downloads.tsx` broken filter** — `n.isPublished || true` → `n.isPublished === true`
8. **Missing `index` prop** on `SearchNoteCard` in downloads screen
9. **Unused `isPremium`** in `course/[id].tsx` removed
10. **Dead styles** in `note/[id].tsx` (helpFeedback) and `Header.tsx` (notificationButton) removed

### Memory Leaks
11. **Cancellation flags added** to 9 hooks: `useUserStats`, `useReputation`, `useDownloads`, `useSaved`, `useCourses`, `useColleges`, `useSemesters`, `useNotes`, `useCommunity`

## Deferred / Not Fixed

| Issue | Reason |
|-------|--------|
| `.env` secrets committed to Git | Needs Git history rewrite + key rotation (DevOps) |
| `feedback.tsx` simulated submit | Needs new backend endpoint |
| `forgot password` → `/coming-soon` | Feature, not bug |
| Rate limiting / logging / security headers | Requires new dependencies (express-rate-limit, morgan, helmet) |
| Payment amount not verified against plan | Not triggered as bug (revenue integrity issue) |
| OAuth client ID validation missing | Medium severity, not crash-causing |
| Feedback form / Placeholder data in MarketplaceCard | Cosmetic / UX polish |

## Release Candidate Report
See `RELEASE_CANDIDATE_REPORT.md` for full audit findings, performance concerns, security gaps, and production readiness score.

## Relevant Files
- `src/index.js` — Express entry, global error handler
- `src/middleware/auth.js` — verifyToken, requireAdmin middleware
- `src/models/User.js` — added `role` field
- `src/modules/admin/admin.routes.js` — admin role guard
- `src/modules/notes/notes.controller.js` — fix publishNote ownership check
- `src/modules/notes/notes.routes.js` — download endpoint auth
- `src/modules/reputation/reputation.controller.js` — fix lean badge
- `app/(drawer)/profile.tsx` — refreshUser after edit
- `app/(drawer)/downloads.tsx` — fix filter + missing index
- `app/course/[id].tsx` — remove unused isPremium
- `app/note/[id].tsx` — remove dead styles, auth-gate ratings/report
- `app/community/index.tsx` — show error state
- `app/(drawer)/home.tsx` — college cards onPress
- `components/Header.tsx` — remove dead notification styles
- `hooks/*.ts` — cancellation flags in 9 hooks
