import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const monthIncome = currentMonth.income;
  const monthExpense = currentMonth.expense;
  const balance = monthIncome - monthExpense;

  const expenseByCategory = (byCatRows ?? []).map((row) => {
    const cat = row.category_id ? categoriesById.get(row.category_id) : null;
    return {
      name: cat?.name ?? "Sem categoria",
      color: cat?.color ?? "#94a3b8",
      total: Number(row.total),
    };
  });

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
          {!recent || recent.length === 0 ? (
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
                        isIncome
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-rose-700 dark:text-rose-400"
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
      ? "text-emerald-700 dark:text-emerald-400"
      : tone === "negative"
        ? "text-rose-700 dark:text-rose-400"
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

function capitalizedMonth(date: Date): string {
  const name = date.toLocaleDateString("pt-BR", { month: "long" });
  return name.charAt(0).toUpperCase() + name.slice(1);
}
