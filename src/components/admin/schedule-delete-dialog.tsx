"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  deleteScheduleEvent,
  type AdminScheduleRow,
} from "@/app/actions/schedule";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";

export function ScheduleDeleteDialog({
  event,
  open,
  onOpenChange,
}: {
  event: AdminScheduleRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!event) return;

    startTransition(async () => {
      const result = await deleteScheduleEvent(event.id);

      if (!result.success) {
        toast.add({
          title: "Nie udało się usunąć wpisu",
          description: result.error,
          type: "error",
        });
        return;
      }

      toast.add({
        title: "Wpis usunięty",
        description: `${event.eventTime} · ${event.title}`,
        type: "success",
      });

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Usunąć wydarzenie?</DialogTitle>
          <DialogDescription>
            {event
              ? `Czy na pewno chcesz usunąć „${event.title}” (${event.eventTime})? Tej operacji nie można cofnąć.`
              : "Czy na pewno chcesz usunąć ten wpis?"}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Anuluj
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Usuwanie…
              </>
            ) : (
              "Usuń"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
