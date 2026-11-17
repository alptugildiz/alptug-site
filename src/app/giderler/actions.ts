"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { attemptLogin } from "@/lib/giderler/auth.ts";
import { isCategory, isUser } from "@/lib/giderler/categories.ts";
import { parseAmount } from "@/lib/giderler/money.ts";
import {
  configuredPasswords,
  endSession,
  getUser,
  loginLimiter,
  sessionSecret,
  startSession,
} from "@/lib/giderler/session.ts";
import { getStore, type ExpenseInput } from "@/lib/giderler/store.ts";

/** `values` echoes the submission on error so the form can refill what React's reset cleared. */
export type FormState = { error?: string; ok?: number; values?: Record<string, string> };

const NOT_YOURS = "Bu kaydı düzenleyemezsin.";

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!sessionSecret()) return { error: "Sunucu yapılandırılmamış." };

  const user = formData.get("user");
  const result = attemptLogin(user, String(formData.get("password") ?? ""), configuredPasswords(), loginLimiter);

  if (result === "limited") return { error: "Çok fazla deneme. 15 dakika sonra tekrar dene." };
  if (result === "invalid" || !isUser(user)) return { error: "Kullanıcı adı veya şifre hatalı." };

  await startSession(user);
  redirect("/giderler");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/giderler");
}

function isValidDate(x: unknown): x is string {
  if (typeof x !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return false;
  const d = new Date(`${x}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(x);
}

export async function saveExpense(prev: FormState, formData: FormData): Promise<FormState> {
  const values = Object.fromEntries(
    ["date", "amount", "category", "note"].map((k) => [k, String(formData.get(k) ?? "")]),
  );
  const fail = (error: string): FormState => ({ ...prev, error, values });

  const user = await getUser();
  if (!user) return fail("Oturum süresi doldu.");

  const amount = parseAmount(values.amount);
  if (amount === null) return fail("Tutar geçersiz. Örnek: 89,90");
  const category = values.category;
  if (!isCategory(category)) return fail("Kategori seç.");
  const date = values.date;
  if (!isValidDate(date)) return fail("Tarih geçersiz.");

  const input: ExpenseInput = { date, amount, category, note: values.note };
  const id = formData.get("id");
  const store = getStore();
  if (typeof id === "string" && id) {
    if (!(await store.update(user, id, input))) return fail(NOT_YOURS);
  } else {
    await store.add(user, input);
  }

  revalidatePath("/giderler");
  return { ok: (prev.ok ?? 0) + 1 };
}

export async function deleteExpense(prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Oturum süresi doldu." };

  if (!(await getStore().remove(user, String(formData.get("id") ?? "")))) return { error: NOT_YOURS };

  revalidatePath("/giderler");
  return { ok: (prev.ok ?? 0) + 1 };
}
