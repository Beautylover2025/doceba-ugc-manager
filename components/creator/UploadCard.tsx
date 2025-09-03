// …oberhalb von handleUpload einfügen:
async function resolveProgramId(supabase: SupabaseClient, userId: string) {
  // 1) v_compliance fragen (empfohlen)
  const { data: comp, error: compErr } = await supabase
    .from('v_compliance')
    .select('program_id')
    .eq('creator_id', userId)
    .maybeSingle();

  if (comp?.program_id) return comp.program_id;

  // 2) Fallback: profiles.program_default_id
  const { data: prof, error: profErr } = await supabase
    .from('profiles')
    .select('program_default_id')
    .eq('id', userId)
    .maybeSingle();

  return prof?.program_default_id ?? null;
}

// …innerhalb handleUpload() – VOR dem Insert:
const programId = await resolveProgramId(supabase, user.id);

if (!programId) {
  toast({
    title: "Kein Programm gefunden",
    description:
      "Für deinen Account ist noch kein Programm hinterlegt. Bitte an Support/Admin wenden.",
    variant: "destructive",
  });
  return;
}

// …beim Insert dann program_id: programId verwenden:
const { error: insErr } = await supabase.from("uploads").insert({
  creator_id: user.id,
  program_id: programId,        // <— Wichtig!
  week_index: weekNumber,
  before_path: photos.front ?? null,
  after_path: photos["forehead"] ?? null,
  note,
  status,
});
