import { describe, it, expect, beforeEach } from "vitest";
import { fmtCurrency, setActiveCurrency, getActiveCurrency } from "@/lib/store";
import { CURRENCIES } from "@/lib/currencies";

/**
 * Centralised expectation: fmtCurrency must match Intl.NumberFormat using the
 * currency's own locale, with JPY always 0 decimals and every other currency
 * using 0 decimals for integer values and 2 decimals otherwise.
 */
function expected(code: string, n: number) {
  const c = CURRENCIES.find((x) => x.code === code)!;
  const decimals = c.code === "JPY" ? 0 : n % 1 === 0 ? 0 : 2;
  return new Intl.NumberFormat(c.locale, {
    style: "currency",
    currency: c.code,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

const SAMPLES = [0, 1, 12, 99.5, 1234.56, 1000000, 0.1 + 0.2];

describe("fmtCurrency – decimals & symbols per currency", () => {
  beforeEach(() => setActiveCurrency("USD"));

  for (const c of CURRENCIES) {
    describe(`${c.code} (${c.name})`, () => {
      it("matches Intl output for all sample amounts", () => {
        for (const n of SAMPLES) {
          expect(fmtCurrency(n, c.code)).toBe(expected(c.code, n));
        }
      });

      it("includes the currency's narrow symbol or ISO code", () => {
        const out = fmtCurrency(1234.5, c.code);
        // Intl always renders either the symbol or the ISO code – never empty.
        const hasSymbol =
          out.includes(c.symbol) ||
          out.includes(c.code) ||
          // JPY/ja-JP renders fullwidth ￥; INR sometimes renders "₹"; AED renders "د.إ.‏" with marks.
          /\p{Sc}/u.test(out);
        expect(hasSymbol, `output="${out}" missing symbol for ${c.code}`).toBe(true);
      });

      it("applies the correct decimal rule", () => {
        const intOut = fmtCurrency(100, c.code);
        const fracOut = fmtCurrency(100.5, c.code);
        // Integers never show fractional digits.
        expect(/[.,]\d{2,}/.test(intOut.replace(/[^\d.,]/g, ""))).toBe(false);

        if (c.code === "JPY") {
          // JPY: always 0 decimals, even for fractional input.
          expect(/[.,]\d/.test(fracOut.replace(/[^\d.,]/g, ""))).toBe(false);
        } else {
          // Others: fractional values render exactly 2 decimals.
          expect(fracOut).toBe(expected(c.code, 100.5));
        }
      });
    });
  }
});

describe("fmtCurrency – active currency switching", () => {
  it("uses the active currency when no override is passed", () => {
    for (const c of CURRENCIES) {
      setActiveCurrency(c.code);
      expect(getActiveCurrency()).toBe(c.code);
      expect(fmtCurrency(42)).toBe(expected(c.code, 42));
    }
  });

  it("override parameter wins over active currency", () => {
    setActiveCurrency("USD");
    expect(fmtCurrency(10, "JPY")).toBe(expected("JPY", 10));
    expect(fmtCurrency(10, "EUR")).toBe(expected("EUR", 10));
    // active currency unchanged
    expect(getActiveCurrency()).toBe("USD");
  });

  it("falls back to USD on unknown code", () => {
    expect(fmtCurrency(5, "ZZZ")).toBe(expected("USD", 5));
  });
});

/**
 * Page-level contracts: every consumer (Dashboard, Transactions, Budgets,
 * Analytics) flows through fmtCurrency. These tests simulate the call shapes
 * each page uses and assert formatting stays consistent after a currency
 * switch – guarding against regressions where a page reads a stale symbol.
 */
describe("Per-page currency consistency", () => {
  const pages = {
    Dashboard: () => [fmtCurrency(5230.75), fmtCurrency(1200), fmtCurrency(-340.2)],
    Transactions: () => [
      fmtCurrency(12.34),
      fmtCurrency(99),
      fmtCurrency(2500.5),
      fmtCurrency(0),
    ],
    Budgets: () => [fmtCurrency(800), fmtCurrency(650.4), fmtCurrency(1500)],
    Analytics: () => [
      fmtCurrency(15234.56),
      fmtCurrency(8421),
      fmtCurrency(6813.56),
    ],
  };

  for (const code of CURRENCIES.map((c) => c.code)) {
    describe(code, () => {
      beforeEach(() => setActiveCurrency(code));
      for (const [page, run] of Object.entries(pages)) {
        it(`${page} formats every value via the active currency`, () => {
          const outputs = run();
          outputs.forEach((out, i) => {
            // Reconstruct the underlying numeric value list per page.
            const numbers = {
              Dashboard: [5230.75, 1200, -340.2],
              Transactions: [12.34, 99, 2500.5, 0],
              Budgets: [800, 650.4, 1500],
              Analytics: [15234.56, 8421, 6813.56],
            }[page]!;
            expect(out).toBe(expected(code, numbers[i]));
          });
        });
      }
    });
  }
});
