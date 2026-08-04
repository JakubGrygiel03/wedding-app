import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { filterGuestRows } from "@/lib/admin/expected-rsvp-storage";
import { guestsToCsv } from "@/lib/admin/export-guests";
import type { AdminGuestRow } from "@/app/actions/admin";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("guests")
      .select(
        "id, token, guest_name, is_attending, dietary_requirements, plus_one, plus_one_diet, accommodation_needed, message, updated_at",
      )
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[Admin] export-guests:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const guests: AdminGuestRow[] = filterGuestRows(data ?? []).map((guest) => ({
      id: guest.id,
      guestName: guest.guest_name,
      isAttending: guest.is_attending,
      diet: guest.dietary_requirements,
      plusOne: guest.plus_one ?? false,
      plusOneDiet: guest.plus_one_diet,
      accommodationNeeded: guest.accommodation_needed ?? false,
      message: guest.message,
      updatedAt: guest.updated_at,
    }));

    const csv = guestsToCsv(guests);
    const filename = `rsvp-goscie-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    console.error("[Admin] export-guests:", message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
