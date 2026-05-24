"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CategoryState =
  | { error?: string; message?: string }
  | undefined;

type ParsedInput = {
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string | null;
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function parseFormData(formData: FormData): ParsedInput | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const color = String(formData.get("color") ?? "").trim();
  const rawIcon = String(formData.get("icon") ?? "").trim();
  const icon = rawIcon.length > 0 ? rawIcon : null;

  if (!name) return { error: "Informe um nome." };
  if (name.length > 40) return { error: "Nome muito longo (máx. 40)." };
  if (type !== "income" && type !== "expense") {
    return { error: "Tipo inválido." };
  }
  if (!HEX_COLOR.test(color)) return { error: "Cor inválida." };

  return { name, type, color, icon };
}

export async function createCategory(
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  const parsed = parseFormData(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const { error } = await supabase.from("categories").insert({
    ...parsed,
    user_id: user.id,
  });
  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe categoria com esse nome." };
    }
    return { error: error.message };
  }

  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { message: "Categoria criada." };
}

export async function updateCategory(
  id: string,
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  const parsed = parseFormData(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const { error } = await supabase
    .from("categories")
    .update(parsed)
    .eq("id", id);
  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe categoria com esse nome." };
    }
    return { error: error.message };
  }

  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { message: "Categoria atualizada." };
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}
