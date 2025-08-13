// Debug utility to understand PDF data flow
export const debugCVData = (originalCvData, transformedData, templateId) => {
  console.group(`🔍 PDF Data Debug - Template: ${templateId}`);
  
  // Original CV Data
  console.group('📋 Original CV Data');
  console.log('Full original data:', originalCvData);
  console.log('Personal Info:', originalCvData?.personalInfo);
  console.log('Job Applied:', originalCvData?.jobApplied);
  console.log('Work Experience:', originalCvData?.workExperience);
  console.log('Skills:', originalCvData?.skills);
  console.groupEnd();
  
  // Transformed Data
  console.group('🔄 Transformed Data');
  console.log('Full transformed data:', transformedData);
  console.log('Personal Info:', transformedData?.personalInfo);
  console.log('Profile Summary:', transformedData?.profileSummary);
  console.log('Technical Skills:', transformedData?.technicalSkills);
  console.log('Soft Skills:', transformedData?.softSkills);
  console.log('Work Experience:', transformedData?.workExperience);
  console.log('Education:', transformedData?.education);
  console.log('Projects:', transformedData?.projects);
  console.groupEnd();
  
  // Specific field checks
  console.group('🎯 Key Field Analysis');
  console.log('Name mapping:', {
    'firstName + lastName': `${originalCvData?.personalInfo?.firstName} ${originalCvData?.personalInfo?.lastName}`,
    'transformed name': transformedData?.personalInfo?.name
  });
  
  console.log('Title mapping:', {
    'jobApplied': originalCvData?.jobApplied,
    'currentPosition': originalCvData?.personalInfo?.currentPosition,
    'personalInfo.title': originalCvData?.personalInfo?.title,
    'transformed title': transformedData?.personalInfo?.title
  });
  
  console.log('Image mapping:', {
    'imageUrl': originalCvData?.personalInfo?.imageUrl,
    'profileImage': originalCvData?.personalInfo?.profileImage,
    'image': originalCvData?.personalInfo?.image,
    'transformed imageUrl': transformedData?.personalInfo?.imageUrl
  });
  
  console.log('Skills mapping:', {
    'original technical': originalCvData?.skills?.technical,
    'original soft': originalCvData?.skills?.soft,
    'transformed technical': transformedData?.technicalSkills,
    'transformed soft': transformedData?.softSkills
  });
  
  console.log('Work Experience mapping:', {
    'original count': originalCvData?.workExperience?.length || 0,
    'transformed count': transformedData?.workExperience?.length || 0,
    'first job original': originalCvData?.workExperience?.[0],
    'first job transformed': transformedData?.workExperience?.[0]
  });
  console.groupEnd();
  
  console.groupEnd();
};

// Test image loading specifically
export const testImageLoading = async (imageUrl) => {
  console.group('🖼️ Image Loading Test');
  console.log('Testing image URL:', imageUrl);
  
  if (!imageUrl) {
    console.warn('No image URL provided');
    console.groupEnd();
    return null;
  }
  
  // Check if it's already a data URL
  if (imageUrl.startsWith('data:')) {
    console.log('✅ Image is already a data URL (ready for PDF)');
    console.log('Data URL length:', imageUrl.length);
    console.log('Data URL preview:', imageUrl.substring(0, 100) + '...');
    console.groupEnd();
    return imageUrl;
  }
  
  try {
    console.log('Attempting to fetch image from URL...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(imageUrl, { 
      signal: controller.signal, 
      mode: 'cors' 
    });
    clearTimeout(timeoutId);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('Blob size:', blob.size, 'bytes');
    console.log('Blob type:', blob.type);
    
    const reader = new FileReader();
    const dataUrl = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    console.log('Data URL length:', dataUrl.length);
    console.log('Data URL preview:', dataUrl.substring(0, 100) + '...');
    console.log('✅ Image loaded successfully and converted to data URL');
    
    console.groupEnd();
    return dataUrl;
  } catch (error) {
    console.error('❌ Image loading failed:', error);
    console.groupEnd();
    return null;
  }
};

// Test function to generate sample CV data for testing
export const generateTestCVData = () => {
  return {
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main Street, Anytown, ST 12345",
      website: "johndoe.com",
      linkedin: "linkedin.com/in/johndoe",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      bio: "Experienced software engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership.",
      currentPosition: "Senior Software Engineer"
    },
    jobApplied: "Lead Software Engineer",
    workExperience: [
      {
        company: "Tech Innovation Corp",
        role: "Senior Software Engineer",
        title: "Senior Software Engineer",
        position: "Senior Software Engineer",
        startDate: "2020-01-01",
        endDate: "",
        current: true,
        location: "San Francisco, CA",
        description: "Lead development of cloud-native applications serving 1M+ users.",
        achievements: [
          "Reduced system latency by 40% through performance optimization",
          "Led a team of 5 engineers on critical product features",
          "Implemented CI/CD pipelines reducing deployment time by 60%"
        ]
      },
      {
        company: "StartupXYZ",
        role: "Full Stack Developer",
        title: "Full Stack Developer",
        position: "Full Stack Developer",
        startDate: "2018-06-01",
        endDate: "2019-12-31",
        current: false,
        location: "Austin, TX",
        description: "Developed full-stack web applications using React, Node.js, and AWS.",
        achievements: [
          "Built responsive web applications used by 50k+ users",
          "Integrated third-party APIs increasing platform functionality by 30%"
        ]
      }
    ],
    education: [
      {
        institution: "University of California, Berkeley",
        degree: "Bachelor of Science in Computer Science",
        fieldOfStudy: "Computer Science",
        startDate: "2014-08-01",
        endDate: "2018-05-01",
        location: "Berkeley, CA",
        grade: "3.8 GPA"
      }
    ],
    skills: {
      technical: [
        { name: "JavaScript", proficiency: 5 },
        { name: "React", proficiency: 5 },
        { name: "Node.js", proficiency: 4 },
        { name: "Python", proficiency: 4 },
        { name: "AWS", proficiency: 4 }
      ],
      soft: [
        { name: "Leadership", proficiency: 5 },
        { name: "Team Collaboration", proficiency: 5 },
        { name: "Problem Solving", proficiency: 5 },
        { name: "Communication", proficiency: 4 }
      ]
    },
    languages: [
      { language: "English", name: "English", proficiency: 5 },
      { language: "Spanish", name: "Spanish", proficiency: 3 },
      { language: "French", name: "French", proficiency: 2 }
    ],
    projects: [
      {
        title: "E-commerce Platform",
        name: "E-commerce Platform",
        role: "Lead Developer",
        technologies: "React, Node.js, PostgreSQL, AWS",
        description: "Full-stack e-commerce platform with real-time inventory management."
      }
    ],
    awardsAndHonors: [
      {
        title: "Employee of the Year",
        issuer: "Tech Innovation Corp",
        year: "2022",
        description: "Outstanding performance and leadership recognition."
      }
    ]
  };
};

export default { debugCVData, generateTestCVData, testImageLoading };
