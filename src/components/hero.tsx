"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarHeart, ChevronDown, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import { weddingTheme } from "@/lib/wedding-theme";

const HERO_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

export interface HeroProps {
  weddingDate: string;
  locationName: string;
  locationCity: string;
  locationAddress: string;
  brideName?: string;
  groomName?: string;
  backgroundImageSrc?: string;
  className?: string;
}

interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function getCountdownValues(target: Date, now: Date): CountdownValues {
  const diffMs = target.getTime() - now.getTime();
  const isPast = diffMs <= 0;
  const magnitudeMs = Math.abs(diffMs);

  const days = Math.floor(magnitudeMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((magnitudeMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((magnitudeMs / (1000 * 60)) % 60);
  const seconds = Math.floor((magnitudeMs / 1000) % 60);

  return {
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
    isPast,
  };
}

function formatWeddingDate(date: Date): string {
  const weekday = new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
  }).format(date);
  const day = new Intl.DateTimeFormat("pl-PL", { day: "numeric" }).format(date);
  const month = new Intl.DateTimeFormat("pl-PL", { month: "long" })
    .format(date)
    .toLowerCase();
  const year = new Intl.DateTimeFormat("pl-PL", { year: "numeric" }).format(date);
  const time = new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${weekday}, ${day} ${month} ${year}, godz. ${time}`;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-[4.5rem] flex-col items-center rounded-2xl border border-primary/15 bg-card/90 px-3 py-4 shadow-sm backdrop-blur-sm sm:min-w-[5.5rem] sm:px-4 sm:py-5">
      <span className="font-mono text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
        {value >= 100 ? String(value) : String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-xs uppercase tracking-wider text-primary/80 sm:text-sm">
        {label}
      </span>
    </div>
  );
}

export function Hero({
  weddingDate,
  locationName,
  locationCity,
  locationAddress,
  brideName = "Adrianna",
  groomName = "Jan",
  backgroundImageSrc = "/hero-loch-hourn.jpg",
  className,
}: HeroProps) {
  const targetDate = useMemo(() => new Date(weddingDate), [weddingDate]);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const countdown = now
    ? getCountdownValues(targetDate, now)
    : { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false };
  const isPastWedding = countdown.isPast;
  const formattedDate = formatWeddingDate(targetDate);

  return (
    <section
      className={cn(
        "relative min-h-[min(100vh,920px)] overflow-hidden px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28",
        className,
      )}
      aria-labelledby="hero-heading"
    >
      {/* Background landscape */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={backgroundImageSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105"
          placeholder="blur"
          blurDataURL={HERO_BLUR}
        />
      </div>

      {/* Blurred image ring — soft fade at the transition zone only */}
      <div
        className="pointer-events-none absolute inset-0 backdrop-blur-[2px] sm:backdrop-blur-[3px]"
        style={{
          maskImage:
            "radial-gradient(ellipse 54% 50% at 50% 40%, transparent 34%, rgba(0,0,0,0.4) 60%, black 84%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 54% 50% at 50% 40%, transparent 34%, rgba(0,0,0,0.4) 60%, black 84%)",
        }}
        aria-hidden
      />

      {/* White center vignette — shifted up for top label, corners still visible */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 62% 58% at 50% 40%, ${weddingTheme.background} 0%, ${weddingTheme.background} 17%, color-mix(in srgb, ${weddingTheme.background} 97%, transparent) 29%, color-mix(in srgb, ${weddingTheme.background} 86%, transparent) 42%, color-mix(in srgb, ${weddingTheme.background} 62%, transparent) 54%, color-mix(in srgb, ${weddingTheme.background} 30%, transparent) 66%, transparent 80%)`,
        }}
        aria-hidden
      />

      {/* Bottom fade into next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background/80 to-transparent sm:h-32"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-wedding-accent drop-shadow-[0_1px_8px_rgba(250,249,246,0.95)] sm:text-base"
        >
          {isPastWedding ? "Jesteśmy małżeństwem!" : "Pobieramy się!"}
        </motion.p>

        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-heading text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl"
        >
          {brideName}
          <span className="mx-3 font-light text-wedding-accent">&</span>
          {groomName}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg"
        >
          {isPastWedding
            ? "Dziękujemy, że byliście z nami w tym wyjątkowym dniu pełnym miłości i radości."
            : "Zapraszamy Was na nasz wyjątkowy dzień pełen miłości, radości i wspólnych wspomnień."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-primary/15 bg-card/80 p-5 shadow-sm backdrop-blur-sm sm:p-6"
        >
          <div className="flex items-start gap-3 text-left">
            <CalendarHeart
              className="mt-0.5 size-5 shrink-0 text-primary"
              aria-hidden
            />
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-primary">
                Data i godzina
              </p>
              <p className="mt-1 text-foreground">{formattedDate}</p>
            </div>
          </div>

          <div className="h-px bg-primary/10" aria-hidden />

          <div className="flex items-start gap-3 text-left">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-primary">
                Miejsce
              </p>
              <p className="mt-1 font-medium text-foreground">{locationName}</p>
              <p className="text-foreground/70">{locationCity}</p>
              <p className="text-sm text-foreground/60">{locationAddress}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 w-full"
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary">
            {isPastWedding ? "Od wesela minęło:" : "Do wesela pozostało:"}
          </p>

          <div
            className="flex flex-wrap justify-center gap-3 sm:gap-4"
            role="timer"
            aria-live="polite"
            aria-label={
              isPastWedding
                ? "Czas, który upłynął od wesela"
                : "Odliczanie do wesela"
            }
          >
            <CountdownUnit value={countdown.days} label="Dni" />
            <CountdownUnit value={countdown.hours} label="Godz." />
            <CountdownUnit value={countdown.minutes} label="Min." />
            <CountdownUnit value={countdown.seconds} label="Sek." />
          </div>
        </motion.div>

        <motion.a
          href="#harmonogram"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 inline-flex min-h-11 min-w-11 flex-col items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wedding-accent/60"
          aria-label="Przewiń do harmonogramu wesela"
        >
          <span
            className="[text-shadow:0_0_2px_#faf9f6,0_0_8px_rgba(250,249,246,0.98),0_0_14px_rgba(250,249,246,0.82),0_0_24px_rgba(250,249,246,0.55)]"
          >
            Harmonogram dnia
          </span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="text-foreground drop-shadow-[0_0_2px_#faf9f6,0_0_6px_rgba(250,249,246,0.75)]"
          >
            <ChevronDown className="size-5" aria-hidden />
          </motion.span>
        </motion.a>
      </div>
    </section>
  );
}

export default Hero;
