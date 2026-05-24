import { createClient } from "@/lib/supabase/server";
import { CategoriesView } from "./categories-view";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: usageRows }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.rpc("category_usage_counts"),
  ]);

  const usage: Record<string, number> = {};
  for (const row of usageRows ?? []) {
    if (row.category_id) usage[row.category_id] = Number(row.count);
  }

  return <CategoriesView categories={categories ?? []} usage={usage} />;
}
