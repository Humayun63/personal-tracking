"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/user";

export interface SetupPayload {
  bulughDate: string;
  qazaEndDate: string;
  includeWitr: boolean;
  exclusions: { startDate: string; endDate: string }[];
}

export async function saveQazaSetup(payload: SetupPayload) {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { error: settingsError } = await supabase.from("qaza_settings").upsert({
    user_id: user.id,
    bulugh_date: payload.bulughDate,
    qaza_end_date: payload.qazaEndDate,
    include_witr: payload.includeWitr,
  });
  if (settingsError) throw new Error(settingsError.message);

  await supabase.from("qaza_exclusion_periods").delete().eq("user_id", user.id);

  if (payload.exclusions.length > 0) {
    const { error: exclusionError } = await supabase.from("qaza_exclusion_periods").insert(
      payload.exclusions.map((e) => ({
        user_id: user.id,
        start_date: e.startDate,
        end_date: e.endDate,
      })),
    );
    if (exclusionError) throw new Error(exclusionError.message);
  }

  revalidatePath("/qaza");
  redirect("/qaza");
}
