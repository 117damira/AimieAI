"use client";

import { LogOut } from "lucide-react";
import { Modal, Button } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { stopSpeaking } from "@/lib/utils/voice";

export interface SpeakingExitExamDialogProps {
  open: boolean;
  onClose: () => void;
  /** Always returns to Speaking's own mode-selection — exiting mid-exam
   * never leaves the Speaking module for Dashboard or any other page. */
  onConfirm: () => void;
}

export function SpeakingExitExamDialog({ open, onClose, onConfirm }: SpeakingExitExamDialogProps) {
  const { t } = useLanguage();

  function handleConfirm() {
    stopSpeaking();
    onConfirm();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.speaking.exitExamConfirmTitle}
      description={t.speaking.exitExamConfirmDescription}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t.speaking.exitExamConfirmCancel}
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            <LogOut className="h-4 w-4" />
            {t.speaking.exitExamConfirmYes}
          </Button>
        </>
      }
    />
  );
}
