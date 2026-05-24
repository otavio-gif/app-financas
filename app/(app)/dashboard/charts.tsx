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
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  marginBottom: 4,
};
const axisTickStyle = { fontSize: 11, fill: "var(--muted-foreground)" };
const legendStyle: React.CSSProperties = {
  fontSize: 11,
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
  return (
    <div className="grid gap-8 border-y border-border py-6 lg:grid-cols-2">
      <section className="space-y-3">
        <header className="flex items-baseline justify-between">
          <h2 className="font-heading text-lg font-medium tracking-tight">
            Despesas por categoria
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Mês atual
          </p>
        </header>
        {expenseByCategory.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Sem despesas no mês.
          </p>
        ) : (
          <div className="h-72">
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
          </div>
        )}
      </section>

      <section className="space-y-3">
        <header className="flex items-baseline justify-between">
          <h2 className="font-heading text-lg font-medium tracking-tight">
            Evolução mensal
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Últimos 6 meses
          </p>
        </header>
        <div className="h-72">
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
        </div>
      </section>
    </div>
  );
}
