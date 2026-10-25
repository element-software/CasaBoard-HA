"use client";

import { ReactNode } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

interface ConfirmActionModalProps {
  isOpen: boolean;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  confirmColor?: "danger" | "primary";
  isLoading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmActionModal({
  isOpen,
  title,
  body,
  confirmLabel,
  confirmColor = "danger",
  isLoading = false,
  error,
  onConfirm,
  onClose,
}: ConfirmActionModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={!isLoading}
      hideCloseButton={isLoading}
    >
      <ModalContent>
        <ModalHeader className="text-base font-semibold">{title}</ModalHeader>
        <ModalBody className="space-y-3 text-sm text-theme-text-secondary">
          <div className="text-theme-text">{body}</div>
          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}
        </ModalBody>
        <ModalFooter className="border-t border-theme-border gap-2">
          <Button variant="light" onPress={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
          <Button
            color={confirmColor}
            onPress={onConfirm}
            isLoading={isLoading}
            isDisabled={isLoading}
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
