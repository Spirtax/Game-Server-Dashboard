import Card from "../Card/Card";
import "./Modal.css";

import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import { AnimateIcon } from "../animate-ui/icons/icon";
import { X } from "../animate-ui/icons/x";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
  modalSize?: string;
};

export default function Modal({
  isOpen,
  onClose,
  children = null,
  className = "",
  modalSize = "",
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      AOS.init({
        duration: 300,
        easing: "ease-out",
        once: true,
      });
      AOS.refresh();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div
        className="modal-wrapper flex-center"
        data-aos="zoom-in"
        data-aos-duration="300"
        data-aos-easing="ease-out-cubic"
      >
        <Card className="modal-container" cardContainer={modalSize || "modal"}>
          <div className={`modal-content ${className}`}>
            {children}
            <AnimateIcon animateOnHover>
              <div
                className="button-selector window-controls"
                onClick={onClose}
              >
                <X animation="expand" size={16} />
              </div>
            </AnimateIcon>
          </div>
        </Card>
      </div>
    </>
  );
}
