"use client";

import { useEffect, useState, useTransition } from "react";
import confetti from "canvas-confetti";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Heart, Loader2, Phone, Send } from "lucide-react";

import { submitRsvp } from "@/app/actions/rsvp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { weddingTheme } from "@/lib/wedding-theme";
import { formatRsvpDeadlineMessage, RSVP_CONTACT_OPTIONS } from "@/lib/wedding-config";
import {
  DIET_OPTIONS,
  rsvpDefaultValues,
  rsvpSchema,
  type RsvpFormValues,
} from "@/lib/validations/rsvp";


function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 72,
    origin: { y: 0.7 },
    colors: [
      weddingTheme.primary,
      weddingTheme.accent,
      weddingTheme.surface,
      weddingTheme.background,
    ],
  });
}

export interface RsvpFormProps {
  token?: string;
  defaultValues?: Partial<RsvpFormValues>;
  className?: string;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

function BooleanChoice({
  value,
  onChange,
  trueLabel,
  falseLabel,
  name,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  trueLabel: string;
  falseLabel: string;
  name: string;
}) {
  return (
    <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={name}>
      {[true, false].map((option) => {
        const isSelected = value === option;
        const label = option ? trueLabel : falseLabel;

        return (
          <button
            key={String(option)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option)}
            className={cn(
              "min-h-11 flex-1 rounded-full border px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wedding-accent/60 sm:flex-none sm:min-w-[7rem]",
              isSelected
                ? "border-primary bg-primary text-white shadow-sm"
                : "border-primary/20 bg-card text-primary hover:border-primary/40",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function DietSelect({
  id,
  error,
  ...props
}: React.ComponentProps<"select"> & { error?: boolean }) {
  return (
    <select
      id={id}
      aria-invalid={error}
      className="flex min-h-11 w-full rounded-lg border border-primary/20 bg-card px-3 py-2 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
      {...props}
    >
      {DIET_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function RsvpContactLinks({
  intro,
  className,
}: {
  intro?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3 text-left", className)}>
      {intro ? (
        <p className="text-sm leading-relaxed text-foreground/65">{intro}</p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {RSVP_CONTACT_OPTIONS.map((contact) => (
          <a
            key={contact.phone}
            href={`tel:${contact.phone}`}
            className="flex min-h-11 items-center gap-3 rounded-xl border border-primary/20 bg-card px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wedding-accent/60"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/5 text-primary">
              <Phone className="size-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-medium uppercase tracking-wide text-foreground/55">
                {contact.label}
              </span>
              <span className="block text-base font-medium text-foreground">
                {contact.phoneDisplay}
              </span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function RsvpForm({ token, defaultValues, className }: RsvpFormProps) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      ...rsvpDefaultValues,
      ...defaultValues,
      isAttending: defaultValues?.isAttending ?? rsvpDefaultValues.isAttending,
    },
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

  useEffect(() => {
    if (!isAttending) {
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

  const onSubmit = handleSubmit(
    (values) => {
      setSubmitError(null);

      startTransition(async () => {
        try {
          const result = await submitRsvp(values, token);

          if (!result.success) {
            setSubmitError(result.error);
            toast.add({
              title: "Nie udało się wysłać RSVP",
              description: result.error,
              type: "error",
            });
            return;
          }

          setSubmitted(true);

          if (values.isAttending) {
            fireConfetti();
          }

          toast.add({
            title: values.isAttending ? "Dziękujemy!" : "Odpowiedź zapisana",
            description: values.isAttending
              ? "Cieszymy się, że będziecie z nami!"
              : "Szkoda, że nie możecie być — dziękujemy za informację.",
            type: "success",
          });

          reset({
            ...values,
          });
        } catch {
          const networkError =
            "Nie udało się połączyć z serwerem. Sprawdź połączenie z internetem i spróbuj ponownie.";

          setSubmitError(networkError);
          toast.add({
            title: "Błąd połączenia",
            description: networkError,
            type: "error",
          });
        }
      });
    },
    () => {
      toast.add({
        title: "Uzupełnij wymagane pola",
        description: "Sprawdź zaznaczone pola formularza i spróbuj ponownie.",
        type: "error",
      });
    },
  );

  return (
    <section
      id="rsvp"
      className={cn(
        "scroll-mt-20 bg-secondary px-4 py-16 sm:px-6 sm:py-24",
        className,
      )}
      aria-labelledby="rsvp-heading"
    >
      <div className="mx-auto max-w-2xl">
        {/* STREAMING_CHUNK: rsvp-header */}
        <header className="mb-10 text-center">
          <Badge
            variant="outline"
            className="mb-4 border-wedding-accent/40 bg-card text-primary"
          >
            <Heart className="size-3" aria-hidden />
            RSVP
          </Badge>
          <h2
            id="rsvp-heading"
            className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Potwierdź obecność
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-foreground/65">
            {formatRsvpDeadlineMessage()}
          </p>

          <div
            className="mx-auto my-5 h-px w-20 bg-linear-to-r from-transparent via-primary/25 to-transparent"
            aria-hidden
          />

          <p className="mx-auto max-w-lg text-base leading-relaxed text-foreground/70">
            Możesz potwierdzić swoją obecność wypełniając poniższy formularz lub
            kontaktując się z nami bezpośrednio telefonicznie.
          </p>

          <RsvpContactLinks className="mx-auto mt-6 max-w-lg" />
        </header>

        {/* STREAMING_CHUNK: rsvp-form-card */}
        <Card className="border-primary/15 bg-card shadow-sm">
          <CardHeader className="border-b border-primary/10">
            <CardTitle className="text-xl text-foreground">
              Formularz RSVP
            </CardTitle>
            <CardDescription>
              Pola oznaczone * są wymagane. Wszystkie dane traktujemy
              poufnie.
            </CardDescription>
          </CardHeader>

          {submitted ? (
            <CardContent className="py-10 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-wedding-accent/15">
                <Heart className="size-7 text-primary" aria-hidden />
              </div>
              <p className="text-lg font-medium text-foreground">
                Dziękujemy za odpowiedź!
              </p>
              <p className="mt-2 text-sm text-foreground/65">
                Wasze RSVP zostało zapisane. Możecie wrócić i zaktualizować je w
                każdej chwili.
              </p>
              <RsvpContactLinks
                intro="W razie pytań lub zmiany planów, możesz się z nami skontaktować:"
                className="mx-auto mt-8 max-w-md"
              />
              <Button
                type="button"
                variant="outline"
                className="mt-6 min-h-11 border-primary/25 text-primary"
                onClick={() => setSubmitted(false)}
              >
                Edytuj odpowiedź
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={onSubmit}>
              <CardContent className="space-y-6 pt-2">
                {submitError && (
                  <div
                    className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                    role="alert"
                  >
                    {submitError}
                  </div>
                )}

                {/* STREAMING_CHUNK: rsvp-field-name */}
                <div className="space-y-2">
                  <Label htmlFor="guestName">Imię i Nazwisko *</Label>
                  <Input
                    id="guestName"
                    placeholder="np. Anna Kowalska"
                    aria-invalid={!!errors.guestName}
                    className="min-h-11 border-primary/20 focus-visible:border-primary"
                    {...register("guestName")}
                  />
                  <FieldError message={errors.guestName?.message} />
                </div>

                {/* STREAMING_CHUNK: rsvp-field-attendance */}
                <div className="space-y-3">
                  <Label>Potwierdzenie obecności *</Label>
                  <Controller
                    name="isAttending"
                    control={control}
                    render={({ field }) => (
                      <BooleanChoice
                        name="Potwierdzenie obecności"
                        value={field.value}
                        onChange={field.onChange}
                        trueLabel="Tak, będę"
                        falseLabel="Nie, nie dam rady"
                      />
                    )}
                  />
                  <FieldError message={errors.isAttending?.message} />
                </div>

                {isAttending && (
                  <>
                    {/* STREAMING_CHUNK: rsvp-field-plus-one */}
                    <div className="space-y-4 rounded-xl border border-primary/10 bg-background/80 p-4">
                      <div className="flex items-start gap-3">
                        <Controller
                          name="plusOne"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              aria-label="Osoba towarzysząca"
                              className="mt-0.5"
                            />
                          )}
                        />
                        <div className="space-y-1">
                          <Label>Osoba towarzysząca (+1)</Label>
                          <p className="text-sm text-foreground/60">
                            Zaznacz, jeśli przyjdziesz z osobą towarzyszącą.
                          </p>
                        </div>
                      </div>

                      {plusOne && (
                        <div className="space-y-2 pl-7">
                          <Label htmlFor="plusOneDiet">
                            Dieta osoby towarzyszącej *
                          </Label>
                          <DietSelect
                            id="plusOneDiet"
                            error={!!errors.plusOneDiet}
                            {...register("plusOneDiet")}
                          />
                          <FieldError message={errors.plusOneDiet?.message} />
                        </div>
                      )}
                    </div>

                    {/* STREAMING_CHUNK: rsvp-field-diet */}
                    <div className="space-y-3">
                      <Label htmlFor="diet">Preferencje dietetyczne *</Label>
                      <DietSelect
                        id="diet"
                        error={!!errors.diet}
                        {...register("diet")}
                      />
                      <FieldError message={errors.diet?.message} />
                    </div>

                    {/* STREAMING_CHUNK: rsvp-field-accommodation */}
                    <div className="space-y-3">
                      <Label>Potrzeba noclegu *</Label>
                      <Controller
                        name="accommodationNeeded"
                        control={control}
                        render={({ field }) => (
                          <BooleanChoice
                            name="Potrzeba noclegu"
                            value={field.value}
                            onChange={field.onChange}
                            trueLabel="Tak"
                            falseLabel="Nie"
                          />
                        )}
                      />
                    </div>
                  </>
                )}

                {/* STREAMING_CHUNK: rsvp-field-message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Wiadomość dla Pary Młodej</Label>
                  <Textarea
                    id="message"
                    placeholder="Napiszcie nam coś miłego lub zadajcie pytanie..."
                    rows={4}
                    aria-invalid={!!errors.message}
                    className="min-h-28 border-primary/20"
                    {...register("message")}
                  />
                  <FieldError message={errors.message?.message} />
                </div>
              </CardContent>

              <CardFooter className="border-t border-primary/10 bg-background/50">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="min-h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden />
                      Wysyłanie...
                    </>
                  ) : (
                    <>
                      <Send aria-hidden />
                      Wyślij RSVP
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </section>
  );
}

export default RsvpForm;
