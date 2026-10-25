import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody,
  Button,
  useDisclosure
} from '@heroui/react'
import classNames from 'classnames';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

interface PopupProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export const Popup = ({ open, setOpen, children, className }: PopupProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Sync external open state with HeroUI's disclosure
  useEffect(() => {
    if (open && !isOpen) {
      onOpen();
    } else if (!open && isOpen) {
      onClose();
    }
  }, [open, isOpen, onOpen, onClose]);

  const handleClose = () => {
    onClose();
    setOpen(false);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="2xl"
      classNames={{
        base: classNames(
          "bg-theme-surface text-theme-text shadow-xl z-50",
          className
        ),
        closeButton: "hidden", // We'll use our custom close button
      }}
    >
      <ModalContent>
        <ModalBody className="relative p-6">
          <Button
            isIconOnly
            variant="light"
            className="absolute top-4 right-4 text-theme-text z-10"
            onPress={handleClose}
          >
            <XMarkIcon className="h-6 w-6" />
          </Button>
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
