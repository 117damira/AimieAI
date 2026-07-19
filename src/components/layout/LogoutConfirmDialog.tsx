"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { useUserProfile } from "@/lib/profile/UserProfileContext";

export interface LogoutConfirmDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LogoutConfirmDialog({ open, onClose }: LogoutConfirmDialogProps) {
  const { clearProfile } = useUserProfile();
  const [reason, setReason] = useState("");

  function handleConfirm() {
    // Don't also navigate here — AppShell already redirects to /onboarding
    // the instant profile becomes null, and racing our own router.push
    // against that effect is what sent users to the wrong route.
    clearProfile();
    onClose();
  }

  function handleClose() {
    setReason("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Log out?"
      description="You'll need to sign back in to access your dashboard."
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </>
      }
    >
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">
          What made you decide to leave today?{" "}
          <span className="font-normal text-muted">(optional)</span>
        </span>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Share any feedback..."
          className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-6 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
        />
      </label>
    </Modal>
  );
}
