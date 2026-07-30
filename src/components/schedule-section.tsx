import { Schedule } from "@/components/schedule";
import {
  DEFAULT_WEDDING_CALENDAR_EVENT,
  type WeddingCalendarEvent,
} from "@/lib/calendar";
import { getTimelineEvents } from "@/lib/schedule";

export interface ScheduleSectionProps {
  weddingDate?: string;
  calendarEvent?: WeddingCalendarEvent;
  title?: string;
  subtitle?: string;
  className?: string;
}

export async function ScheduleSection({
  weddingDate,
  calendarEvent = DEFAULT_WEDDING_CALENDAR_EVENT,
  title,
  subtitle,
  className,
}: ScheduleSectionProps) {
  const events = await getTimelineEvents();

  return (
    <Schedule
      events={events}
      weddingDate={weddingDate}
      calendarEvent={calendarEvent}
      title={title}
      subtitle={subtitle}
      className={className}
    />
  );
}
