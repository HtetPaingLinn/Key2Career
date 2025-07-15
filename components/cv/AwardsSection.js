import React from "react";

export default function AwardsSection({ data, onChange, onAdd, onRemove }) {
  const handleChange = (idx, field, value) => {
    const newData = [...data];
    newData[idx] = { ...newData[idx], [field]: value };
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-lexend mb-4">Awards & Honors</h2>
      {data && data.length > 0 ? (
        data.map((award, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-6 mb-4 relative bg-white shadow-sm">
            <button
              type="button"
              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              onClick={() => onRemove(idx)}
              aria-label="Remove Award"
            >
              &#128465;
            </button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Award Title</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Dean's List"
                  value={award.title || ""}
                  onChange={e => handleChange(idx, "title", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Issuer</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. XYZ University"
                  value={award.issuer || ""}
                  onChange={e => handleChange(idx, "issuer", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. 2023"
                  value={award.year || ""}
                  onChange={e => handleChange(idx, "year", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[60px]"
                placeholder="Describe the award, criteria, or context."
                value={award.description || ""}
                onChange={e => handleChange(idx, "description", e.target.value)}
              />
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-400 italic">No awards added yet.</div>
      )}
      <button
        type="button"
        className="mt-2 px-5 py-2 rounded-lg bg-green-500 text-white font-bold font-dmsans hover:bg-green-600 transition"
        onClick={onAdd}
      >
        + Add Award
      </button>
    </div>
  );
} 