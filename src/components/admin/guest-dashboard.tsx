"use client";

import { useEffect, useMemo, useState, useTransition, type ComponentType } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BedDouble,
  Download,
  LogOut,
  Pencil,
  Plus,
  Salad,
  Trash2,
  Users,
  UserCheck,
} from "lucide-react";

import { logoutAdmin, type AdminGuestRow, type AdminStats } from "@/app/actions/admin";
import { GuestDeleteDialog } from "@/components/admin/guest-delete-dialog";
import { GuestEditDialog } from "@/components/admin/guest-edit-dialog";
import { ExpectedRsvpSetting } from "@/components/admin/expected-rsvp-setting";
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
import {
  computeRsvpProgress,
  parseExpectedCountInput,
} from "@/lib/admin/rsvp-progress";
import {
  GUEST_SORT_LABELS,
  sortGuestRows,
  type GuestSortColumn,
  type SortDirection,
} from "@/lib/admin/sort-guests";
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

function SortableTableHead({
  column,
  label,
  sort,
  onSort,
  className,
}: {
  column: GuestSortColumn;
  label: string;
  sort: { column: GuestSortColumn; direction: SortDirection } | null;
  onSort: (column: GuestSortColumn) => void;
  className?: string;
}) {
  const isActive = sort?.column === column;
  const direction = isActive ? sort.direction : null;
  const SortIcon =
    direction === "asc" ? ArrowUp : direction === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex min-h-10 items-center gap-1.5 rounded-md px-1 py-1 text-left font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          isActive && "text-primary",
        )}
        aria-label={`Sortuj według: ${label}${
          direction === "asc"
            ? ", rosnąco"
            : direction === "desc"
              ? ", malejąco"
              : ""
        }`}
      >
        {label}
        <SortIcon className="size-3.5 shrink-0 opacity-70" aria-hidden />
      </button>
    </TableHead>
  );
}

export function GuestDashboard({
  guests,
  stats,
  expectedRsvpCount,
}: {
  guests: AdminGuestRow[];
  stats: AdminStats;
  expectedRsvpCount: number | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<AdminGuestRow | null>(null);
  const [deletingGuest, setDeletingGuest] = useState<AdminGuestRow | null>(null);
  const [sort, setSort] = useState<{
    column: GuestSortColumn;
    direction: SortDirection;
  } | null>(null);
  const [expectedInput, setExpectedInput] = useState(
    expectedRsvpCount !== null ? String(expectedRsvpCount) : "",
  );
  const dietCounts = getOrderedDietCounts(stats.dietCounts);

  useEffect(() => {
    setExpectedInput(
      expectedRsvpCount !== null ? String(expectedRsvpCount) : "",
    );
  }, [expectedRsvpCount]);

  const effectiveExpectedCount = useMemo(() => {
    const draft = parseExpectedCountInput(expectedInput);
    if (draft !== null) return draft;
    return expectedRsvpCount;
  }, [expectedInput, expectedRsvpCount]);

  const rsvpProgress = useMemo(
    () => computeRsvpProgress(stats, effectiveExpectedCount),
    [stats, effectiveExpectedCount],
  );

  const sortedGuests = useMemo(() => {
    if (!sort) return guests;
    return sortGuestRows(guests, sort.column, sort.direction);
  }, [guests, sort]);

  function handleSort(column: GuestSortColumn) {
    setSort((current) => {
      if (current?.column === column) {
        return {
          column,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }

      return { column, direction: "asc" };
    });
  }

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
            description={
              rsvpProgress.expectedCount !== null
                ? `Odpowiedzi: ${rsvpProgress.respondedCount} / ${rsvpProgress.expectedCount} · Oczekujący: ${rsvpProgress.awaitingResponses}`
                : `Potwierdzeni: ${stats.attendingCount} · Odmowy: ${stats.declinedCount}`
            }
            icon={Users}
          />
          <StatCard
            title="Potwierdzeni"
            value={stats.attendingCount}
            description={
              rsvpProgress.awaitingResponses !== null
                ? `Oczekujący: ${rsvpProgress.awaitingResponses}`
                : `Oczekujący w bazie: ${stats.pendingCount}`
            }
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
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-lg text-foreground">
                Lista odpowiedzi
              </CardTitle>

              <Button
                type="button"
                className="min-h-11 shrink-0"
                onClick={() => setCreateOpen(true)}
              >
                <Plus aria-hidden />
                Dodaj gościa
              </Button>
            </div>
            <CardDescription>
              {guests.length} {guests.length === 1 ? "wpis" : "wpisów"} w bazie
              danych.
              {sort ? (
                <>
                  {" "}
                  · Sortowanie: {GUEST_SORT_LABELS[sort.column]} (
                  {sort.direction === "asc" ? "rosnąco" : "malejąco"})
                </>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-(--card-spacing)">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead
                    column="guestName"
                    label="Imię"
                    sort={sort}
                    onSort={handleSort}
                  />
                  <SortableTableHead
                    column="isAttending"
                    label="Obecność"
                    sort={sort}
                    onSort={handleSort}
                  />
                  <SortableTableHead
                    column="diet"
                    label="Dieta"
                    sort={sort}
                    onSort={handleSort}
                  />
                  <SortableTableHead
                    column="plusOne"
                    label="+1"
                    sort={sort}
                    onSort={handleSort}
                  />
                  <SortableTableHead
                    column="plusOneDiet"
                    label="Dieta +1"
                    sort={sort}
                    onSort={handleSort}
                  />
                  <SortableTableHead
                    column="accommodationNeeded"
                    label="Nocleg"
                    sort={sort}
                    onSort={handleSort}
                  />
                  <SortableTableHead
                    column="message"
                    label="Wiadomość"
                    sort={sort}
                    onSort={handleSort}
                    className="min-w-[12rem]"
                  />
                  <TableHead className="w-[8.5rem] text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedGuests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-foreground/60"
                    >
                      Brak odpowiedzi RSVP.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedGuests.map((guest) => (
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-primary"
                            aria-label={`Edytuj ${guest.guestName}`}
                            onClick={() => setEditingGuest(guest)}
                          >
                            <Pencil aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            aria-label={`Usuń ${guest.guestName}`}
                            onClick={() => setDeletingGuest(guest)}
                          >
                            <Trash2 aria-hidden />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <GuestEditDialog
          mode="create"
          guest={null}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />

        <GuestEditDialog
          mode="edit"
          guest={editingGuest}
          open={editingGuest !== null}
          onOpenChange={(open) => {
            if (!open) setEditingGuest(null);
          }}
        />

        <GuestDeleteDialog
          guest={deletingGuest}
          open={deletingGuest !== null}
          onOpenChange={(open) => {
            if (!open) setDeletingGuest(null);
          }}
        />

        <ExpectedRsvpSetting
          inputValue={expectedInput}
          onInputChange={setExpectedInput}
          progress={rsvpProgress}
          stats={stats}
        />
      </div>
    </div>
  );
}
