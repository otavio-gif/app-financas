"use client";

import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { currencyBRL } from "@/lib/format";

const tooltipContentStyle: React.CSSProperties = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "2px",
  color: "var(--popover-foreground)",
  fontSize: 12,
  padding: "8px 10px",
};
const tooltipItemStyle: React.CSSProperties = {
  color: "var(--popover-foreground)",
  fontFamily: "var(--font-mono)",
};
const tooltipLabelStyle: React.CSSProperties = {
  color: "var(--muted-foreground)",
  fontSize: 12,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  marginBottom: 4,
};
const axisTickStyle = { fontSize: 12, fill: "var(--muted-foreground)" };
const legendStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--muted-foreground)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

interface DashboardChartsProps {
  expenseByCategory: { name: string; color: string; total: number }[];
  monthlyTrend: { label: string; income: number; expense: number }[];
}

export function DashboardCharts({
  expenseByCategory,
  monthlyTrend,
}: DashboardChartsProps) {
  const expenseTotal = expenseByCategory.reduce((s, r) => s + r.total, 0);
  const expenseSummary =
    expenseByCategory.length === 0
      ? "Sem despesas no mês atual."
      : `Despesas por categoria no mês atual, total ${currencyBRL.format(expenseTotal)}. ` +
        expenseByCategory
          .map(
            (r) =>
              `${r.name}: ${currencyBRL.format(r.total)} (${expenseTotal > 0 ? Math.round((r.total / expenseTotal) * 100) : 0}%)`,
          )
          .join(", ") +
        ".";

  const trendSummary =
    monthlyTrend.length === 0
      ? "Sem histórico mensal."
      : `Evolução de receitas e despesas nos últimos ${monthlyTrend.length} meses. ` +
        monthlyTrend
          .map(
            (m) =>
              `${m.label}: receitas ${currencyBRL.format(m.income)}, despesas ${currencyBRL.format(m.expense)}`,
          )
          .join("; ") +
        ".";

  return (
    <div className="grid gap-8 border-y border-border py-6 lg:grid-cols-2">
      <section className="space-y-3">
        <header className="flex items-baseline justify-between">
          <h2 className="font-sans text-lg font-semibold tracking-[-0.2px]">
            Despesas por categoria
          </h2>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Mês atual
          </p>
        </header>
        {expenseByCategory.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Sem despesas no mês.
          </p>
        ) : (
          <figure
            role="img"
            aria-label={expenseSummary}
            className="h-72"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={88}
                  paddingAngle={1}
                  stroke="var(--background)"
                  strokeWidth={2}
                >
                  {expenseByCategory.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => currencyBRL.format(Number(value ?? 0))}
                  contentStyle={tooltipContentStyle}
                  itemStyle={tooltipItemStyle}
                  labelStyle={tooltipLabelStyle}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={6}
                  wrapperStyle={legendStyle}
                />
              </PieChart>
            </ResponsiveContainer>
            <table className="sr-only">
              <caption>Despesas por categoria no mês atual</caption>
              <thead>
                <tr>
                  <th scope="col">Categoria</th>
                  <th scope="col">Valor</th>
                </tr>
              </thead>
              <tbody>
                {expenseByCategory.map((r) => (
                  <tr key={r.name}>
                    <th scope="row">{r.name}</th>
                    <td>{currencyBRL.format(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </figure>
        )}
      </section>

      <section className="space-y-3">
        <header className="flex items-baseline justify-between">
          <h2 className="font-sans text-lg font-semibold tracking-[-0.2px]">
            Evolução mensal
          </h2>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Últimos 6 meses
          </p>
        </header>
        <figure role="img" aria-label={trendSummary} className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyTrend}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="2 4"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={axisTickStyle}
                axisLine={false}
                tickLine={false}
                stroke="var(--border)"
              />
              <YAxis
                tick={axisTickStyle}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(v) => {
                  const n = Number(v);
                  return n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n);
                }}
              />
              <Tooltip
                formatter={(value) => currencyBRL.format(Number(value ?? 0))}
                contentStyle={tooltipContentStyle}
                itemStyle={tooltipItemStyle}
                labelStyle={tooltipLabelStyle}
                cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              />
              <Legend
                iconType="circle"
                iconSize={6}
                wrapperStyle={legendStyle}
              />
              <Line
                type="monotone"
                dataKey="income"
                name="Receitas"
                stroke="var(--income)"
                strokeWidth={1.5}
                dot={{ r: 3, strokeWidth: 0, fill: "var(--income)" }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                name="Despesas"
                stroke="var(--expense)"
                strokeWidth={1.5}
                dot={{ r: 3, strokeWidth: 0, fill: "var(--expense)" }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <table className="sr-only">
            <caption>Evolução mensal de receitas e despesas</caption>
            <thead>
              <tr>
                <th scope="col">Mês</th>
                <th scope="col">Receitas</th>
                <th scope="col">Despesas</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTrend.map((m) => (
                <tr key={m.label}>
                  <th scope="row">{m.label}</th>
                  <td>{currencyBRL.format(m.income)}</td>
                  <td>{currencyBRL.format(m.expense)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      </section>
    </div>
  );
}
