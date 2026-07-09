export const formatDate = (d: string | Date) => {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
};

export const cn = (...cls: (string | false | undefined | null)[]) =>
  cls.filter(Boolean).join(" ");
