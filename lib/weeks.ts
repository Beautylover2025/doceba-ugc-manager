// lib/weeks.ts
export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function getWeekMeta(programStartISO: string, now = new Date()) {
  const start = startOfDay(new Date(programStartISO));
  const today = startOfDay(now);

  // volle Wochen seit Start (Woche 1 beginnt am Startdatum)
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const currentWeek = Math.max(1, Math.floor(diffDays / 7) + 1);

  const weekStart = addDays(start, (currentWeek - 1) * 7);
  const weekEnd = addDays(weekStart, 6);

  return {
    currentWeek,
    isFirstWeek: currentWeek === 1,
    weekStart,
    weekEnd,
    endDateLabel: weekEnd.toLocaleDateString("de-DE"),
  };
}
