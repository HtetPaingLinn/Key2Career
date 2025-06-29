'use client';

const logos = [
  {
    alt: 'Spotify',
    href: 'https://www.spotify.com/',
    src: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
  },
  {
    alt: 'Tesla',
    href: 'https://www.tesla.com/',
    src: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png',
  },
  {
    alt: 'Microsoft',
    href: 'https://www.microsoft.com/',
    src: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
  },
  {
    alt: 'Adobe',
    href: 'https://www.adobe.com/',
    src: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Adobe_Systems_logo_and_wordmark.svg',
  },
  {
    alt: 'Google',
    href: 'https://www.google.com/',
    src: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  },
  {
    alt: 'Netflix',
    href: 'https://www.netflix.com/',
    src: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  },
  {
    alt: 'Amazon',
    href: 'https://www.amazon.com/',
    src: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  },
  {
    alt: 'Airbnb',
    href: 'https://www.airbnb.com/',
    src: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg',
  },
];

export default function TrustedByLogos() {
  return (
    <section className="w-full py-14 bg-white flex flex-col items-center">
      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 text-center">Trusted by job seekers who've landed at top companies</h2>
      <p className="text-lg text-slate-600 mb-10 text-center">Our users have secured positions at industry-leading companies such as</p>
      <div className="overflow-x-hidden w-full">
        <div
          className="flex gap-32 animate-slide group hover:[animation-play-state:paused]"
          style={{
            animation: 'slide 40s linear infinite',
          }}
        >
          {[...logos, ...logos].map((logo, i) => (
            <a
              key={i}
              href={logo.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-16 min-w-[120px] group-hover:animate-none transition-transform hover:scale-110"
              style={{ cursor: 'pointer' }}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-12 w-auto object-contain transition-all duration-300 hover:scale-105"
              />
              <span className="sr-only">{logo.alt}</span>
            </a>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-slide {
          min-width: 200vw;
        }
      `}</style>
    </section>
  );
} 