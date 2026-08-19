"use client";

import type { ReactNode } from "react";
import { Modal, Button } from "@/components/ui";

interface TopikAnswerReviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  hideLabel: string;
  children: ReactNode;
}

/**
 * Shared "Review Your Answers" popup for TOPIK results screens (Listening,
 * Reading — any section with a per-question answer breakdown). Clicking
 * "Review answers" used to reveal a section further down the same page,
 * which was easy to miss without scrolling; this opens it immediately in a
 * modal instead, built on the existing ui/Modal (same component used by
 * StreakModal/ProfileModal/etc.) so it stays visually consistent with the
 * rest of AimieAI. Sized wider than Modal's default and independently
 * scrollable so a full question list fits comfortably.
 */
export function TopikAnswerReviewModal({
  open,
  onClose,
  title,
  hideLabel,
  children,
}: TopikAnswerReviewModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      className="max-w-3xl"
      footer={
        <Button variant="secondary" onClick={onClose}>
          {hideLabel}
        </Button>
      }
    >
      <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">{children}</div>
    </Modal>
  );
}
