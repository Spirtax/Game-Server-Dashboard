import Modal from "./Modal";
import "./ErrorModal.css";

type ErrorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  error?: string | null;
};

export default function ErrorModal({
  isOpen,
  onClose,
  title = "System Error",
  error = "An unexpected error occurred.",
}: ErrorModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="error-modal-wrapper"
      modalSize="w-[344px] h-auto"
    >
      <div className="error-modal-body flex-center">
        <div className="error-icon-container">
          <div className="error-circle">!</div>
        </div>
        <h2 className="error-title">{title}</h2>
        <p className="error-message">
          {error || "Unknown error details provided."}
        </p>
        <button className="error-close-btn" onClick={onClose}>
          Dismiss
        </button>
      </div>
    </Modal>
  );
}
