# Currency Formatting QA Checklist

Use this checklist after any change that touches `fmtCurrency`, `setActiveCurrency`,
`src/lib/currencies.ts`, `src/lib/exporters.ts`, or the Settings → Preferred
Currency picker. The goal is to prove every monetary surface and every export
respects the active currency's **symbol**, **ISO code**, and **decimal rules**.

## Reference: expected formatting

| ISO | Symbol | Decimals | Example for 1234.5      |
| --- | ------ | -------- | ----------------------- |
| USD | $      | 2        | `$1,234.50`             |
| INR | ₹      | 2        | `₹1,234.50` (en-IN grouping) |
| EUR | €      | 2        | `€1,234.50`             |
| GBP | £      | 2        | `£1,234.50`             |
| AED | د.إ    | 2        | `د.إ 1,234.50`          |
| SGD | S$     | 2        | `S$1,234.50`            |
| JPY | ¥      | **0**    | `¥1,235` (no decimals)  |
| CAD | C$     | 2        | `C$1,234.50`            |
| AUD | A$     | 2        | `A$1,234.50`            |

JPY is the canary — it MUST never render decimals.

## In-app surfaces

For each currency in the picker, switch in Settings → Preferred Currency, save,
then walk through:

- [ ] **Dashboard** — KPI cards (Balance, Income, Expense), recent transactions list, chart tooltips.
- [ ] **Transactions** — table Amount column, edit dialog amount input prefix, summary footer.
- [ ] **Budgets** — limit, spent, remaining values; progress label.
- [ ] **Goals** — target, current, remaining values.
- [ ] **Analytics** — Pie tooltips, bar tooltips, income-vs-expense axis labels, trend chart Y-axis.
- [ ] **Notifications** — budget exceeded / goal achieved alerts use new symbol.
- [ ] **Admin** — platform spend totals and per-user spend column.

For each surface confirm:
1. Symbol matches the table above.
2. ISO grouping matches (e.g. INR uses 1,23,456.78 not 123,456.78).
3. JPY shows zero decimals everywhere.

## Export consistency check

Exports are the most common place currency drifts. The contract enforced by
`src/lib/exporters.ts` is:

- Every monetary header is annotated with the active ISO, e.g. `Amount (EUR)`.
- Every monetary cell is formatted via `fmtCurrency()` at export time, so the
  cell text contains the symbol and follows the decimal rule.
- CSV files append a trailing `Currency` column with the ISO code on every row.
- PDF files print a header block: `Currency: <name> (<ISO> <symbol>)`.

### CSV — Transactions

1. Switch currency to USD, export. Verify:
   - [ ] Header row contains `Amount (USD)` and trailing `Currency` column.
   - [ ] Amount cells look like `"$1,234.50"`.
   - [ ] Every row's last column is `USD`.
2. Switch currency to JPY, export the same filtered set. Verify:
   - [ ] Header row contains `Amount (JPY)`.
   - [ ] Amount cells look like `"¥1,235"` (no decimals).
   - [ ] Every row's last column is `JPY`.
3. Switch currency to INR, export. Verify:
   - [ ] Header `Amount (INR)`, cells use `₹` and en-IN grouping.

### PDF — Transactions

Repeat the USD → JPY → INR cycle with **Export PDF**:

- [ ] Title block reads `Currency: <name> (<ISO> <symbol>)` matching the active picker value.
- [ ] Subtitle totals (Income / Expense / Net) use the active currency.
- [ ] Table `Amount (ISO)` column renders with the right symbol and decimal rule.
- [ ] Filename is `transactions-YYYY-MM-DD.pdf`.

### Cross-export drift check

1. Change currency from USD → EUR **without reloading the page**.
2. Immediately re-export CSV and PDF.
3. Confirm both files use EUR — no stale USD values, no mixed symbols inside
   the same file. (This proves exporters resolve currency at call time via
   `getActiveCurrency()` rather than capturing it at module load.)

## Regression guards (do not remove)

- `src/lib/exporters.ts` reads `getActiveCurrency()` **inside** `exportCsv` /
  `exportPdf`, never at module top-level — otherwise switching currency mid-session
  produces stale exports.
- `fmtCurrency` in `src/lib/store.tsx` special-cases JPY decimals. Keep the
  `c.code === "JPY" ? 0 : ...` branch.
- The Transactions page must call `exportTransactionsCsv` / `exportTransactionsPdf`
  (never inline its own CSV string) so every monetary export goes through the
  single source of truth.
