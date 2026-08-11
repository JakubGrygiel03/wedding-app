"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ScrollText, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export interface StoryStep {
  title: string;
  text: string;
  imageSrc: string;
  imageAlt: string;
}

export interface InteractiveStoryProps {
  steps?: StoryStep[];
  title?: string;
  subtitle?: string;
  className?: string;
}

const STORY_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

export const DEFAULT_STORY_STEPS: StoryStep[] = [
  {
    title: "Spotkanie w Mroku Velen",
    text: "To nie była słodka bajka. Poznaliśmy się na larpie 'Tajemnice Velen' – w brutalnym, pełnym napięcia i intryg świecie wiedźmińskiego pogranicza. Wśród błota, szczęku stali, niepewności i mrocznych tajemnic, nasze ścieżki skrzyżowały się po raz pierwszy. Wtedy w tym chaosie narodził się sojusz, który miał przetrwać wszystko.",
    imageSrc: "/story/step-1-sunset.png",
    imageAlt: "Para w strojach fantasy na polu fioletowych kwiatów o zachodzie słońca",
  },
  {
    title: "Sojusz na Czas Wojny i Pokoju",
    text: "Z brutalnego świata gry szybko przenieśliśmy się do codzienności. Okazało się, że wspólnie potrafimy przetrwać każdą zamieć. Z przelotnego spojrzenia w mroku Velen wyrosła relacja pełna zaufania, wspólnych pasji, wyjazdów i niekończących się rozmów.",
    imageSrc: "/story/step-1-sunset.png",
    imageAlt: "Para w strojach fantasy na polu fioletowych kwiatów o zachodzie słońca",
  },
  {
    title: "Szkocki Przełom: Bach!",
    text: "Majestatyczna, surowa, spowita mgłą... Szkocja. Wyjazd w klimacie niczym z serialu Outlander – pośród starożytnych ruin i wiatru smagającego wzgórza. I nagle… BACH! W tym niesamowitym miejscu, pośród milczących kamieni, Jan uklęknął. Napięcie opadło, ustępując miejsca czystej radości.",
    imageSrc: "/story/step-3-proposal.png",
    imageAlt: "Oświadczyny na tle szkockiego zamku",
  },
  {
    title: "Artefakt Przeznaczenia",
    text: "Zamiast wiedźmińskiego medalionu czy magicznego glifu – na palcu pojawił się ten jedyny, wyjątkowy pierścionek. Nasza opowieść oficjalnie weszła w najważniejszy jak dotąd rozdział.",
    imageSrc: "/story/step-4-ring.png",
    imageAlt: "Zielony pierścionek zaręczynowy zakładany na palec",
  },
  {
    title: "Witajcie w Naszej Weselnej Wiosce",
    text: "16 Stycznia 2027 roku zbieramy naszą własną drużynę! Zapraszamy Was do naszej klimatycznej wioski, by uczcić ten dzień tak, jak zaczęliśmy – z charakterem, wspaniałymi ludźmi i dobrą zabawą do białego rana.",
    imageSrc: "/story/step-5-village.png",
    imageAlt: "Para w strojach fantasy — zaproszenie na wesele",
  },
];

function StoryImage({ step, className }: { step: StoryStep; className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl border border-[#c9a227]/25 bg-[#141210] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(201,162,39,0.12)] sm:max-w-md lg:max-w-none",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-3xl ring-1 ring-inset ring-[#c9a227]/10"
        aria-hidden
      />
      <Image
        src={step.imageSrc}
        alt={step.imageAlt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 384px, 320px"
        className="object-cover object-center"
        placeholder="blur"
        blurDataURL={STORY_BLUR}
      />
    </div>
  );
}

function StoryText({
  step,
  index,
  align,
}: {
  step: StoryStep;
  index: number;
  align: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center px-1 sm:px-2",
        align === "right" ? "lg:items-end lg:text-right" : "lg:items-start lg:text-left",
      )}
    >
      <h3
        id={`story-step-${index}-title`}
        className="font-heading text-2xl font-semibold leading-tight text-[#f5f0e8] sm:text-3xl"
      >
        {step.title}
      </h3>
      <p className="mt-3 max-w-lg text-base leading-relaxed text-[#c4bdb0] sm:text-lg">
        {step.text}
      </p>
    </div>
  );
}

function StoryTimelineStep({
  step,
  index,
  totalSteps,
}: {
  step: StoryStep;
  index: number;
  totalSteps: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const isEven = index % 2 === 0;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        duration: 0.65,
        delay: 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-x-8"
      aria-labelledby={`story-step-${index}-title`}
    >
      {/* STREAMING_CHUNK: story-timeline-marker */}
      <div
        className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 flex-col items-center lg:flex"
        aria-hidden
      >
        <span className="relative z-10 flex size-10 items-center justify-center rounded-full border border-[#c9a227]/50 bg-[#1c1917] shadow-[0_0_0_4px_rgba(201,162,39,0.12),0_0_24px_rgba(201,162,39,0.15)]">
          <Sparkles className="size-4 text-[#d4af37]" />
        </span>
      </div>

      {index < totalSteps - 1 && (
        <span
          className="absolute left-1/2 top-[calc(50%+1.25rem)] hidden h-[calc(100%+2rem)] w-px -translate-x-1/2 bg-linear-to-b from-[#c9a227]/40 via-[#4a6b5d]/25 to-transparent lg:block"
          aria-hidden
        />
      )}

      {/* Mobile: text first, then image */}
      <div className="order-1 lg:hidden">
        <StoryText step={step} index={index} align="left" />
      </div>
      <div className="order-2 lg:hidden">
        <StoryImage step={step} />
      </div>

      {/* Desktop: alternating columns */}
      {isEven ? (
        <>
          <div className="hidden lg:block lg:pr-4">
            <StoryImage step={step} className="lg:w-full lg:max-w-sm lg:justify-self-end xl:max-w-md" />
          </div>
          <div className="hidden lg:block" aria-hidden />
          <div className="hidden lg:block lg:pl-4">
            <StoryText step={step} index={index} align="right" />
          </div>
        </>
      ) : (
        <>
          <div className="hidden lg:block lg:pr-4">
            <StoryText step={step} index={index} align="left" />
          </div>
          <div className="hidden lg:block" aria-hidden />
          <div className="hidden lg:block lg:pl-4">
            <StoryImage step={step} className="lg:w-full lg:max-w-sm lg:justify-self-start xl:max-w-md" />
          </div>
        </>
      )}
    </motion.article>
  );
}

export function InteractiveStory({
  steps = DEFAULT_STORY_STEPS,
  title = "Nasza Historia",
  subtitle = "Od mroku Velen po weselną wioskę — pięć rozdziałów naszej opowieści.",
  className,
}: InteractiveStoryProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-10% 0px" });

  return (
    <section
      id="nasza-historia"
      className={cn(
        "relative w-full overflow-hidden bg-[#12100e] py-10 sm:py-12 lg:py-14",
        className,
      )}
      aria-labelledby="interactive-story-heading"
    >
      {/* Ambient texture */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(74,107,93,0.18),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(201,162,39,0.06),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* STREAMING_CHUNK: story-header */}
        <motion.header
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 text-center sm:mb-10 lg:mb-12"
        >
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#c9a227]/25 bg-[#1c1917]/80 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-[#c9a227]">
            <ScrollText className="size-3.5" aria-hidden />
            Timeline
          </div>
          <h2
            id="interactive-story-heading"
            className="font-heading text-3xl font-semibold text-[#f5f0e8] sm:text-4xl lg:text-5xl"
          >
            {title}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-base text-[#a39e93] sm:text-lg">
            {subtitle}
          </p>
          <div className="mx-auto mt-4 h-px w-24 bg-linear-to-r from-transparent via-[#c9a227]/60 to-transparent" />
        </motion.header>

        {/* STREAMING_CHUNK: story-timeline */}
        <div className="relative flex flex-col gap-10 sm:gap-12 lg:gap-16">
          {steps.map((step, index) => (
            <StoryTimelineStep
              key={step.title}
              step={step}
              index={index}
              totalSteps={steps.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
