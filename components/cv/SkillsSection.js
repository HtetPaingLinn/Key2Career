import React from "react";

export default function SkillsSection({ data, onChange, onAdd, onRemove }) {
  const { technical = [], soft = [] } = data || {};

  const handleProficiencyChange = (group, idx, value) => {
    const newData = { ...data };
    newData[group][idx] = { ...newData[group][idx], proficiency: value };
    onChange(newData);
  };

  const handleNameChange = (group, idx, value) => {
    const newData = { ...data };
    newData[group][idx] = { ...newData[group][idx], name: value };
    onChange(newData);
  };

  const handleAdd = (group) => {
    const newData = { ...data };
    newData[group] = [...(newData[group] || []), { name: "", proficiency: 0 }];
    onChange(newData);
  };

  const handleRemove = (group, idx) => {
    const newData = { ...data };
    newData[group] = newData[group].filter((_, i) => i !== idx);
    onChange(newData);
  };

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold font-lexend mb-4">Skills</h2>
      <div>
        <h3 className="text-lg font-semibold mb-2">Technical Skills</h3>
        {technical.length > 0 ? technical.map((skill, idx) => (
          <div key={idx} className="flex items-center gap-4 mb-3">
            <input
              type="text"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. JavaScript"
              value={skill.name || ""}
              onChange={e => handleNameChange("technical", idx, e.target.value)}
            />
            <div className="flex gap-1">
              {[1,2,3,4,5].map(val => (
                <button
                  key={val}
                  type="button"
                  className={`w-7 h-7 rounded-full border-2 ${skill.proficiency >= val ? 'bg-green-500 border-green-600' : 'bg-gray-200 border-gray-300'} transition`}
                  onClick={() => handleProficiencyChange("technical", idx, val)}
                  aria-label={`Set proficiency to ${val}`}
                />
              ))}
            </div>
            <button type="button" className="text-red-500 hover:text-red-700" onClick={() => handleRemove("technical", idx)}>&#128465;</button>
          </div>
        )) : <div className="text-gray-400 italic mb-2">No technical skills added yet.</div>}
        <button type="button" className="mt-2 px-5 py-2 rounded-lg bg-green-500 text-white font-bold font-dmsans hover:bg-green-600 transition" onClick={() => handleAdd("technical")}>+ Add Technical Skill</button>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Soft Skills</h3>
        {soft.length > 0 ? soft.map((skill, idx) => (
          <div key={idx} className="flex items-center gap-4 mb-3">
            <input
              type="text"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. Communication"
              value={skill.name || ""}
              onChange={e => handleNameChange("soft", idx, e.target.value)}
            />
            <div className="flex gap-1">
              {[1,2,3,4,5].map(val => (
                <button
                  key={val}
                  type="button"
                  className={`w-7 h-7 rounded-full border-2 ${skill.proficiency >= val ? 'bg-green-500 border-green-600' : 'bg-gray-200 border-gray-300'} transition`}
                  onClick={() => handleProficiencyChange("soft", idx, val)}
                  aria-label={`Set proficiency to ${val}`}
                />
              ))}
            </div>
            <button type="button" className="text-red-500 hover:text-red-700" onClick={() => handleRemove("soft", idx)}>&#128465;</button>
          </div>
        )) : <div className="text-gray-400 italic mb-2">No soft skills added yet.</div>}
        <button type="button" className="mt-2 px-5 py-2 rounded-lg bg-green-500 text-white font-bold font-dmsans hover:bg-green-600 transition" onClick={() => handleAdd("soft")}>+ Add Soft Skill</button>
      </div>
    </div>
  );
} 