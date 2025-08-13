import { useEffect, useState } from 'react';
import { X, Info, Loader2, AlertTriangle } from 'lucide-react';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ["latin"], weight: ['400'] });

export default function InfoSidePanel({ isOpen, onClose, element }) {
  const [aiInfo, setAiInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !element) return;
    let ignore = false;
    setLoading(true);
    setError(null);
    setAiInfo(null);
    const techName = element.technology?.name;
    if (!techName) {
      setLoading(false);
      setError('No technology selected.');
      return;
    }
    fetch('/api/ai-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ capsule: techName }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (!ignore) setAiInfo(data);
      })
      .catch((err) => {
        if (!ignore) setError('Could not fetch info. Showing static description.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, [isOpen, element]);

  if (!isOpen || !element) return null;
  const techName = element.technology?.name;
  const staticDescription = element.technology?.description || '';



  useEffect(() => {
    if (aiInfo) {
      console.log("AI Info:", aiInfo);
      console.log("Description Type:", typeof aiInfo.description);
      console.log("Description:", aiInfo.description);
      console.log("Resources:", aiInfo.resources);
    }
  }, [aiInfo]);
  
  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end ${montserrat.className}`}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity duration-300"
        onClick={onClose}
        aria-label="Close info panel"
        tabIndex={-1}
      />
      {/* Panel */}
      <aside
        className="relative w-full max-w-md h-full bg-gray-50 shadow-xl p-8 flex flex-col transition-transform duration-300 rounded-l-2xl border-l border-gray-200 animate-slideIn"
        style={{ width: '60vw', minWidth: 600 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Info about ${techName}`}
      >
        <button
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-200 focus:outline-none"
          onClick={onClose}
          aria-label="Close info panel"
        >
          <X size={18} className="text-blue-500" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 uppercase mb-2 flex items-center gap-1 tracking-wide">
          <Info size={30} className="text-blue-500" />
          <span className='ml-2'> {techName} </span>
        </h2>
        <div className="flex-1 overflow-y-auto space-y-4 mt-2 pr-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-32 text-blue-500 animate-pulse">
              <Loader2 size={28} className="animate-spin mb-1" />
              <span className="text-base font-medium">Fetching info...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-24 text-yellow-600">
              <AlertTriangle size={24} className="mb-1" />
              <span className="font-semibold mb-1 text-sm">{error}</span>
              {staticDescription && (
                <p className="text-gray-700 text-sm text-center">{staticDescription}</p>
              )}
            </div>
          ) : aiInfo ? (
            <>
              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1 mb-1 tracking-wider">
                  <span className="inline-block w-2 h-2 bg-red-400 rounded-full" />  Description
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">{aiInfo.description || staticDescription}</p>
              </div>
              <div className="border-t border-gray-200" />
              {/* Resources */}
              {aiInfo.resources && aiInfo.resources.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1 mb-1 tracking-wider">
                    <span className="inline-block w-2 h-2 bg-blue-400 rounded-full" /> Resources
                  </h3>
                  <ul className="space-y-1">
                    {aiInfo.resources.map((res, idx) => (
                      <li key={idx}>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline font-medium text-sm hover:text-blue-900 transition-colors"
                        >
                          {res.title || res.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {aiInfo.resources && aiInfo.resources.length > 0 && <div className="border-t border-gray-200" />}
              {/* Learning Steps */}
              {aiInfo.learningSteps && aiInfo.learningSteps.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1 mb-1 tracking-wider">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full" /> Learning Steps
                  </h3>
                  <ol className="list-decimal list-inside space-y-0.5 text-gray-800 text-sm">
                    {aiInfo.learningSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
              {aiInfo.learningSteps && aiInfo.learningSteps.length > 0 && <div className="border-t border-gray-200" />}
              {/* Code Example */}
              {aiInfo.codeExample && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1 mb-1 tracking-wider">
                    <span className="inline-block w-2 h-2 bg-purple-400 rounded-full" /> Code Example
                  </h3>
                  <div
                    className="bg-gray-100 text-gray-700 rounded-lg p-3 overflow-x-auto text-xs font-mono border border-gray-200"
                    style={{ maxHeight: 200 }}
                    dangerouslySetInnerHTML={{ __html: aiInfo.codeExample }}
                  />
                </div>
              )}
              {aiInfo.codeExample && <div className="border-t border-gray-200" />}
              {/* Related Technologies */}
              {aiInfo.relatedTechnologies && aiInfo.relatedTechnologies.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1 mb-1 tracking-wider">
                    <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full" /> Related Technologies
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {aiInfo.relatedTechnologies.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium border border-yellow-200 hover:bg-yellow-200 transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-700 text-sm mt-2 mb-2">
              <p>{staticDescription || 'No information available.'}</p>
            </div>
          )}
        </div>
      </aside>
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
} 