import React from "react";

export default function VolunteerSection({ data, onChange, onAdd, onRemove }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-lexend mb-4">Volunteer Experience</h2>
      {data && data.length > 0 ? (
        data.map((vol, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-6 mb-4 relative bg-white shadow-sm">
            <button
              type="button"
              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              onClick={() => onRemove(idx)}
              aria-label="Remove Volunteer Experience"
            >
              &#128465;
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Organization</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Red Cross"
                  value={vol.organization || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...vol, organization: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Volunteer Coordinator"
                  value={vol.role || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...vol, role: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="month"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={vol.startDate || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...vol, startDate: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="month"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={vol.endDate || ""}
                  onChange={e => {
                    const newData = [...data];
                    newData[idx] = { ...vol, endDate: e.target.value };
                    onChange(newData);
                  }}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[60px]"
                placeholder="Describe your volunteer work and impact."
                value={vol.description || ""}
                onChange={e => {
                  const newData = [...data];
                  newData[idx] = { ...vol, description: e.target.value };
                  onChange(newData);
                }}
              />
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-400 italic">No volunteer experience added yet.</div>
      )}
      <button
        type="button"
        className="mt-2 px-5 py-2 rounded-lg bg-green-500 text-white font-bold font-dmsans hover:bg-green-600 transition"
        onClick={onAdd}
      >
        + Add Volunteer Experience
      </button>
    </div>
  );
} 