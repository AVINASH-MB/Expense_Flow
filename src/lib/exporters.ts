// Centralized export helpers — guarantee CSV and PDF exports always reflect
// the user's active preferred currency (symbol, ISO code, decimal rules).
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { findCurrency } from "@/lib/currencies";
import { fmtCurrency, getActiveCurrency, type Transaction } from "@/lib/store";

/** Resolve currency at call time so a mid-session change is reflected. */
function activeCurrency() {
  return findCurrency(getActiveCurrency());
}

/** Format a number with the active currency for use inside exported files. */
export function fmtExport(n: number): string {
  return fmtCurrency(n);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(v: unknown) {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

export interface CsvOptions {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  /** Index of columns containing monetary numbers to be formatted with active currency. */
  currencyColumns?: number[];
}

/**
 * Export a CSV with a guaranteed currency-consistency contract:
 *  - The header row is annotated with the active ISO code (e.g. "Amount (USD)").
 *  - Monetary cells are formatted with fmtCurrency() using the active currency.
 *  - A trailing "Currency" column with the ISO code is appended so downstream
 *    tools never have to guess what units the file is in.
 */
export function exportCsv({ filename, headers, rows, currencyColumns = [] }: CsvOptions) {
  const cur = activeCurrency();
  const annotated = headers.map((h, i) => (currencyColumns.includes(i) ? `${h} (${cur.code})` : h));
  const finalHeaders = [...annotated, "Currency"];
  const finalRows = rows.map((r) =>
    [...r.map((cell, i) => (currencyColumns.includes(i) && typeof cell === "number" ? fmtCurrency(cell) : cell)), cur.code],
  );
  const csv = [finalHeaders, ...finalRows]
    .map((r) => r.map(csvEscape).join(","))
    .join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), filename);
}

export interface PdfOptions {
  filename: string;
  title: string;
  headers: string[];
  rows: (string | number)[][];
  currencyColumns?: number[];
  subtitle?: string;
}

/**
 * Export a PDF using jsPDF + autoTable.
 *  - Title block records the active currency (name, ISO, symbol).
 *  - Monetary cells render via fmtCurrency() so the symbol and decimal rules
 *    always match the user's preference at export time.
 */
export function exportPdf({ filename, title, headers, rows, currencyColumns = [], subtitle }: PdfOptions) {
  const cur = activeCurrency();
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  doc.setFontSize(16);
  doc.text(title, 40, 40);
  doc.setFontSize(10);
  doc.setTextColor(120);
  const stamp = new Date().toLocaleString(cur.locale);
  doc.text(`Generated ${stamp}  •  Currency: ${cur.name} (${cur.code} ${cur.symbol})`, 40, 58);
  if (subtitle) doc.text(subtitle, 40, 72);

  const body = rows.map((r) =>
    r.map((cell, i) => (currencyColumns.includes(i) && typeof cell === "number" ? fmtCurrency(cell) : String(cell ?? ""))),
  );

  autoTable(doc, {
    startY: subtitle ? 88 : 76,
    head: [headers.map((h, i) => (currencyColumns.includes(i) ? `${h} (${cur.code})` : h))],
    body,
    styles: { font: "helvetica", fontSize: 9, cellPadding: 6, textColor: 30 },
    headStyles: { fillColor: [139, 92, 246], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 244, 252] },
    margin: { left: 40, right: 40 },
  });

  doc.save(filename);
}

/** Transactions-specific convenience wrappers used by the Transactions page. */
export function exportTransactionsCsv(rows: Transaction[]) {
  exportCsv({
    filename: `transactions-${new Date().toISOString().slice(0, 10)}.csv`,
    headers: ["Date", "Name", "Category", "Type", "Amount", "Note"],
    rows: rows.map((t) => [t.date, t.name, t.category, t.type, t.amount, t.note || ""]),
    currencyColumns: [4],
  });
}

export function exportTransactionsPdf(rows: Transaction[]) {
  const totalIn = rows.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
  const totalOut = rows.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0);
  exportPdf({
    filename: `transactions-${new Date().toISOString().slice(0, 10)}.pdf`,
    title: "ExpenseFlow — Transactions",
    subtitle: `${rows.length} rows  •  Income ${fmtExport(totalIn)}  •  Expense ${fmtExport(totalOut)}  •  Net ${fmtExport(totalIn - totalOut)}`,
    headers: ["Date", "Name", "Category", "Type", "Amount", "Note"],
    rows: rows.map((t) => [t.date, t.name, t.category, t.type, t.amount, t.note || ""]),
    currencyColumns: [4],
  });
}
