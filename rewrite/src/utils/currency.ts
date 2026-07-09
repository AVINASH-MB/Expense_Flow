export interface CurrencyMeta {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  decimals: number;
  locale: string;
}

export const CURRENCIES: CurrencyMeta[] = [
  { code: "USD", name: "US Dollar",         symbol: "$",   flag: "🇺🇸", decimals: 2, locale: "en-US" },
  { code: "INR", name: "Indian Rupee",      symbol: "₹",   flag: "🇮🇳", decimals: 2, locale: "en-IN" },
  { code: "EUR", name: "Euro",              symbol: "€",   flag: "🇪🇺", decimals: 2, locale: "de-DE" },
  { code: "GBP", name: "British Pound",     symbol: "£",   flag: "🇬🇧", decimals: 2, locale: "en-GB" },
  { code: "AED", name: "UAE Dirham",        symbol: "د.إ", flag: "🇦🇪", decimals: 2, locale: "ar-AE" },
  { code: "SGD", name: "Singapore Dollar",  symbol: "S$",  flag: "🇸🇬", decimals: 2, locale: "en-SG" },
  { code: "JPY", name: "Japanese Yen",      symbol: "¥",   flag: "🇯🇵", decimals: 0, locale: "ja-JP" },
  { code: "CAD", name: "Canadian Dollar",   symbol: "C$",  flag: "🇨🇦", decimals: 2, locale: "en-CA" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$",  flag: "🇦🇺", decimals: 2, locale: "en-AU" },
];

export const findCurrency = (code?: string): CurrencyMeta =>
  CURRENCIES.find((c) => c.code === (code || "").toUpperCase()) || CURRENCIES[0];

export function formatCurrency(amount: number, code?: string): string {
  const c = findCurrency(code);
  try {
    return new Intl.NumberFormat(c.locale, {
      style: "currency", currency: c.code,
      minimumFractionDigits: c.decimals, maximumFractionDigits: c.decimals,
    }).format(amount);
  } catch {
    const n = amount.toFixed(c.decimals);
    return `${c.symbol}${n}`;
  }
}
