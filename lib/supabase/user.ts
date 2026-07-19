import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Route protection itself happens in proxy.ts; this just fetches the current
 * user for pages/layouts that need the id to scope queries, memoized per
 * render pass so multiple call sites don't each hit Supabase separately.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
