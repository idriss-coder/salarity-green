"use client";

import * as stylex from "@stylexjs/stylex";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { colors } from "@/lib/tokens.stylex";

const styles = stylex.create({
  error: { color: colors.destructive, fontSize: "0.85rem" },
});

export function DeleteSubmissionButton({
  id,
  companyName,
  redirectTo,
}: {
  id: string;
  companyName: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setOpen(false);
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch {
      setError("La suppression a échoué. Veuillez réessayer.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) setOpen(next);
      }}
    >
      <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
        <Trash2Icon />
        Supprimer
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette soumission ?</AlertDialogTitle>
          <AlertDialogDescription>
            La soumission de <strong>{companyName}</strong> et son rapport PDF seront supprimés
            définitivement. Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? <p {...stylex.props(styles.error)}>{error}</p> : null}
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="outline" />} disabled={pending}>
            Annuler
          </AlertDialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={pending}>
            {pending ? "Suppression…" : "Supprimer"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
