import React from "react";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function LanguagesSection({ data, onChange, onAdd, onRemove }) {
  const handleProficiencyChange = (idx, value) => {
    const newData = [...data];
    newData[idx] = { ...newData[idx], proficiency: value };
    onChange(newData);
  };

  const handleChange = (idx, field, value) => {
    const newData = [...data];
    newData[idx] = { ...newData[idx], [field]: value };
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-lexend mb-4">Languages</h2>
      {data && data.length > 0 ? (
        data.map((lang, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-6 mb-4 relative bg-white shadow-sm flex flex-col md:flex-row md:items-center md:gap-6">
            <button
              type="button"
              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              onClick={() => onRemove(idx)}
              aria-label="Remove Language"
            >
              &#128465;
            </button>
            <div className="flex-1 mb-4 md:mb-0">
              <label className="block text-sm font-medium mb-1">Language</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="e.g. English"
                value={lang.language || lang.name || ""}
                onChange={e => {
                  const value = e.target.value;
                  handleChange(idx, "language", value);
                  handleChange(idx, "name", value); // Also update name field for MongoDB compatibility
                }}
              />
            </div>
            <div className="flex flex-col items-start md:items-center">
              <label className="block text-sm font-medium mb-1">Proficiency (0/5)</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(val => (
                  <button
                    key={val}
                    type="button"
                    className={`w-7 h-7 rounded-full border-2 ${lang.proficiency >= val ? 'bg-green-500 border-green-600' : 'bg-gray-200 border-gray-300'} transition`}
                    onClick={() => handleProficiencyChange(idx, val)}
                    aria-label={`Set proficiency to ${val}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex-1 mb-4 md:mb-0">
              <label className="block text-sm font-medium mb-1">CEFR Level</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                value={lang.cefr || ""}
                onChange={e => handleChange(idx, "cefr", e.target.value)}
              >
                <option value="">Select level</option>
                {CEFR_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 mb-4 md:mb-0">
              <label className="block text-sm font-medium mb-1">Certificate</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="e.g. IELTS, TOEFL"
                value={lang.certificate || ""}
                onChange={e => handleChange(idx, "certificate", e.target.value)}
              />
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-400 italic">No languages added yet.</div>
      )}
      <button
        type="button"
        className="mt-2 px-5 py-2 rounded-lg bg-green-500 text-white font-bold font-dmsans hover:bg-green-600 transition"
        onClick={onAdd}
      >
        + Add Language
      </button>
    </div>
  );
} 