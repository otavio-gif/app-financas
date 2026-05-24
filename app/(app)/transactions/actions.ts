"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TransactionState =
  | { error?: string; message?: string }
  | undefined;

type ParsedInput = {
  type: "income" | "expense";
  amount: number;
  category_id: string | null;
  description: string | null;
  occurred_on: string;
};

function parseFormData(formData: FormData): ParsedInput | { error: string } {
  const type = String(formData.get("type") ?? "");
  const amountStr = String(formData.get("amount") ?? "").replace(",", ".");
  const amount = Number(amountStr);
  const rawCategory = formData.get("category_id");
  const category_id =
    typeof rawCategory === "string" && rawCategory.length > 0
      ? rawCategory
      : null;
  const rawDescription = formData.get("description");
  const description =
    typeof rawDescription === "string" && rawDescription.trim().length > 0
      ? rawDescription.trim()
      : null;
  const occurred_on = String(formData.get("occurred_on") ?? "");

  if (type !== "income" && type !== "expense") {
    return { error: "Tipo inválido." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Informe um valor maior que zero." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(occurred_on)) {
    return { error: "Informe uma data válida." };
  }

  return { type, amount, category_id, description, occurred_on };
}

export async function createTransaction(
  _prev: TransactionState,
  formData: FormData,
): Promise<TransactionState> {
  const parsed = parseFormData(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const { error } = await supabase.from("transactions").insert({
    ...parsed,
    user_id: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/transactions");
  return { message: "Transação criada." };
}

export async function updateTransaction(
  id: string,
  _prev: TransactionState,
  formData: FormData,
): Promise<TransactionState> {
  const parsed = parseFormData(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .update(parsed)
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/transactions");
  return { message: "Transação atualizada." };
}

export async function deleteTransaction(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("transactions").delete().eq("id", id);
  revalidatePath("/transactions");
}
