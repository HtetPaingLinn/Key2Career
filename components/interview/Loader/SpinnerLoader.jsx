import React from "react";

const SpinnerLoader = ({ size = "md", color = "blue" }) => {
  const getSizeClasses = (size) => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-8 h-8";
      case "xl":
        return "w-12 h-12";
      default:
        return "w-6 h-6";
    }
  };

  const getColorClasses = (color) => {
    switch (color) {
      case "white":
        return "border-white border-t-transparent";
      case "gray":
        return "border-gray-300 border-t-gray-600";
      case "green":
        return "border-green-300 border-t-green-600";
      case "red":
        return "border-red-300 border-t-red-600";
      default:
        return "border-blue-300 border-t-blue-600";
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${getSizeClasses(size)} ${getColorClasses(color)} border-2 rounded-full animate-spin`}
      />
    </div>
  );
};

export default SpinnerLoader;

