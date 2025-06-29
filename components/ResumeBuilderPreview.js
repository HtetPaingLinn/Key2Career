export default function ResumeBuilderPreview() {
  return (
    <section className="w-full py-16 flex flex-col items-center bg-white">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Smart Resume Builder Preview</h2>
      <div className="flex flex-col md:flex-row gap-8 max-w-5xl w-full px-6">
        {/* Editor Panel */}
        <div className="flex-1 bg-gray-50 rounded-xl shadow-md p-6 min-w-[280px]">
          <h3 className="font-semibold text-lg mb-4">Editor</h3>
          <div className="mb-2 text-sm text-gray-700">Work Experience</div>
          <div className="bg-white rounded-lg p-3 mb-4 shadow-sm">
            <div className="font-bold text-gray-800">Full Stack Engineer</div>
            <div className="text-xs text-gray-500 mb-2">Linear · Jan 21 to May 25</div>
            <ul className="list-disc pl-5 text-xs text-gray-700">
              <li>Improved code reliability by 50% through code optimization and performance tuning.</li>
              <li>Optimized cloud usage to improve server uptime by 30%.</li>
              <li>Collaborated with cross-functional teams to deliver high-quality software products.</li>
            </ul>
          </div>
          <button className="mt-2 px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">+ Add Experience</button>
        </div>
        {/* Resume Preview */}
        <div className="flex-1 bg-white rounded-xl shadow-md p-6 min-w-[280px] border border-gray-100">
          <h3 className="font-semibold text-lg mb-4">Resume Preview</h3>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <div className="text-2xl font-bold mb-1">PENELOPE HARBER</div>
            <div className="text-sm text-gray-700 mb-2">Software engineer</div>
            <div className="text-xs text-gray-500 mb-2">Seattle, WA · penelope@gmail.com</div>
            <div className="font-semibold mt-2 mb-1">About</div>
            <p className="text-xs text-gray-700 mb-2">Experienced software engineer with a strong background in developing and implementing innovative solutions. Skilled in full stack development and problem-solving.</p>
            <div className="font-semibold mt-2 mb-1">Experience</div>
            <ul className="list-disc pl-5 text-xs text-gray-700">
              <li>Full Stack Engineer, Linear: Improved design patterns and code reliability.</li>
              <li>Software Engineer, Facebook: Collaborated with teams to analyze industry trends.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
} 