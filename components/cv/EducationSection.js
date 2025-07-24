import React, { useState } from "react";

export default function EducationSection({ data, onChange, onAdd, onRemove }) {
  // State for AI/grammar per education entry
  const [aiPromptIdx, setAiPromptIdx] = useState(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState("");
  const [aiPreviewIdx, setAiPreviewIdx] = useState(null);
  const [aiError, setAiError] = useState("");
  const [grammarIdx, setGrammarIdx] = useState(null);
  const [grammarPreview, setGrammarPreview] = useState("");
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarError, setGrammarError] = useState("");

  function cleanAIResponse(text) {
    if (!text) return '';
    return text.replace(/^Here is a professional description for the specified field:?\s*/i, '').replace(/^"|"$/g, '').trim();
  }
  function buildContext(obj) {
    return Object.entries(obj)
      .filter(([key, val]) => key !== 'description' && val && typeof val === 'string' && val.trim() !== '')
      .map(([key, val]) => `${key[0].toUpperCase() + key.slice(1)}: ${val}`)
      .join(', ');
  }
  const handleGenerate = async (idx, prompt, currentText) => {
    setAiLoading(true); setAiError("");
    try {
      let fullPrompt = prompt;
      if (currentText) fullPrompt += `\n\nCurrent description: ${currentText}`;
      const context = buildContext(data[idx]);
      const res = await fetch('/api/groq', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'description', prompt: fullPrompt, context })
      });
      const d = await res.json();
      if (!res.ok || !d.result) throw new Error(d.error || 'AI error');
      setAiPreview(cleanAIResponse(d.result));
      setAiPreviewIdx(idx);
      setAiPromptIdx(null);
      setAiPrompt("");
    } catch (e) { setAiError('AI error. Try again.'); }
    setAiLoading(false);
  };
  const handleGrammarCheck = async (idx, text) => {
    setGrammarLoading(true); setGrammarError("");
    try {
      const res = await fetch('/api/groq', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'grammar', text })
      });
      const d = await res.json();
      if (!res.ok || !d.result) throw new Error(d.error || 'AI error');
      setGrammarPreview(d.result);
      setGrammarIdx(idx);
    } catch (e) { setGrammarError('AI error. Try again.'); }
    setGrammarLoading(false);
  };
  const handleAcceptAIPreview = (idx) => {
    const newData = [...data];
    newData[idx].description = aiPreview;
    onChange(newData);
    setAiPreview('');
    setAiPreviewIdx(null);
  };
  const handleRejectAIPreview = () => {
    setAiPreview('');
    setAiPreviewIdx(null);
  };
  const handleAcceptGrammar = (idx) => {
    const newData = [...data];
    newData[idx].description = grammarPreview;
    onChange(newData);
    setGrammarIdx(null);
    setGrammarPreview('');
  };
  const handleRejectGrammar = () => {
    setGrammarIdx(null);
    setGrammarPreview('');
  };

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
              <div className="flex gap-2 mt-2">
                <button type="button" className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200" onClick={() => setAiPromptIdx(aiPromptIdx === idx ? null : idx)} disabled={aiLoading}>✨ Generate with AI</button>
                <button type="button" className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200" onClick={() => handleGrammarCheck(idx, edu.description)} disabled={grammarLoading}>📝 Check Grammar</button>
              </div>
              {aiPromptIdx === idx && (
                <div className="mt-2 flex flex-col gap-2">
                  <input type="text" className="w-full rounded border border-gray-300 px-2 py-1 text-xs" placeholder="Describe what you want to generate (e.g. 'Summary of my degree')" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                  <button type="button" className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleGenerate(idx, aiPrompt, edu.description)} disabled={aiLoading || !aiPrompt}>{aiLoading ? 'Generating...' : 'Generate'}</button>
                  {aiError && <div className="text-red-500 text-xs mt-1">{aiError}</div>}
                </div>
              )}
              {aiPreviewIdx === idx && (
                <div className="mt-2 bg-gray-50 border border-emerald-200 rounded p-2 text-xs">
                  <div className="mb-1 font-semibold text-emerald-700">AI Suggestion:</div>
                  <div className="mb-2 whitespace-pre-line">{aiPreview}</div>
                  <div className="flex gap-2">
                    <button type="button" className="px-2 py-1 rounded bg-emerald-600 text-white text-xs" onClick={() => handleAcceptAIPreview(idx)}>Accept</button>
                    <button type="button" className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs" onClick={handleRejectAIPreview}>Reject</button>
                  </div>
                </div>
              )}
              {grammarIdx === idx && (
                <div className="mt-2 bg-gray-50 border border-blue-200 rounded p-2 text-xs">
                  <div className="mb-1 font-semibold text-blue-700">AI Suggestion:</div>
                  <div className="mb-2 whitespace-pre-line">{grammarPreview}</div>
                  <div className="flex gap-2">
                    <button type="button" className="px-2 py-1 rounded bg-blue-600 text-white text-xs" onClick={() => handleAcceptGrammar(idx)}>Accept</button>
                    <button type="button" className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs" onClick={handleRejectGrammar}>Reject</button>
                  </div>
                  {grammarError && <div className="text-red-500 text-xs mt-1">{grammarError}</div>}
                </div>
              )}
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