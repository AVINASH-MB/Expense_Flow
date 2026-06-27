## Settings page additions

Add two cards to `src/routes/_app.settings.tsx` without changing the existing visual language (same `card-glass` containers, spacing, and accent tokens already used elsewhere).

### 1. Preferred Currency card

New card placed between "Email notifications" and "Data".

- Searchable combobox built from existing shadcn `Command` + `Popover` primitives (already in repo) — keeps it consistent with the rest of the UI.
- Currency catalog hardcoded in a new file `src/lib/currencies.ts`:
  - INR ₹ 🇮🇳, USD $ 🇺🇸, EUR € 🇪🇺, GBP £ 🇬🇧, AED د.إ 🇦🇪, SGD S$ 🇸🇬, JPY ¥ 🇯🇵, CAD C$ 🇨🇦, AUD A$ 🇦🇺.
  - Each entry: `{ code, name, symbol, flag, locale, decimals }`. Search matches name, code, or symbol.
- Selected option renders flag + name + ISO code + symbol; trigger shows the same compact summary.
- Persistence:
  - Extend `NotifySettings` type with `currency: string`.
  - Add `currency` column to `server/schema.sql` `settings` table and update `server/src/routes/settings.js` to read/write it.
  - Frontend `useStore().updateSettings({ currency })` already routes through `SettingsAPI` when `apiEnabled()`, otherwise falls back to localStorage — meets the offline requirement automatically.
- Global formatting:
  - New helper `src/lib/format.ts` exporting `useCurrency()` hook + `formatMoney(amount, currency)` using `Intl.NumberFormat(locale, { style: 'currency', currency })`.
  - Replace existing hardcoded `$`/`toFixed(2)` / `toLocaleString` money renders in: `_app.dashboard.tsx`, `_app.transactions.tsx` (table + CSV export keeps raw numbers but adds a currency column), `_app.budgets.tsx`, `_app.goals.tsx`, `_app.analytics.tsx`, `_app.admin.tsx`, and any chart tooltips/axis formatters.
  - No AI Assistant or PDF export exists in the current codebase — out of scope, will note in the closing message.
- Toast: reuse existing `toast.success("Currency updated")` pattern.

### 2. Danger Zone — Delete Account card

New card at the very bottom, replacing the current "Clear all data" button location. Keep the existing "Clear all data" action inside the same Danger Zone for consistency.

- Card styling: existing `card-glass` + `border-brand-rose/40` accent and `AlertTriangle` icon from `lucide-react`.
- "Delete account" button opens a shadcn `Dialog` (already glassmorphic via existing tokens) — backdrop already blurs via the project's dialog overlay styles.
- Modal content:
  - Warning copy exactly as specified.
  - Text input — final destructive button disabled until value === `DELETE`.
  - Password input — shown only when `apiEnabled()` (mock auth has no password to verify).
  - Cancel button closes the dialog; destructive button shows a spinner while pending.
- Backend:
  - New `DELETE /api/auth/account` route in `server/src/routes/auth.js`:
    - Requires `requireAuth`, accepts `{ password }`, re-verifies via bcrypt against `users.password_hash`.
    - Cascades delete on `users` row (existing FKs already `ON DELETE CASCADE` for transactions/budgets/goals/notifications/settings/refresh_tokens).
    - Clears refresh cookie.
  - `AuthAPI.deleteAccount(password)` in `src/lib/api-services.ts`.
- Client flow on success:
  - `clearAll()` local state, `logout()` (clears JWT + localStorage + refresh timer), `toast.success("Account deleted")`, then `navigate({ to: "/login" })`.
  - On error: inline error message + toast.error, keep modal open.
- Mock-mode fallback (no API): wipe localStorage keys (`expenseflow.auth`, store seed key, settings), logout, redirect.

### Files touched

- New: `src/lib/currencies.ts`, `src/lib/format.ts`.
- Edit: `src/routes/_app.settings.tsx`, `src/lib/store.tsx` (extend `NotifySettings` + default), `src/lib/api-services.ts`, `src/context/auth.tsx` (expose `deleteAccount` helper or call API directly from settings), money-rendering routes listed above.
- Edit: `server/schema.sql` (add `currency VARCHAR(8) DEFAULT 'USD'`), `server/src/routes/settings.js`, `server/src/routes/auth.js`.

### Out of scope / flagged

- AI Assistant and PDF export aren't in the current codebase, so the "apply currency everywhere" rule will cover all existing surfaces but those two are no-ops until those features ship.
