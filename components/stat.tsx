import { currencyBRL } from "@/lib/format";

export type StatTone = "positive" | "negative" | "neutral";

interface StatProps {
  label: string;
  value: number;
  /** Format as BRL currency (default true). Set false for raw numbers. */
  currency?: boolean;
  tone?: StatTone;
  delta?: number | null;
}

/**
 * Editorial statistic block: small uppercase label + large mono value,
 * with an optional vs-previous delta below. Hairline rule on the left
 * (mobile) or top (desktop) provides the section break.
 */
export function Stat({
  label,
  value,
  currency = true,
  tone = "neutral",
  delta,
}: StatProps) {
  const toneColor =
    tone === "positive"
      ? "text-[color:var(--income)]"
      : tone === "negative"
        ? "text-[color:var(--expense)]"
        : "text-foreground";

  const formatted = currency
    ? currencyBRL.format(value)
    : value.toLocaleString("pt-BR");

  const deltaSign =
    delta !== null && delta !== undefined && delta > 0 ? "+" : "";

  return (
    <div className="space-y-2 border-l border-border pl-5 md:border-l-0 md:border-t md:pl-0 md:pt-5">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`font-mono text-3xl font-normal tabular-nums ${toneColor}`}
      >
        {formatted}
      </p>
      {delta !== null && delta !== undefined && (
        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          {deltaSign}
          {delta.toFixed(1)}% vs mês anterior
        </p>
      )}
    </div>
  );
}
