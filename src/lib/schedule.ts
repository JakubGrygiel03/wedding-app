import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_SCHEDULE_EVENTS,
  sortScheduleEvents,
  type SerializableScheduleEvent,
} from "@/lib/schedule-data";

export type { SerializableScheduleEvent } from "@/lib/schedule-data";
export { DEFAULT_SCHEDULE_EVENTS } from "@/lib/schedule-data";

type TimelineEventRow = {
  id: string;
  title: string;
  event_time: string;
  description: string | null;
  location_name: string | null;
  google_maps_url: string | null;
  order_index: number;
};

function formatEventTime(raw: string): string {
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function mapRowToEvent(row: TimelineEventRow): SerializableScheduleEvent {
  return {
    time: formatEventTime(row.event_time),
    title: row.title,
    description: row.description ?? "",
    locationName: row.location_name ?? "",
    googleMapsUrl: row.google_maps_url ?? undefined,
    orderIndex: row.order_index,
  };
}

export async function getTimelineEvents(): Promise<SerializableScheduleEvent[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("timeline_events")
      .select(
        "id, title, event_time, description, location_name, google_maps_url, order_index",
      )
      .order("order_index", { ascending: true })
      .order("event_time", { ascending: true });

    if (error) {
      console.error("[Schedule] Supabase timeline_events error:", error.message);
      return DEFAULT_SCHEDULE_EVENTS;
    }

    if (!data?.length) {
      return DEFAULT_SCHEDULE_EVENTS;
    }

    return sortScheduleEvents(data.map(mapRowToEvent));
  } catch (error) {
    console.error("[Schedule] Failed to fetch timeline_events:", error);
    return DEFAULT_SCHEDULE_EVENTS;
  }
}
