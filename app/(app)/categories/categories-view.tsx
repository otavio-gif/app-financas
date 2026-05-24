"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
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
import { PageHeader } from "@/components/page-header";
import type { Database } from "@/lib/supabase/database.types";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  type CategoryState,
} from "./actions";

type Category = Database["public"]["Tables"]["categories"]["Row"];

const PALETTE: { hex: string; name: string }[] = [
  { hex: "#ef4444", name: "Vermelho" },
  { hex: "#f97316", name: "Laranja" },
  { hex: "#f59e0b", name: "Âmbar" },
  { hex: "#eab308", name: "Amarelo" },
  { hex: "#84cc16", name: "Lima" },
  { hex: "#22c55e", name: "Verde" },
  { hex: "#10b981", name: "Esmeralda" },
  { hex: "#14b8a6", name: "Verde-água" },
  { hex: "#06b6d4", name: "Ciano" },
  { hex: "#0ea5e9", name: "Céu" },
  { hex: "#3b82f6", name: "Azul" },
  { hex: "#6366f1", name: "Anil" },
  { hex: "#8b5cf6", name: "Violeta" },
  { hex: "#a855f7", name: "Roxo" },
  { hex: "#d946ef", name: "Fúcsia" },
  { hex: "#ec4899", name: "Rosa" },
  { hex: "#94a3b8", name: "Cinza" },
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
    <div className="space-y-10">
      <PageHeader overline="Taxonomia" title="Categorias" size="md" />

      <CategorySection
        title="Despesas"
        accent="text-[color:var(--expense)]"
        categories={expenses}
        usage={usage}
        onCreate={() => setDialogState({ mode: "create", type: "expense" })}
        onEdit={(c) => setDialogState({ mode: "edit", category: c })}
        onDelete={(c) => setDeleteTarget(c)}
      />

      <CategorySection
        title="Receitas"
        accent="text-[color:var(--income)]"
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
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h2
          className={`font-sans text-xl font-semibold tracking-[-0.2px] ${accent}`}
        >
          {title}
        </h2>
        <Button variant="outline" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>
      {categories.length === 0 ? (
        <p className="border-y border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          Nenhuma categoria.
        </p>
      ) : (
        <ul className="grid gap-x-8 sm:grid-cols-2">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 border-b border-border py-3"
            >
              <span
                className="h-6 w-6 shrink-0 rounded-full"
                style={{ backgroundColor: c.color }}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{c.name}</p>
                <p className="font-mono text-xs text-muted-foreground tabular-nums">
                  {usage[c.id] ?? 0}{" "}
                  {(usage[c.id] ?? 0) === 1 ? "transação" : "transações"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => onEdit(c)}
                  aria-label={`Editar categoria ${c.name}`}
                  className="h-10 w-10 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => onDelete(c)}
                  aria-label={`Excluir categoria ${c.name}`}
                  className="h-10 w-10 p-0"
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

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (formState?.message) onSuccess();
  }, [formState, onSuccess]);

  useEffect(() => {
    if (formState?.error) nameRef.current?.focus();
  }, [formState?.error]);

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
          <Label htmlFor="name">
            Nome <span aria-hidden="true" className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            ref={nameRef}
            required
            aria-required="true"
            maxLength={40}
            defaultValue={editing?.name ?? ""}
            placeholder="Ex: Mercado, Salário..."
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <span id="color-label" className="text-sm font-semibold leading-none">
            Cor
          </span>
          <div
            role="radiogroup"
            aria-labelledby="color-label"
            className="flex flex-wrap gap-2"
          >
            {PALETTE.map((c) => {
              const selected = c.hex === color;
              return (
                <button
                  key={c.hex}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setColor(c.hex)}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:scale-110 motion-reduce:transition-none motion-reduce:hover:scale-100"
                  style={{ backgroundColor: c.hex }}
                  aria-label={c.name}
                >
                  {selected && (
                    <Check className="h-4 w-4 text-white drop-shadow" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="icon">Ícone (opcional)</Label>
          <Input
            id="icon"
            name="icon"
            defaultValue={editing?.icon ?? ""}
            placeholder="Ex: utensils, car, wallet"
            autoComplete="off"
            aria-describedby="icon-hint"
          />
          <p id="icon-hint" className="text-xs text-muted-foreground">
            Nome de um ícone do lucide.dev
          </p>
        </div>

        {formState?.error && (
          <p
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
            {pending ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
