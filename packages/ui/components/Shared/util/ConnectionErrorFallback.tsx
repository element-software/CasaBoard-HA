"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import Icon from "@mdi/react";
import { mdiAlert, mdiRefresh, mdiInformation, mdiDelete } from "@mdi/js";
import { cn } from "@heroui/react";

interface ConnectionErrorIndicatorProps {
  instanceName: string;
  instanceUrl: string;
  error: Error | null;
  onRetry: () => void;
  onReauthenticate: () => void;
  onDelete?: () => void;
}

/**
 * Error indicator - shows inline with instance cards when connection fails
 */
export const ConnectionErrorIndicator: React.FC<
  ConnectionErrorIndicatorProps
> = ({
  instanceName,
  instanceUrl,
  error,
  onRetry,
  onReauthenticate,
  onDelete,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between gap-3 p-3 rounded-md",
          "bg-red-900/40 border border-red-500/50",
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Icon
              path={mdiAlert}
              className="w-5 h-5 text-red-400 flex-shrink-0"
            />
            <div className="font-medium text-red-300 truncate">
              {instanceName}
            </div>
          </div>
          <div className="text-xs text-red-400/70 truncate mt-1">
            {instanceUrl}
          </div>
        </div>
        <Button
          onClick={onOpen}
          className="hover:opacity-80"
          isIconOnly
          size="sm"
          color="danger"
        >
          <Icon
            path={mdiInformation}
            className="w-5 h-5 text-white flex-shrink-0"
          />
        </Button>
        {onDelete && (
          <Button isIconOnly size="sm" color="danger" onPress={onDelete}>
            <Icon path={mdiDelete} className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Error Details Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        backdrop="blur"
        size="md"
        scrollBehavior="inside"
      >
        <ModalContent className="bg-theme-background text-theme-text border border-theme-border">
          <ModalHeader className="flex flex-col gap-2 border-b border-theme-border">
            <div className="flex items-center gap-2">
              <Icon path={mdiAlert} className="w-6 h-6 text-red-500" />
              <h2 className="text-lg font-bold">Connection Error</h2>
            </div>
            <p className="text-sm text-theme-text-secondary font-normal">
              Unable to connect to {instanceName}
            </p>
          </ModalHeader>

          <ModalBody className="gap-4">
            {/* Instance Info */}
            <div className="bg-theme-surface rounded-lg p-4 border border-theme-border space-y-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-theme-text-secondary uppercase tracking-wider">
                  Instance
                </span>
                <span className="text-theme-text font-medium">
                  {instanceName}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-theme-text-secondary uppercase tracking-wider">
                  URL
                </span>
                <span className="text-theme-text font-mono text-sm break-all">
                  {instanceUrl}
                </span>
              </div>
            </div>

            {/* Error Details */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-red-500 uppercase tracking-wider font-semibold">
                    {"code" in error && typeof (error as { code?: unknown }).code === "string"
                      ? String((error as { code: string }).code).replaceAll("_", " ")
                      : "Error Details"}
                  </span>
                  <p className="text-xs text-red-400 font-mono break-all">
                    {error.message || "Unknown error occurred"}
                  </p>
                </div>
              </div>
            )}

            {/* Troubleshooting */}
            <div className="space-y-2">
              <h3 className="font-semibold text-theme-text text-xs uppercase tracking-wider">
                Possible Causes
              </h3>
              <ul className="space-y-1 text-xs text-theme-text-secondary">
                <li className="flex gap-2">
                  <span className="text-primary font-bold min-w-4">•</span>
                  <span>Wrong Home Assistant URL or the host is offline</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold min-w-4">•</span>
                  <span>Long-lived token is invalid, revoked, or expired</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold min-w-4">•</span>
                  <span>SSL certificate problem on an https:// HA URL</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold min-w-4">•</span>
                  <span>Network / firewall blocking this browser from HA</span>
                </li>
              </ul>
            </div>
          </ModalBody>

          <ModalFooter className="border-t border-theme-border gap-2">
            <Button variant="light" onPress={onClose}>
              Close
            </Button>
            <Button
              color="primary"
              startContent={<Icon path={mdiRefresh} className="w-4 h-4" />}
              onPress={() => {
                onRetry();
                onClose();
              }}
            >
              Retry
            </Button>
            <Button
              color="warning"
              onPress={() => {
                onReauthenticate();
                onClose();
              }}
            >
              Re-authenticate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
