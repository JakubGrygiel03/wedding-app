"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import {
  createScheduleEvent,
  updateScheduleEvent,
  type AdminScheduleRow,
} from "@/app/actions/schedule";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  scheduleEventDefaultValues,
  scheduleEventSchema,
  type ScheduleEventFormValues,
} from "@/lib/validations/schedule";

function eventToFormValues(event: AdminScheduleRow): ScheduleEventFormValues {
  return {
    title: event.title,
    eventTime: event.eventTime,
    description: event.description ?? "",
    orderIndex: event.orderIndex,
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

export function ScheduleEventDialog({
  mode,
  event,
  suggestedOrderIndex,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit";
  event: AdminScheduleRow | null;
  suggestedOrderIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ScheduleEventFormValues>({
    resolver: zodResolver(scheduleEventSchema),
    defaultValues: scheduleEventDefaultValues,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && event) {
      reset(eventToFormValues(event));
      return;
    }

    reset({
      ...scheduleEventDefaultValues,
      orderIndex: suggestedOrderIndex,
    });
  }, [mode, event, open, reset, suggestedOrderIndex]);

  function onSubmit(values: ScheduleEventFormValues) {
    startTransition(async () => {
      const result =
        mode === "edit" && event
          ? await updateScheduleEvent(event.id, values)
          : await createScheduleEvent(values);

      if (!result.success) {
        toast.add({
          title:
            mode === "edit"
              ? "Nie udało się zapisać zmian"
              : "Nie udało się dodać wpisu",
          description: result.error,
          type: "error",
        });
        return;
      }

      toast.add({
        title: mode === "edit" ? "Zapisano zmiany" : "Dodano wpis",
        description: values.title,
        type: "success",
      });

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edytuj wydarzenie" : "Dodaj wydarzenie"}
          </DialogTitle>
          <DialogDescription>
            Godzina, tytuł i opis pojawią się w harmonogramie na stronie
            głównej.
          </DialogDescription>
        </DialogHeader>

        <form
          id="schedule-event-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="schedule-event-time">Godzina</Label>
              <Input
                id="schedule-event-time"
                type="time"
                step={60}
                aria-invalid={Boolean(errors.eventTime)}
                {...register("eventTime")}
              />
              <FieldError message={errors.eventTime?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule-event-order">Kolejność</Label>
              <Input
                id="schedule-event-order"
                type="number"
                min={0}
                step={1}
                aria-invalid={Boolean(errors.orderIndex)}
                {...register("orderIndex", { valueAsNumber: true })}
              />
              <FieldError message={errors.orderIndex?.message} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule-event-title">Tytuł</Label>
            <Input
              id="schedule-event-title"
              aria-invalid={Boolean(errors.title)}
              {...register("title")}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule-event-description">Opis</Label>
            <Textarea
              id="schedule-event-description"
              rows={4}
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            <FieldError message={errors.description?.message} />
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Anuluj
          </Button>
          <Button type="submit" form="schedule-event-form" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Zapisywanie…
              </>
            ) : mode === "edit" ? (
              "Zapisz"
            ) : (
              "Dodaj"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
