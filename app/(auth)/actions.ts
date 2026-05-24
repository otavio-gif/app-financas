"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string } | undefined;

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: traduzirErro(error.message) };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }
  if (password.length < 6) {
    return { error: "Senha deve ter ao menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: traduzirErro(error.message) };

  if (!data.session) {
    return {
      message:
        "Cadastro realizado. Verifique seu e-mail para confirmar a conta antes de entrar.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

function traduzirErro(msg: string): string {
  if (/invalid login credentials/i.test(msg)) {
    return "E-mail ou senha inválidos.";
  }
  if (/user already registered|already registered/i.test(msg)) {
    return "Esse e-mail já está cadastrado.";
  }
  if (/email/i.test(msg) && /not.*confirmed/i.test(msg)) {
    return "Confirme seu e-mail antes de entrar.";
  }
  if (/password/i.test(msg) && /6/i.test(msg)) {
    return "Senha deve ter ao menos 6 caracteres.";
  }
  return msg;
}
