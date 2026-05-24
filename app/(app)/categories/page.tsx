import { createClient } from "@/lib/supabase/server";
import { CategoriesView } from "./categories-view";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: usageRows }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("transactions").select("category_id"),
  ]);

  const usage = new Map<string, number>();
  for (const row of usageRows ?? []) {
    if (!row.category_id) continue;
    usage.set(row.category_id, (usage.get(row.category_id) ?? 0) + 1);
  }

  return (
    <CategoriesView
      categories={categories ?? []}
      usage={Object.fromEntries(usage)}
    />
  );
}
