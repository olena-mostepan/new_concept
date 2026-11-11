import type { Lang } from "./index";

const DE_MONTHS = [
  "Jan.",
  "Feb.",
  "März",
  "Apr.",
  "Mai",
  "Juni",
  "Juli",
  "Aug.",
  "Sep.",
  "Okt.",
  "Nov.",
  "Dez.",
] as const;

const EN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Parse mock dates like "28 Aug 2026" or "1 Sep". */
export function parseConceptDate(input: string): Date | null {
  const m = input.trim().match(/^(\d{1,2})\s+([A-Za-zä]+)\.?(?:\s+(\d{4}))?$/);
  if (!m) return null;
  const day = Number(m[1]);
  const mon = m[2].replace(/\.$/, "");
  const year = m[3] ? Number(m[3]) : 2026;
  const enIdx = EN_MONTHS.findIndex((x) => x === mon || x.startsWith(mon.slice(0, 3)));
  const deIdx = DE_MONTHS.findIndex(
    (x) => x.replace(".", "") === mon || x.startsWith(mon),
  );
  const month = enIdx >= 0 ? enIdx : deIdx;
  if (month < 0) return null;
  return new Date(year, month, day);
}

export function formatDate(
  input: string | Date,
  lang: Lang,
  opts?: { year?: boolean },
): string {
  const d = input instanceof Date ? input : parseConceptDate(input);
  if (!d || Number.isNaN(d.getTime())) return typeof input === "string" ? input : "";
  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();
  if (lang === "de") {
    const m = DE_MONTHS[month] ?? `${month + 1}`;
    return opts?.year ? `${day}. ${m} ${year}` : `${day}. ${m}`;
  }
  const m = EN_MONTHS[month] ?? `${month + 1}`;
  return opts?.year ? `${day} ${m} ${year}` : `${day} ${m}`;
}

function deThousands(n: number, decimals = 0): string {
  const fixed = decimals ? n.toFixed(decimals) : String(Math.round(n));
  const [intPart, dec] = fixed.split(".");
  const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return dec ? `${withDots},${dec}` : withDots;
}

export function formatMoney(kEuro: number, lang: Lang): string {
  if (lang === "de") {
    if (kEuro >= 1000) {
      const mio = kEuro / 1000;
      const s = deThousands(mio, 1);
      return `${s} Mio. €`;
    }
    return `${deThousands(kEuro * 1000)} €`;
  }
  if (kEuro >= 1000) return `€${(kEuro / 1000).toFixed(1).replace(/\.0$/, "")}m`;
  return `€${kEuro}k`;
}

export function formatMoneyRange(
  lo: number,
  hi: number,
  lang: Lang,
): string {
  if (lang === "de") {
    const fmt = (k: number) =>
      k >= 1000
        ? `${deThousands(k / 1000, 1)} Mio. €`
        : `${deThousands(k * 1000)} €`;
    return `${fmt(lo)}–${fmt(hi)}`;
  }
  if (lo < 1000 && hi >= 1000)
    return `€${lo}k–${(hi / 1000).toFixed(1)}m`;
  const fmt = (n: number) =>
    n >= 1000
      ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}m`
      : `${n}k`;
  return `€${fmt(lo)}–${fmt(hi)}`;
}

export function formatMoneyOne(n: number, lang: Lang): string {
  return formatMoney(n, lang);
}
