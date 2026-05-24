"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/lib/supabase/database.types";
import { currencyBRL, formatDateBR, todayISO } from "@/lib/format";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
  type TransactionState,
} from "./actions";
import { TransactionsFilters } from "./transactions-filters";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Transaction = Pick<
  Database["public"]["Tables"]["transactions"]["Row"],
  "id" | "type" | "amount" | "description" | "occurred_on" | "category_id"
>;

type Filters = {
  month?: string;
  type?: string;
  category?: string;
  q?: string;
};

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  filters: Filters;
}

export function TransactionsView({
  transactions,
  categories,
  filters,
}: TransactionsViewProps) {
  const [dialogState, setDialogState] = useState<
    { mode: "create" } | { mode: "edit"; transaction: Transaction } | null
  >(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  function handleDelete() {
    if (!deleteId) return;
    const id = deleteId;
    startDelete(async () => {
      await deleteTransaction(id);
      setDeleteId(null);
    });
  }

  const categoriesById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  let totalIncome = 0;
  let totalExpense = 0;
  for (const t of transactions) {
    const amount = Number(t.amount);
    if (t.type === "income") totalIncome += amount;
    else if (t.type === "expense") totalExpense += amount;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Transações</h1>
        <Button onClick={() => setDialogState({ mode: "create" })}>
          <Plus className="h-4 w-4" />
          Nova transação
        </Button>
      </div>

      <TransactionsFilters categories={categories} initial={filters} />

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">
            {transactions.length}
          </span>{" "}
          {transactions.length === 1 ? "transação" : "transações"}
        </span>
        <span className="text-emerald-700 dark:text-emerald-400">
          + {currencyBRL.format(totalIncome)}
        </span>
        <span className="text-rose-700 dark:text-rose-400">
          − {currencyBRL.format(totalExpense)}
        </span>
        <span className="ml-auto">
          Saldo:{" "}
          <span
            className={`font-medium tabular-nums ${
              totalIncome - totalExpense >= 0
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-rose-700 dark:text-rose-400"
            }`}
          >
            {currencyBRL.format(totalIncome - totalExpense)}
          </span>
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center">
          {filters.month || filters.type || filters.category || filters.q ? (
            <p className="text-muted-foreground">
              Nenhuma transação encontrada para esses filtros.
            </p>
          ) : (
            <>
              <p className="text-muted-foreground">Nenhuma transação ainda.</p>
              <p className="text-sm text-muted-foreground">
                Clique em &quot;Nova transação&quot; para começar.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Data</th>
                <th className="px-4 py-2 text-left font-medium">Descrição</th>
                <th className="px-4 py-2 text-left font-medium">Categoria</th>
                <th className="px-4 py-2 text-right font-medium">Valor</th>
                <th className="px-4 py-2 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const category = tx.category_id
                  ? categoriesById.get(tx.category_id)
                  : undefined;
                const isIncome = tx.type === "income";
                return (
                  <tr key={tx.id} className="border-t">
                    <td className="px-4 py-3">{formatDateBR(tx.occurred_on)}</td>
                    <td className="px-4 py-3">
                      {tx.description ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {category ? (
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Sem categoria
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium tabular-nums ${
                        isIncome
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-rose-700 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? "+" : "−"}
                      {currencyBRL.format(Number(tx.amount))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setDialogState({ mode: "edit", transaction: tx })
                          }
                          aria-label={`Editar transação de ${formatDateBR(tx.occurred_on)}${tx.description ? `: ${tx.description}` : ""}`}
                          className="h-10 w-10 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setDeleteId(tx.id)}
                          aria-label={`Excluir transação de ${formatDateBR(tx.occurred_on)}${tx.description ? `: ${tx.description}` : ""}`}
                          className="h-10 w-10 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <TransactionDialog
        state={dialogState}
        categories={categories}
        onClose={() => setDialogState(null)}
      />

      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir transação?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TransactionDialogProps {
  state: { mode: "create" } | { mode: "edit"; transaction: Transaction } | null;
  categories: Category[];
  onClose: () => void;
}

function TransactionDialog({
  state,
  categories,
  onClose,
}: TransactionDialogProps) {
  return (
    <Dialog open={state !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {state && (
          <TransactionForm
            key={state.mode === "edit" ? state.transaction.id : "new"}
            editing={state.mode === "edit" ? state.transaction : null}
            categories={categories}
            onSuccess={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface TransactionFormProps {
  editing: Transaction | null;
  categories: Category[];
  onSuccess: () => void;
}

function TransactionForm({
  editing,
  categories,
  onSuccess,
}: TransactionFormProps) {
  const isEdit = editing !== null;
  const action = isEdit
    ? updateTransaction.bind(null, editing.id)
    : createTransaction;

  const [formState, formAction, pending] = useActionState<
    TransactionState,
    FormData
  >(action, undefined);

  const [type, setType] = useState<"income" | "expense">(
    (editing?.type as "income" | "expense") ?? "expense",
  );

  useEffect(() => {
    if (formState?.message) {
      onSuccess();
    }
  }, [formState, onSuccess]);

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEdit ? "Editar transação" : "Nova transação"}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Atualize os dados da transação"
            : "Registre uma receita ou despesa"}
        </DialogDescription>
      </DialogHeader>

      <form action={formAction} className="space-y-4">
        <div
          role="radiogroup"
          aria-label="Tipo da transação"
          className="grid grid-cols-2 gap-2"
        >
          <button
            type="button"
            role="radio"
            aria-checked={type === "expense"}
            onClick={() => setType("expense")}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
              type === "expense"
                ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                : "border-input text-muted-foreground hover:bg-muted"
            }`}
          >
            Despesa
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={type === "income"}
            onClick={() => setType("income")}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
              type === "income"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "border-input text-muted-foreground hover:bg-muted"
            }`}
          >
            Receita
          </button>
        </div>
        <input type="hidden" name="type" value={type} />

        <div className="space-y-1.5">
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            required
            defaultValue={editing?.amount ?? ""}
            placeholder="0.00"
            autoComplete="off"
            aria-describedby={formState?.error ? "tx-form-error" : undefined}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="occurred_on">Data</Label>
          <Input
            id="occurred_on"
            name="occurred_on"
            type="date"
            required
            defaultValue={editing?.occurred_on ?? todayISO()}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category_id">Categoria</Label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={editing?.category_id ?? ""}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">Sem categoria</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Input
            id="description"
            name="description"
            type="text"
            maxLength={120}
            defaultValue={editing?.description ?? ""}
            placeholder="Ex: Almoço, Salário, Uber..."
            autoComplete="off"
          />
        </div>

        {formState?.error && (
          <p
            id="tx-form-error"
            role="alert"
            aria-live="polite"
            className="text-sm text-destructive"
          >
            {formState.error}
          </p>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" type="button" />}>
            Cancelar
          </DialogClose>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : isEdit ? "Salvar" : "Adicionar"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
