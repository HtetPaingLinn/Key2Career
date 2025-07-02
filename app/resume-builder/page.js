"use client";
import Image from "next/image";
import { NavbarLogo } from "@/components/ui/resizable-navbar";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Home", link: "/" },
  { name: "Job Tracker", link: "#" },
  { name: "Resume Builder", link: "/resume-builder" },
  { name: "CV Verification", link: "#" },
  { name: "Interview Q&A", link: "#" },
  { name: "Career Roadmap", link: "#" },
];

export default function ResumeBuilderPage() {
  return (
    <>
      <nav className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm flex items-center justify-between px-4 md:px-8 py-4">
        <div className="ml-4 md:ml-12">
          <NavbarLogo />
        </div>
        <div className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.link}
              className="text-base font-medium text-zinc-600 hover:text-zinc-800 px-3 py-2 rounded transition"
            >
              {item.name}
            </a>
          ))}
        </div>
        {/* Mobile menu button (hamburger) */}
        <div className="md:hidden">
          {/* You can add a mobile menu here if needed */}
        </div>
      </nav>
      <div className="pt-24">
        <section className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12 z-10">
            {/* Left: Text */}
            <div className="flex-1 flex flex-col items-start text-left">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                K2C's <span className="text-purple-600">CV Maker</span>
                <br />
                helps you create a professional CV that stands out
              </h1>
              <div className="flex flex-row gap-4 mb-6">
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-lg text-lg shadow-md transition">
                  Build Your CV
                </button>
                <button className="border border-gray-400 text-gray-800 font-semibold px-8 py-3 rounded-lg text-lg bg-white hover:bg-gray-100 transition">
                  Get Your CV Score
                </button>
              </div>
              <p className="text-2xl text-gray-700 font-medium mb-2">
                Build a modern, job-winning CV in minutes with K2C's easy-to-use online maker.
              </p>
            </div>
            {/* Right: ResumeFlipCarousel */}
            <div className="flex-1 flex items-center justify-center relative">
              <ResumeFlipCarousel />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function ResumeFlipCarousel() {
  const images = ["/cvhero1.png", "/cvhero2.png", "/cvhero3.png"];
  const [rotateY, setRotateY] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRotateY((prev) => prev + 2);
    }, 33); // ~30fps
    return () => clearInterval(intervalRef.current);
  }, []);

  // Calculate which images to show based on rotateY
  const step = Math.floor(rotateY / 180);
  const frontIndex = step % images.length;
  const backIndex = (frontIndex + 1) % images.length;
  const localAngle = rotateY % 360;

  return (
    <div
      className="mx-auto relative flex justify-center items-center"
      style={{ perspective: 1200, minWidth: 600, minHeight: 800 }}
    >
      <div className="relative" style={{ minWidth: 600, minHeight: 800 }}>
        <div
          style={{
            width: "100%",
            height: "auto",
            minWidth: 600,
            minHeight: 800,
            position: "relative",
            transformStyle: "preserve-3d",
            transform: `rotateY(${localAngle}deg)`,
            transition: "transform 0.033s linear",
          }}
        >
          {/* Front face (current image) */}
          <img
            src={images[frontIndex]}
            alt={`Resume ${frontIndex + 1}`}
            style={{
              width: "100%",
              height: "auto",
              minWidth: 600,
              minHeight: 800,
              backfaceVisibility: "hidden",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
          {/* Back face (next image) */}
          <img
            src={images[backIndex]}
            alt={`Resume ${backIndex + 1}`}
            style={{
              width: "100%",
              height: "auto",
              minWidth: 600,
              minHeight: 800,
              backfaceVisibility: "hidden",
              position: "absolute",
              top: 0,
              left: 0,
              transform: "rotateY(180deg)",
            }}
          />
        </div>
      </div>
    </div>
  );
} 