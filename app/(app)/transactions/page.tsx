import { createClient } from "@/lib/supabase/server";
import { isoFromDate } from "@/lib/format";
import { TransactionsView } from "./transactions-view";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type SearchParams = {
  month?: string;
  type?: string;
  category?: string;
  q?: string;
  page?: string;
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

  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  // Fetch one extra to know if there's a next page without a count query.
  const to = from + PAGE_SIZE;

  let query = supabase
    .from("transactions")
    .select("id, type, amount, description, occurred_on, category_id")
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

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

  const [{ data: rows }, { data: categories }] = await Promise.all([
    query,
    supabase.from("categories").select("*").order("name"),
  ]);

  const fetched = rows ?? [];
  const hasNext = fetched.length > PAGE_SIZE;
  const transactions = hasNext ? fetched.slice(0, PAGE_SIZE) : fetched;

  return (
    <TransactionsView
      transactions={transactions}
      categories={categories ?? []}
      filters={params}
      page={page}
      hasNext={hasNext}
    />
  );
}
