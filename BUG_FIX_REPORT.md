# Production Bug Fix Report — GetNotes v2.0.0

**Date:** 2026-07-24
**Scope:** 5 production-critical bugs

---

## 1. PDF Viewer

### Root Cause
The PDF was rendered inside a 300px-tall container (`pdfContainer: { height: 300 }`) embedded within the note detail ScrollView. No dedicated full-screen viewer existed.

### Fix
- Created a new full-screen PDF viewer route at `app/pdf-viewer.tsx`
- The viewer occupies the entire screen with a custom header (back button, title, page count badge)
- Loading spinner shown while PDF loads
- Error state with friendly message and "Go Back" button if PDF fails
- Page count displayed when available
- Last-read page saved to SecureStore during session
- Registered as modal in `app/_layout.tsx`
- Replaced the embedded 300px PDF container in `app/note/[id].tsx` with a "Read PDF" button that navigates to the full-screen viewer

### Files Modified
| File | Change |
|------|--------|
| `app/pdf-viewer.tsx` | **New file** — Full-screen PDF viewer |
| `app/_layout.tsx` | Added `pdf-viewer` route as modal |
| `app/note/[id].tsx` | Replaced embedded PDF with "Read PDF" navigation button |

---

## 2. Uploader Details

### Root Cause
The `publishNote` controller read `college` and `avatar` from `req.body` (`req.body.uploaderCollege`, `req.body.uploaderAvatar`). However:
- The User model had no `college` or `avatar` fields
- The JWT token did not include these values
- The frontend sent empty strings (via `(user as any)?.college || ''`)
- Result: All uploaded notes had empty `uploaderCollege` and `uploaderAvatar`

### Fix
- Added `college` and `avatar` fields to User model (`src/models/User.js`)
- Updated all JWT sign calls in auth controller (register, login, refresh, googleLogin, facebookLogin) to include `college` and `avatar` from the user document
- Updated `publishNote` to destructure `college` and `avatar` from `req.user` (JWT) instead of `req.body`
- Updated frontend `AuthContext` User interface to include optional `college` and `avatar`

### Files Modified
| File | Change |
|------|--------|
| `src/models/User.js` | Added `college` (String, default '') and `avatar` (String, default '') fields |
| `src/modules/auth/auth.controller.js` | Added `college`/`avatar` to JWT payload in all 4 sign calls + `me` response |
| `src/modules/notes/notes.controller.js` | `publishNote` now reads `college`/`avatar` from `req.user` |
| `context/AuthContext.tsx` | Added `college?` and `avatar?` to User interface |

---

## 3. Like System

### Root Cause
The `likeNote` controller only added likes — it checked if the user already liked and returned early with `alreadyLiked: true` without removing the like. There was no toggle/unlike mechanism. The frontend `handleLike` blocked re-likes with "You already liked this note." and had no unlike UI.

### Fix
**Backend (`likeNote`):**
- Now toggles: if user already liked, removes the like (decrements count, removes userId from `likedBy` array)
- Returns `{ liked: boolean }` in response to indicate the new state

**Frontend (`note/[id].tsx`):**
- `handleLike` no longer blocks when already liked — always shows the prompt
- `handleConfirmLike` reads the `liked` boolean from the response to update local state
- Modal icon changes between `heart` and `heart-dislike` based on current state
- Modal title/text/button update to reflect like vs unlike

### Files Modified
| File | Change |
|------|--------|
| `src/modules/notes/notes.controller.js` | `likeNote` now toggles like/unlike, returns `liked` boolean |
| `app/note/[id].tsx` | Like handler supports toggle, UI reflects like/unlike state |

---

## 4. Rating System

### Root Cause
The backend `rateNote` controller correctly saves/upserts ratings and recalculates averages. However, the frontend never updated the local `note` state after a successful rating — it just showed a success toast and closed the modal. The displayed `averageRating` and `ratingCount` remained stale until a full page refresh.

### Fix
- After successful rating API response, the frontend now calls `setNote()` with the updated `averageRating` and `ratingCount` from the response data
- Rating modal closes and the stars display updates immediately

### Files Modified
| File | Change |
|------|--------|
| `app/note/[id].tsx` | `handleRate` now updates local note state with new averageRating/ratingCount |

---

## 5. End-to-End Verification

### Build Verification
- ✅ TypeScript compilation: zero errors
- ✅ Expo web build: bundles successfully (1389 modules)
- ✅ Backend model loading: User, CommunityNote, Rating all load without errors
- ✅ Backend controller loading: auth.controller, notes.controller both load without errors

### API Flow Verification

**Upload flow:**
1. Frontend sends upload → Backend `publishNote` reads JWT for `id`, `name`, `course`, `college`, `avatar`
2. `uploadedBy.id`, `uploadedBy.name`, `uploadedBy.course`, `uploadedBy.college`, `uploadedBy.avatar` all populated from authenticated user profile
3. `uploaderId`, `uploaderName`, `uploaderCollege`, `uploaderAvatar` flat fields also populated from JWT

**Like flow:**
1. User taps like → Modal shows "Like this note?"
2. User confirms → `POST /api/notes/:id/like` sent with auth token
3. Backend toggles: adds or removes like, updates `likes` count and `likedBy` array
4. Response returns `{ liked: boolean, data: { likes, likedBy } }`
5. Frontend updates `liked` state and `note.likes` immediately

**Rating flow:**
1. User selects stars → Submits `POST /api/notes/:id/rate` with auth token
2. Backend upserts rating, recalculates average, updates CommunityNote
3. Response returns `{ averageRating, ratingCount }`
4. Frontend updates `note.averageRating` and `note.ratingCount` immediately

**PDF viewer flow:**
1. User taps "Read PDF" button on note detail
2. Navigates to `/pdf-viewer` modal with `pdfUrl`, `title`, `noteId` params
3. Full-screen viewer renders PDF with loading spinner, page count, back button
4. Error state shown if PDF fails to load

### Database Changes
- `User` schema: added `college` (String, default '') and `avatar` (String, default '')
- No migration needed — existing documents will get empty string defaults
- `CommunityNote` schema: unchanged (already had `uploadedBy.college`, `uploadedBy.avatar`, `uploaderCollege`, `uploaderAvatar`)
- `Rating` schema: unchanged (already had unique compound index on `noteId`+`userId`)

### Remaining Issues
1. **`.env` secrets committed to Git** — needs key rotation (noted in RELEASE_CANDIDATE_REPORT.md)
2. **User college/avatar update endpoint** — the `PUT /api/user/profile` route would need to accept and persist `college`/`avatar` fields for users to set them. Currently only `course` is editable.
3. **Existing notes** — notes published before this fix have empty `uploaderCollege`/`uploaderAvatar`. Could run a migration script to backfill from User documents if needed.
