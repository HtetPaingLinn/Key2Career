import { FaBriefcase, FaBolt, FaEnvelopeOpenText } from 'react-icons/fa';

export default function ResultsStatsSection() {
  return (
    <section className="w-full bg-[#f2f8fe] py-20">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          Real Results for <span className="text-blue-600">Job<br className="sm:hidden" /> Seekers Like You</span>
        </h2>
        <p className="text-gray-500 text-center mb-10 text-base md:text-lg">
          More interviews, offers, and a faster path to your next role
        </p>

        {/* Stats Cards */}
        <div className="w-full flex flex-col md:flex-row gap-6 justify-center mb-10">
          {/* Card 1 */}
          <div className="flex-1 bg-white rounded-xl shadow-md flex flex-col items-center py-10 px-6 min-w-[220px]">
            <div className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">500k+</div>
            <div className="flex items-center gap-2 text-gray-600 text-base mt-2">
              <FaBriefcase className="text-blue-500" />
              Job Seekers Served
            </div>
          </div>
          {/* Card 2 */}
          <div className="flex-1 bg-white rounded-xl shadow-md flex flex-col items-center py-10 px-6 min-w-[220px]">
            <div className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">60%</div>
            <div className="flex items-center gap-2 text-gray-600 text-base mt-2">
              <FaBolt className="text-blue-500" />
              Faster time to interviews
            </div>
          </div>
          {/* Card 3 */}
          <div className="flex-1 bg-white rounded-xl shadow-md flex flex-col items-center py-10 px-6 min-w-[220px]">
            <div className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">2x</div>
            <div className="flex items-center gap-2 text-gray-600 text-base mt-2">
              <FaEnvelopeOpenText className="text-blue-500" />
              More Job Offers
            </div>
          </div>
        </div>

        {/* Button */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-lg text-lg shadow-md transition-colors duration-200">
          SIGN UP FOR FREE
        </button>
      </div>
    </section>
  );
} 