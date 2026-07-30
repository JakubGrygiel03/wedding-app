"use client";

import { CalendarPlus, Download } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  buildGoogleCalendarUrl,
  downloadIcsFile,
  type WeddingCalendarEvent,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";

export interface AddToCalendarProps {
  event: WeddingCalendarEvent;
  icsFilename?: string;
  className?: string;
}

export function AddToCalendar({
  event,
  icsFilename = "slub-adrianna-jan.ics",
  className,
}: AddToCalendarProps) {
  const googleUrl = buildGoogleCalendarUrl(event);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-3",
        className,
      )}
    >
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Dodaj wesele do Google Calendar"
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "min-h-11 gap-2 border-primary/25 bg-card px-4 text-primary hover:border-primary/40 hover:bg-primary/5",
        )}
      >
        <CalendarPlus className="size-4" aria-hidden />
        Google Calendar
      </a>

      <button
        type="button"
        aria-label="Pobierz plik kalendarza ICS dla Apple Calendar lub Outlook"
        onClick={() => downloadIcsFile(event, icsFilename)}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "min-h-11 gap-2 border-wedding-accent/40 bg-card px-4 text-primary hover:border-wedding-accent/60 hover:bg-wedding-accent/10",
        )}
      >
        <Download className="size-4" aria-hidden />
        Pobierz .ics
      </button>
    </div>
  );
}
