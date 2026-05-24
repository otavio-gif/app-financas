import { createClient } from "@/lib/supabase/server";
import { isoFromDate } from "@/lib/format";
import { TransactionsView } from "./transactions-view";

export const dynamic = "force-dynamic";

type SearchParams = {
  month?: string;
  type?: string;
  category?: string;
  q?: string;
};

const MONTH_RE = /^\d{4}-\d{2}$/;

function escapeLikePattern(input: string): string {
  return input.replace(/[\\%_]/g, "\\$&");
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("transactions")
    .select("id, type, amount, description, occurred_on, category_id")
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.month && MONTH_RE.test(params.month)) {
    const [y, m] = params.month.split("-").map(Number);
    const start = isoFromDate(new Date(y, m - 1, 1));
    const end = isoFromDate(new Date(y, m, 0));
    query = query.gte("occurred_on", start).lte("occurred_on", end);
  }

  if (params.type === "income" || params.type === "expense") {
    query = query.eq("type", params.type);
  }

  if (params.category && params.category !== "all") {
    query = query.eq("category_id", params.category);
  }

  if (params.q && params.q.trim().length > 0) {
    query = query.ilike(
      "description",
      `%${escapeLikePattern(params.q.trim())}%`,
    );
  }

  const [{ data: transactions }, { data: categories }] = await Promise.all([
    query,
    supabase.from("categories").select("*").order("name"),
  ]);

  return (
    <TransactionsView
      transactions={transactions ?? []}
      categories={categories ?? []}
      filters={params}
    />
  );
}
