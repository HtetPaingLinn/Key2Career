import React from "react";

export default function EducationSection({ data, onChange, onAdd, onRemove }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-lexend mb-4">Education</h2>
      {data && data.length > 0 ? (
        data.map((edu, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-6 mb-4 relative bg-white shadow-sm">
            <button
              type="button"
              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              onClick={() => onRemove(idx)}
              aria-label="Remove Education"
            >
              &#128465;
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Degree</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Bachelor of Science in Computer Science"
                  value={edu.degree || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...edu, degree: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Institution</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. XYZ University"
                  value={edu.institution || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...edu, institution: e.target.value };
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
                  value={edu.location || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...edu, location: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Field of Study</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Computer Science"
                  value={edu.fieldOfStudy || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...edu, fieldOfStudy: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Grade / GPA</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. 3.8/4.0"
                  value={edu.grade || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...edu, grade: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="month"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={edu.startDate || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...edu, startDate: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="month"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={edu.endDate || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...edu, endDate: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[60px]"
                placeholder="Describe your studies, thesis, or relevant coursework."
                value={edu.description || ""}
                onChange={e => {
                  const newData = [...data];
                  newData[idx] = { ...edu, description: e.target.value };
                  onChange(newData);
                }}
              />
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-400 italic">No education added yet.</div>
      )}
      <button
        type="button"
        className="mt-2 px-5 py-2 rounded-lg bg-green-500 text-white font-bold font-dmsans hover:bg-green-600 transition"
        onClick={onAdd}
      >
        + Add Education
      </button>
    </div>
  );
} 