import React, { useState } from "react";

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
  // State for AI/grammar per work experience entry (for achievements)
  const [aiPromptIdx, setAiPromptIdx] = useState({ exp: null, ach: null });
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState("");
  const [aiPreviewIdx, setAiPreviewIdx] = useState({ exp: null, ach: null });
  const [aiError, setAiError] = useState("");
  const [grammarIdx, setGrammarIdx] = useState({ exp: null, ach: null });
  const [grammarPreview, setGrammarPreview] = useState("");
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarError, setGrammarError] = useState("");

  function cleanAIResponse(text) {
    if (!text) return '';
    return text.replace(/^Here is a professional description for the specified field:?\s*/i, '').replace(/^"|"$/g, '').trim();
  }
  function buildContext(obj) {
    return Object.entries(obj)
      .filter(([key, val]) => key !== 'achievements' && val && typeof val === 'string' && val.trim() !== '')
      .map(([key, val]) => `${key[0].toUpperCase() + key.slice(1)}: ${val}`)
      .join(', ');
  }
  const handleGenerate = async (expIdx, achIdx, prompt, currentText) => {
    setAiLoading(true); setAiError("");
    try {
      let fullPrompt = prompt;
      if (currentText) fullPrompt += `\n\nCurrent achievement: ${currentText}`;
      const context = buildContext(data[expIdx]);
      const res = await fetch('/api/groq', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'description', prompt: fullPrompt, context })
      });
      const d = await res.json();
      if (!res.ok || !d.result) throw new Error(d.error || 'AI error');
      setAiPreview(cleanAIResponse(d.result));
      setAiPreviewIdx({ exp: expIdx, ach: achIdx });
      setAiPromptIdx({ exp: null, ach: null });
      setAiPrompt("");
    } catch (e) { setAiError('AI error. Try again.'); }
    setAiLoading(false);
  };
  const handleGrammarCheck = async (expIdx, achIdx, text) => {
    setGrammarLoading(true); setGrammarError("");
    try {
      const res = await fetch('/api/groq', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'grammar', text })
      });
      const d = await res.json();
      if (!res.ok || !d.result) throw new Error(d.error || 'AI error');
      setGrammarPreview(d.result);
      setGrammarIdx({ exp: expIdx, ach: achIdx });
    } catch (e) { setGrammarError('AI error. Try again.'); }
    setGrammarLoading(false);
  };
  const handleAcceptAIPreview = (expIdx, achIdx) => {
    const newData = [...data];
    newData[expIdx].achievements[achIdx] = aiPreview;
    onChange(newData);
    setAiPreview('');
    setAiPreviewIdx({ exp: null, ach: null });
  };
  const handleRejectAIPreview = () => {
    setAiPreview('');
    setAiPreviewIdx({ exp: null, ach: null });
  };
  const handleAcceptGrammar = (expIdx, achIdx) => {
    const newData = [...data];
    newData[expIdx].achievements[achIdx] = grammarPreview;
    onChange(newData);
    setGrammarIdx({ exp: null, ach: null });
    setGrammarPreview('');
  };
  const handleRejectGrammar = () => {
    setGrammarIdx({ exp: null, ach: null });
    setGrammarPreview('');
  };
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
                  <li key={achIdx} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
                        placeholder="e.g. Led a team of 5 designers"
                        value={ach}
                        onChange={e => handleAchievementChange(idx, achIdx, e.target.value)}
                      />
                      <button type="button" className="text-red-500 hover:text-red-700" onClick={() => handleRemoveAchievement(idx, achIdx)}>&#128465;</button>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button type="button" className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200" onClick={() => setAiPromptIdx(aiPromptIdx.exp === idx && aiPromptIdx.ach === achIdx ? { exp: null, ach: null } : { exp: idx, ach: achIdx })} disabled={aiLoading}>✨ Generate with AI</button>
                      <button type="button" className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200" onClick={() => handleGrammarCheck(idx, achIdx, ach)} disabled={grammarLoading}>📝 Check Grammar</button>
                    </div>
                    {aiPromptIdx.exp === idx && aiPromptIdx.ach === achIdx && (
                      <div className="mt-2 flex flex-col gap-2">
                        <input type="text" className="w-full rounded border border-gray-300 px-2 py-1 text-xs" placeholder="Describe what you want to generate (e.g. 'Achievement summary')" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                        <button type="button" className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleGenerate(idx, achIdx, aiPrompt, ach)} disabled={aiLoading || !aiPrompt}>{aiLoading ? 'Generating...' : 'Generate'}</button>
                        {aiError && <div className="text-red-500 text-xs mt-1">{aiError}</div>}
                      </div>
                    )}
                    {aiPreviewIdx.exp === idx && aiPreviewIdx.ach === achIdx && (
                      <div className="mt-2 bg-gray-50 border border-emerald-200 rounded p-2 text-xs">
                        <div className="mb-1 font-semibold text-emerald-700">AI Suggestion:</div>
                        <div className="mb-2 whitespace-pre-line">{aiPreview}</div>
                        <div className="flex gap-2">
                          <button type="button" className="px-2 py-1 rounded bg-emerald-600 text-white text-xs" onClick={() => handleAcceptAIPreview(idx, achIdx)}>Accept</button>
                          <button type="button" className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs" onClick={handleRejectAIPreview}>Reject</button>
                        </div>
                      </div>
                    )}
                    {grammarIdx.exp === idx && grammarIdx.ach === achIdx && (
                      <div className="mt-2 bg-gray-50 border border-blue-200 rounded p-2 text-xs">
                        <div className="mb-1 font-semibold text-blue-700">AI Suggestion:</div>
                        <div className="mb-2 whitespace-pre-line">{grammarPreview}</div>
                        <div className="flex gap-2">
                          <button type="button" className="px-2 py-1 rounded bg-blue-600 text-white text-xs" onClick={() => handleAcceptGrammar(idx, achIdx)}>Accept</button>
                          <button type="button" className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs" onClick={handleRejectGrammar}>Reject</button>
                        </div>
                        {grammarError && <div className="text-red-500 text-xs mt-1">{grammarError}</div>}
                      </div>
                    )}
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