import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "./Inputs/Input";
import TopicSelector from "./Inputs/TopicSelector";
import SpinnerLoader from "./Loader/SpinnerLoader";
import PDFDropzone from "./Inputs/PDFDropzone";
import axios from "axios";
import toast from "react-hot-toast";

// API configuration for standalone backend
const API_BASE_URL = "http://localhost:5001";
const API_PATHS = {
  SESSION: {
    CREATE: "/api/sessions/create",
    UPLOAD_PDF: "/api/sessions/upload-pdf",
  },
  AI: {
    GENERATE_QUESTIONS: "/api/ai/generate-questions",
  },
};

const CreateSessionForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    role: "",
    experience: "",
    topicsToFocus: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUploadInfo, setPdfUploadInfo] = useState(null);

  const router = useRouter();

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

  const handleChange = (key, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();

    const { role, experience, topicsToFocus } = formData;

    if (!role || !experience || !topicsToFocus) {
      setError("Please fill all the required fields.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const axiosInstance = getAxiosInstance();
      
      let pdfInfo = null;
      if (pdfFile) {
        const formDataPDF = new FormData();
        formDataPDF.append("pdf", pdfFile);
        // Upload PDF first
        const pdfAxios = axios.create({
          baseURL: API_BASE_URL,
          headers: {
            'Authorization': typeof window !== 'undefined' ? `Bearer ${localStorage.getItem('jwt')}` : '',
          },
        });
        const pdfRes = await pdfAxios.post(API_PATHS.SESSION.UPLOAD_PDF, formDataPDF, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        pdfInfo = pdfRes.data;
        setPdfUploadInfo(pdfInfo);
      }

      // Call AI API to generate questions
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role,
          experience,
          topicsToFocus,
          numberOfQuestions: 25, // Always generate 25 questions
          pdf: pdfInfo, // Pass PDF info to backend for skill extraction
        }
      );
      
      // Should be array like [{question, answer}, ...]
      const generatedQuestions = aiResponse.data;
      
      const response = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
        ...formData,
        questions: generatedQuestions,
        pdf: pdfInfo,
      });
      
      if (response.data?.session?._id) {
        toast.success("Interview session created successfully!");
        onSuccess();
        router.push(`/interview-prep/${response.data?.session?._id}`);
      }
    } catch (error) {
      console.error("Error creating session:", error);
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      toast.error(error.response?.data?.message || "Failed to create session");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-4 flex flex-col">
      <p className="text-sm text-slate-700 mb-4">
        Fill out a few quick details and unlock your personalized set of
        25 AI-generated interview questions!
      </p>

      <form onSubmit={handleCreateSession} className="flex flex-col gap-3 w-full">
        <Input
          value={formData.role}
          onChange={({ target }) => handleChange("role", target.value)}
          label="Target Role"
          placeholder="(e.g., Java Developer, Software Engineering, etc.)"
          type="text"
        />

        <Input
          value={formData.experience}
          onChange={({ target }) => handleChange("experience", target.value)}
          label="Years of Experience"
          placeholder="(e.g., 1 year, 3 years, 5+ years)"
          type="number"
        />

        <TopicSelector
          selectedTopics={formData.topicsToFocus || ""}
          onTopicsChange={(topics) => handleChange("topicsToFocus", topics)}
          label="Topics to Focus On"
          isCodingTest={false}
        />

        <Input
          value={formData.description}
          onChange={({ target }) => handleChange("description", target.value)}
          label="Description"
          placeholder="(Any specific goals or notes for this session)"
          type="text"
        />

        <PDFDropzone pdfFile={pdfFile} setPdfFile={setPdfFile} />

        {error && <p className="text-red-500 text-sm py-2">{error}</p>}

        <div className="flex justify-center gap-3 mt-4">
          <button
            type="submit"
            className="px-6 py-2 text-white transition ease-in-out duration-100 cursor-pointer rounded-lg flex items-center justify-center font-medium"
            style={{ 
              background: 'linear-gradient(to right, rgb(47, 114, 47), oklch(0.51 0.2 145.36))'
            }}
            disabled={isLoading}
          >
            {isLoading ? <SpinnerLoader /> : 'Create Session'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSessionForm;