import React from "react";

export default function CertificationsSection({ data, onChange, onAdd, onRemove }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-lexend mb-4">Certifications</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Certificate Title</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. UI UX Design Certificate"
                  value={cert.title || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...cert, title: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Issuer</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Time To Program"
                  value={cert.issuer || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...cert, issuer: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. 2024"
                  value={cert.year || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...cert, year: e.target.value };
                    onChange(newData);
                  }}
                />
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