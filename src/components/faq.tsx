"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { HelpCircle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { RSVP_DEADLINE_LABEL } from "@/lib/wedding-config";

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

export interface FaqProps {
  items?: FaqEntry[];
  rsvpDeadline?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function buildDefaultFaqItems(rsvpDeadline: string): FaqEntry[] {
  return [
    {
      id: "rsvp-deadline",
      question: "Do kiedy należy potwierdzić przybycie?",
      answer: `Prosimy o potwierdzenie obecności (RSVP) do ${rsvpDeadline} za pomocą formularza na tej stronie lub kontaktując się z nami osobiście.`,
    },
    {
      id: "gifts",
      question: "Co z prezentami? Co wolelibyście otrzymać?",
      answer:
        "Największym prezentem jest dla nas Wasza obecność! Jeśli jednak chcielibyście nas obdarować, najbardziej ucieszą nas koperty, które pomogą nam zrealizować nasze wspólne marzenia, lub dobra książka z Waszą dedykacją zamiast kwiatów.",
    },
    {
      id: "dress-code",
      question: "Jaki obowiązuje dress code?",
      answer:
        "Obowiązuje strój wieczorowy / elegancki. Ponieważ czerpiemy inspiracje z klimatu fantasy i wiedźmińskich opowieści, subtelne akcenty w kolorach ziemi, głębokiej zieleni, złota czy ciemnej elegancji będą mile widziane!",
    },
    {
      id: "parking",
      question: "Czy na miejscu dostępny jest parking?",
      answer:
        "Tak, na terenie obiektu Hotel Trylogia dostępny jest bezpłatny parking dla wszystkich naszych gości.",
    },
    {
      id: "accommodation",
      question: "Czy zapewniony jest nocleg?",
      answer:
        "Zapewniamy nocleg dla gości przyjezdnych w Hotelu Trylogia. Podczas wypełniania formularza RSVP na tej stronie prosimy o zaznaczenie zapotrzebowania na nocleg.",
    },
    {
      id: "dietary",
      question: "Czy na weselu będą uwzględnione opcje dietetyczne?",
      answer:
        "Tak! W formularzu RSVP znajdziesz miejsce na wpisanie swoich preferencji dietetycznych lub alergii.",
    },
    {
      id: "courses",
      question: "Ile dań będzie?",
      answer:
        "Planujemy serwis trzech dań podczas kolacji (przystawka, danie główne i deser), a wieczorem tradycyjny wjazd tortu. Menu dopasujemy do preferencji dietetycznych zgłoszonych w formularzu RSVP.",
    },
    {
      id: "end-time",
      question: "Do której trwa wesele?",
      answer:
        "Przyjęcie zaplanowane jest do około 4:00 w nocy. Oczepiny rozpoczniemy około 23:30 — pełny plan dnia znajdziecie w harmonogramie na tej stronie.",
    },
    {
      id: "afterparty",
      question: "Czy planowane są poprawiny?",
      answer:
        "Nie planujemy tradycyjnych poprawin. Zapraszamy jednak gości nocujących w obiekcie na wspólne, leniwe śniadanie w niedzielny poranek.",
    },
    {
      id: "photo-gallery",
      question: "Gdzie i kiedy będą dostępne zdjęcia ze ślubu i wesela?",
      answer:
        "Oficjalna galeria ze zdjęciami od fotografa pojawi się na tej stronie niedługo po weselu. W specjalnej sekcji udostępnimy link do albumu, z którego będziecie mogli łatwo przejrzeć i pobrać pamiątkowe kadry.",
    },
  ];
}

export { RSVP_DEADLINE_LABEL as DEFAULT_RSVP_DEADLINE } from "@/lib/wedding-config";

function FaqAccordionItem({
  item,
  index,
}: {
  item: FaqEntry;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{
        duration: 0.45,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <AccordionItem
        value={item.id}
        className="border-[#c9a227]/15 not-last:border-b"
      >
        <AccordionTrigger className="min-h-11 py-3 text-base font-medium text-[#1c1917] hover:no-underline hover:text-primary [&[data-panel-open]]:text-primary">
          {item.question}
        </AccordionTrigger>
        <AccordionContent className="pb-3 text-[15px] leading-relaxed text-[#4a4540]">
          <p>{item.answer}</p>
        </AccordionContent>
      </AccordionItem>
    </motion.div>
  );
}

export function Faq({
  items,
  rsvpDeadline = RSVP_DEADLINE_LABEL,
  title = "Najczęściej zadawane pytania",
  subtitle = "Wszystko, co warto wiedzieć przed naszym wielkim dniem.",
  className,
}: FaqProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });
  const faqItems = items ?? buildDefaultFaqItems(rsvpDeadline);

  return (
    <section
      id="faq"
      className={cn(
        "relative scroll-mt-20 overflow-hidden px-4 py-10 sm:px-6 sm:py-12",
        className,
      )}
      aria-labelledby="faq-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(201,162,39,0.06),transparent),linear-gradient(to_bottom,#f5f0e8_0%,#faf9f6_45%,#faf9f6_100%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl">
        {/* STREAMING_CHUNK: faq-header */}
        <motion.header
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 text-center sm:mb-8"
        >
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#c9a227]/30 bg-[#1c1917]/5 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-[#8b6914]">
            <HelpCircle className="size-3.5" aria-hidden />
            FAQ
          </div>
          <h2
            id="faq-heading"
            className="font-heading text-3xl font-semibold tracking-tight text-[#1c1917] sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-[#4a4540]">
            {subtitle}
          </p>
          <div className="mx-auto mt-4 h-px w-24 bg-linear-to-r from-transparent via-[#c9a227]/50 to-transparent" />
        </motion.header>

        {/* STREAMING_CHUNK: faq-accordion */}
        <div className="rounded-2xl border border-[#1c1917]/10 bg-card/90 p-2 shadow-[0_12px_40px_-16px_rgba(28,25,23,0.18)] backdrop-blur-sm sm:p-4">
          <Accordion
            multiple
            className="divide-y divide-[#c9a227]/10 px-2 sm:px-3"
          >
            {faqItems.map((item, index) => (
              <FaqAccordionItem key={item.id} item={item} index={index} />
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
