"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Database } from "@/lib/supabase/database.types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

const MONTH_NAMES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function lastTwelveMonths(): { value: string; label: string }[] {
  const now = new Date();
  const out: { value: string; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${MONTH_NAMES_PT[d.getMonth()]} ${d.getFullYear()}`;
    out.push({ value, label });
  }
  return out;
}

interface FiltersProps {
  categories: Category[];
  initial: {
    month?: string;
    type?: string;
    category?: string;
    q?: string;
  };
}

export function TransactionsFilters({ categories, initial }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(initial.q ?? "");

  const months = lastTwelveMonths();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "" || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/transactions?${qs}` : "/transactions");
    });
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateParam("q", searchValue.trim() || null);
  }

  function handleReset() {
    setSearchValue("");
    startTransition(() => {
      router.push("/transactions");
    });
  }

  const hasActiveFilters =
    initial.month || initial.type || initial.category || initial.q;

  const selectClass =
    "h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div
      aria-busy={pending}
      className={`flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3 ${pending ? "opacity-70" : ""}`}
    >
      <div className="space-y-1">
        <label htmlFor="filter-month" className="text-xs text-muted-foreground">
          Mês
        </label>
        <select
          id="filter-month"
          value={initial.month ?? "all"}
          onChange={(e) => updateParam("month", e.target.value)}
          disabled={pending}
          className={selectClass}
        >
          <option value="all">Todos</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="filter-type" className="text-xs text-muted-foreground">
          Tipo
        </label>
        <select
          id="filter-type"
          value={initial.type ?? "all"}
          onChange={(e) => updateParam("type", e.target.value)}
          disabled={pending}
          className={selectClass}
        >
          <option value="all">Todos</option>
          <option value="expense">Despesas</option>
          <option value="income">Receitas</option>
        </select>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="filter-category"
          className="text-xs text-muted-foreground"
        >
          Categoria
        </label>
        <select
          id="filter-category"
          value={initial.category ?? "all"}
          onChange={(e) => updateParam("category", e.target.value)}
          disabled={pending}
          className={selectClass}
        >
          <option value="all">Todas</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.type === "income" ? "receita" : "despesa"})
            </option>
          ))}
        </select>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-1 items-end gap-2 min-w-[200px]"
      >
        <div className="flex-1 space-y-1">
          <label
            htmlFor="search-q"
            className="text-xs text-muted-foreground"
          >
            Busca
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search-q"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Descrição..."
              className="pl-8"
            />
          </div>
        </div>
        <Button type="submit" variant="outline">
          Buscar
        </Button>
      </form>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="self-center"
        >
          <X className="h-4 w-4" />
          Limpar
        </Button>
      )}
    </div>
  );
}
