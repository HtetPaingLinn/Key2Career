// Utility to transform CV data between different schemas
// Maps our CV data structure to Reactive-Resume compatible format

export const transformToReactiveResumeFormat = (cvData) => {
  return {
    basics: {
      name: `${cvData.personalInfo?.firstName || ''} ${cvData.personalInfo?.lastName || ''}`.trim(),
      headline: cvData.jobApplied || '',
      email: cvData.personalInfo?.email || '',
      phone: cvData.personalInfo?.phone || '',
      location: cvData.personalInfo?.address || '',
      url: {
        label: cvData.personalInfo?.website || '',
        href: cvData.personalInfo?.website || '',
      },
      customFields: [
        ...(cvData.personalInfo?.linkedin ? [{
          id: 'linkedin',
          icon: 'linkedin-logo',
          name: 'LinkedIn',
          value: cvData.personalInfo.linkedin
        }] : []),
        ...(cvData.personalInfo?.dateOfBirth ? [{
          id: 'dob',
          icon: 'calendar',
          name: 'Date of Birth',
          value: cvData.personalInfo.dateOfBirth
        }] : []),
        ...(cvData.personalInfo?.nationality ? [{
          id: 'nationality',
          icon: 'globe',
          name: 'Nationality',
          value: cvData.personalInfo.nationality
        }] : []),
        ...(cvData.personalInfo?.drivingLicense ? [{
          id: 'driving',
          icon: 'car',
          name: 'Driving License',
          value: cvData.personalInfo.drivingLicense
        }] : [])
      ],
      picture: {
        url: cvData.personalInfo?.imageUrl || '',
        size: 64,
        aspectRatio: 1,
        borderRadius: 0,
        effects: {
          hidden: false,
          border: false,
          grayscale: false,
        },
      },
    },
    sections: {
      summary: {
        id: 'summary',
        name: 'Summary',
        items: [{
          id: 'summary-1',
          summary: cvData.personalInfo?.bio || cvData.personalInfo?.description || '',
        }],
        visible: !!(cvData.personalInfo?.bio || cvData.personalInfo?.description),
      },
      experience: {
        id: 'experience',
        name: 'Experience',
        items: (cvData.workExperience || []).map(exp => ({
          id: exp.id || Math.random().toString(),
          company: exp.company || '',
          position: exp.role || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.current ? '' : (exp.endDate || ''),
          current: exp.current || false,
          description: exp.description || '',
          summary: exp.achievements && exp.achievements.length > 0 ? exp.achievements.join('. ') : exp.description || '',
          achievements: exp.achievements || [],
          url: {
            label: exp.website || '',
            href: exp.website || '',
          },
        })),
        visible: (cvData.workExperience || []).length > 0,
      },
      education: {
        id: 'education',
        name: 'Education',
        items: (cvData.education || []).map(edu => ({
          id: edu.id || Math.random().toString(),
          institution: edu.institution || '',
          degree: edu.degree || '',
          fieldOfStudy: edu.fieldOfStudy || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          score: edu.grade || '',
          description: edu.description || '',
          summary: edu.description || '',
          location: edu.location || '',
          url: {
            label: '',
            href: '',
          },
        })),
        visible: (cvData.education || []).length > 0,
      },
      skills: {
        id: 'skills',
        name: 'Skills',
        items: [
          ...(cvData.skills?.technical || []).map(skill => ({
            id: skill.id || Math.random().toString(),
            name: skill.name || '',
            level: skill.proficiency || skill.level || 5,
            keywords: skill.keywords || [],
          })),
          ...(cvData.skills?.soft || []).map(skill => ({
            id: skill.id || Math.random().toString(),
            name: skill.name || '',
            level: skill.proficiency || skill.level || 5,
            keywords: skill.keywords || [],
          }))
        ],
        visible: ((cvData.skills?.technical || []).length + (cvData.skills?.soft || []).length) > 0,
      },
      languages: {
        id: 'languages',
        name: 'Languages',
        items: (cvData.languages || []).map(lang => ({
          id: lang.id || Math.random().toString(),
          name: lang.language || '',
          level: lang.proficiency || 5,
          description: lang.cefr || lang.certificate || '',
        })),
        visible: (cvData.languages || []).length > 0,
      },
      projects: {
        id: 'projects',
        name: 'Projects',
        items: (cvData.projects || []).map(proj => ({
          id: proj.id || Math.random().toString(),
          name: proj.title || '',
          description: proj.description || '',
          startDate: proj.startDate || '',
          endDate: proj.endDate || '',
          url: {
            label: proj.github || proj.demo || '',
            href: proj.github || proj.demo || '',
          },
          summary: proj.technologies || '',
          keywords: proj.technologies ? proj.technologies.split(',').map(t => t.trim()) : [],
        })),
        visible: (cvData.projects || []).length > 0,
      },
      awards: {
        id: 'awards',
        name: 'Awards',
        items: (cvData.awards || []).map(award => ({
          id: award.id || Math.random().toString(),
          title: award.title || '',
          issuer: award.issuer || '',
          date: award.year ? `${award.year}-01-01` : '',
          description: award.description || '',
          url: {
            label: '',
            href: '',
          },
        })),
        visible: (cvData.awards || []).length > 0,
      },
      certifications: {
        id: 'certifications',
        name: 'Certifications',
        items: (cvData.certifications || []).map(cert => ({
          id: cert.id || Math.random().toString(),
          name: cert.name || '',
          issuer: cert.issuingOrganization || '',
          date: cert.date || '',
          url: {
            label: '',
            href: '',
          },
        })),
        visible: (cvData.certifications || []).length > 0,
      },
      interests: {
        id: 'interests',
        name: 'Interests',
        items: (cvData.interests || []).map(interest => ({
          id: interest.id || Math.random().toString(),
          name: interest.value || interest || '',
          keywords: [],
        })),
        visible: (cvData.interests || []).length > 0,
      },
      volunteer: {
        id: 'volunteer',
        name: 'Volunteer',
        items: (cvData.volunteer || []).map(vol => ({
          id: vol.id || Math.random().toString(),
          organization: vol.organization || '',
          position: vol.role || '',
          startDate: vol.startDate || '',
          endDate: vol.endDate || '',
          description: vol.description || '',
          url: {
            label: '',
            href: '',
          },
        })),
        visible: (cvData.volunteer || []).length > 0,
      },
      publications: {
        id: 'publications',
        name: 'Publications',
        items: (cvData.publications || []).map(pub => ({
          id: pub.id || Math.random().toString(),
          name: pub.title || '',
          publisher: pub.publisher || '',
          date: pub.year ? `${pub.year}-01-01` : '',
          description: pub.description || '',
          url: {
            label: pub.url || '',
            href: pub.url || '',
          },
        })),
        visible: (cvData.publications || []).length > 0,
      },
      references: {
        id: 'references',
        name: 'References',
        items: (cvData.references || []).map(ref => ({
          id: ref.id || Math.random().toString(),
          name: ref.name || '',
          email: ref.email || '',
          phone: ref.phone || '',
          summary: `${ref.position || ''} ${ref.company ? `at ${ref.company}` : ''}`.trim(),
        })),
        visible: (cvData.references || []).length > 0,
      },
    },
    metadata: {
      template: 'azurill',
      layout: [
        [
          'summary',
          'experience',
          'education',
          'skills',
          'languages',
          'projects',
          'awards',
          'certifications',
          'interests',
          'volunteer',
          'publications',
          'references'
        ]
      ],
      css: {
        font: {
          family: 'Inter',
          subset: 'latin',
          variants: ['400', '500', '600', '700'],
          size: '14px',
        },
        page: {
          margin: '0.75in',
        },
      },
    },
  };
};

export const transformFromReactiveResumeFormat = (reactiveResumeData) => {
  // Transform back from Reactive-Resume format to our format
  const basics = reactiveResumeData.basics || {};
  const sections = reactiveResumeData.sections || {};
  
  return {
    personalInfo: {
      firstName: basics.name ? basics.name.split(' ')[0] || '' : '',
      lastName: basics.name ? basics.name.split(' ').slice(1).join(' ') || '' : '',
      email: basics.email || '',
      phone: basics.phone || '',
      address: basics.location || '',
      website: basics.url?.href || '',
      linkedin: basics.customFields?.find(f => f.id === 'linkedin')?.value || '',
      dateOfBirth: basics.customFields?.find(f => f.id === 'dob')?.value || '',
      nationality: basics.customFields?.find(f => f.id === 'nationality')?.value || '',
      drivingLicense: basics.customFields?.find(f => f.id === 'driving')?.value || '',
      bio: sections.summary?.content || '',
      description: sections.summary?.content || '',
      imageUrl: basics.picture?.url || '',
    },
    jobApplied: basics.headline || '',
    workExperience: (sections.experience?.items || []).map(item => ({
      id: item.id,
      company: item.company || '',
      role: item.position || '',
      location: item.location || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      current: item.current || false,
      description: item.description || '',
      achievements: item.achievements || [],
      website: item.url?.href || '',
    })),
    education: (sections.education?.items || []).map(item => ({
      id: item.id,
      institution: item.institution || '',
      degree: item.degree || '',
      fieldOfStudy: item.fieldOfStudy || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      grade: item.score || '',
      description: item.description || '',
      location: item.location || '',
    })),
    skills: {
      technical: (sections.skills?.items || []).filter(item => 
        !['communication', 'leadership', 'teamwork', 'problem solving', 'creativity'].includes(item.name.toLowerCase())
      ).map(item => ({
        id: item.id,
        name: item.name || '',
        proficiency: item.level || 5,
        keywords: item.keywords || [],
      })),
      soft: (sections.skills?.items || []).filter(item => 
        ['communication', 'leadership', 'teamwork', 'problem solving', 'creativity'].includes(item.name.toLowerCase())
      ).map(item => ({
        id: item.id,
        name: item.name || '',
        proficiency: item.level || 5,
        keywords: item.keywords || [],
      })),
    },
    languages: (sections.languages?.items || []).map(item => ({
      id: item.id,
      language: item.name || '',
      proficiency: item.level || 5,
      cefr: item.description || '',
      certificate: item.description || '',
    })),
    projects: (sections.projects?.items || []).map(item => ({
      id: item.id,
      title: item.name || '',
      description: item.description || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      technologies: item.summary || '',
      github: item.url?.href || '',
      demo: item.url?.href || '',
    })),
    awards: (sections.awards?.items || []).map(item => ({
      id: item.id,
      title: item.title || '',
      issuer: item.issuer || '',
      year: item.date ? new Date(item.date).getFullYear().toString() : '',
      description: item.description || '',
    })),
    certifications: (sections.certifications?.items || []).map(item => ({
      id: item.id,
      name: item.name || '',
      issuingOrganization: item.issuer || '',
      date: item.date || '',
    })),
    interests: (sections.interests?.items || []).map(item => ({
      id: item.id,
      value: item.name || '',
    })),
    volunteer: (sections.volunteer?.items || []).map(item => ({
      id: item.id,
      organization: item.organization || '',
      role: item.position || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      description: item.description || '',
    })),
    publications: (sections.publications?.items || []).map(item => ({
      id: item.id,
      title: item.name || '',
      publisher: item.publisher || '',
      year: item.date ? new Date(item.date).getFullYear().toString() : '',
      description: item.description || '',
      url: item.url?.href || '',
    })),
    references: (sections.references?.items || []).map(item => ({
      id: item.id,
      name: item.name || '',
      email: item.email || '',
      phone: item.phone || '',
      position: item.summary || '',
      company: '',
    })),
  };
}; 

// Data transformer to convert MongoDB CV data to template format
export const transformCVDataForTemplates = (cvData) => {
  if (!cvData) return null;

  const personalInfo = cvData.personalInfo || {};
  const skills = cvData.skills || {};
  const workExperience = cvData.workExperience || [];
  const education = cvData.education || [];
  const projects = cvData.projects || [];
  const languages = cvData.languages || [];
  const awardsAndHonors = cvData.awardsAndHonors || [];

  return {
    personalInfo: {
      name: `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim(),
      title: cvData.jobApplied || personalInfo.currentPosition || personalInfo.title || personalInfo.role || '',
      email: personalInfo.email || cvData.email || '',
      phone: personalInfo.phone || '',
      location: personalInfo.address || personalInfo.city || personalInfo.country || '',
      website: personalInfo.website || '',
      linkedin: personalInfo.linkedin || '',
      github: '', // Will be extracted from projects if available
      imageUrl: personalInfo.imageUrl || personalInfo.profileImage || personalInfo.image || '',
      bio: personalInfo.bio || personalInfo.description || '',
      fullName: personalInfo.fullName || `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim(),
      username: personalInfo.username || '',
      nationality: personalInfo.nationality || '',
      dateOfBirth: personalInfo.dateOfBirth || '',
      drivingLicense: personalInfo.drivingLicense || '',
      connections: personalInfo.connections || 0,
      followers: personalInfo.followers || 0,
      currentCompany: personalInfo.currentCompany || '',
      currentPosition: personalInfo.currentPosition || ''
    },
    profileSummary: personalInfo.description || personalInfo.bio || '',
    technicalSkills: (skills.technical || []).map(skill => typeof skill === 'string' ? skill : skill.name || skill.skill || '').filter(Boolean),
    softSkills: (skills.soft || []).map(skill => typeof skill === 'string' ? skill : skill.name || skill.skill || '').filter(Boolean),
    workExperience: workExperience.map(exp => {
      const startYear = exp.startDate ? new Date(exp.startDate).getFullYear() : '';
      const endYear = exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '');
      const period = exp.duration || `${startYear} - ${endYear}`;
      
      return {
        position: exp.role || exp.title || exp.position || '',
        company: exp.company || '',
        period: period,
        description: exp.description || '',
        achievements: exp.achievements || [],
        location: exp.location || '',
        employmentType: exp.employmentType || '',
        companyLogo: exp.companyLogo || '',
        companyUrl: exp.companyUrl || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        current: exp.current || false
      };
    }),
    education: education.map(edu => {
      const startYear = edu.startDate ? new Date(edu.startDate).getFullYear() : edu.startYear;
      const endYear = edu.endDate ? new Date(edu.endDate).getFullYear() : edu.endYear;
      const period = edu.duration || `${startYear || ''} - ${endYear || ''}`;
      
      return {
        degree: edu.degree || '',
        school: edu.school || edu.institution || '',
        period: period,
        description: edu.description || '',
        field: edu.fieldOfStudy || edu.field || '',
        grade: edu.grade || '',
        activities: edu.activities || [],
        instituteLogo: edu.instituteLogo || '',
        instituteUrl: edu.instituteUrl || '',
        startYear: startYear || '',
        endYear: endYear || '',
        current: edu.current || false,
        location: edu.location || '',
        achievements: edu.achievements || [],
        honors: edu.honors || [],
        activitiesAndSocieties: edu.activitiesAndSocieties || [],
        additionalInfo: edu.additionalInfo || ''
      };
    }),
    projects: projects.map(proj => ({
      name: proj.title || '',
      tech: proj.technologies || proj.languages || '',
      description: proj.description || '',
      url: proj.github || proj.demo || '',
      github: proj.github || '',
      demo: proj.demo || '',
      duration: proj.duration || '',
      role: proj.role || '',
      highlights: proj.highlights || [],
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
      achievements: proj.achievements || []
    })),
    languages: languages.map(lang => ({
      name: lang.name || lang.language || '',
      proficiency: lang.proficiency || 0,
      description: lang.description || '',
      achievements: lang.achievements || []
    })),
    certifications: [], // Will be populated from awardsAndHonors if needed
    awardsAndHonors: awardsAndHonors.map(award => ({
      title: award.title || '',
      issuer: award.issuer || '',
      date: award.date || '',
      description: award.description || '',
      achievements: award.achievements || [],
      publication: award.publication || '',
      year: award.year || '',
      url: award.url || ''
    }))
  };
};

// Helper function to extract GitHub username from projects
export const extractGitHubUsername = (projects) => {
  if (!projects || projects.length === 0) return '';
  
  for (const project of projects) {
    if (project.github && project.github.includes('github.com/')) {
      const match = project.github.match(/github\.com\/([^\/]+)/);
      if (match) return match[1];
    }
  }
  return '';
};

// Helper function to format date
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  } catch (error) {
    return dateString;
  }
};

// Helper function to format date range
export const formatDateRange = (startDate, endDate, current = false) => {
  const start = formatDate(startDate);
  const end = current ? 'Present' : formatDate(endDate);
  
  if (!start && !end) return '';
  if (!start) return end;
  if (!end) return start;
  
  return `${start} - ${end}`;
}; 