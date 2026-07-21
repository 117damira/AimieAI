"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export interface LogoutConfirmDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LogoutConfirmDialog({ open, onClose }: LogoutConfirmDialogProps) {
  const { clearProfile } = useUserProfile();
  const { t } = useLanguage();
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
      title={t.logoutModal.title}
      description={t.logoutModal.description}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            {t.logoutModal.cancel}
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            <LogOut className="h-4 w-4" />
            {t.logoutModal.confirm}
          </Button>
        </>
      }
    >
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-foreground">
          {t.logoutModal.reasonLabel}{" "}
          <span className="font-normal text-muted">{t.logoutModal.reasonOptional}</span>
        </span>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t.logoutModal.reasonPlaceholder}
          className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-6 text-foreground placeholder:text-muted/70 transition-all duration-200 hover:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
        />
      </label>
    </Modal>
  );
}
