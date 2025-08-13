"use client";
import { useRef, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';

const testimonials = [
  {
    text: 'The Careerflow extension kept me organized with job applications, improved my resume and LinkedIn, and aligned my applications to job requirements, boosting my opportunities.',
    name: 'Ntow Emmanuel Akyea',
    title: 'Copywriter',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    text: 'Job searching in 2024 is challenging, but Careerflow has been a game-changer. Its resume creation and customization tools make tailoring applications quick and efficient.',
    name: 'Sumera Malik',
    title: 'Site Engineer',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    text: 'Careerflow AI is an AI-driven platform that offers personalized career guidance, skill enhancement opportunities, and job market insights. An awesome feeling.',
    name: 'Joanna Taylor',
    title: 'Brand Strategist',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    text: 'I landed my dream job thanks to Careerflow! The interview prep and analytics were spot on.',
    name: 'Alex Chen',
    title: 'Product Manager',
    avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
  },
  {
    text: 'The platform is intuitive and the support team is fantastic. Highly recommended!',
    name: 'Priya Singh',
    title: 'HR Specialist',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
];

export default function TestimonialsSlider() {
  const marqueeRef = useRef(null);
  const animationRef = useRef(null);
  const isPaused = useRef(false);

  useEffect(() => {
    const marquee = marqueeRef.current;
    let scrollAmount = 0;
    let speed = 0.7; // px per frame

    function step() {
      if (!isPaused.current) {
        scrollAmount += speed;
        if (marquee) {
          if (scrollAmount >= marquee.scrollWidth / 2) {
            scrollAmount = 0;
          }
          marquee.scrollLeft = scrollAmount;
        }
      }
      animationRef.current = requestAnimationFrame(step);
    }
    animationRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  function handleMouseEnter() {
    isPaused.current = true;
  }
  function handleMouseLeave() {
    isPaused.current = false;
  }

  // Duplicate testimonials for seamless looping
  const cards = [...testimonials, ...testimonials];

  return (
    <section className="w-full bg-[#eaf4fe] py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Hear From Our <span className="text-blue-600">Community</span>
          </h2>
          <p className="text-gray-500 text-lg">Trusted and loved by over 600k users worldwide.</p>
        </div>

        {/* Infinite Marquee */}
        <div
          ref={marqueeRef}
          className="overflow-x-hidden w-full mt-12"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex w-max gap-6 animate-none">
            {cards.map((t, i) => (
              <div
                key={i + t.name}
                className="flex-1 bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-between min-h-[320px] max-w-[420px] w-[380px]"
              >
                {/* Stars */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 mr-1" />
                  ))}
                </div>
                {/* Text */}
                <p className="text-gray-700 text-lg mb-8 flex-1">“{t.text}”</p>
                {/* User */}
                <div className="flex items-center mt-4">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-blue-100"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{t.name}</div>
                    <div className="text-gray-400 text-sm">{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 