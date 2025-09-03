// lib/weeks.ts
import { SupabaseClient } from '@supabase/supabase-js';

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

/**
 * Gets the current week index for the logged-in creator.
 * First checks v_compliance view for current_week or weeks_done data.
 * Falls back to week 1 if no data is found.
 */
export async function getCurrentWeek(supabase: SupabaseClient): Promise<number> {
  try {
    // First, try to get current_week or weeks_done from v_compliance
    const { data: complianceData, error: complianceError } = await supabase
      .from("v_compliance")
      .select("current_week, weeks_done")
      .single();

    if (!complianceError && complianceData) {
      // If current_week is available, use it
      if (complianceData.current_week && typeof complianceData.current_week === 'number') {
        return complianceData.current_week;
      }
      
      // If weeks_done is available, return weeks_done + 1
      if (complianceData.weeks_done && typeof complianceData.weeks_done === 'number') {
        return complianceData.weeks_done + 1;
      }
    }

    // If v_compliance doesn't exist or doesn't have the expected data, fallback to 1
    console.log('v_compliance not found or missing week data, falling back to week 1');
    return 1;
  } catch (error) {
    console.error('Error getting current week from v_compliance:', error);
    // Fallback to week 1 on any error
    return 1;
  }
}
