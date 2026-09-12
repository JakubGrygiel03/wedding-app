"use client";

import { useState, useTransition } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Loader2 } from "lucide-react";

import { changeAdminPassword } from "@/app/actions/admin-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminPasswordForm({
  submitLabel,
}: {
  submitLabel: string;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await changeAdminPassword({
          currentPassword,
          newPassword,
          confirmPassword,
        });
        setError(result.error ?? "Nie udało się zmienić hasła.");
      } catch (caught) {
        if (isRedirectError(caught)) throw caught;
        setError("Nie udało się zmienić hasła. Spróbuj ponownie.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="admin-current-password">Obecne hasło</Label>
        <Input
          id="admin-current-password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className="min-h-11 border-primary/20"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-new-password">Nowe hasło</Label>
        <Input
          id="admin-new-password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className="min-h-11 border-primary/20"
          required
          minLength={8}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-confirm-password">Potwierdź nowe hasło</Label>
        <Input
          id="admin-confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="min-h-11 border-primary/20"
          required
          minLength={8}
        />
      </div>

      <Button type="submit" disabled={isPending} className="min-h-11 w-full">
        {isPending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Zapisywanie…
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
