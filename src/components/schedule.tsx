"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Church,
  Clock,
  MapPin,
  PartyPopper,
  Sparkles,
  Utensils,
  type LucideIcon,
} from "lucide-react";

import { AddToCalendar } from "@/components/add-to-calendar";
import { Badge } from "@/components/ui/badge";
import { type WeddingCalendarEvent } from "@/lib/calendar";
import {
  DEFAULT_SCHEDULE_EVENTS,
  type SerializableScheduleEvent,
} from "@/lib/schedule-data";
import { cn } from "@/lib/utils";

export type { SerializableScheduleEvent as ScheduleEvent };
export { DEFAULT_SCHEDULE_EVENTS };

export interface ScheduleProps {
  events?: SerializableScheduleEvent[];
  /** ISO date string (YYYY-MM-DD) used to highlight current/upcoming events */
  weddingDate?: string;
  calendarEvent?: WeddingCalendarEvent;
  title?: string;
  subtitle?: string;
  className?: string;
}

type EventStatus = "past" | "current" | "upcoming";
type ScheduleFilter = "all" | "upcoming" | "past";

type ResolvedScheduleEvent = SerializableScheduleEvent & { icon: LucideIcon };

function resolveEventIcon(title: string): LucideIcon {
  const normalized = title.toLowerCase();

  if (normalized.includes("ceremonia") || normalized.includes("ślub")) {
    return Church;
  }
  if (
    normalized.includes("kolacja") ||
    normalized.includes("obiad") ||
    normalized.includes("tort")
  ) {
    return Utensils;
  }
  if (
    normalized.includes("przyjęcie") ||
    normalized.includes("wesele") ||
    normalized.includes("oczepiny")
  ) {
    return PartyPopper;
  }
  if (
    normalized.includes("sesja") ||
    normalized.includes("zdjęci") ||
    normalized.includes("pierwszy taniec")
  ) {
    return Sparkles;
  }

  return Clock;
}

function resolveScheduleEvents(
  events: SerializableScheduleEvent[],
): ResolvedScheduleEvent[] {
  return events.map((event) => ({
    ...event,
    icon: resolveEventIcon(event.title),
  }));
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getEventStatus(
  eventTime: string,
  now: Date,
  weddingDate?: string,
): EventStatus {
  if (!weddingDate) return "upcoming";

  const today = now.toISOString().slice(0, 10);
  if (today !== weddingDate) {
    return today < weddingDate ? "upcoming" : "past";
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const eventMinutes = parseTimeToMinutes(eventTime);

  if (eventMinutes > currentMinutes) return "upcoming";
  if (eventMinutes <= currentMinutes) {
    return "current";
  }

  return "past";
}

function resolveEventStatuses(
  events: ResolvedScheduleEvent[],
  now: Date | null,
  weddingDate?: string,
): EventStatus[] {
  if (!now) {
    return events.map(() => "upcoming" as const);
  }

  const statuses = events.map((event) =>
    getEventStatus(event.time, now, weddingDate),
  );

  if (!weddingDate || weddingDate !== now.toISOString().slice(0, 10)) {
    return statuses;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  let activeIndex = -1;

  for (let i = events.length - 1; i >= 0; i -= 1) {
    if (parseTimeToMinutes(events[i].time) <= currentMinutes) {
      activeIndex = i;
      break;
    }
  }

  return statuses.map((_, index) => {
    if (activeIndex === -1) return "upcoming";
    if (index < activeIndex) return "past";
    if (index === activeIndex) return "current";
    return "upcoming";
  });
}

function ScheduleTimelineItem({
  event,
  index,
  status,
  isNextUpcoming,
}: {
  event: ResolvedScheduleEvent;
  index: number;
  status: EventStatus;
  isNextUpcoming: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px 0px" });
  const Icon = event.icon;

  const isPast = status === "past";
  const isCurrent = status === "current";

  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{
        duration: 0.55,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "relative grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 pb-10 last:pb-0 sm:gap-x-6",
        isPast && "opacity-60",
      )}
      aria-current={isCurrent ? "step" : undefined}
    >
      {/* STREAMING_CHUNK: schedule-timeline-marker */}
      <div className="relative flex flex-col items-center">
        <motion.span
          className={cn(
            "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border-2 bg-card shadow-sm transition-colors sm:size-12",
            isCurrent
              ? "border-wedding-accent shadow-[0_0_0_4px_color-mix(in_srgb,var(--wedding-accent)_25%,transparent)]"
              : "border-primary/30",
          )}
          animate={
            isCurrent
              ? { scale: [1, 1.06, 1] }
              : { scale: 1 }
          }
          transition={
            isCurrent
              ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        >
          <Icon
            className={cn(
              "size-5",
              isCurrent ? "text-wedding-accent" : "text-primary",
            )}
            aria-hidden
          />
        </motion.span>
        <span
          className="absolute top-11 bottom-0 w-px bg-linear-to-b from-primary/40 to-transparent sm:top-12"
          aria-hidden
        />
      </div>

      {/* STREAMING_CHUNK: schedule-timeline-card */}
      <article
        className={cn(
          "rounded-2xl border bg-card p-4 shadow-sm transition-all sm:p-5",
          isCurrent
            ? "border-wedding-accent shadow-[0_8px_30px_color-mix(in_srgb,var(--wedding-primary)_12%,transparent)]"
            : "border-primary/15 hover:border-primary/30",
        )}
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-primary/25 bg-background font-mono text-primary"
          >
            <Clock className="size-3" aria-hidden />
            {event.time}
          </Badge>

          {isCurrent && (
            <Badge className="border-transparent bg-wedding-accent text-foreground">
              Teraz
            </Badge>
          )}

          {isNextUpcoming && !isCurrent && (
            <Badge
              variant="outline"
              className="border-primary/40 text-primary"
            >
              Następne
            </Badge>
          )}
        </div>

        <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {event.title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-foreground/70 sm:text-base">
          {event.description}
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-start gap-2 text-sm text-primary">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{event.locationName}</span>
          </p>

          {(event.googleMapsUrl) && (
            <div className="flex flex-wrap gap-2">
              {event.googleMapsUrl && (
                <a
                  href={event.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-primary/25 px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wedding-accent/60"
                >
                  <MapPin className="size-4" aria-hidden />
                  Mapy
                </a>
              )}
            </div>
          )}
        </div>
      </article>
    </motion.li>
  );
}

export function Schedule({
  events = DEFAULT_SCHEDULE_EVENTS,
  weddingDate,
  calendarEvent,
  title = "Harmonogram Wesela",
  subtitle = "Plan dnia — od ceremonii po oczepiny",
  className,
}: ScheduleProps) {
  const [filter, setFilter] = useState<ScheduleFilter>("all");
  const [now, setNow] = useState<Date | null>(null);

  const resolvedEvents = useMemo(
    () => resolveScheduleEvents(events),
    [events],
  );

  useEffect(() => {
    setNow(new Date());
    const interval = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const statuses = useMemo(
    () => resolveEventStatuses(resolvedEvents, now, weddingDate),
    [resolvedEvents, now, weddingDate],
  );

  const filteredEvents = useMemo(() => {
    return resolvedEvents
      .map((event, index) => ({ event, index, status: statuses[index] }))
      .filter(({ status }) => {
        if (filter === "all") return true;
        if (filter === "upcoming") return status === "upcoming" || status === "current";
        return status === "past";
      });
  }, [resolvedEvents, filter, statuses]);

  const nextUpcomingIndex = statuses.findIndex((status) => status === "upcoming");

  const filterOptions: { value: ScheduleFilter; label: string }[] = [
    { value: "all", label: "Wszystkie" },
    { value: "upcoming", label: "Nadchodzące" },
    { value: "past", label: "Minione" },
  ];

  return (
    <section
      id="harmonogram"
      className={cn("scroll-mt-20 bg-background px-4 py-16 sm:px-6 sm:py-24", className)}
      aria-labelledby="schedule-heading"
    >
      <div className="mx-auto max-w-3xl">
        {/* STREAMING_CHUNK: schedule-header */}
        <motion.header
          className="mb-10 text-center sm:mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-wedding-accent">
            Timeline
          </p>
          <h2
            id="schedule-heading"
            className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-foreground/65">
            {subtitle}
          </p>

          {calendarEvent && (
            <AddToCalendar event={calendarEvent} className="mt-6" />
          )}
        </motion.header>

        {/* STREAMING_CHUNK: schedule-filters */}
        <div
          className="mb-8 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Filtr harmonogramu"
        >
          {filterOptions.map(({ value, label }) => {
            const isActive = filter === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilter(value)}
                className={cn(
                  "min-h-11 rounded-full px-5 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wedding-accent/60",
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "border border-primary/20 bg-card text-primary hover:border-primary/40",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* STREAMING_CHUNK: schedule-timeline */}
        {filteredEvents.length > 0 ? (
          <ol className="relative m-0 list-none p-0" aria-label="Harmonogram wydarzeń">
            {filteredEvents.map(({ event, index, status }, displayIndex) => (
              <ScheduleTimelineItem
                key={`${event.time}-${event.title}`}
                event={event}
                index={displayIndex}
                status={status}
                isNextUpcoming={index === nextUpcomingIndex}
              />
            ))}
          </ol>
        ) : (
          <p className="rounded-2xl border border-dashed border-primary/25 bg-card/70 px-6 py-10 text-center text-sm text-foreground/60">
            Brak wydarzeń w wybranej kategorii.
          </p>
        )}
      </div>
    </section>
  );
}

export default Schedule;
