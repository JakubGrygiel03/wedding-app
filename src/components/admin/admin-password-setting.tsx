import { KeyRound } from "lucide-react";

import { AdminPasswordForm } from "@/components/admin/admin-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AdminPasswordSetting() {
  return (
    <Card className="border-primary/15 bg-card shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound className="size-5 text-primary" aria-hidden />
          <CardTitle className="text-lg text-foreground">Hasło panelu</CardTitle>
        </div>
        <CardDescription>
          Zmień hasło dostępu do panelu admina. Dotychczasowe hasło startowe
          nadal działa jako zapasowe, gdyby nowe umknęło.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <AdminPasswordForm submitLabel="Zapisz nowe hasło" />
      </CardContent>
    </Card>
  );
}
