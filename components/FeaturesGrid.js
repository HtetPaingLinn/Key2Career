const features = [
  {
    title: 'Secure User/Admin Management',
    desc: 'Role-based login, session handling, and admin panel powered by Spring Boot + PostgreSQL.',
    icon: '🔒',
  },
  {
    title: 'Full Job Portal',
    desc: 'Employers post jobs, students search/apply, and track applications. Data stored in MongoDB Atlas.',
    icon: '💼',
  },
  {
    title: 'Smart Resume Builder',
    desc: 'Custom sections, real-time preview, export as PDF. Next.js + MongoDB Atlas.',
    icon: '📝',
  },
  {
    title: 'Blockchain CV Verification',
    desc: 'Issue verifiable certificates (Polygon testnet/NFT-style) to prove authenticity.',
    icon: '🔗',
  },
  {
    title: 'AI Interview Question Generator',
    desc: 'Python ML model generates questions matched to your CV & role. Served via API.',
    icon: '🤖',
  },
  {
    title: 'Voice Interview (Beta)',
    desc: 'Speak answers via mic, get AI feedback on tone, fluency, and relevance.',
    icon: '🎤',
  },
  {
    title: 'Career Roadmap & AI Path Planning',
    desc: 'AI creates a personalized roadmap based on your career goals.',
    icon: '🗺️',
  },
];

export default function FeaturesGrid() {
  return (
    <section className="w-full bg-gray-50 py-12 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Key Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full px-6">
        {features.map((f, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-start hover:shadow-lg transition">
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">{f.title}</h3>
            <p className="text-gray-600 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
} 