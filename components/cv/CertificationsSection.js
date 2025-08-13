import React from "react";

export default function CertificationsSection({ data, onChange, onAdd, onRemove }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-lexend mb-4">Licenses & Certifications</h2>
      {data && data.length > 0 ? (
        data.map((cert, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-6 mb-4 relative bg-white shadow-sm">
            <button
              type="button"
              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              onClick={() => onRemove(idx)}
              aria-label="Remove Certification"
            >
              &#128465;
            </button>
            
            {/* Main Certification Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Certificate Title *</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. CCNA: Introduction to Networks"
                  value={cert.title || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...cert, title: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Issuing Organization *</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Cisco, Microsoft, Google"
                  value={cert.subtitle || cert.issuer || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...cert, subtitle: e.target.value, issuer: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Issue Date</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. May 2024"
                  value={cert.date || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...cert, date: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
            </div>

            {/* Credential Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Credential ID</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. 5KZ P6W FJZ"
                  value={cert.credential_id || cert.credentialId || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...cert, credential_id: e.target.value, credentialId: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Nov 2025"
                  value={cert.expiryDate || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...cert, expiryDate: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
            </div>

            {/* URLs and Meta Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Credential URL</label>
                <input
                  type="url"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="https://www.credly.com/badges/... or https://www.linkedin.com/learning/certificates/..."
                  value={cert.credential_url || cert.credentialUrl || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...cert, credential_url: e.target.value, credentialUrl: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Meta Information</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Issued May 2024 See credential, Issued Nov 2022 Expires Nov 2025 See credential"
                  value={cert.meta || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...cert, meta: e.target.value };
                    onChange(newData);
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">This field automatically combines issue date, expiry date, and credential information</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[80px]"
                placeholder="Describe the certification, skills covered, learning outcomes, or additional details about this credential."
                value={cert.description || ""}
                onChange={e => {
                  const newData = [...data];
                  newData[idx] = { ...cert, description: e.target.value };
                  onChange(newData);
                }}
              />
            </div>

            {/* Additional Fields for LinkedIn Compatibility */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Additional LinkedIn Fields (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Category</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="e.g. Technology, Business, Marketing"
                    value={cert.category || ""}
                    onChange={e => {
                      const newData = [...data];
                      newData[idx] = { ...cert, category: e.target.value };
                      onChange(newData);
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1">Recognition Type</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="e.g. Certification, License, Badge"
                    value={cert.recognitionType || ""}
                    onChange={e => {
                      const newData = [...data];
                      newData[idx] = { ...cert, recognitionType: e.target.value };
                      onChange(newData);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-400 italic">No certifications added yet.</div>
      )}
      <button
        type="button"
        className="mt-2 px-5 py-2 rounded-lg bg-green-500 text-white font-bold font-dmsans hover:bg-green-600 transition"
        onClick={onAdd}
      >
        + Add Certification
      </button>
    </div>
  );
} 