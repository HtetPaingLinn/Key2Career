"use client";

import { useState } from "react";
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  XMarkIcon 
} from "@heroicons/react/24/outline";

export default function ValidationStatusModal({ 
  isOpen, 
  onClose, 
  onProceed, 
  validationStatus, 
  userEmail 
}) {
  const getStatusInfo = () => {
    switch (validationStatus) {
      case "approved":
        return {
          icon: CheckCircleIcon,
          iconColor: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          title: "CV Verified ✓",
          message: "Your CV has been verified by our admin team.",
          warning: "⚠️ Important: If you make any changes to your CV, your verification status will be reset and you'll need to request validation again.",
          proceedText: "Continue Editing",
          proceedStyle: "bg-blue-600 hover:bg-blue-700 text-white"
        };
      case "pending":
        return {
          icon: ClockIcon,
          iconColor: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          title: "Validation Pending",
          message: "Your CV validation request is currently being reviewed by our admin team.",
          warning: "You can continue editing, but any changes will require re-validation.",
          proceedText: "Continue Editing",
          proceedStyle: "bg-blue-600 hover:bg-blue-700 text-white"
        };
      case "rejected":
        return {
          icon: ExclamationTriangleIcon,
          iconColor: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "Validation Rejected",
          message: "Your CV validation was rejected. Please review and improve your CV content.",
          warning: "Make necessary improvements and request validation again when ready.",
          proceedText: "Edit CV",
          proceedStyle: "bg-red-600 hover:bg-red-700 text-white"
        };
      default:
        return {
          icon: ClockIcon,
          iconColor: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          title: "No Validation Status",
          message: "Your CV hasn't been submitted for validation yet.",
          warning: "You can edit your CV and request validation when you're ready.",
          proceedText: "Start Editing",
          proceedStyle: "bg-blue-600 hover:bg-blue-700 text-white"
        };
    }
  };

  if (!isOpen) return null;

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-b px-6 py-4 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`${statusInfo.bgColor} p-2 rounded-full border ${statusInfo.borderColor}`}>
                <StatusIcon className={`h-6 w-6 ${statusInfo.iconColor}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {statusInfo.title}
                </h3>
                <p className="text-sm text-gray-600">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              {statusInfo.message}
            </p>
            
            <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-4`}>
              <p className="text-sm text-gray-700 font-medium">
                {statusInfo.warning}
              </p>
            </div>

            {validationStatus === "approved" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Consider downloading your verified CV before making changes to preserve the validated version.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Go Back
          </button>
          <button
            onClick={onProceed}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${statusInfo.proceedStyle}`}
          >
            {statusInfo.proceedText}
          </button>
        </div>
      </div>
    </div>
  );
}
