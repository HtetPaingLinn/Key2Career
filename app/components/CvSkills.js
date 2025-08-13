"use client";
import { useEffect, useState } from 'react';
import { Code2Icon } from 'lucide-react'; // optional icon
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ["latin"], weight: ['400'] });

export default function CvSkills() {
  const [skills, setSkills] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSkills() {
      try {
        setLoading(true);
        const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
        if (!email) {
          setError('No user email found');
          setLoading(false);
          return;
        }
        
        const res = await fetch(`/api/cv-skills?email=${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error('Failed to fetch skills');
        const data = await res.json();
        setSkills(data.skills);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSkills();
  }, []);

  if (loading) return <div className="text-sm text-gray-500 text-center mt-4">Loading skills...</div>;
  if (error) return <div className="text-red-500 text-sm text-center mt-4">Error: {error}</div>;
  if (!skills) return <div className="text-gray-400 text-sm text-center mt-4">No skills found.</div>;

  return (
    <div className={`${montserrat.className} bg-white rounded-2xl shadow-md p-8 w-full max-w-lg border border-gray-100 font-montserrat`}>
      <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
        <Code2Icon size={30} className="text-indigo-500" />
        Technical Skills
      </h2>

      <ul className="space-y-1 text-md text-gray-700">
        {skills.technical && skills.technical.length > 0 ? (
          skills.technical.map((skill, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
              <span>{skill.name}</span>
            </li>
          ))
        ) : (
          <li className="text-gray-400">No technical skills listed.</li>
        )}
      </ul>
      <button
        className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-300 active:scale-95"
        type="button"
        onClick={() => {
          // Skills will be loaded from backend on the main page
          window.location.href = 'http://localhost:3000/';
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        Send to Roadmap
      </button>
    </div>
  );
}
