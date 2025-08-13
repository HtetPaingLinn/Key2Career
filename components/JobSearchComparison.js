import { CheckCircle, XCircle, Clock, Layers, FileText } from 'lucide-react';

export default function JobSearchComparison() {
  return (
    <section className="w-full py-24 bg-white flex flex-col items-center relative overflow-hidden">
      {/* Modern dot grid background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%" className="w-full h-full" style={{position:'absolute',top:0,left:0}}>
          <defs>
            <pattern id="modern-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#e5e7eb" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#modern-dots)" />
        </svg>
      </div>
      <div className="max-w-5xl w-full mx-auto px-4 md:px-8 z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 text-center tracking-tight">
          Say goodbye to job <span className="text-blue-600">search frustration</span>
        </h2>
        <p className="text-lg text-slate-600 mb-14 text-center max-w-2xl mx-auto">
          From endless rejections to landing your dream job, discover the difference <span className="font-semibold text-blue-700">Key2Career</span> can make.
        </p>
        <div className="relative flex flex-col md:flex-row gap-10 md:gap-0 bg-white/90 rounded-3xl shadow-2xl p-8 md:p-14 border border-slate-100">
          {/* Before Key2Career */}
          <div className="flex-1 flex flex-col justify-center pr-0 md:pr-10">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="text-red-500 w-6 h-6" />
              <span className="uppercase text-xs font-bold text-red-500 tracking-wider">Before Key2Career</span>
            </div>
            <div className="text-slate-700 font-semibold mb-7 text-lg">Struggling to navigate the job market without the right tools</div>
            <div className="space-y-5">
              <div className="flex items-start gap-3 p-4 border rounded-xl border-red-200 bg-red-50/60">
                <FileText className="w-6 h-6 text-red-400 mt-1" />
                <div>
                  <div className="font-bold text-red-600">Rejection</div>
                  <div className="text-sm text-slate-600">Non-optimized resumes lead to missed opportunities</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 border rounded-xl border-red-200 bg-red-50/60">
                <Clock className="w-6 h-6 text-red-400 mt-1" />
                <div>
                  <div className="font-bold text-red-600">Time Wasted</div>
                  <div className="text-sm text-slate-600">Job searching is a time-consuming and stressful process</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 border rounded-xl border-red-200 bg-red-50/60">
                <Layers className="w-6 h-6 text-red-400 mt-1" />
                <div>
                  <div className="font-bold text-red-600">Fragmented Tools</div>
                  <div className="text-sm text-slate-600">Switching between multiple platforms is overwhelming</div>
                </div>
              </div>
            </div>
          </div>
          {/* Vertical divider with arrow */}
          <div className="hidden md:flex flex-col items-center justify-center px-6">
            <div className="w-0.5 h-32 bg-slate-200 rounded-full mb-2" />
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-slate-400">
              <path d="M8 12h8m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {/* After Key2Career */}
          <div className="flex-1 flex flex-col justify-center pl-0 md:pl-10">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="text-green-500 w-6 h-6" />
              <span className="uppercase text-xs font-bold text-green-600 tracking-wider">After Key2Career</span>
            </div>
            <div className="text-slate-700 font-semibold mb-7 text-lg">Easily navigate the job market with AI-powered tools</div>
            <div className="space-y-5">
              <div className="flex items-start gap-3 p-4 border rounded-xl border-green-200 bg-green-50/60">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                <div>
                  <div className="font-bold text-green-700">No More Rejections</div>
                  <div className="text-sm text-slate-600">Instantly create ATS-friendly, professional resumes</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 border rounded-xl border-green-200 bg-green-50/60">
                <Clock className="w-6 h-6 text-green-500 mt-1" />
                <div>
                  <div className="font-bold text-green-700">Save Time</div>
                  <div className="text-sm text-slate-600">Key2Career's AI tools simplify your job search</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 border rounded-xl border-green-200 bg-green-50/60">
                <Layers className="w-6 h-6 text-green-500 mt-1" />
                <div>
                  <div className="font-bold text-green-700">All in One Solution</div>
                  <div className="text-sm text-slate-600">Manage your entire job search in one platform</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 