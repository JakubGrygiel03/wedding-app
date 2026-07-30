import { Faq } from "@/components/faq";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { InteractiveStory } from "@/components/interactive-story";
import { PhotoGallerySection } from "@/components/photo-gallery-section";
import { RsvpForm } from "@/components/rsvp-form";
import { ScheduleSection } from "@/components/schedule-section";
import { DEFAULT_WEDDING_CALENDAR_EVENT } from "@/lib/calendar";

const WEDDING_DATE_ISO = "2027-01-16T16:00:00";
const WEDDING_DATE = "2027-01-16";
const BRIDE_NAME = "Adrianna";
const GROOM_NAME = "Jan";

const WEDDING_CALENDAR_EVENT = {
  ...DEFAULT_WEDDING_CALENDAR_EVENT,
  start: WEDDING_DATE_ISO,
};

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <Hero
        weddingDate={WEDDING_DATE_ISO}
        brideName={BRIDE_NAME}
        groomName={GROOM_NAME}
        locationName="Hotel Trylogia"
        locationCity="Zielonka k. Warszawy"
        locationAddress="ul. Poniatowskiego 46/46A, 05-220 Zielonka"
      />

      <InteractiveStory />

      <ScheduleSection
        weddingDate={WEDDING_DATE}
        calendarEvent={WEDDING_CALENDAR_EVENT}
        className="pt-10 sm:pt-14"
      />

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
