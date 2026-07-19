"use client";

import { Trash2 } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { useUserProfile } from "@/lib/profile/UserProfileContext";

export interface DeleteAccountConfirmDialogProps {
  open: boolean;
  onClose: () => void;
}

export function DeleteAccountConfirmDialog({
  open,
  onClose,
}: DeleteAccountConfirmDialogProps) {
  const { clearProfile } = useUserProfile();

  function handleConfirm() {
    // AppShell redirects to /onboarding as soon as profile is null — see
    // the comment in LogoutConfirmDialog's handleConfirm for why we don't
    // also navigate here.
    clearProfile();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete your account?"
      description="This permanently removes your profile, progress, and history from this device. This can't be undone."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            <Trash2 className="h-4 w-4" />
            Delete account
          </Button>
        </>
      }
    />
  );
}
