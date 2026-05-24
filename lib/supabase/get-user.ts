import { cache } from "react";
import { createClient } from "./server";

/**
 * React-cached wrapper around supabase.auth.getUser() so the layout
 * and any child server components that need the user share a single
 * call within the same request.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
