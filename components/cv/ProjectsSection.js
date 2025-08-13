import React, { useState } from "react";
// REMOVE: import { generateDescription, checkGrammar } from '../../lib/groq';

export default function ProjectsSection({ data, onChange, onAdd, onRemove, onMove }) {
  const [aiPromptIdx, setAiPromptIdx] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [grammarIdx, setGrammarIdx] = useState(null);
  const [grammarPreview, setGrammarPreview] = useState('');
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarError, setGrammarError] = useState('');
  const [aiPreview, setAiPreview] = useState('');
  const [aiPreviewIdx, setAiPreviewIdx] = useState(null);
  const [aiError, setAiError] = useState('');

  // Utility to clean up AI response
  function cleanAIResponse(text) {
    if (!text) return '';
    // Remove common boilerplate/prefixes
    return text.replace(/^Here is a professional description for the specified field:?\s*/i, '')
               .replace(/^"|"$/g, '') // Remove leading/trailing quotes
               .trim();
  }

  const handleChange = (idx, field, value) => {
    const newData = [...data];
    newData[idx] = { ...newData[idx], [field]: value };
    onChange(newData);
  };

  const handleGenerate = async (idx, context, currentText) => {
    setAiLoading(true);
    setAiError('');
    try {
      let prompt = aiPrompt;
      if (currentText) {
        prompt += `\n\nCurrent description: ${currentText}`;
      }
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'description', prompt, context }),
      });
      const data = await res.json();
      if (!res.ok || !data.result) throw new Error(data.error || 'AI error');
      setAiPreview(cleanAIResponse(data.result));
      setAiPreviewIdx(idx);
      setAiPromptIdx(null);
      setAiPrompt('');
    } catch (e) {
      setAiError('AI error. Try again.');
    }
    setAiLoading(false);
  };

  const handleGrammarCheck = async (idx, text) => {
    setGrammarLoading(true);
    setGrammarError('');
    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'grammar', text }),
      });
      const data = await res.json();
      if (!res.ok || !data.result) throw new Error(data.error || 'AI error');
      setGrammarPreview(data.result);
      setGrammarIdx(idx);
    } catch (e) {
      setGrammarError('AI error. Try again.');
    }
    setGrammarLoading(false);
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
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[80px]"
                placeholder="Describe your project, your role, and the impact."
                value={project.description || ''}
                onChange={e => {
                  const newData = [...data];
                  newData[idx] = { ...project, description: e.target.value };
                  onChange(newData);
                }}
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200"
                  onClick={() => setAiPromptIdx(aiPromptIdx === idx ? null : idx)}
                  disabled={aiLoading}
                >
                  ✨ Generate with AI
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200"
                  onClick={() => handleGrammarCheck(idx, project.description)}
                  disabled={grammarLoading}
                >
                  📝 Check Grammar
                </button>
              </div>
              {/* AI Prompt Input */}
              {aiPromptIdx === idx && (
                <div className="mt-2 flex flex-col gap-2">
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                    placeholder="Describe what you want to generate (e.g. 'Concise, professional summary for a web app project')"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                  />
                  <button
                    type="button"
                    className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={() => handleGenerate(idx, `Project: ${project.title}, Role: ${project.role}, Technologies: ${project.technologies}`, project.description)}
                    disabled={aiLoading || !aiPrompt}
                  >
                    {aiLoading ? 'Generating...' : 'Generate'}
                  </button>
                  {aiError && <div className="text-red-500 text-xs mt-1">{aiError}</div>}
                </div>
              )}
              {/* AI Preview */}
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
              {/* Grammar Preview */}
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