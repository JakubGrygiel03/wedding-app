"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Pencil, Plus, Trash2 } from "lucide-react";

import type { AdminScheduleRow } from "@/app/actions/schedule";
import { ScheduleDeleteDialog } from "@/components/admin/schedule-delete-dialog";
import { ScheduleEventDialog } from "@/components/admin/schedule-event-dialog";
import { Button } from "@/components/ui/button";
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

function sortEvents(events: AdminScheduleRow[]): AdminScheduleRow[] {
  return [...events].sort((a, b) => {
    const orderDiff = a.orderIndex - b.orderIndex;
    if (orderDiff !== 0) return orderDiff;

    const [aH, aM] = a.eventTime.split(":").map(Number);
    const [bH, bM] = b.eventTime.split(":").map(Number);
    return aH * 60 + aM - (bH * 60 + bM);
  });
}

export function AdminScheduleManager({
  events,
}: {
  events: AdminScheduleRow[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminScheduleRow | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<AdminScheduleRow | null>(
    null,
  );

  const sortedEvents = useMemo(() => sortEvents(events), [events]);

  const suggestedOrderIndex = useMemo(() => {
    if (sortedEvents.length === 0) return 0;
    return Math.max(...sortedEvents.map((event) => event.orderIndex)) + 1;
  }, [sortedEvents]);

  return (
    <>
      <Card className="border-primary/15 bg-card shadow-sm">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarClock className="size-5 text-primary" aria-hidden />
              <CardTitle className="text-lg text-foreground">
                Harmonogram wydarzeń
              </CardTitle>
            </div>
            <CardDescription className="mt-1.5">
              {sortedEvents.length}{" "}
              {sortedEvents.length === 1 ? "wpis" : "wpisów"} · sortowanie wg
              kolejności i godziny
            </CardDescription>
          </div>

          <Button
            type="button"
            className="min-h-11"
            onClick={() => setCreateOpen(true)}
          >
            <Plus aria-hidden />
            Dodaj wpis
          </Button>
        </CardHeader>

        <CardContent className="px-0 sm:px-(--card-spacing)">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Kol.</TableHead>
                <TableHead className="w-24">Godzina</TableHead>
                <TableHead className="min-w-[10rem]">Tytuł</TableHead>
                <TableHead className="min-w-[16rem]">Opis</TableHead>
                <TableHead className="w-[8.5rem] text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEvents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-foreground/60"
                  >
                    Brak wpisów w harmonogramie. Dodaj pierwsze wydarzenie.
                  </TableCell>
                </TableRow>
              ) : (
                sortedEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-foreground/70">
                      {event.orderIndex}
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      {event.eventTime}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {event.title}
                    </TableCell>
                    <TableCell className="max-w-md whitespace-normal text-foreground/75">
                      {event.description ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-primary"
                          aria-label={`Edytuj ${event.title}`}
                          onClick={() => setEditingEvent(event)}
                        >
                          <Pencil aria-hidden />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          aria-label={`Usuń ${event.title}`}
                          onClick={() => setDeletingEvent(event)}
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

      <ScheduleEventDialog
        mode="create"
        event={null}
        suggestedOrderIndex={suggestedOrderIndex}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <ScheduleEventDialog
        mode="edit"
        event={editingEvent}
        suggestedOrderIndex={suggestedOrderIndex}
        open={editingEvent !== null}
        onOpenChange={(open) => {
          if (!open) setEditingEvent(null);
        }}
      />

      <ScheduleDeleteDialog
        event={deletingEvent}
        open={deletingEvent !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingEvent(null);
        }}
      />
    </>
  );
}
