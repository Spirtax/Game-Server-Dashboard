import { useState } from "react";
import { Plus } from "lucide-react";
import "./CreateServerButton.css";
import Button from "@/components/Input/Button/Button";
import CreateServerModal from "@/features/ServerDashboard/CreateServerModal/CreateServerModal";

export default function CreateServerButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        className="create-button-container"
        width="128px"
        height="32px"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="button-content">
          <Plus size={16} className="plus-icon" />
          <span className="create-button-text">Create Server</span>
        </div>
      </Button>

      <CreateServerModal
        isOpen={isModalOpen}
        setIsModalOpen={() => setIsModalOpen(false)}
      />
    </>
  );
}
