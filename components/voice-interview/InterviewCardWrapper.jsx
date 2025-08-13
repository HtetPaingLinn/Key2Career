"use client";

import { useState } from "react";
import InterviewCard from "./InterviewCard";

/**
 * Interview Card Wrapper component
 * @param {import('@/types/voice-interview').InterviewCardProps} props
 */
const InterviewCardWrapper = (props) => {
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDelete = () => {
    setIsDeleted(true);
  };

  if (isDeleted) {
    return null; // Don't render the card if it's been deleted
  }

  return <InterviewCard {...props} onDelete={handleDelete} />;
};

export default InterviewCardWrapper;
