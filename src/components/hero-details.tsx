import { CalendarHeart, Church } from "lucide-react";

import { CEREMONY, RECEPTION } from "@/lib/wedding-config";

export function HeroDetailsCard() {
  return (
    <div className="mx-auto mt-3 grid w-full max-w-2xl gap-3 rounded-2xl border border-primary/15 bg-card/80 p-4 text-left shadow-sm backdrop-blur-sm sm:mt-4 sm:grid-cols-2 sm:gap-5 sm:p-5">
      <div className="flex items-start gap-3">
        <Church className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Ślub
          </p>
          <p className="mt-1 text-foreground">{CEREMONY.displayDateTime}</p>
          <p className="mt-1 font-medium text-foreground">{CEREMONY.placeName}</p>
          <p className="text-foreground/70">{CEREMONY.city}</p>
          <p className="text-sm text-foreground/60">{CEREMONY.address}</p>
        </div>
      </div>

      <div className="h-px bg-primary/10 sm:hidden" aria-hidden />

      <div className="flex items-start gap-3">
        <CalendarHeart className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Wesele
          </p>
          <p className="mt-1 text-foreground">godz. {RECEPTION.timeLabel}</p>
          <p className="mt-1 font-medium text-foreground">{RECEPTION.placeName}</p>
          <p className="text-foreground/70">{RECEPTION.city}</p>
          <p className="text-sm text-foreground/60">{RECEPTION.address}</p>
        </div>
      </div>
    </div>
  );
}
