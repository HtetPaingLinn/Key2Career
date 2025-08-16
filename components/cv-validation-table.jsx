"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import CVPreview from "@/components/CVPreview";

export function CVValidationTable({ initialData, onStatusUpdate }) {
  const [data, setData] = useState(initialData);
  const [selectedCV, setSelectedCV] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePreview = (cv) => {
    setSelectedCV(cv);
    setShowPreviewModal(true);
  };

  const handleStatusUpdate = async (email, newStatus) => {
    setIsUpdating(true);
    try {
      const jwt = localStorage.getItem("jwt");
      const response = await fetch("/api/admin/cv-validation-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ email, status: newStatus }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update local state
          setData(prevData => 
            prevData.map(cv => 
              cv.email === email 
                ? { ...cv, validationStatus: newStatus, validationApprovedAt: newStatus === 'approved' ? new Date() : null }
                : cv
            )
          );
          
          // Notify parent component
          if (onStatusUpdate) {
            onStatusUpdate(email, newStatus);
          }
        } else {
          alert(result.error || "Failed to update status");
        }
      } else {
        alert("Failed to update validation status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating validation status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">No Request</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">CV Validation Requests</h3>
          <p className="text-sm text-gray-600">Manage CV validation requests from users</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((cv, index) => (
                <tr key={cv._id || `${cv.email}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {cv.personalInfo?.imageUrl ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={cv.personalInfo.imageUrl}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {cv.personalInfo?.firstName?.[0] || cv.email[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {cv.personalInfo?.firstName && cv.personalInfo?.lastName
                            ? `${cv.personalInfo.firstName} ${cv.personalInfo.lastName}`
                            : "Unknown User"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {cv.jobApplied || "No job specified"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cv.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(cv.validationStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(cv.validationRequestedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(cv)}
                        className="flex items-center space-x-1"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>Preview</span>
                      </Button>
                      
                      {cv.validationStatus === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(cv.email, "approved")}
                            disabled={isUpdating}
                            className="flex items-center space-x-1 text-green-600 border-green-600 hover:bg-transparent"
                          >
                            <CheckIcon className="h-4 w-4" />
                            <span>Approve</span>
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(cv.email, "rejected")}
                            disabled={isUpdating}
                            className="flex items-center space-x-1 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XMarkIcon className="h-4 w-4" />
                            <span>Reject</span>
                          </Button>
                        </>
                      )}
                      
                      {cv.validationStatus === "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(cv.email, "rejected")}
                          disabled={isUpdating}
                          className="flex items-center space-x-1 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XMarkIcon className="h-4 w-4" />
                          <span>Revoke</span>
                        </Button>
                      )}
                      
                      {cv.validationStatus === "rejected" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(cv.email, "approved")}
                          disabled={isUpdating}
                          className="flex items-center space-x-1 text-green-600 border-green-600 hover:bg-transparent"
                        >
                          <CheckIcon className="h-4 w-4" />
                          <span>Approve</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No CV validation requests found.</p>
          </div>
        )}
      </div>

      {/* Side Drawer CV Preview */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={() => setShowPreviewModal(false)}
          />
          
          {/* Slide-in Panel */}
          <div className="ml-auto relative flex h-full w-full max-w-4xl transform transition-transform">
            <div className="flex h-full w-full flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {selectedCV?.personalInfo?.imageUrl ? (
                        <img
                          className="h-14 w-14 rounded-full border-2 border-gray-200 object-cover"
                          src={selectedCV.personalInfo.imageUrl}
                          alt="Profile"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                          <span className="text-xl font-bold text-gray-600">
                            {selectedCV?.personalInfo?.firstName?.[0] || selectedCV?.email[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedCV?.personalInfo?.firstName && selectedCV?.personalInfo?.lastName
                          ? `${selectedCV.personalInfo.firstName} ${selectedCV.personalInfo.lastName}`
                          : "CV Preview"}
                      </h2>
                      <p className="text-gray-600 text-sm">{selectedCV?.email}</p>
                      {selectedCV?.jobApplied && (
                        <p className="text-gray-500 text-sm mt-1">Applied for: {selectedCV.jobApplied}</p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="rounded-full p-2 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Status and Actions */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    {getStatusBadge(selectedCV?.validationStatus)}
                  </div>
                  
                  <div className="flex space-x-3">
                    {selectedCV?.validationStatus === "pending" && (
                      <>
                        <Button
                          onClick={() => {
                            handleStatusUpdate(selectedCV.email, "approved");
                            setShowPreviewModal(false);
                          }}
                          disabled={isUpdating}
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-transparent"
                        >
                          <CheckIcon className="h-4 w-4 mr-2" />
                          Approve CV
                        </Button>
                        <Button
                          onClick={() => {
                            handleStatusUpdate(selectedCV.email, "rejected");
                            setShowPreviewModal(false);
                          }}
                          disabled={isUpdating}
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <XMarkIcon className="h-4 w-4 mr-2" />
                          Reject CV
                        </Button>
                      </>
                    )}
                    {selectedCV?.validationStatus === "approved" && (
                      <Button
                        onClick={() => {
                          handleStatusUpdate(selectedCV.email, "rejected");
                          setShowPreviewModal(false);
                        }}
                        disabled={isUpdating}
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XMarkIcon className="h-4 w-4 mr-2" />
                        Revoke Approval
                      </Button>
                    )}
                    {selectedCV?.validationStatus === "rejected" && (
                      <Button
                        onClick={() => {
                          handleStatusUpdate(selectedCV.email, "approved");
                          setShowPreviewModal(false);
                        }}
                        disabled={isUpdating}
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-transparent"
                      >
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Approve CV
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* CV Content */}
              <div className="flex-1 overflow-y-auto bg-gray-50">
                <div className="p-6">
                  {selectedCV && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-6">
                        <CVPreview cvData={selectedCV} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
