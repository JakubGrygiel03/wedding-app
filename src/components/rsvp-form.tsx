"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import confetti from "canvas-confetti";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Heart, Loader2, Phone, Send, UserPlus } from "lucide-react";

import { getGuestByToken, submitRsvp } from "@/app/actions/rsvp";
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
  type DietOption,
  type RsvpFormValues,
} from "@/lib/validations/rsvp";

const RSVP_TOKEN_STORAGE_KEY = "wedding-rsvp-token";

const CONFETTI_COLORS = [
  weddingTheme.primary,
  weddingTheme.accent,
  weddingTheme.surface,
  weddingTheme.background,
] as const;

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

function toDietOption(value: string | null | undefined): DietOption {
  if (value && DIET_OPTIONS.includes(value as DietOption)) {
    return value as DietOption;
  }

  return "Standardowa";
}

export function RsvpForm({ token, defaultValues, className }: RsvpFormProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const fireConfettiRef = useRef<confetti.CreateTypes | null>(null);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [guestToken, setGuestToken] = useState<string | undefined>(token);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className =
      "pointer-events-none absolute inset-0 z-20 h-full w-full";
    section.appendChild(canvas);

    fireConfettiRef.current = confetti.create(canvas, { resize: true });

    return () => {
      fireConfettiRef.current = null;
      canvas.remove();
    };
  }, []);

  const fireConfetti = useCallback(() => {
    fireConfettiRef.current?.({
      particleCount: 100,
      spread: 55,
      startVelocity: 32,
      origin: { x: 0.5, y: 0.58 },
      gravity: 1.05,
      ticks: 180,
      colors: [...CONFETTI_COLORS],
    });
  }, []);

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
      form.setValue("availableCarSeats", 0);
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

  useEffect(() => {
    const storedToken =
      token ?? localStorage.getItem(RSVP_TOKEN_STORAGE_KEY) ?? undefined;

    if (!storedToken) return;

    setGuestToken(storedToken);

    void getGuestByToken(storedToken).then((guest) => {
      if (!guest) return;

      reset({
        guestName: guest.guestName,
        isAttending: guest.isAttending ?? true,
        plusOne: guest.plusOne,
        plusOneDiet: guest.plusOneDiet
          ? toDietOption(guest.plusOneDiet)
          : undefined,
        diet: toDietOption(guest.diet),
        availableCarSeats: guest.availableCarSeats,
        message: guest.message ?? "",
      });
      setSubmitted(true);
    });
  }, [token, reset]);

  const startNewRsvp = useCallback(() => {
    localStorage.removeItem(RSVP_TOKEN_STORAGE_KEY);
    setGuestToken(undefined);
    setSubmitError(null);
    setSubmitted(false);
    reset(rsvpDefaultValues);
  }, [reset]);

  const onSubmit = handleSubmit(
    (values) => {
      setSubmitError(null);

      startTransition(async () => {
        try {
          const result = await submitRsvp(values, guestToken ?? token);

          if (!result.success) {
            setSubmitError(result.error);
            toast.add({
              title: "Nie udało się wysłać formularza",
              description: result.error,
              type: "error",
            });
            return;
          }

          setGuestToken(result.token);
          localStorage.setItem(RSVP_TOKEN_STORAGE_KEY, result.token);
          setSubmitted(true);

          if (values.isAttending && !guestToken) {
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
      ref={sectionRef}
      id="rsvp"
      className={cn(
        "relative scroll-mt-20 overflow-hidden bg-secondary px-4 py-16 sm:px-6 sm:py-24",
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
            Uczestnictwo
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
              Formularz Uczestnictwa
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
                Wasza odpowiedź została zapisana. Na tym urządzeniu możecie
                wrócić i zaktualizować ją w każdej chwili.
              </p>
              <RsvpContactLinks
                intro="W razie pytań lub zmiany planów, możesz się z nami skontaktować:"
                className="mx-auto mt-8 max-w-md"
              />
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full border-primary/25 text-primary sm:w-auto"
                  onClick={() => setSubmitted(false)}
                >
                  Edytuj odpowiedź
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11 w-full text-primary hover:bg-primary/5 sm:w-auto"
                  onClick={startNewRsvp}
                >
                  <UserPlus aria-hidden />
                  Potwierdź inną osobę
                </Button>
              </div>
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

                    {/* STREAMING_CHUNK: rsvp-field-car-seats */}
                    <div className="space-y-2">
                      <Label htmlFor="availableCarSeats">
                        Ile miejsc wolnych masz w samochodzie, aby kogoś zabrać
                        z kościoła na salę weselną? *
                      </Label>
                      <Input
                        id="availableCarSeats"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={9}
                        aria-invalid={!!errors.availableCarSeats}
                        className="min-h-11 border-primary/20 focus-visible:border-primary"
                        {...register("availableCarSeats", {
                          valueAsNumber: true,
                        })}
                      />
                      <p className="text-sm text-foreground/60">
                        Wpisz 0, jeśli nie jedziesz autem albo nie masz wolnego
                        miejsca.
                      </p>
                      <FieldError message={errors.availableCarSeats?.message} />
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

              <CardFooter className="flex flex-col gap-3 border-t border-primary/10 bg-background/50 sm:flex-row sm:items-center sm:justify-between">
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
                      Wyślij formularz
                    </>
                  )}
                </Button>
                {guestToken ? (
                  <button
                    type="button"
                    onClick={startNewRsvp}
                    className="text-sm text-foreground/60 underline-offset-4 hover:text-primary hover:underline"
                  >
                    Wypełniasz formularz dla kogoś innego?
                  </button>
                ) : null}
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </section>
  );
}

export default RsvpForm;
