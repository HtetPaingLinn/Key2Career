"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { cn, getTechLogos } from "@/lib/utils";
import "@/styles/voice-interview.css";

/**
 * Display technology icons component
 * @param {import('@/types/voice-interview').TechIconProps} props
 */
const DisplayTechIcons = ({ techStack }) => {
  /** @type {[Array<{tech: string, url: string}>, Function]} */
  const [techIcons, setTechIcons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechIcons = async () => {
      try {
        const icons = await getTechLogos(techStack);
        setTechIcons(icons);
      } catch (error) {
        console.error("Error fetching tech icons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechIcons();
  }, [techStack]);

  if (loading) {
    return (
      <div className="flex flex-row">
        <div className="bg-secondary rounded-full p-2 flex flex-center border border-border w-5 h-5 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="voice-interview">
      <div className="flex flex-row">
        {techIcons.slice(0, 3).map(({ tech, url }, index) => (
          <div
            key={tech}
            className={cn(
              "relative group bg-gray-100 rounded-full p-2 flex flex-center border border-gray-200",
              index >= 1 && "-ml-3"
            )}
          >
            <span className="tech-tooltip bg-gray-700 text-white border border-gray-200">
              {tech}
            </span>

            <Image
              src={url}
              alt={tech}
              width={100}
              height={100}
              className="size-5"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayTechIcons;
