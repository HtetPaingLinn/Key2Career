import HeroSection from '../components/HeroSection';
import TrustedByLogos from '../components/TrustedByLogos';
import JobSearchComparison from '../components/JobSearchComparison';
import ResultsStatsSection from '../components/ResultsStatsSection';
import FeaturesShowcase from '../components/FeaturesShowcase';
import TestimonialsSlider from '../components/TestimonialsSlider';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center">
      <HeroSection />
      <TrustedByLogos />
      <JobSearchComparison />
      <ResultsStatsSection />
      <FeaturesShowcase />
      <TestimonialsSlider />
      <Footer />
    </main>
  );
}
