"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";

import { setExpectedRsvpCount, type AdminStats } from "@/app/actions/admin";
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
import { toast } from "@/components/ui/toast";
import type { RsvpProgress } from "@/lib/admin/rsvp-progress";
import { cn } from "@/lib/utils";

export function ExpectedRsvpSetting({
  inputValue,
  onInputChange,
  progress,
  stats,
}: {
  inputValue: string;
  onInputChange: (value: string) => void;
  progress: RsvpProgress;
  stats: AdminStats;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    const trimmed = inputValue.trim();

    startTransition(async () => {
      const result = await setExpectedRsvpCount(
        trimmed === "" ? null : Number.parseInt(trimmed, 10),
      );

      if (!result.success) {
        toast.add({
          title: "Nie udało się zapisać",
          description: result.error,
          type: "error",
        });
        return;
      }

      toast.add({
        title: trimmed === "" ? "Usunięto limit zaproszeń" : "Zapisano limit zaproszeń",
        description:
          trimmed === ""
            ? "Możesz ustawić oczekiwaną liczbę ponownie w dowolnym momencie."
            : `Oczekujesz ${trimmed} odpowiedzi RSVP.`,
        type: "success",
      });

      router.refresh();
    });
  }

  return (
    <Card className="border-primary/15 bg-card shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MailCheck className="size-5 text-primary" aria-hidden />
          <CardTitle className="text-lg text-foreground">
            Oczekiwane odpowiedzi RSVP
          </CardTitle>
        </div>
        <CardDescription>
          Ile zaproszeń wysłaliście — statystyki u góry aktualizują się od razu
          po wpisaniu liczby.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="expected-rsvp-count">Liczba zaproszeń</Label>
            <Input
              id="expected-rsvp-count"
              type="number"
              min={1}
              max={9999}
              inputMode="numeric"
              placeholder="np. 80"
              value={inputValue}
              onChange={(event) => onInputChange(event.target.value)}
            />
          </div>

          <Button
            type="button"
            className="min-h-11 sm:min-w-[8rem]"
            disabled={isPending}
            onClick={handleSave}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Zapisywanie…
              </>
            ) : (
              "Zapisz"
            )}
          </Button>
        </div>

        {progress.expectedCount !== null ? (
          <div className="space-y-3 rounded-xl border border-primary/15 bg-background p-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <p className="text-3xl font-semibold text-foreground">
                {progress.respondedCount}
                <span className="text-lg font-medium text-foreground/50">
                  {" "}
                  / {progress.expectedCount}
                </span>
              </p>
              <p className="text-sm text-foreground/65">otrzymanych odpowiedzi</p>
            </div>

            <div
              className="h-2 overflow-hidden rounded-full bg-primary/10"
              role="progressbar"
              aria-valuenow={progress.progressPercent ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Postęp odpowiedzi RSVP"
            >
              <div
                className={cn(
                  "h-full rounded-full bg-primary transition-all duration-500",
                )}
                style={{ width: `${progress.progressPercent ?? 0}%` }}
              />
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/65">
              <span>Oczekujący: {progress.awaitingResponses}</span>
              <span>Bez odpowiedzi w bazie: {progress.dbPendingCount}</span>
              <span>Tak: {stats.attendingCount} osób</span>
              <span>Nie: {stats.declinedCount}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground/60">
            Ustaw liczbę wysłanych zaproszeń, aby zobaczyć postęp odpowiedzi.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
