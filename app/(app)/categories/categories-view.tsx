"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
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
import {
  createCategory,
  deleteCategory,
  updateCategory,
  type CategoryState,
} from "./actions";

type Category = Database["public"]["Tables"]["categories"]["Row"];

const PALETTE = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#94a3b8",
];

interface CategoriesViewProps {
  categories: Category[];
  usage: Record<string, number>;
}

export function CategoriesView({ categories, usage }: CategoriesViewProps) {
  const [dialogState, setDialogState] = useState<
    | { mode: "create"; type: "income" | "expense" }
    | { mode: "edit"; category: Category }
    | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const expenses = categories.filter((c) => c.type === "expense");
  const incomes = categories.filter((c) => c.type === "income");

  function handleDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    startDelete(async () => {
      await deleteCategory(id);
      setDeleteTarget(null);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
        <p className="text-sm text-muted-foreground">
          Organize suas receitas e despesas
        </p>
      </div>

      <CategorySection
        title="Despesas"
        accent="text-rose-600"
        categories={expenses}
        usage={usage}
        onCreate={() => setDialogState({ mode: "create", type: "expense" })}
        onEdit={(c) => setDialogState({ mode: "edit", category: c })}
        onDelete={(c) => setDeleteTarget(c)}
      />

      <CategorySection
        title="Receitas"
        accent="text-emerald-600"
        categories={incomes}
        usage={usage}
        onCreate={() => setDialogState({ mode: "create", type: "income" })}
        onEdit={(c) => setDialogState({ mode: "edit", category: c })}
        onDelete={(c) => setDeleteTarget(c)}
      />

      <Dialog
        open={dialogState !== null}
        onOpenChange={(open) => !open && setDialogState(null)}
      >
        <DialogContent>
          {dialogState && (
            <CategoryForm
              key={
                dialogState.mode === "edit"
                  ? dialogState.category.id
                  : `new-${dialogState.type}`
              }
              editing={
                dialogState.mode === "edit" ? dialogState.category : null
              }
              defaultType={
                dialogState.mode === "create" ? dialogState.type : undefined
              }
              onSuccess={() => setDialogState(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir &quot;{deleteTarget?.name}&quot;?</DialogTitle>
            <DialogDescription>
              {deleteTarget && usage[deleteTarget.id]
                ? `${usage[deleteTarget.id]} transação(ões) ficarão sem categoria.`
                : "Esta categoria não está em uso."}
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

interface CategorySectionProps {
  title: string;
  accent: string;
  categories: Category[];
  usage: Record<string, number>;
  onCreate: () => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}

function CategorySection({
  title,
  accent,
  categories,
  usage,
  onCreate,
  onEdit,
  onDelete,
}: CategorySectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${accent}`}>{title}</h2>
        <Button size="sm" variant="outline" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>
      {categories.length === 0 ? (
        <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
          Nenhuma categoria.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <span
                className="h-8 w-8 shrink-0 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {usage[c.id] ?? 0} transações
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(c)}
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(c)}
                  aria-label="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

interface CategoryFormProps {
  editing: Category | null;
  defaultType?: "income" | "expense";
  onSuccess: () => void;
}

function CategoryForm({
  editing,
  defaultType,
  onSuccess,
}: CategoryFormProps) {
  const isEdit = editing !== null;
  const action = isEdit
    ? updateCategory.bind(null, editing.id)
    : createCategory;

  const [formState, formAction, pending] = useActionState<
    CategoryState,
    FormData
  >(action, undefined);

  const type = (editing?.type ?? defaultType ?? "expense") as
    | "income"
    | "expense";

  const [color, setColor] = useState<string>(
    editing?.color ?? (type === "income" ? "#10b981" : "#ef4444"),
  );

  useEffect(() => {
    if (formState?.message) onSuccess();
  }, [formState, onSuccess]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEdit ? "Editar categoria" : "Nova categoria"}
        </DialogTitle>
        <DialogDescription>
          {type === "income" ? "Receita" : "Despesa"}
        </DialogDescription>
      </DialogHeader>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="color" value={color} />

        <div className="space-y-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={40}
            defaultValue={editing?.name ?? ""}
            placeholder="Ex: Mercado, Salário..."
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label>Cor</Label>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="relative flex h-8 w-8 items-center justify-center rounded-full ring-offset-background transition hover:scale-110"
                style={{ backgroundColor: c }}
                aria-label={`Cor ${c}`}
              >
                {c === color && (
                  <Check className="h-4 w-4 text-white drop-shadow" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="icon">Ícone (opcional)</Label>
          <Input
            id="icon"
            name="icon"
            defaultValue={editing?.icon ?? ""}
            placeholder="Ex: utensils, car, wallet"
          />
          <p className="text-xs text-muted-foreground">
            Nome de um ícone do lucide.dev
          </p>
        </div>

        {formState?.error && (
          <p className="text-sm text-destructive">{formState.error}</p>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" type="button" />}>
            Cancelar
          </DialogClose>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
