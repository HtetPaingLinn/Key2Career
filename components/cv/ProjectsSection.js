import React from "react";

export default function ProjectsSection({ data, onChange, onAdd, onRemove }) {
  const handleChange = (idx, field, value) => {
    const newData = [...data];
    newData[idx] = { ...newData[idx], [field]: value };
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-lexend mb-4">Projects</h2>
      {data && data.length > 0 ? (
        data.map((project, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-6 mb-4 relative bg-white shadow-sm">
            <button
              type="button"
              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              onClick={() => onRemove(idx)}
              aria-label="Remove Project"
            >
              &#128465;
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Project Title</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Portfolio Website"
                  value={project.title || ""}
                  onChange={e => handleChange(idx, "title", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Lead Developer"
                  value={project.role || ""}
                  onChange={e => handleChange(idx, "role", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. Jan 2022 - May 2022"
                  value={project.duration || ""}
                  onChange={e => handleChange(idx, "duration", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Technologies Used</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="e.g. React, Node.js, MongoDB"
                  value={project.technologies || ""}
                  onChange={e => handleChange(idx, "technologies", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GitHub Link</label>
                <input
                  type="url"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="https://github.com/username/project"
                  value={project.github || ""}
                  onChange={e => handleChange(idx, "github", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Live Demo URL</label>
                <input
                  type="url"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="https://yourproject.live"
                  value={project.demo || ""}
                  onChange={e => handleChange(idx, "demo", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[60px]"
                placeholder="Short description about the project"
                value={project.description || ""}
                onChange={e => handleChange(idx, "description", e.target.value)}
              />
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-400 italic">No projects added yet.</div>
      )}
      <button
        type="button"
        className="mt-2 px-5 py-2 rounded-lg bg-green-500 text-white font-bold font-dmsans hover:bg-green-600 transition"
        onClick={onAdd}
      >
        + Add Project
      </button>
    </div>
  );
} 