import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { currencyBRL, formatDateBR } from "@/lib/format";
import type { Database } from "@/lib/supabase/database.types";
import { DashboardCharts } from "./charts-loader";

export const dynamic = "force-dynamic";

type Category = Database["public"]["Tables"]["categories"]["Row"];

const MONTH_NAMES_PT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();

  const [{ data: monthlyRows }, { data: byCatRows }, { data: cats }, { data: recent }] =
    await Promise.all([
      supabase.rpc("monthly_totals", { p_months: 6 }),
      supabase.rpc("current_month_expense_by_category"),
      supabase.from("categories").select("*"),
      supabase
        .from("transactions")
        .select("id, type, amount, description, occurred_on, category_id")
        .order("occurred_on", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const categories = cats ?? [];
  const categoriesById = new Map<string, Category>(
    categories.map((c) => [c.id, c]),
  );

  const monthlyTrend = (monthlyRows ?? []).map((row) => {
    const month = Number(row.month_start.slice(5, 7)) - 1;
    return {
      label: MONTH_NAMES_PT[month],
      income: Number(row.income),
      expense: Number(row.expense),
    };
  });

  const currentMonth = monthlyTrend[monthlyTrend.length - 1] ?? {
    income: 0,
    expense: 0,
  };
  const prevMonth = monthlyTrend[monthlyTrend.length - 2];
  const monthIncome = currentMonth.income;
  const monthExpense = currentMonth.expense;
  const balance = monthIncome - monthExpense;

  const prevBalance = prevMonth ? prevMonth.income - prevMonth.expense : null;
  const balanceDelta =
    prevBalance !== null && prevBalance !== 0
      ? ((balance - prevBalance) / Math.abs(prevBalance)) * 100
      : null;

  const expenseByCategory = (byCatRows ?? []).map((row) => {
    const cat = row.category_id ? categoriesById.get(row.category_id) : null;
    return {
      name: cat?.name ?? "Sem categoria",
      color: cat?.color ?? "var(--muted-foreground)",
      total: Number(row.total),
    };
  });

  return (
    <div className="space-y-10">
      <PageHeader
        overline={`${capitalizedMonth(now)} ${now.getFullYear()}`}
        title="Resumo"
      />

      <section className="grid gap-x-12 gap-y-8 md:grid-cols-3">
        <Stat
          label="Saldo do mês"
          value={balance}
          tone={balance >= 0 ? "positive" : "negative"}
          delta={balanceDelta}
        />
        <Stat label="Receitas" value={monthIncome} tone="positive" />
        <Stat label="Despesas" value={monthExpense} tone="negative" />
      </section>

      <DashboardCharts
        expenseByCategory={expenseByCategory}
        monthlyTrend={monthlyTrend}
      />

      <section className="space-y-4 border-t border-border pt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="t-h2">
            Últimas transações
          </h2>
          <Link
            href="/transactions"
            className="t-overline inline-flex items-center gap-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {!recent || recent.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma transação ainda.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((tx) => {
              const cat = tx.category_id
                ? categoriesById.get(tx.category_id)
                : null;
              const isIncome = tx.type === "income";
              return (
                <li
                  key={tx.id}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {tx.description ?? cat?.name ?? "Sem descrição"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span
                        className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle"
                        style={{
                          backgroundColor: cat?.color ?? "var(--muted-foreground)",
                        }}
                      />
                      {cat?.name ?? "Sem categoria"} ·{" "}
                      <time>{formatDateBR(tx.occurred_on)}</time>
                    </p>
                  </div>
                  <span
                    className={`font-mono text-sm tabular-nums ${
                      isIncome ? "text-[color:var(--income)]" : "text-[color:var(--expense)]"
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
      </section>
    </div>
  );
}

function capitalizedMonth(date: Date): string {
  const name = date.toLocaleDateString("pt-BR", { month: "long" });
  return name.charAt(0).toUpperCase() + name.slice(1);
}
