// ...
// 4) Status ableiten
const requiredCount = slots.filter((s) => s.required).length;
const uploadedRequired = slots
  .filter((s) => s.required)
  .filter((s) => photos[s.id]).length;
const status = uploadedRequired === requiredCount ? "complete" : "partial";

// 5) DB-Eintrag (program_id weglassen ODER explizit null setzen)
const payload: any = {
  // falls deine Tabelle 'user_id' ODER 'creator_id' nutzt:
  user_id: user.id,       // wenn vorhanden
  creator_id: user.id,    // wenn vorhanden
  week: weekNumber,       // wenn vorhanden
  week_index: weekNumber, // wenn vorhanden
  note,
  photos,                 // nur wenn Spalte existiert
  status,
};

// program_id nicht senden oder auf null setzen:
payload.program_id = null;  // <-- wichtig bei uuid-Spalte

const { error: insErr } = await supabase.from("uploads").insert(payload);
// ...

