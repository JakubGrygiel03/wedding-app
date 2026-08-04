"use client";

import { useTransition } from "react";
import { CalendarClock, LogOut, Users } from "lucide-react";

import { logoutAdmin, type AdminGuestRow, type AdminStats } from "@/app/actions/admin";
import type { AdminScheduleRow } from "@/app/actions/schedule";
import { AdminScheduleManager } from "@/components/admin/admin-schedule-manager";
import { GuestDashboard } from "@/components/admin/guest-dashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminPanel({
  guests,
  stats,
  expectedRsvpCount,
  scheduleEvents,
}: {
  guests: AdminGuestRow[];
  stats: AdminStats;
  expectedRsvpCount: number | null;
  scheduleEvents: AdminScheduleRow[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutAdmin();
    });
  }

  return (
    <Tabs defaultValue="rsvp" className="min-h-full flex-1">
      <div className="border-b border-primary/10 bg-background px-4 pt-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <TabsList className="h-10">
            <TabsTrigger value="rsvp" className="min-h-9 px-4">
              <Users aria-hidden />
              RSVP
            </TabsTrigger>
            <TabsTrigger value="schedule" className="min-h-9 px-4">
              <CalendarClock aria-hidden />
              Harmonogram
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value="rsvp" className="mt-0">
        <GuestDashboard
          guests={guests}
          stats={stats}
          expectedRsvpCount={expectedRsvpCount}
        />
      </TabsContent>

      <TabsContent value="schedule" className="mt-0">
        <div className="min-h-full flex-1 bg-background px-4 py-8 sm:px-6 sm:py-10">
          <div className="mx-auto max-w-7xl space-y-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-wedding-accent">
                  Admin
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  Harmonogram
                </h1>
                <p className="mt-2 text-sm text-foreground/65">
                  Dodawaj, edytuj i usuwaj punkty planu dnia wesela.
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                disabled={isPending}
                onClick={handleLogout}
                className="min-h-11 self-start text-primary sm:self-center"
              >
                <LogOut aria-hidden />
                Wyloguj
              </Button>
            </header>

            <AdminScheduleManager events={scheduleEvents} />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
