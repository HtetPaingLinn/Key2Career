"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteInterview } from "@/lib/actions/voice-general.action";
import "@/styles/voice-interview.css";

/**
 * Delete button component
 * @param {{interviewId: string, onDelete?: Function}} props
 */
const DeleteButton = ({ interviewId, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      console.log("Attempting to delete interview:", interviewId);
      const result = await deleteInterview(interviewId);
      console.log("Delete result:", result);
      if (result.success) {
        console.log("Interview deleted successfully");
        onDelete?.();
      } else {
        console.error("Failed to delete interview");
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="voice-interview">
        <div className="flex gap-2">
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm"
          >
            {isDeleting ? "Deleting..." : "Confirm"}
          </Button>
          <Button
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-interview">
      <Button
        onClick={() => setShowConfirm(true)}
        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
        size="sm"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </Button>
    </div>
  );
};

export default DeleteButton;
