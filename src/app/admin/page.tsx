import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { GuestDashboard } from "@/components/admin/guest-dashboard";
import { getAdminGuests } from "@/app/actions/admin";
import { isAdminAuthenticated } from "@/lib/admin/auth";

export const metadata = {
  title: "Admin RSVP | Wedding App",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return <AdminLoginForm />;
  }

  const result = await getAdminGuests();

  if (!result.success) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-background px-4 py-16">
        <div className="max-w-md rounded-xl border border-destructive/30 bg-card p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">
            Nie udało się pobrać danych
          </h1>
          <p className="mt-2 text-sm text-destructive">{result.error}</p>
        </div>
      </div>
    );
  }

  return <GuestDashboard guests={result.guests} stats={result.stats} />;
}
