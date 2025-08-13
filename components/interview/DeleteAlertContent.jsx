import React from 'react'

const DeleteAlertContent = ({content, onDelete, onClose}) => {
  return (
    <div className="p-3 text-center">
      <div className="mb-3">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Delete Session?</h3>
        <p className="text-gray-600 text-xs leading-tight max-w-xs mx-auto">{content}</p>
      </div>

      <div className="flex justify-center gap-2">
        <button
          type="button"
          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-medium transition-colors"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default DeleteAlertContent;
