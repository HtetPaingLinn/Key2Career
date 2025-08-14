import React from 'react';

const DeleteAlertContent = ({
  title = "Delete Session?",
  content = "Are you sure you want to delete this item?",
  confirmText = "Delete",
  cancelText = "Cancel",
  warningText = "",
  showWarning = true,
  icon = "trash",
  variant = "danger", // danger, warning, info
  size = "default", // small, default, large
  onDelete,
  onClose,
  isLoading = false,
  disabled = false
}) => {
  // Icon configurations
  const getIcon = () => {
    switch (icon) {
      case "trash":
        return (
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case "info":
        return (
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
    }
  };

  // Variant configurations
  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          iconBg: "from-amber-50 to-amber-100",
          iconBorder: "border-amber-200/50",
          iconColor: "text-amber-500",
          confirmBg: "from-amber-500 to-amber-600",
          confirmHover: "hover:from-amber-600 hover:to-amber-700",
          warningBg: "bg-amber-50",
          warningBorder: "border-amber-200",
          warningText: "text-amber-700"
        };
      case "info":
        return {
          iconBg: "from-blue-50 to-blue-100",
          iconBorder: "border-blue-200/50",
          iconColor: "text-blue-500",
          confirmBg: "from-blue-500 to-blue-600",
          confirmHover: "hover:from-blue-600 hover:to-blue-700",
          warningBg: "bg-blue-50",
          warningBorder: "border-blue-200",
          warningText: "text-blue-700"
        };
      case "danger":
      default:
        return {
          iconBg: "from-red-50 to-red-100",
          iconBorder: "border-red-200/50",
          iconColor: "text-red-500",
          confirmBg: "from-red-500 to-red-600",
          confirmHover: "hover:from-red-600 hover:to-red-700",
          warningBg: "bg-amber-50",
          warningBorder: "border-amber-200",
          warningText: "text-amber-700"
        };
    }
  };

  // Size configurations
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          container: "p-4 max-w-xs",
          icon: "w-12 h-12",
          iconInner: "w-6 h-6",
          title: "text-lg",
          content: "text-xs",
          button: "px-4 py-2 text-xs",
          warning: "p-2 text-xs"
        };
      case "large":
        return {
          container: "p-8 max-w-md",
          icon: "w-20 h-20",
          iconInner: "w-10 h-10",
          title: "text-2xl",
          content: "text-base",
          button: "px-8 py-4 text-base",
          warning: "p-4 text-sm"
        };
      default:
        return {
          container: "p-6 max-w-sm",
          icon: "w-16 h-16",
          iconInner: "w-8 h-8",
          title: "text-xl",
          content: "text-sm",
          button: "px-6 py-3 text-sm",
          warning: "p-3 text-xs"
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <div className={`${sizeStyles.container} text-center mx-auto`}>
      {/* Icon and Header Section */}
      <div className="mb-6">
        <div className={`${sizeStyles.icon} bg-gradient-to-br ${variantStyles.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border ${variantStyles.iconBorder}`}>
          <div className={variantStyles.iconColor}>
            {getIcon()}
          </div>
        </div>
        
        <h3 className={`${sizeStyles.title} font-bold text-gray-900 mb-2 tracking-tight`}>
          {title}
        </h3>
        
        <p className={`${sizeStyles.content} text-gray-600 leading-relaxed max-w-xs mx-auto font-medium`}>
          {content}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
        <button
          type="button"
          className={`${sizeStyles.button} bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 hover:shadow-md active:scale-95 border border-gray-200 flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={onClose}
          disabled={disabled || isLoading}
        >
          {cancelText}
        </button>
        
        <button
          type="button"
          className={`${sizeStyles.button} bg-gradient-to-r ${variantStyles.confirmBg} ${variantStyles.confirmHover} text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg active:scale-95 shadow-md flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={onDelete}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            confirmText
          )}
        </button>
      </div>
      
      {/* Warning Note */}
      {showWarning && warningText && (
        <div className={`${sizeStyles.warning} ${variantStyles.warningBg} border ${variantStyles.warningBorder} rounded-lg`}>
          <p className={`${variantStyles.warningText} font-medium flex items-center justify-center gap-1`}>
            <span>⚠️</span>
            {warningText}
          </p>
        </div>
      )}
    </div>
  );
};

export default DeleteAlertContent;
