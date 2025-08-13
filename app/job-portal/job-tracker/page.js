"use client";

import { useState, useRef, useEffect } from "react";

export default function JobTrackerPage() {
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOver, setDraggedOver] = useState(null);

  // Sample job data with different stages
  const [jobs, setJobs] = useState({
    submitted: [
      { id: 1, company: "TechCorp", position: "Frontend Developer", appliedDate: "2024-01-15", priority: "high" },
      { id: 2, company: "StartupXYZ", position: "Full Stack Engineer", appliedDate: "2024-01-12", priority: "medium" },
      { id: 3, company: "BigTech Inc", position: "React Developer", appliedDate: "2024-01-10", priority: "low" }
    ],
    interview: [
      { id: 4, company: "InnovateLab", position: "Senior Developer", appliedDate: "2024-01-08", priority: "high" },
      { id: 5, company: "DevStudio", position: "UI/UX Developer", appliedDate: "2024-01-05", priority: "medium" }
    ],
    offer: [
      { id: 6, company: "DreamJob Co", position: "Lead Developer", appliedDate: "2024-01-03", priority: "high" }
    ],
    accepted: [
      { id: 7, company: "PerfectFit Ltd", position: "Senior Frontend", appliedDate: "2023-12-28", priority: "high" }
    ],
    rejected: [
      { id: 8, company: "NotRight Inc", position: "Junior Developer", appliedDate: "2023-12-20", priority: "low" }
    ]
  });

  // Modal state for quick add
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ company: "", position: "", priority: "medium", stage: "submitted" });
  const nextIdRef = useRef(1000);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("job-tracker-state");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setJobs(parsed);
          const all = Object.values(parsed).flat();
          const maxId = all.reduce((m, j) => Math.max(m, j.id || 0), 0);
          nextIdRef.current = Math.max(nextIdRef.current, maxId + 1);
        }
      }
    } catch {}
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("job-tracker-state", JSON.stringify(jobs));
    } catch {}
  }, [jobs]);

  const stages = [
    { 
      key: 'submitted', 
      title: 'Form Submitted/Pending', 
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      key: 'interview', 
      title: 'Call for Interview/Screening', 
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    { 
      key: 'offer', 
      title: 'Offer Stage', 
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    { 
      key: 'accepted', 
      title: 'Accept Offer', 
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    { 
      key: 'rejected', 
      title: 'Reject()', 
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  const handleDragStart = (e, item, sourceStage) => {
    setDraggedItem({ item, sourceStage });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, targetStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOver(targetStage);
  };

  const handleDragLeave = (e) => {
    setDraggedOver(null);
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    setDraggedOver(null);
    
    if (!draggedItem || draggedItem.sourceStage === targetStage) {
      setDraggedItem(null);
      return;
    }

    setJobs(prevJobs => {
      const newJobs = { ...prevJobs };
      
      // Remove from source
      newJobs[draggedItem.sourceStage] = newJobs[draggedItem.sourceStage].filter(
        job => job.id !== draggedItem.item.id
      );
      
      // Add to target
      newJobs[targetStage] = [...newJobs[targetStage], draggedItem.item];
      
      return newJobs;
    });
    
    setDraggedItem(null);
  };

  const handleDelete = (stageKey, jobId) => {
    setJobs(prev => ({
      ...prev,
      [stageKey]: prev[stageKey].filter(j => j.id !== jobId)
    }));
  };

  const openAddModal = () => setShowAdd(true);
  const closeAddModal = () => setShowAdd(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleAdd = (e) => {
    e?.preventDefault?.();
    if (!form.company.trim() || !form.position.trim()) return;
    const newJob = {
      id: nextIdRef.current++,
      company: form.company.trim(),
      position: form.position.trim(),
      appliedDate: new Date().toISOString().slice(0,10),
      priority: form.priority
    };
    setJobs(prev => ({
      ...prev,
      [form.stage]: [...prev[form.stage], newJob]
    }));
    setForm({ company: "", position: "", priority: "medium", stage: "submitted" });
    setShowAdd(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const JobCard = ({ job, stage }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, job, stage)}
      className={`p-4 mb-3 bg-white rounded-lg shadow-sm border-l-4 cursor-move hover:shadow-md transition-all duration-200 ${getPriorityColor(job.priority)}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 text-sm">{job.company}</h4>
        <span className={`px-2 py-1 text-xs rounded-full ${
          job.priority === 'high' ? 'bg-red-100 text-red-700' :
          job.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {job.priority}
        </span>
      </div>
      <p className="text-gray-700 text-sm mb-2">{job.position}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Applied: {formatDate(job.appliedDate)}</span>
        <div className="flex space-x-1">
          <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button className="p-1 hover:bg-gray-100 rounded text-red-500" onClick={() => handleDelete(stage, job.id)} title="Delete">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const StageColumn = ({ stage, stageJobs }) => (
    <div 
      className={`flex-1 min-w-[280px] ${stage.bgColor} rounded-xl p-4 transition-all duration-200 ${
        draggedOver === stage.key ? 'ring-2 ring-indigo-400 bg-indigo-100' : ''
      }`}
      onDragOver={(e) => handleDragOver(e, stage.key)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, stage.key)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
          <h3 className="font-semibold text-gray-800 text-sm">{stage.title}</h3>
        </div>
        <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
          {stageJobs.length}
        </span>
      </div>
      
      <div className="space-y-2 min-h-[200px]">
        {stageJobs.map(job => (
          <JobCard key={job.id} job={job} stage={stage.key} />
        ))}
        
        {stageJobs.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-sm">No applications</p>
          </div>
        )}
      </div>
    </div>
  );

  const totalApplications = Object.values(jobs).flat().length;
  const activeApplications = jobs.submitted.length + jobs.interview.length + jobs.offer.length;

  return (
    <main className="bg-white text-black min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Application Tracker</h1>
              <p className="text-gray-600">Track your job applications through each stage of the process</p>
            </div>
            <button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Application</span>
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">{totalApplications}</div>
              <div className="text-indigo-100">Total Applications</div>
            </div>
            <div className="bg-gradient-to-r from-indigo-400 to-indigo-500 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">{activeApplications}</div>
              <div className="text-indigo-100">Active Applications</div>
            </div>
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">{jobs.accepted.length}</div>
              <div className="text-indigo-100">Offers Accepted</div>
            </div>
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white p-4 rounded-lg">
              <div className="text-2xl font-bold">{jobs.rejected.length}</div>
              <div className="text-indigo-100">Applications Rejected</div>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {stages.map(stage => (
            <StageColumn 
              key={stage.key} 
              stage={stage} 
              stageJobs={jobs[stage.key]} 
            />
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-gray-800">How to use</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Drag and drop job applications between columns to update their status. 
            Use the priority indicators (red=high, yellow=medium, green=low) to organize your applications by importance.
          </p>
        </div>
        
        {/* Add Application Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={closeAddModal} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Add Application</h3>
                  <button onClick={closeAddModal} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleAdd} className="grid gap-3">
                  <label className="grid gap-1">
                    <span className="text-sm font-medium text-gray-700">Company</span>
                    <input name="company" value={form.company} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900" placeholder="Acme Inc" required />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm font-medium text-gray-700">Position</span>
                    <input name="position" value={form.position} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900" placeholder="Frontend Engineer" required />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="grid gap-1">
                      <span className="text-sm font-medium text-gray-700">Priority</span>
                      <select name="priority" value={form.priority} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-900">
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </label>
                    <label className="grid gap-1">
                      <span className="text-sm font-medium text-gray-700">Stage</span>
                      <select name="stage" value={form.stage} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-900">
                        {stages.map(s => (
                          <option key={s.key} value={s.key}>{s.title}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button type="button" onClick={closeAddModal} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Add</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}