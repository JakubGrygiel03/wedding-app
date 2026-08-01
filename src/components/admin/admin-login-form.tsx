"use client";

import { useState, useTransition } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Lock, Loader2 } from "lucide-react";

import { loginAdmin } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await loginAdmin(password);
        setError(result.error ?? "Nie udało się zalogować.");
      } catch (error) {
        if (isRedirectError(error)) throw error;
        setError("Nie udało się zalogować. Spróbuj ponownie.");
      }
    });
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-background px-4 py-16">
      <Card className="w-full max-w-md border-primary/15 bg-card shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="size-6 text-primary" aria-hidden />
          </div>
          <CardTitle className="text-xl text-foreground">Panel Admina</CardTitle>
          <CardDescription>
            Wprowadź hasło, aby przeglądać odpowiedzi RSVP.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="admin-password">Hasło</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-h-11 border-primary/20"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="min-h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  Logowanie...
                </>
              ) : (
                "Zaloguj się"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
