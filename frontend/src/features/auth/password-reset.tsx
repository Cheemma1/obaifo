"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "@/i18n/link";
import { useErrorText } from "@/i18n/errors";
import { useI18n } from "@/i18n/provider";
import {
  Button,
  ButtonLink,
  Field,
  Input,
  Notice,
} from "@/shared/ui/primitives";
import { useRequestPasswordReset, useResetPassword } from "./api";

/** Step 1: ask for the email. The answer is the same whether or not an account exists. */
export function ForgotPasswordForm() {
  const { t, locale } = useI18n();
  const errorText = useErrorText();
  const r = t.auth.reset;
  const request = useRequestPasswordReset();
  const [email, setEmail] = useState("");

  if (request.isSuccess) {
    return (
      <div className="space-y-8">
        <Notice tone="success">{r.sent(email)}</Notice>
        <p className="text-muted">{r.sentHint}</p>
        <p>
          <Link href="/login" className="link font-semibold">
            {r.backToSignIn}
          </Link>
        </p>
      </div>
    );
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    request.mutate({ email: email.trim(), locale });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <p className="text-muted">{r.intro}</p>
      <Field label={t.auth.email}>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      {request.isError && (
        <Notice tone="error">{errorText(request.error)}</Notice>
      )}
      <Button
        type="submit"
        arrow
        disabled={request.isPending}
        className="w-full"
      >
        {request.isPending ? r.sending : r.send}
      </Button>
      <p className="text-muted">
        {r.remembered}{" "}
        <Link href="/login" className="link font-semibold text-char">
          {t.auth.login.submit}
        </Link>
      </p>
    </form>
  );
}

/** Step 2: the email link lands here with ?token=… (or ?error=INVALID_TOKEN if it expired). */
export function ResetPasswordForm() {
  const { t } = useI18n();
  const errorText = useErrorText();
  const r = t.auth.reset;
  const params = useSearchParams();
  const token = params.get("token");
  const reset = useResetPassword();
  const [mismatch, setMismatch] = useState(false);

  if (!token || params.get("error")) {
    return (
      <div className="space-y-8">
        <Notice tone="error">{r.badLink}</Notice>
        <ButtonLink href="/forgot-password" arrow>
          {r.requestNew}
        </ButtonLink>
      </div>
    );
  }

  if (reset.isSuccess) {
    return (
      <div className="space-y-8">
        <Notice tone="success">{r.done}</Notice>
        <ButtonLink href="/login" arrow>
          {t.auth.login.submit}
        </ButtonLink>
      </div>
    );
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("password"));
    const same = newPassword === String(form.get("confirm"));
    setMismatch(!same);
    if (same) reset.mutate({ token, newPassword });
  };

  const tokenDead =
    reset.isError && errorText(reset.error) === t.errors.INVALID_TOKEN;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Field label={r.newPassword} hint={t.auth.register.passwordHint}>
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
        />
      </Field>
      <Field label={r.confirm} error={mismatch ? r.mismatch : undefined}>
        <Input
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
        />
      </Field>
      {reset.isError && (
        <Notice tone="error">
          {errorText(reset.error)}{" "}
          {tokenDead && (
            <Link href="/forgot-password" className="link font-semibold">
              {r.requestNew}
            </Link>
          )}
        </Notice>
      )}
      <Button type="submit" arrow disabled={reset.isPending} className="w-full">
        {reset.isPending ? r.saving : r.save}
      </Button>
    </form>
  );
}
