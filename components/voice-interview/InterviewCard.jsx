"use client";

import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import DisplayTechIcons from "./DisplayTechIcons";
import TiltedCard from "./TiltedCard";
import DeleteButton from "./DeleteButton";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/voice-general.action";
import "@/styles/voice-interview.css";

/**
 * Interview Card component
 * @param {import('@/types/voice-interview').InterviewCardProps} props
 */
const InterviewCard = ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
  onDelete,
}) => {
  /** @type {[import('@/types/voice-interview').Feedback | null, Function]} */
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (userId && interviewId) {
        try {
          const feedbackData = await getFeedbackByInterviewId({
            interviewId,
            userId,
          });
          setFeedback(feedbackData);
        } catch (error) {
          console.error("Error fetching feedback:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [userId, interviewId]);

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeClass =
    {
      Behavioral: "badge-behavioral",
      Mixed: "badge-mixed",
      Technical: "badge-technical",
    }[normalizedType] || "badge-mixed";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  const image = getRandomInterviewCover();

  if (loading) {
    return (
      <div className="voice-interview">
        <div className="w-[360px] h-[400px] bg-white rounded-2xl shadow-md border border-gray-200 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-interview">
      <TiltedCard
        imageSrc={image}
        altText={`${role} Interview`}
        captionText={`${role} - ${normalizedType}`}
        containerHeight="400px"
        containerWidth="360px"
        imageHeight="400px"
        imageWidth="360px"
        rotateAmplitude={8}
        scaleOnHover={1.05}
        showMobileWarning={false}
        showTooltip={false}
        displayOverlayContent={true}
        overlayContent={
          <div className="card-interview p-4 w-full bg-white text-gray-900 rounded-[15px] shadow-lg border border-gray-200" style={{ marginTop: '-1.625rem' }}>
            {/* Type Badge */}
            <div
              className={cn(
                "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg font-semibold",
                badgeClass
              )}
              style={{ color: 'black' }}
            >
              <p className="badge-text" style={{ color: 'black' }}>{normalizedType}</p>
            </div>

            {/* Cover Image */}
            <Image
              src={image}
              alt="cover-image"
              width={48}
              height={48}
              className="rounded-full object-cover size-[48px]"
            />

            {/* Interview Role */}
            <h3 className="mt-2 capitalize text-gray-900 font-semibold text-lg">
              {role} Interview
            </h3>

            {/* Date & Score */}
            <div className="flex flex-row gap-5 mt-3">
              <div className="flex flex-row gap-2 items-center">
                <Image
                  src="/calendar.svg"
                  width={22}
                  height={22}
                  alt="calendar"
                  className="filter dark:invert"
                />
                <p className="text-gray-900 font-medium">
                  {formattedDate}
                </p>
              </div>

              <div className="flex flex-row gap-2 items-center">
                <Image
                  src="/star.svg"
                  width={22}
                  height={22}
                  alt="star"
                  className="filter dark:invert"
                />
                <p className="text-gray-900 font-medium">
                  {feedback?.totalScore || "---"}/100
                </p>
              </div>
            </div>

            {/* Feedback or Placeholder Text */}
            <p className="line-clamp-2 mt-5 text-sm text-gray-600 leading-relaxed">
              {feedback?.finalAssessment ||
                "You haven't taken this interview yet. Take it now to improve your skills."}
            </p>

            <div className="flex flex-row justify-between mt-3">
              <DisplayTechIcons techStack={techstack} />
              <div className="flex gap-2 items-center">
                <Button className="text-black font-semibold" style={{
                  background: 'rgb(40 168 255 / 57%)',
                  color: 'black',
                  border: 'none'
                }}>
                  <Link
                    href={
                      feedback
                        ? `/voice-interview/${interviewId}/feedback`
                        : `/voice-interview/${interviewId}`
                    }
                    className="text-black font-semibold"
                  >
                    {feedback ? "Check Feedback" : "View Interview"}
                  </Link>
                </Button>
                {interviewId && (
                  <DeleteButton interviewId={interviewId} onDelete={onDelete} />
                )}
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default InterviewCard;
