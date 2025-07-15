import React from "react";

const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
  "Freelance",
  "Temporary",
  "Seasonal"
];

export default function WorkExperienceSection({ data, onChange, onAdd, onRemove }) {
  const handleAchievementChange = (expIdx, achIdx, value) => {
    const newData = [...data];
    newData[expIdx].achievements[achIdx] = value;
    onChange(newData);
  };
  const handleAddAchievement = (expIdx) => {
    const newData = [...data];
    newData[expIdx].achievements = [...(newData[expIdx].achievements || []), ""];
    onChange(newData);
  };
  const handleRemoveAchievement = (expIdx, achIdx) => {
    const newData = [...data];
    newData[expIdx].achievements.splice(achIdx, 1);
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-lexend mb-4">Work Experience</h2>
      {data && data.length > 0 ? (
        data.map((exp, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-6 mb-4 relative bg-white shadow-sm">
            <button
              type="button"
              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              onClick={() => onRemove(idx)}
              aria-label="Remove Work Experience"
            >
              &#128465;
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Time To Program Studios"
                  value={exp.company || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...exp, company: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Senior UI Designer"
                  value={exp.role || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...exp, role: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. London, UK"
                  value={exp.location || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...exp, location: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Employment Type</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={exp.employmentType || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...exp, employmentType: e.target.value };
                    onChange(newData);
                  }}
                >
                  <option value="">Select type</option>
                  {EMPLOYMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="month"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={exp.startDate || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...exp, startDate: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="month"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={exp.endDate || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...exp, endDate: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Achievements / Responsibilities</label>
              <ul className="space-y-2">
                {(exp.achievements || []).map((ach, achIdx) => (
                  <li key={achIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                      placeholder="e.g. Led a team of 5 designers"
                      value={ach}
                      onChange={e => handleAchievementChange(idx, achIdx, e.target.value)}
                    />
                    <button type="button" className="text-red-500 hover:text-red-700" onClick={() => handleRemoveAchievement(idx, achIdx)}>&#128465;</button>
                  </li>
                ))}
              </ul>
              <button type="button" className="mt-2 px-4 py-1 rounded bg-green-100 text-green-700 font-semibold" onClick={() => handleAddAchievement(idx)}>+ Add Achievement</button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-400 italic">No work experience added yet.</div>
      )}
      <button
        type="button"
        className="mt-2 px-5 py-2 rounded-lg bg-green-500 text-white font-bold font-dmsans hover:bg-green-600 transition"
        onClick={onAdd}
      >
        + Add Work Experience
      </button>
    </div>
  );
} 