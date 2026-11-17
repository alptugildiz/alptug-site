"use client";

import { useActionState } from "react";
import { USERS } from "@/lib/giderler/categories.ts";
import { login, type FormState } from "./actions";
import { errorText, field, label, primaryButton } from "./ui";

export default function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});

  return (
    <form action={action} className="panel flex w-full max-w-sm flex-col gap-5 p-6">
      <h1 className="hud-label text-lg text-cream">Giderler</h1>
      <div>
        <label htmlFor="user" className={label}>
          Kim
        </label>
        <select id="user" name="user" className={field} defaultValue="alptug">
          {Object.entries(USERS).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="password" className={label}>
          Şifre
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={field} />
      </div>
      {state.error && (
        <p role="alert" className={errorText}>
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Kontrol ediliyor…" : "Giriş"}
      </button>
    </form>
  );
}
