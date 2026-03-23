/**
 * Row background for appointment list: Past (red-ish), Today (green-ish), Future (yellow-ish).
 * API may return DATE as "YYYY-MM-DD" or ISO datetime; TIME as "HH:MM:SS" or similar.
 */

/** @returns {{ y: number, m: number, d: number } | null} */
function parseYmdParts(dateVal) {
  if (dateVal == null || dateVal === "") return null;
  if (typeof dateVal === "string") {
    const m = dateVal.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
    }
  }
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return null;
  return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
}

/** @returns {{ hh: number, mm: number }} */
function parseHhMmParts(timeVal) {
  if (timeVal == null || timeVal === "") return { hh: 0, mm: 0 };
  if (typeof timeVal === "object" && timeVal !== null) {
    if (typeof timeVal.hours === "number" && typeof timeVal.minutes === "number") {
      return { hh: timeVal.hours, mm: timeVal.minutes };
    }
  }
  const s = String(timeVal);
  const m = s.match(/(\d{1,2}):(\d{2})/);
  if (!m) return { hh: 0, mm: 0 };
  return { hh: Number(m[1]), mm: Number(m[2]) };
}

/**
 * @param {{ date: unknown, time: unknown }} p
 */
export function getAppointmentRowColor({ date, time }) {
  const ymd = parseYmdParts(date);
  if (!ymd) return { bg: "transparent", label: "" };

  const { hh, mm } = parseHhMmParts(time);
  const dt = new Date(ymd.y, ymd.m - 1, ymd.d, hh, mm, 0, 0);
  if (Number.isNaN(dt.getTime())) return { bg: "transparent", label: "" };

  const now = new Date();
  const isToday =
    dt.getFullYear() === now.getFullYear() &&
    dt.getMonth() === now.getMonth() &&
    dt.getDate() === now.getDate();

  if (isToday) return { bg: "#22c55e", label: "Today" };
  if (dt.getTime() < now.getTime()) return { bg: "#ef4444", label: "Past" };
  return { bg: "#eab308", label: "Future" };
}
