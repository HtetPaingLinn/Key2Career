import React, { useState, useEffect } from "react";
import axios from "axios";
import SpinnerLoader from "../Loader/SpinnerLoader";

// API configuration for standalone backend
const API_BASE_URL = "http://localhost:5001";
const API_PATHS = {
  ACTUAL: {
    GET_AVAILABLE_TOPICS: "/api/actual/available-topics",
  },
};

const TopicSelector = ({ selectedTopics, onTopicsChange, label = "Topics to Focus On", isCodingTest = false }) => {
  const [availableTopics, setAvailableTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Axios instance for interview backend
  const getAxiosInstance = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt');
      return axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
    }
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  useEffect(() => {
    // Only fetch dataset topics for coding tests
    if (isCodingTest) {
      fetchAvailableTopics();
    }
  }, [isCodingTest]);

  const fetchAvailableTopics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching available topics from:", API_PATHS.ACTUAL.GET_AVAILABLE_TOPICS);
      const axiosInstance = getAxiosInstance();
      const response = await axiosInstance.get(API_PATHS.ACTUAL.GET_AVAILABLE_TOPICS);
      console.log("Available topics response:", response.data);
      if (response.data.success) {
        setAvailableTopics(response.data.topics);
      } else {
        setError("Failed to load available topics");
      }
    } catch (error) {
      console.error("Error fetching available topics:", error);
      setError("Failed to load available topics. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicToggle = (e, topic) => {
    e.preventDefault(); // Prevent any form submission
    e.stopPropagation(); // Prevent event bubbling
    
    // Convert selectedTopics string to array
    const topicsArray = selectedTopics 
      ? selectedTopics.split(", ").filter(t => t.trim() !== "")
      : [];
    
    const updatedTopics = topicsArray.includes(topic)
      ? topicsArray.filter(t => t !== topic)
      : [...topicsArray, topic];
    
    onTopicsChange(updatedTopics.join(", "));
  };

  const handleManualInput = (e) => {
    // Allow all characters including commas and spaces
    const value = e.target.value;
    onTopicsChange(value);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 TopicSelector">
        <label className="text-sm font-medium text-black">{label}</label>
        <div className="flex items-center justify-center p-4 border border-gray-300 rounded-lg">
          <SpinnerLoader />
          <span className="ml-2 text-sm text-black">Loading topics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 TopicSelector">
      <label className="text-sm font-medium text-black">{label}</label>
      
      {error && (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      )}
      
      {/* Show available topics as clickable chips for coding tests */}
      {isCodingTest && availableTopics.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-black mb-2">Available topics (click to select):</div>
          <div className="flex flex-wrap gap-2">
            {availableTopics.map((topic, index) => {
              const topicsArray = selectedTopics 
                ? selectedTopics.split(", ").filter(t => t.trim() !== "")
                : [];
              const isSelected = topicsArray.includes(topic);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => handleTopicToggle(e, topic)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    isSelected
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-100 text-black border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Manual input field */}
      <textarea
        value={selectedTopics}
        onChange={handleManualInput}
        placeholder={
          isCodingTest 
            ? "Select from available topics above or type custom topics separated by commas (e.g., Arrays, Linked Lists, Trees)"
            : "Enter topics separated by commas (e.g., React, JavaScript, Node.js)"
        }
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-black"
        rows={3}
      />
      
      {isCodingTest && (
        <div className="text-xs text-black">
          Note: For coding tests, only questions from our curated dataset topics will be available.
        </div>
      )}
    </div>
  );
};

export default TopicSelector;