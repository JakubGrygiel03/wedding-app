"use client";

import { useTransition, type ComponentType } from "react";
import {
  BedDouble,
  Download,
  LogOut,
  Salad,
  Users,
  UserCheck,
} from "lucide-react";

import { logoutAdmin, type AdminGuestRow, type AdminStats } from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrderedDietCounts } from "@/lib/admin/export-guests";
import { cn } from "@/lib/utils";

function formatBoolean(value: boolean): string {
  return value ? "Tak" : "Nie";
}

function AttendanceBadge({ value }: { value: boolean | null }) {
  if (value === true) {
    return (
      <Badge className="border-transparent bg-primary text-primary-foreground">
        Tak
      </Badge>
    );
  }

  if (value === false) {
    return (
      <Badge variant="outline" className="border-primary/25 text-primary">
        Nie
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-wedding-accent/15 text-foreground">
      Oczekuje
    </Badge>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-primary/15 bg-card shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardDescription>{title}</CardDescription>
          <div className="rounded-full bg-primary/10 p-2">
            <Icon className="size-4 text-primary" aria-hidden />
          </div>
        </div>
        <CardTitle className="text-3xl font-semibold text-foreground">
          {value}
        </CardTitle>
      </CardHeader>
      {description ? (
        <CardContent className="pt-0 text-sm text-foreground/60">
          {description}
        </CardContent>
      ) : null}
    </Card>
  );
}

export function GuestDashboard({
  guests,
  stats,
}: {
  guests: AdminGuestRow[];
  stats: AdminStats;
}) {
  const [isPending, startTransition] = useTransition();
  const dietCounts = getOrderedDietCounts(stats.dietCounts);

  function handleLogout() {
    startTransition(async () => {
      await logoutAdmin();
    });
  }

  return (
    <div
      className="min-h-full flex-1 bg-background px-4 py-8 sm:px-6 sm:py-10"
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className="text-sm font-medium uppercase tracking-[0.2em] text-wedding-accent"
            >
              Admin
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Odpowiedzi RSVP
            </h1>
            <p className="mt-2 text-sm text-foreground/65">
              Podsumowanie gości, preferencji dietetycznych i noclegów.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/api/export-guests"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "min-h-11 border-primary/25 text-primary",
              )}
            >
              <Download aria-hidden />
              Pobierz plik CSV / Excel
            </a>

            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={handleLogout}
              className="min-h-11 text-primary"
            >
              <LogOut aria-hidden />
              Wyloguj
            </Button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Łącznie gości"
            value={stats.totalGuests}
            description={`Potwierdzeni: ${stats.attendingCount} · Odmowy: ${stats.declinedCount}`}
            icon={Users}
          />
          <StatCard
            title="Potwierdzeni"
            value={stats.attendingCount}
            description={`Oczekujący: ${stats.pendingCount}`}
            icon={UserCheck}
          />
          <StatCard
            title="Osoby towarzyszące (+1)"
            value={stats.plusOneCount}
            icon={Users}
          />
          <StatCard
            title="Noclegi"
            value={stats.accommodationCount}
            icon={BedDouble}
          />
        </section>

        <Card className="border-primary/15 bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Salad className="size-5 text-primary" aria-hidden />
              <CardTitle className="text-lg text-foreground">
                Liczba diet wg rodzajów
              </CardTitle>
            </div>
            <CardDescription>
              Preferencje dietetyczne potwierdzonych gości.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dietCounts.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {dietCounts.map(({ label, count }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-primary/15 bg-background px-4 py-3"
                  >
                    <p className="text-sm text-foreground/65">{label}</p>
                    <p className="text-2xl font-semibold text-primary">
                      {count}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground/60">
                Brak zapisanych preferencji dietetycznych.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/15 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Lista odpowiedzi
            </CardTitle>
            <CardDescription>
              {guests.length} {guests.length === 1 ? "wpis" : "wpisów"} w bazie
              danych.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-(--card-spacing)">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imię</TableHead>
                  <TableHead>Obecność</TableHead>
                  <TableHead>Dieta</TableHead>
                  <TableHead>+1</TableHead>
                  <TableHead>Dieta +1</TableHead>
                  <TableHead>Nocleg</TableHead>
                  <TableHead className="min-w-[12rem]">Wiadomość</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-foreground/60"
                    >
                      Brak odpowiedzi RSVP.
                    </TableCell>
                  </TableRow>
                ) : (
                  guests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium text-foreground">
                        {guest.guestName}
                      </TableCell>
                      <TableCell>
                        <AttendanceBadge value={guest.isAttending} />
                      </TableCell>
                      <TableCell>{guest.diet ?? "—"}</TableCell>
                      <TableCell>{formatBoolean(guest.plusOne)}</TableCell>
                      <TableCell>{guest.plusOneDiet ?? "—"}</TableCell>
                      <TableCell>{formatBoolean(guest.accommodationNeeded)}</TableCell>
                      <TableCell className="max-w-xs whitespace-normal text-foreground/75">
                        {guest.message ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
