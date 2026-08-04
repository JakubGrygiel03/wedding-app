"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import {
  createAdminGuest,
  updateAdminGuest,
  type AdminGuestRow,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cn } from "@/lib/utils";
import {
  adminGuestDefaultValues,
  adminGuestSchema,
  type AdminGuestFormValues,
} from "@/lib/validations/admin-guest";
import {
  DIET_OPTIONS,
  type DietOption,
} from "@/lib/validations/rsvp";

function toDietOption(value: string | null | undefined): DietOption {
  if (value && DIET_OPTIONS.includes(value as DietOption)) {
    return value as DietOption;
  }

  return "Standardowa";
}

function guestToFormValues(guest: AdminGuestRow): AdminGuestFormValues {
  return {
    guestName: guest.guestName,
    isAttending: guest.isAttending,
    plusOne: guest.plusOne,
    plusOneDiet: guest.plusOneDiet
      ? toDietOption(guest.plusOneDiet)
      : undefined,
    diet: guest.diet ? toDietOption(guest.diet) : "Standardowa",
    accommodationNeeded: guest.accommodationNeeded,
    message: guest.message ?? "",
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

function AttendanceChoice({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (value: boolean | null) => void;
}) {
  const options: { value: boolean | null; label: string }[] = [
    { value: true, label: "Tak" },
    { value: false, label: "Nie" },
    { value: null, label: "Oczekuje" },
  ];

  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Obecność">
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-10 rounded-full border px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-primary/20 bg-background text-foreground hover:border-primary/40",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function GuestEditDialog({
  mode = "edit",
  guest,
  open,
  onOpenChange,
}: {
  mode?: "create" | "edit";
  guest: AdminGuestRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formId = mode === "create" ? "guest-create-form" : "guest-edit-form";

  const form = useForm<AdminGuestFormValues>({
    resolver: zodResolver(adminGuestSchema),
    defaultValues: adminGuestDefaultValues,
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = form;

  const isAttending = watch("isAttending");
  const plusOne = watch("plusOne");
  const showGuestFields = isAttending === true;

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && guest) {
      reset(guestToFormValues(guest));
      return;
    }

    if (mode === "create") {
      reset(adminGuestDefaultValues);
    }
  }, [mode, guest, open, reset]);

  useEffect(() => {
    if (isAttending !== true) {
      form.setValue("plusOne", false);
      form.setValue("plusOneDiet", undefined);
      form.setValue("accommodationNeeded", false);
    }
  }, [isAttending, form]);

  useEffect(() => {
    if (!plusOne) {
      form.setValue("plusOneDiet", undefined);
      return;
    }

    if (!form.getValues("plusOneDiet")) {
      form.setValue("plusOneDiet", "Standardowa");
    }
  }, [plusOne, form]);

  function onSubmit(values: AdminGuestFormValues) {
    startTransition(async () => {
      if (mode === "create") {
        const result = await createAdminGuest(values);

        if (!result.success) {
          toast.add({
            title: "Nie udało się dodać gościa",
            description: result.error,
            type: "error",
          });
          return;
        }

        toast.add({
          title: "Gość dodany",
          description: `${values.guestName} · token: ${result.token}`,
          type: "success",
        });

        onOpenChange(false);
        router.refresh();
        return;
      }

      if (!guest) {
        toast.add({
          title: "Nie udało się zapisać zmian",
          description: "Brak gościa do edycji.",
          type: "error",
        });
        return;
      }

      const result = await updateAdminGuest(guest.id, values);

      if (!result.success) {
        toast.add({
          title: "Nie udało się zapisać zmian",
          description: result.error,
          type: "error",
        });
        return;
      }

      toast.add({
        title: "Zapisano zmiany",
        description: `Zaktualizowano wpis: ${values.guestName}`,
        type: "success",
      });

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Dodaj gościa" : "Edytuj gościa"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Dodaj wpis ręcznie, gdy ktoś nie mógł wypełnić formularza RSVP."
              : "Zmiany zostaną zapisane w bazie RSVP."}
          </DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor={`${formId}-name`}>Imię i nazwisko</Label>
            <Input
              id={`${formId}-name`}
              autoComplete="name"
              aria-invalid={Boolean(errors.guestName)}
              {...register("guestName")}
            />
            <FieldError message={errors.guestName?.message} />
          </div>

          <div className="space-y-2">
            <Label>Obecność</Label>
            <Controller
              control={control}
              name="isAttending"
              render={({ field }) => (
                <AttendanceChoice
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <FieldError message={errors.isAttending?.message} />
          </div>

          {showGuestFields ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="guest-edit-diet">Dieta</Label>
                <select
                  id="guest-edit-diet"
                  aria-invalid={Boolean(errors.diet)}
                  className="flex min-h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...register("diet")}
                >
                  {DIET_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.diet?.message} />
              </div>

              <div className="flex items-center gap-3">
                <Controller
                  control={control}
                  name="plusOne"
                  render={({ field }) => (
                    <Checkbox
                      id="guest-edit-plus-one"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  )}
                />
                <Label htmlFor="guest-edit-plus-one">Osoba towarzysząca (+1)</Label>
              </div>

              {plusOne ? (
                <div className="space-y-2">
                  <Label htmlFor="guest-edit-plus-one-diet">Dieta +1</Label>
                  <select
                    id="guest-edit-plus-one-diet"
                    aria-invalid={Boolean(errors.plusOneDiet)}
                    className="flex min-h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...register("plusOneDiet")}
                  >
                    {DIET_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.plusOneDiet?.message} />
                </div>
              ) : null}

              <div className="flex items-center gap-3">
                <Controller
                  control={control}
                  name="accommodationNeeded"
                  render={({ field }) => (
                    <Checkbox
                      id="guest-edit-accommodation"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  )}
                />
                <Label htmlFor="guest-edit-accommodation">Potrzebny nocleg</Label>
              </div>
            </>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="guest-edit-message">Wiadomość</Label>
            <Textarea
              id="guest-edit-message"
              rows={3}
              aria-invalid={Boolean(errors.message)}
              {...register("message")}
            />
            <FieldError message={errors.message?.message} />
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
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Zapisywanie…
              </>
            ) : mode === "create" ? (
              "Dodaj"
            ) : (
              "Zapisz"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
