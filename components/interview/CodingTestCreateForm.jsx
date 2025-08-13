import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Input from "./Inputs/Input";
import TopicSelector from "./Inputs/TopicSelector";
import SpinnerLoader from "./Loader/SpinnerLoader";

// API configuration for standalone backend
const API_BASE_URL = "http://localhost:5001";
const API_PATHS = {
  ACTUAL: {
    CREATE: "/api/actual/create",
  },
};

const CodingTestCreateForm = ({ onClose, onSuccess }) => {
  const router = useRouter();
  
  const [form, setForm] = useState({
    role: "",
    experience: "",
    topicsToFocus: "",
    description: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

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

  // Validate form fields
  const validateForm = () => {
    const errors = {};

    // Role validation
    if (!form.role.trim()) {
      errors.role = "Target role is required";
    } else if (form.role.trim().length < 3) {
      errors.role = "Target role must be at least 3 characters";
    } else if (form.role.trim().length > 100) {
      errors.role = "Target role must be less than 100 characters";
    }

    // Experience validation
    if (!form.experience.trim()) {
      errors.experience = "Experience is required";
    } else {
      const exp = parseInt(form.experience);
      if (isNaN(exp) || exp < 0 || exp > 50) {
        errors.experience = "Experience must be a number between 0 and 50";
      }
    }

    // Topics validation
    if (!form.topicsToFocus.trim()) {
      errors.topicsToFocus = "At least one topic is required";
    } else if (form.topicsToFocus.trim().length < 3) {
      errors.topicsToFocus = "Topics must be at least 3 characters";
    }

    // Description validation (optional but if provided, must be reasonable length)
    if (form.description && form.description.trim().length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    setValidationErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  };

  // Update form validation whenever form changes
  useEffect(() => {
    validateForm();
  }, [form]);

  // Clear validation errors when form changes
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const axiosInstance = getAxiosInstance();
      const response = await axiosInstance.post(API_PATHS.ACTUAL.CREATE, form);
      
      setForm({ role: "", experience: "", topicsToFocus: "", description: "" });
      toast.success("Coding test created successfully!");
      onSuccess();
      
      // Navigate to the new session if response contains session data
      if (response.data?._id) {
        router.push(`/interview-prep/coding-test/${response.data._id}`);
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to create coding test";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-4 flex flex-col">
      <form onSubmit={handleAddSession} className="flex flex-col gap-3 w-full">
        <p className="text-sm text-gray-600 mb-4">This will create a coding test using questions from our curated dataset. Only dataset topics are available for coding tests.</p>
        
        {/* Validation Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
            <div className="text-red-800 text-sm font-medium mb-2">Please fix the following errors:</div>
            <ul className="text-red-700 text-xs space-y-1">
              {Object.values(validationErrors).map((error, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <Input
          value={form.role}
          onChange={({ target }) => handleChange("role", target.value)}
          label="Target Role"
          placeholder="(e.g., Java Developer, Software Engineering, etc.)"
          type="text"
          required
        />
        {validationErrors.role && (
          <div className="text-red-500 text-xs -mt-2">{validationErrors.role}</div>
        )}
        
        <Input
          value={form.experience}
          onChange={({ target }) => handleChange("experience", target.value)}
          label="Years of Experience"
          placeholder="(e.g., 1, 3, 5)"
          type="number"
          required
        />
        {validationErrors.experience && (
          <div className="text-red-500 text-xs -mt-2">{validationErrors.experience}</div>
        )}

        <TopicSelector
          selectedTopics={form.topicsToFocus}
          onTopicsChange={(topics) => handleChange("topicsToFocus", topics)}
          label="Topics to Focus On"
          isCodingTest={true}
        />
        {validationErrors.topicsToFocus && (
          <div className="text-red-500 text-xs -mt-2">{validationErrors.topicsToFocus}</div>
        )}

        <Input
          value={form.description}
          onChange={({ target }) => handleChange("description", target.value)}
          label="Description (Optional)"
          placeholder="Brief description of the coding test focus"
          type="text"
        />
        {validationErrors.description && (
          <div className="text-red-500 text-xs -mt-2">{validationErrors.description}</div>
        )}

        {error && <p className="text-red-500 text-sm py-2">{error}</p>}

        <div className="flex justify-center gap-3 mt-4">
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            style={{ 
              background: 'linear-gradient(to right, rgb(47, 114, 47), oklch(0.51 0.2 145.36))'
            }}
          >
            {isLoading && <SpinnerLoader />}
            {isLoading ? "Creating..." : "Create Test"}
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

export default CodingTestCreateForm;