import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AdminPanel } from "@/components/admin/admin-panel";
import { getAdminGuests } from "@/app/actions/admin";
import { getAdminScheduleEvents } from "@/app/actions/schedule";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { SHOW_SCHEDULE } from "@/lib/wedding-config";

export const metadata = {
  title: "Admin | Wedding App",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return <AdminLoginForm />;
  }

  const guestsResult = await getAdminGuests();

  if (!guestsResult.success) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-background px-4 py-16">
        <div className="max-w-md rounded-xl border border-destructive/30 bg-card p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">
            Nie udało się pobrać danych RSVP
          </h1>
          <p className="mt-2 text-sm text-destructive">{guestsResult.error}</p>
        </div>
      </div>
    );
  }

  const scheduleResult = SHOW_SCHEDULE ? await getAdminScheduleEvents() : null;

  if (scheduleResult && !scheduleResult.success) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-background px-4 py-16">
        <div className="max-w-md rounded-xl border border-destructive/30 bg-card p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">
            Nie udało się pobrać harmonogramu
          </h1>
          <p className="mt-2 text-sm text-destructive">{scheduleResult.error}</p>
        </div>
      </div>
    );
  }

  return (
    <AdminPanel
      guests={guestsResult.guests}
      stats={guestsResult.stats}
      expectedRsvpCount={guestsResult.expectedRsvpCount}
      scheduleEvents={scheduleResult?.events ?? []}
    />
  );
}
