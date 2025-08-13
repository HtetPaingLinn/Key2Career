// Test function for styled PDF generation
import { generateStyledPDF } from './styledPdfGenerator';

// Sample CV data for testing
const sampleCVData = {
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, City, State 12345",
    website: "www.johndoe.com",
    linkedin: "linkedin.com/in/johndoe",
    bio: "Experienced software engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Passionate about creating scalable solutions and mentoring junior developers.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
  },
  jobApplied: "Senior Software Engineer",
  workExperience: [
    {
      company: "Tech Innovation Corp",
      role: "Senior Software Engineer",
      position: "Senior Software Engineer",
      startDate: "2020-01-01",
      endDate: null,
      current: true,
      location: "San Francisco, CA",
      description: "Lead development of cloud-native applications serving 1M+ users. Architect scalable microservices and mentor junior developers.",
      achievements: [
        "Reduced system latency by 40% through performance optimization",
        "Led a team of 5 engineers on critical product features",
        "Implemented CI/CD pipelines reducing deployment time by 60%",
        "Mentored 8 junior developers, with 100% retention rate"
      ]
    },
    {
      company: "StartupXYZ",
      role: "Full Stack Developer",
      position: "Full Stack Developer",
      startDate: "2018-06-01",
      endDate: "2019-12-31",
      current: false,
      location: "Austin, TX",
      description: "Developed full-stack web applications using React, Node.js, and AWS. Collaborated with cross-functional teams to deliver user-centric solutions.",
      achievements: [
        "Built responsive web applications used by 50k+ users",
        "Integrated third-party APIs increasing platform functionality by 30%",
        "Optimized database queries improving response times by 25%"
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
      grade: "3.8 GPA",
      description: "Graduated Magna Cum Laude. Relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems."
    }
  ],
  skills: {
    technical: [
      { name: "JavaScript", proficiency: 5, level: 5 },
      { name: "React", proficiency: 5, level: 5 },
      { name: "Node.js", proficiency: 4, level: 4 },
      { name: "Python", proficiency: 4, level: 4 },
      { name: "AWS", proficiency: 4, level: 4 },
      { name: "Docker", proficiency: 3, level: 3 },
      { name: "Kubernetes", proficiency: 3, level: 3 },
      { name: "GraphQL", proficiency: 3, level: 3 }
    ],
    soft: [
      { name: "Leadership", proficiency: 5, level: 5 },
      { name: "Team Collaboration", proficiency: 5, level: 5 },
      { name: "Problem Solving", proficiency: 5, level: 5 },
      { name: "Communication", proficiency: 4, level: 4 },
      { name: "Project Management", proficiency: 4, level: 4 },
      { name: "Mentoring", proficiency: 4, level: 4 }
    ]
  },
  languages: [
    { language: "English", proficiency: 5, cefr: "C2" },
    { language: "Spanish", proficiency: 3, cefr: "B1" },
    { language: "French", proficiency: 2, cefr: "A2" }
  ],
  projects: [
    {
      title: "E-commerce Platform",
      role: "Lead Developer",
      technologies: "React, Node.js, PostgreSQL, AWS",
      github: "https://github.com/johndoe/ecommerce-platform",
      demo: "https://demo.ecommerce-platform.com",
      description: "Full-stack e-commerce platform with real-time inventory management, payment processing, and analytics dashboard.",
      highlights: ["Real-time updates", "Payment integration", "Analytics dashboard"]
    },
    {
      title: "Task Management API",
      role: "Backend Developer",
      technologies: "Python, FastAPI, MongoDB",
      github: "https://github.com/johndoe/task-management-api",
      description: "RESTful API for task management with user authentication, role-based permissions, and real-time notifications."
    }
  ],
  awards: [
    {
      title: "Employee of the Year",
      issuer: "Tech Innovation Corp",
      year: "2022",
      description: "Recognized for outstanding performance and leadership in delivering critical project milestones."
    },
    {
      title: "Dean's List",
      issuer: "UC Berkeley",
      year: "2017, 2018",
      description: "Academic excellence recognition for maintaining high GPA."
    }
  ],
  certifications: [
    {
      name: "AWS Solutions Architect",
      issuingOrganization: "Amazon Web Services",
      date: "2021-03-15",
      url: "https://aws.amazon.com/certification/"
    },
    {
      name: "Certified Kubernetes Administrator",
      issuingOrganization: "Cloud Native Computing Foundation",
      date: "2020-09-10"
    }
  ]
};

// Test function to generate PDF for all supported templates
export const testAllTemplates = async () => {
  const supportedTemplates = ['modern-template-1', 'modern-template-4', 'modern-template-7', 'modern-template-10'];
  
  console.log('Testing styled PDF generation for all supported templates...');
  
  for (const templateId of supportedTemplates) {
    try {
      console.log(`Testing ${templateId}...`);
      const filename = `test_${templateId}.pdf`;
      await generateStyledPDF(sampleCVData, templateId, filename);
      console.log(`✅ ${templateId} - PDF generated successfully`);
    } catch (error) {
      console.error(`❌ ${templateId} - Error:`, error.message);
    }
  }
  
  console.log('Testing completed!');
};

// Test function for a specific template
export const testTemplate = async (templateId) => {
  try {
    console.log(`Testing ${templateId}...`);
    const filename = `test_${templateId}_${Date.now()}.pdf`;
    await generateStyledPDF(sampleCVData, templateId, filename);
    console.log(`✅ ${templateId} - PDF generated successfully as ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ ${templateId} - Error:`, error.message);
    return false;
  }
};

// Export sample data for use in other tests
export { sampleCVData };

export default { testAllTemplates, testTemplate, sampleCVData };


