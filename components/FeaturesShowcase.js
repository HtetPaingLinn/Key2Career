import { FaRocket, FaShieldAlt, FaUsers, FaChartLine, FaGraduationCap, FaHandshake, FaMicrophone } from 'react-icons/fa';

export default function FeaturesShowcase() {
  const features = [
    {
      icon: <FaRocket className="w-8 h-8" />,
      title: "AI-Powered Job Matching",
      description: "Our advanced AI algorithms match you with the perfect job opportunities based on your skills and preferences.",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <FaShieldAlt className="w-8 h-8" />,
      title: "Blockchain CV Verification",
      description: "Secure, tamper-proof verification of your credentials using cutting-edge blockchain technology.",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: "Smart Resume Builder",
      description: "Create professional resumes that stand out with our intelligent builder and ATS optimization.",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: <FaChartLine className="w-8 h-8" />,
      title: "Career Analytics",
      description: "Track your job search progress and get insights to improve your application strategy.",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: <FaGraduationCap className="w-8 h-8" />,
      title: "AI Interview Prep",
      description: "Practice with our AI-powered interview simulator and get personalized feedback.",
      color: "from-indigo-500 to-blue-600"
    },
    {
      icon: <FaMicrophone className="w-8 h-8" />,
      title: "Voice Interview AI",
      description: "Practice real voice interviews with AI assistants and receive instant detailed feedback on your performance.",
      color: "from-pink-500 to-purple-600"
    },
    {
      icon: <FaHandshake className="w-8 h-8" />,
      title: "Direct Employer Connect",
      description: "Connect directly with employers and skip the traditional application process.",
      color: "from-teal-500 to-green-600"
    }
  ];

  return (
    <section className="w-full bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
            Why Choose Key2Career?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of job searching with our comprehensive suite of AI-powered tools designed to accelerate your career growth.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-0">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
              
              {/* Icon */}
              <div className={`relative mb-6 p-4 rounded-xl bg-gradient-to-br ${feature.color} text-white w-fit`}>
                {feature.icon}
              </div>
              
              {/* Content */}
              <div className="relative">
                <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 