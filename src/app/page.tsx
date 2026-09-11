import { Faq } from "@/components/faq";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { InteractiveStory } from "@/components/interactive-story";
import { PhotoGallerySection } from "@/components/photo-gallery-section";
import { RsvpForm } from "@/components/rsvp-form";
import { ScheduleSection } from "@/components/schedule-section";
import { DEFAULT_WEDDING_CALENDAR_EVENT } from "@/lib/calendar";
import { CEREMONY, SHOW_SCHEDULE } from "@/lib/wedding-config";

const BRIDE_NAME = "Adrianna";
const GROOM_NAME = "Jan";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Hero
        weddingDate={CEREMONY.datetimeIso}
        brideName={BRIDE_NAME}
        groomName={GROOM_NAME}
      />

      <InteractiveStory />

      {SHOW_SCHEDULE ? (
        <ScheduleSection
          weddingDate={CEREMONY.datetimeIso.slice(0, 10)}
          calendarEvent={{
            ...DEFAULT_WEDDING_CALENDAR_EVENT,
            start: CEREMONY.datetimeIso,
          }}
          className="pt-10 sm:pt-14"
        />
      ) : null}

      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6" aria-hidden>
        <div className="h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <RsvpForm className="pt-10 sm:pt-14" />

      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6" aria-hidden>
        <div className="h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <PhotoGallerySection className="pt-10 sm:pt-14" />

      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6" aria-hidden>
        <div className="h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <Faq className="pt-10 sm:pt-14" />

      <Footer brideName={BRIDE_NAME} groomName={GROOM_NAME} />
    </div>
  );
}
