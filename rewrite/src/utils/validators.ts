export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export const minLen = (s: string, n: number) => s.trim().length >= n;
