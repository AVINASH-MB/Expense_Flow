export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  locale: string;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar",         symbol: "$",   flag: "🇺🇸", locale: "en-US" },
  { code: "INR", name: "Indian Rupee",      symbol: "₹",   flag: "🇮🇳", locale: "en-IN" },
  { code: "EUR", name: "Euro",              symbol: "€",   flag: "🇪🇺", locale: "en-IE" },
  { code: "GBP", name: "British Pound",     symbol: "£",   flag: "🇬🇧", locale: "en-GB" },
  { code: "AED", name: "UAE Dirham",        symbol: "د.إ", flag: "🇦🇪", locale: "en-AE" },
  { code: "SGD", name: "Singapore Dollar",  symbol: "S$",  flag: "🇸🇬", locale: "en-SG" },
  { code: "JPY", name: "Japanese Yen",      symbol: "¥",   flag: "🇯🇵", locale: "ja-JP" },
  { code: "CAD", name: "Canadian Dollar",   symbol: "C$",  flag: "🇨🇦", locale: "en-CA" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$",  flag: "🇦🇺", locale: "en-AU" },
];

export function findCurrency(code: string | undefined | null): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}
