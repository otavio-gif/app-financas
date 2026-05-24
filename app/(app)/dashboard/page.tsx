import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currencyBRL, formatDateBR, isoFromDate } from "@/lib/format";
import type { Database } from "@/lib/supabase/database.types";
import { DashboardCharts } from "./charts";

export const dynamic = "force-dynamic";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

const MONTH_NAMES_PT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [{ data: txs }, { data: cats }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .gte("occurred_on", isoFromDate(sixMonthsAgo))
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*"),
  ]);

  const transactions = txs ?? [];
  const categories = cats ?? [];
  const categoriesById = new Map(categories.map((c) => [c.id, c]));

  const currentMonthIso = isoFromDate(currentMonthStart);
  const currentMonthTxs = transactions.filter(
    (t) => t.occurred_on >= currentMonthIso,
  );

  const monthIncome = sumByType(currentMonthTxs, "income");
  const monthExpense = sumByType(currentMonthTxs, "expense");
  const balance = monthIncome - monthExpense;

  const expenseByCategory = aggregateExpensesByCategory(
    currentMonthTxs,
    categoriesById,
  );

  const monthlyTrend = buildMonthlyTrend(transactions, now);

  const recent = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumo de {capitalizedMonth(now)} {now.getFullYear()}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Saldo do mês"
          value={balance}
          icon={<Wallet className="h-4 w-4" />}
          tone={balance >= 0 ? "positive" : "negative"}
        />
        <SummaryCard
          title="Receitas"
          value={monthIncome}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="positive"
        />
        <SummaryCard
          title="Despesas"
          value={monthExpense}
          icon={<TrendingDown className="h-4 w-4" />}
          tone="negative"
        />
      </div>

      <DashboardCharts
        expenseByCategory={expenseByCategory}
        monthlyTrend={monthlyTrend}
      />

      <Card>
        <CardHeader>
          <CardTitle>Últimas transações</CardTitle>
          <CardDescription>
            <Link
              href="/transactions"
              className="inline-flex items-center gap-1 text-sm hover:text-foreground"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma transação ainda.
            </p>
          ) : (
            <ul className="divide-y">
              {recent.map((tx) => {
                const cat = tx.category_id
                  ? categoriesById.get(tx.category_id)
                  : null;
                const isIncome = tx.type === "income";
                return (
                  <li key={tx.id} className="flex items-center gap-3 py-3">
                    <span
                      className="h-8 w-8 shrink-0 rounded-full"
                      style={{ backgroundColor: cat?.color ?? "#94a3b8" }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {tx.description ?? cat?.name ?? "Sem descrição"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cat?.name ?? "Sem categoria"} ·{" "}
                        {formatDateBR(tx.occurred_on)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-sm font-medium tabular-nums ${
                        isIncome ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isIncome ? "+" : "−"}
                      {currencyBRL.format(Number(tx.amount))}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  tone: "positive" | "negative" | "neutral";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
        ? "text-rose-600"
        : "text-foreground";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          {title}
          <span className="text-muted-foreground">{icon}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-semibold tabular-nums ${toneClass}`}>
          {currencyBRL.format(value)}
        </p>
      </CardContent>
    </Card>
  );
}

function sumByType(txs: Transaction[], type: "income" | "expense"): number {
  return txs
    .filter((t) => t.type === type)
    .reduce((acc, t) => acc + Number(t.amount), 0);
}

function aggregateExpensesByCategory(
  txs: Transaction[],
  byId: Map<string, Category>,
): { name: string; color: string; total: number }[] {
  const sums = new Map<string, number>();
  for (const t of txs) {
    if (t.type !== "expense") continue;
    const key = t.category_id ?? "__none__";
    sums.set(key, (sums.get(key) ?? 0) + Number(t.amount));
  }
  return [...sums.entries()]
    .map(([id, total]) => {
      const cat = id !== "__none__" ? byId.get(id) : null;
      return {
        name: cat?.name ?? "Sem categoria",
        color: cat?.color ?? "#94a3b8",
        total,
      };
    })
    .sort((a, b) => b.total - a.total);
}

function buildMonthlyTrend(
  txs: Transaction[],
  reference: Date,
): { label: string; income: number; expense: number }[] {
  const buckets: Map<string, { income: number; expense: number }> = new Map();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(reference.getFullYear(), reference.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, { income: 0, expense: 0 });
  }

  for (const t of txs) {
    const key = t.occurred_on.slice(0, 7); // YYYY-MM
    const bucket = buckets.get(key);
    if (!bucket) continue;
    if (t.type === "income") bucket.income += Number(t.amount);
    else bucket.expense += Number(t.amount);
  }

  return [...buckets.entries()].map(([key, v]) => {
    const month = Number(key.slice(5, 7)) - 1;
    return { label: MONTH_NAMES_PT[month], income: v.income, expense: v.expense };
  });
}

function capitalizedMonth(date: Date): string {
  const name = date.toLocaleDateString("pt-BR", { month: "long" });
  return name.charAt(0).toUpperCase() + name.slice(1);
}
