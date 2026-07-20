"use client";

import { Trash2 } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { deleteAccount } from "@/lib/auth/accountStore";

export interface DeleteAccountConfirmDialogProps {
  open: boolean;
  onClose: () => void;
}

export function DeleteAccountConfirmDialog({
  open,
  onClose,
}: DeleteAccountConfirmDialogProps) {
  const { profile, clearProfile } = useUserProfile();
  const { t } = useLanguage();

  function handleConfirm() {
    // AppShell redirects to /onboarding as soon as profile is null — see
    // the comment in LogoutConfirmDialog's handleConfirm for why we don't
    // also navigate here.
    if (profile) deleteAccount(profile.id);
    clearProfile();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.deleteAccountModal.title}
      description={t.deleteAccountModal.description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t.deleteAccountModal.cancel}
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            <Trash2 className="h-4 w-4" />
            {t.deleteAccountModal.confirm}
          </Button>
        </>
      }
    />
  );
}
