import React, { useState } from "react";

export default function PersonalInfoSection({ data, onChange, twoColumnLayout }) {
  const [aiPromptField, setAiPromptField] = useState(null); // 'bio' or 'description'
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [grammarField, setGrammarField] = useState(null); // 'bio' or 'description'
  const [grammarPreview, setGrammarPreview] = useState('');
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarError, setGrammarError] = useState('');
  const [aiPreview, setAiPreview] = useState('');
  const [aiPreviewField, setAiPreviewField] = useState(null); // 'bio' or 'description'
  const [aiError, setAiError] = useState('');

  // Utility to clean up AI response
  function cleanAIResponse(text) {
    if (!text) return '';
    // Remove common boilerplate/prefixes
    return text.replace(/^Here is a professional description for the specified field:?\s*/i, '')
               .replace(/^"|"$/g, '') // Remove leading/trailing quotes
               .trim();
  }

  // Build context for AI generation
  function buildContext() {
    return `Name: ${data.firstName || ''} ${data.lastName || ''}, 
            Email: ${data.email || ''}, 
            Phone: ${data.phone || ''}, 
            Address: ${data.address || ''}, 
            Nationality: ${data.nationality || ''}, 
            LinkedIn: ${data.linkedin || ''}, 
            Website: ${data.website || ''}, 
            Driving License: ${data.drivingLicense || ''}`;
  }

  const handleGenerate = async (field, currentText) => {
    setAiLoading(true);
    setAiError('');
    try {
      let prompt = aiPrompt;
      if (currentText) {
        prompt += `\n\nCurrent ${field}: ${currentText}`;
      }
      const context = buildContext();
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'description', prompt, context }),
      });
      const result = await res.json();
      if (!res.ok || !result.result) throw new Error(result.error || 'AI error');
      setAiPreview(cleanAIResponse(result.result));
      setAiPreviewField(field);
      setAiPromptField(null);
      setAiPrompt('');
    } catch (e) {
      setAiError('AI error. Try again.');
    }
    setAiLoading(false);
  };

  const handleGrammarCheck = async (field, text) => {
    setGrammarLoading(true);
    setGrammarError('');
    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'grammar', text }),
      });
      const result = await res.json();
      if (!res.ok || !result.result) throw new Error(result.error || 'AI error');
      setGrammarPreview(result.result);
      setGrammarField(field);
    } catch (e) {
      setGrammarError('AI error. Try again.');
    }
    setGrammarLoading(false);
  };

  const handleAcceptAIPreview = (field) => {
    onChange({ ...data, [field]: aiPreview });
    setAiPreview('');
    setAiPreviewField(null);
  };

  const handleRejectAIPreview = () => {
    setAiPreview('');
    setAiPreviewField(null);
  };

  const handleAcceptGrammar = (field) => {
    onChange({ ...data, [field]: grammarPreview });
    setGrammarField(null);
    setGrammarPreview('');
  };

  const handleRejectGrammar = () => {
    setGrammarField(null);
    setGrammarPreview('');
  };

  return (
    <div className="space-y-4 text-sm">
      <h2 className="text-lg font-bold font-lexend mb-2">Personal Information</h2>
      <div className={`grid ${twoColumnLayout ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
        <div>
          <label className="block text-xs font-medium mb-1">First Name</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. John"
            value={data.firstName || ""}
            onChange={e => onChange({ ...data, firstName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Last Name</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. Doe"
            value={data.lastName || ""}
            onChange={e => onChange({ ...data, lastName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. john.doe@email.com"
            value={data.email || ""}
            onChange={e => onChange({ ...data, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Phone</label>
          <input
            type="tel"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. +1234567890"
            value={data.phone || ""}
            onChange={e => onChange({ ...data, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Address</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. 123 Main St, City, Country"
            value={data.address || ""}
            onChange={e => onChange({ ...data, address: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Date of Birth</label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            value={data.dateOfBirth || ""}
            onChange={e => onChange({ ...data, dateOfBirth: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Nationality</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. American"
            value={data.nationality || ""}
            onChange={e => onChange({ ...data, nationality: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">LinkedIn</label>
          <input
            type="url"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. linkedin.com/in/username"
            value={data.linkedin || ""}
            onChange={e => onChange({ ...data, linkedin: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Website</label>
          <input
            type="url"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. johndoe.com"
            value={data.website || ""}
            onChange={e => onChange({ ...data, website: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Driving License</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. B, C1, D"
            value={data.drivingLicense || ""}
            onChange={e => onChange({ ...data, drivingLicense: e.target.value })}
          />
        </div>
      </div>
      
      {/* Bio Field with AI Features */}
      <div>
        <label className="block text-xs font-medium mb-1">Bio</label>
        <input
          type="text"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Short headline (e.g. UI/UX Designer)"
          value={data.bio || ""}
          onChange={e => onChange({ ...data, bio: e.target.value })}
        />
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200"
            onClick={() => setAiPromptField(aiPromptField === 'bio' ? null : 'bio')}
            disabled={aiLoading}
          >
            ✨ Generate with AI
          </button>
          <button
            type="button"
            className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200"
            onClick={() => handleGrammarCheck('bio', data.bio)}
            disabled={grammarLoading}
          >
            📝 Check Grammar
          </button>
        </div>
        
        {/* AI Prompt Input for Bio */}
        {aiPromptField === 'bio' && (
          <div className="mt-2 flex flex-col gap-2">
            <input
              type="text"
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              placeholder="Describe what you want to generate (e.g. 'Professional bio for a software developer')"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
            />
            <button
              type="button"
              className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => handleGenerate('bio', data.bio)}
              disabled={aiLoading || !aiPrompt}
            >
              {aiLoading ? 'Generating...' : 'Generate'}
            </button>
            {aiError && <div className="text-red-500 text-xs mt-1">{aiError}</div>}
          </div>
        )}
        
        {/* AI Preview for Bio */}
        {aiPreviewField === 'bio' && (
          <div className="mt-2 bg-gray-50 border border-emerald-200 rounded p-2 text-xs">
            <div className="mb-1 font-semibold text-emerald-700">AI Suggestion:</div>
            <div className="mb-2 whitespace-pre-line">{aiPreview}</div>
            <div className="flex gap-2">
              <button type="button" className="px-2 py-1 rounded bg-emerald-600 text-white text-xs" onClick={() => handleAcceptAIPreview('bio')}>Accept</button>
              <button type="button" className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs" onClick={handleRejectAIPreview}>Reject</button>
            </div>
          </div>
        )}
        
        {/* Grammar Preview for Bio */}
        {grammarField === 'bio' && (
          <div className="mt-2 bg-gray-50 border border-blue-200 rounded p-2 text-xs">
            <div className="mb-1 font-semibold text-blue-700">AI Suggestion:</div>
            <div className="mb-2 whitespace-pre-line">{grammarPreview}</div>
            <div className="flex gap-2">
              <button type="button" className="px-2 py-1 rounded bg-blue-600 text-white text-xs" onClick={() => handleAcceptGrammar('bio')}>Accept</button>
              <button type="button" className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs" onClick={handleRejectGrammar}>Reject</button>
            </div>
            {grammarError && <div className="text-red-500 text-xs mt-1">{grammarError}</div>}
          </div>
        )}
      </div>
      
      {/* Description Field with AI Features */}
      <div>
        <label className="block text-xs font-medium mb-1">Description</label>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[80px]"
          placeholder="A short summary about yourself, your goals, and what makes you unique."
          value={data.description || ""}
          onChange={e => onChange({ ...data, description: e.target.value })}
        />
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200"
            onClick={() => setAiPromptField(aiPromptField === 'description' ? null : 'description')}
            disabled={aiLoading}
          >
            ✨ Generate with AI
          </button>
          <button
            type="button"
            className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200"
            onClick={() => handleGrammarCheck('description', data.description)}
            disabled={grammarLoading}
          >
            📝 Check Grammar
          </button>
        </div>
        
        {/* AI Prompt Input for Description */}
        {aiPromptField === 'description' && (
          <div className="mt-2 flex flex-col gap-2">
            <input
              type="text"
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              placeholder="Describe what you want to generate (e.g. 'Professional summary for a full-stack developer')"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
            />
            <button
              type="button"
              className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => handleGenerate('description', data.description)}
              disabled={aiLoading || !aiPrompt}
            >
              {aiLoading ? 'Generating...' : 'Generate'}
            </button>
            {aiError && <div className="text-red-500 text-xs mt-1">{aiError}</div>}
          </div>
        )}
        
        {/* AI Preview for Description */}
        {aiPreviewField === 'description' && (
          <div className="mt-2 bg-gray-50 border border-emerald-200 rounded p-2 text-xs">
            <div className="mb-1 font-semibold text-emerald-700">AI Suggestion:</div>
            <div className="mb-2 whitespace-pre-line">{aiPreview}</div>
            <div className="flex gap-2">
              <button type="button" className="px-2 py-1 rounded bg-emerald-600 text-white text-xs" onClick={() => handleAcceptAIPreview('description')}>Accept</button>
              <button type="button" className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs" onClick={handleRejectAIPreview}>Reject</button>
            </div>
          </div>
        )}
        
        {/* Grammar Preview for Description */}
        {grammarField === 'description' && (
          <div className="mt-2 bg-gray-50 border border-blue-200 rounded p-2 text-xs">
            <div className="mb-1 font-semibold text-blue-700">AI Suggestion:</div>
            <div className="mb-2 whitespace-pre-line">{grammarPreview}</div>
            <div className="flex gap-2">
              <button type="button" className="px-2 py-1 rounded bg-blue-600 text-white text-xs" onClick={() => handleAcceptGrammar('description')}>Accept</button>
              <button type="button" className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs" onClick={handleRejectGrammar}>Reject</button>
            </div>
            {grammarError && <div className="text-red-500 text-xs mt-1">{grammarError}</div>}
          </div>
        )}
      </div>
    </div>
  );
} 