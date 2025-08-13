import React from "react";

export default function InterestsSection({ data, onChange, onAdd, onRemove }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-lexend mb-4">Interests</h2>
      {data && data.length > 0 ? (
        data.map((interest, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-4 mb-4 relative bg-white shadow-sm flex items-center">
            <button
              type="button"
              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              onClick={() => onRemove(idx)}
              aria-label="Remove Interest"
            >
              &#128465;
            </button>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. Reading"
              value={interest.value || ""}
              onChange={e => {
                const newData = [...data];
                newData[idx] = { ...interest, value: e.target.value };
                onChange(newData);
              }}
            />
          </div>
        ))
      ) : (
        <div className="text-gray-400 italic">No interests added yet.</div>
      )}
      <button
        type="button"
        className="mt-2 px-5 py-2 rounded-lg bg-green-500 text-white font-bold font-dmsans hover:bg-green-600 transition"
        onClick={onAdd}
      >
        + Add Interest
      </button>
    </div>
  );
} 