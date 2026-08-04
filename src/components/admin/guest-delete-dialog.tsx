"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  deleteAdminGuest,
  type AdminGuestRow,
} from "@/app/actions/admin";
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

export function GuestDeleteDialog({
  guest,
  open,
  onOpenChange,
}: {
  guest: AdminGuestRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!guest) return;

    startTransition(async () => {
      const result = await deleteAdminGuest(guest.id);

      if (!result.success) {
        toast.add({
          title: "Nie udało się usunąć gościa",
          description: result.error,
          type: "error",
        });
        return;
      }

      toast.add({
        title: "Gość usunięty",
        description: `Usunięto wpis: ${guest.guestName}`,
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
          <DialogTitle>Usunąć gościa?</DialogTitle>
          <DialogDescription>
            {guest
              ? `Czy na pewno chcesz usunąć wpis „${guest.guestName}”? Tej operacji nie można cofnąć.`
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
