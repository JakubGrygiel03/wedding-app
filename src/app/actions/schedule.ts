"use server";

import { revalidatePath } from "next/cache";

import { isAdminAuthenticated } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getSupabaseEnvErrorMessage,
  SupabaseEnvError,
} from "@/lib/supabase/env";
import {
  scheduleEventSchema,
  type ScheduleEventFormValues,
} from "@/lib/validations/schedule";

export type AdminScheduleRow = {
  id: string;
  title: string;
  eventTime: string;
  description: string | null;
  locationName: string | null;
  googleMapsUrl: string | null;
  orderIndex: number;
};

export type AdminScheduleResult =
  | { success: true; events: AdminScheduleRow[] }
  | { success: false; error: string };

export type ScheduleMutationResult =
  | { success: true }
  | { success: false; error: string };

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

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function mapScheduleRow(row: TimelineEventRow): AdminScheduleRow {
  return {
    id: row.id,
    title: row.title,
    eventTime: formatEventTime(row.event_time),
    description: row.description,
    locationName: row.location_name,
    googleMapsUrl: row.google_maps_url,
    orderIndex: row.order_index,
  };
}

function sortAdminScheduleEvents(
  events: AdminScheduleRow[],
): AdminScheduleRow[] {
  return [...events].sort((a, b) => {
    const orderDiff = a.orderIndex - b.orderIndex;
    if (orderDiff !== 0) return orderDiff;

    return timeToMinutes(a.eventTime) - timeToMinutes(b.eventTime);
  });
}

function toDbEventTime(eventTime: string): string {
  return eventTime.length === 5 ? `${eventTime}:00` : eventTime;
}

function revalidateSchedulePaths(): void {
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function getAdminScheduleEvents(): Promise<AdminScheduleResult> {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: "Brak autoryzacji." };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("timeline_events")
      .select(
        "id, title, event_time, description, location_name, google_maps_url, order_index",
      )
      .order("order_index", { ascending: true })
      .order("event_time", { ascending: true });

    if (error) {
      console.error("[Schedule] getAdminScheduleEvents:", error.message);
      return { success: false, error: error.message };
    }

    const events = sortAdminScheduleEvents((data ?? []).map(mapScheduleRow));

    return { success: true, events };
  } catch (error) {
    if (error instanceof SupabaseEnvError) {
      return { success: false, error: getSupabaseEnvErrorMessage(error) };
    }

    const message = error instanceof Error ? error.message : "Nieznany błąd.";
    console.error("[Schedule] getAdminScheduleEvents:", message);

    return { success: false, error: message };
  }
}

export async function createScheduleEvent(
  values: ScheduleEventFormValues,
): Promise<ScheduleMutationResult> {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: "Brak autoryzacji." };
  }

  const parsed = scheduleEventSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane formularza.",
    };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("timeline_events").insert({
      title: parsed.data.title,
      event_time: toDbEventTime(parsed.data.eventTime),
      description: parsed.data.description?.trim() || null,
      location_name: null,
      google_maps_url: null,
      order_index: parsed.data.orderIndex,
    });

    if (error) {
      console.error("[Schedule] createScheduleEvent:", error.message);
      return { success: false, error: error.message };
    }

    revalidateSchedulePaths();
    return { success: true };
  } catch (error) {
    if (error instanceof SupabaseEnvError) {
      return { success: false, error: getSupabaseEnvErrorMessage(error) };
    }

    const message = error instanceof Error ? error.message : "Nieznany błąd.";
    console.error("[Schedule] createScheduleEvent:", message);

    return { success: false, error: message };
  }
}

export async function updateScheduleEvent(
  eventId: string,
  values: ScheduleEventFormValues,
): Promise<ScheduleMutationResult> {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: "Brak autoryzacji." };
  }

  const parsed = scheduleEventSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane formularza.",
    };
  }

  const id = eventId.trim();

  if (!id) {
    return { success: false, error: "Brak identyfikatora wydarzenia." };
  }

  try {
    const supabase = createAdminClient();
    const { data: existing, error: fetchError } = await supabase
      .from("timeline_events")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("[Schedule] updateScheduleEvent fetch:", fetchError.message);
      return { success: false, error: fetchError.message };
    }

    if (!existing) {
      return { success: false, error: "Nie znaleziono wydarzenia." };
    }

    const { error: updateError } = await supabase
      .from("timeline_events")
      .update({
        title: parsed.data.title,
        event_time: toDbEventTime(parsed.data.eventTime),
        description: parsed.data.description?.trim() || null,
        order_index: parsed.data.orderIndex,
      })
      .eq("id", id);

    if (updateError) {
      console.error("[Schedule] updateScheduleEvent:", updateError.message);
      return { success: false, error: updateError.message };
    }

    revalidateSchedulePaths();
    return { success: true };
  } catch (error) {
    if (error instanceof SupabaseEnvError) {
      return { success: false, error: getSupabaseEnvErrorMessage(error) };
    }

    const message = error instanceof Error ? error.message : "Nieznany błąd.";
    console.error("[Schedule] updateScheduleEvent:", message);

    return { success: false, error: message };
  }
}

export async function deleteScheduleEvent(
  eventId: string,
): Promise<ScheduleMutationResult> {
  if (!(await isAdminAuthenticated())) {
    return { success: false, error: "Brak autoryzacji." };
  }

  const id = eventId.trim();

  if (!id) {
    return { success: false, error: "Brak identyfikatora wydarzenia." };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("timeline_events").delete().eq("id", id);

    if (error) {
      console.error("[Schedule] deleteScheduleEvent:", error.message);
      return { success: false, error: error.message };
    }

    revalidateSchedulePaths();
    return { success: true };
  } catch (error) {
    if (error instanceof SupabaseEnvError) {
      return { success: false, error: getSupabaseEnvErrorMessage(error) };
    }

    const message = error instanceof Error ? error.message : "Nieznany błąd.";
    console.error("[Schedule] deleteScheduleEvent:", message);

    return { success: false, error: message };
  }
}
