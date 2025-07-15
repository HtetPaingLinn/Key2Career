import React from "react";

export default function JobAppliedSection({ data, onChange }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-lexend mb-4">Job Applied For</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Job Title / Position</label>
        <input
          type="text"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="e.g. UI/UX Designer, Software Engineer, Data Analyst"
          value={data || ""}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  );
} 