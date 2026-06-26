## 1. Refresh tokens with rotation (server)

**New table** in `server/schema.sql`:

```sql
CREATE TABLE refresh_tokens (
  id          CHAR(36) PRIMARY KEY,
  user_id     CHAR(36) NOT NULL,
  token_hash  CHAR(64) NOT NULL UNIQUE,   -- sha256 of opaque token
  family_id   CHAR(36) NOT NULL,          -- rotation family
  parent_id   CHAR(36) NULL,              -- previous token in chain
  expires_at  DATETIME NOT NULL,
  revoked_at  DATETIME NULL,
  user_agent  VARCHAR(255) NULL,
  ip          VARCHAR(64) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_rt_family (family_id)
);
```

**Token model:**
- **Access token (JWT)** — short-lived, 15 min, signed with `JWT_SECRET`. Same shape as today.
- **Refresh token** — 32-byte random opaque string. Stored hashed (sha256) in DB. 30-day expiry. Returned to client as an `httpOnly`, `Secure`, `SameSite=Lax` cookie named `ef_refresh`, scoped to `/api/auth`.

**Endpoints** (`server/src/routes/auth.js`):
- `POST /api/auth/login` and `/register` — issue access token in JSON body, refresh cookie via `Set-Cookie`. Insert refresh row with new `family_id`.
- `POST /api/auth/refresh` — read cookie, hash, look up row.
  - If missing/expired/revoked → 401, clear cookie.
  - If row exists but already `revoked_at` is set → **reuse detected**: revoke the entire `family_id`, return 401. (Rotation safety.)
  - Otherwise: mark current row `revoked_at=NOW()`, insert new row with same `family_id` and `parent_id=<old.id>`, issue new access token + new refresh cookie.
- `POST /api/auth/logout` — revoke current refresh row + family, clear cookie.

**Env:** add `REFRESH_TOKEN_TTL_DAYS=30`, `ACCESS_TOKEN_TTL=15m`. Add `cookie-parser` dependency. CORS must allow credentials (`credentials: true`, exact origin).

## 2. Refresh tokens (frontend)

- `src/lib/api.ts`: set `withCredentials: true` on the axios instance. Add a response interceptor that, on `401` for non-`/auth/*` requests, calls `POST /api/auth/refresh` once, replays the original request with the new access token, and only logs out if refresh itself fails. Use a single in-flight refresh promise so concurrent 401s share one refresh call.
- `src/context/auth.tsx`:
  - On mount, if a stored token is present, call `/auth/me`; if it 401s, attempt one silent refresh before clearing session.
  - Schedule a proactive refresh ~1 min before access-token `exp` (decode JWT inline; no new dep) so long-lived tabs stay logged in without a bounce.
  - `logout()` calls `POST /api/auth/logout` to revoke server-side, then clears local storage.

Stored token shape in `localStorage` stays `{ user, token }`. Refresh token never touches `localStorage` — cookie only.

## 3. "Can't delete demo data" fix

Cause: the frontend store seeds demo transactions/budgets/goals into `localStorage` (`expenseflow.data.v1`) on first load. In **API mode** the seed is overwritten on hydration, but in **mock mode** (no `VITE_API_URL`) the seed re-appears every fresh install and there is no UI to wipe it. Users see the demo rows return after clearing the browser, and there is no single action to clear them in one go.

Changes in `src/lib/store.tsx`:
- Add `clearAll()` to the store: empties transactions, budgets, goals, notifications in both mock and API modes. In API mode it calls bulk delete (see below) for each collection.
- Add `hasSeenSeed` flag in localStorage so the seed only runs on truly first load, never re-seeds after a clear.
- Expose a "Clear demo data" button in `src/routes/_app.settings.tsx` (Danger zone section) with a confirm dialog. Wired to `clearAll()`.

Server side (only needed when API is configured):
- `DELETE /api/transactions` (no id) → wipes all transactions for `req.user.id`.
- `DELETE /api/budgets`, `DELETE /api/goals`, `DELETE /api/notifications` → same pattern.
- Frontend `clearAll()` issues these four DELETEs in parallel, then resets local state.

## Files touched

**Server**
- `server/schema.sql` — add `refresh_tokens` table.
- `server/package.json` — add `cookie-parser`.
- `server/src/index.js` — `cookieParser()`, CORS `credentials: true`.
- `server/src/routes/auth.js` — login/register/refresh/logout, rotation logic.
- `server/src/routes/transactions.js`, `budgets.js`, `goals.js`, `notifications.js` — add bulk `DELETE /` handler.
- `server/.env.example` — new TTL vars.
- `server/README.md` — document refresh flow.

**Frontend**
- `src/lib/api.ts` — `withCredentials`, refresh interceptor, single-flight refresh.
- `src/lib/api-services.ts` — `AuthAPI.refresh`, `AuthAPI.logout`; bulk-delete methods.
- `src/context/auth.tsx` — silent refresh on boot, proactive refresh timer, logout calls server.
- `src/lib/store.tsx` — `clearAll()`, `hasSeenSeed` guard.
- `src/routes/_app.settings.tsx` — Danger zone with "Clear demo data" button.

## Out of scope

- Multi-device session list / revoke-other-sessions UI (table supports it; UI deferred).
- Moving refresh token to a separate JWT — opaque + DB lookup is the standard rotation pattern and lets us revoke families instantly.
