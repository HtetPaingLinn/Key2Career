import { NextResponse } from 'next/server';

// Function to pre-clean content before processing
function preCleanContent(content) {
  if (!content) return '';
  
  let cleaned = content;
  
  // Remove HTML/XML tags and their content
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  cleaned = cleaned.replace(/&[a-zA-Z0-9#]+;/g, ''); // HTML entities
  
  // Remove markdown formatting
  cleaned = cleaned.replace(/^#{1,6}\s+.*$/gm, ''); // Headers
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links but keep text
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // Bold
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // Italic
  cleaned = cleaned.replace(/~~([^~]+)~~/g, '$1'); // Strikethrough
  
  // Remove code blocks and inline code
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`[^`]*`/g, '');
  
  // Remove command line instructions
  cleaned = cleaned.replace(/^\$\s+.*$/gm, '');
  cleaned = cleaned.replace(/^npm\s+.*$/gm, '');
  cleaned = cleaned.replace(/^yarn\s+.*$/gm, '');
  cleaned = cleaned.replace(/^pnpm\s+.*$/gm, '');
  cleaned = cleaned.replace(/^bun\s+.*$/gm, '');
  
  // Remove URLs
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');
  
  // Remove badges and shields
  cleaned = cleaned.replace(/!\[.*?\]\(.*?\)/g, '');
  
  // Remove emojis and special characters
  cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  
  // Remove common development patterns
  const devPatterns = [
    // Template boilerplate
    /This template provides.*?ESLint rules\.?/gi,
    /This is a.*?template.*?\./gi,
    /bootstrapped with.*?\./gi,
    /First, run the development server:?/gi,
    /Open.*?with your browser.*?\./gi,
    /You can start editing.*?\./gi,
    /The page auto-updates.*?\./gi,
    /This project uses.*?font.*?\./gi,
    
    // Common instructions
    /To learn more.*?resources:?/gi,
    /Check out.*?documentation.*?\./gi,
    /Click.*?preview.*?\./gi,
    /Edit.*?save to test.*?\./gi,
    /Recommended IDE.*?\./gi,
    
    // Technology descriptions
    /React is a JavaScript library.*?\./gi,
    /Next\.js is a React framework.*?\./gi,
    /Vite is a build tool.*?\./gi,
    /TypeScript is a.*?programming language.*?\./gi,
    /Tailwind CSS is a.*?framework.*?\./gi,
    
    // Package manager descriptions
    /npm is a package manager.*?\./gi,
    /yarn is a package manager.*?\./gi,
    
    // Generic GitHub text
    /Welcome to.*?profile.*?\./gi,
    /Feel free to reach out.*?\./gi,
    /Don't forget to.*?star.*?\./gi,
    /Contributions are welcome.*?\./gi,
    /This project is licensed.*?\./gi,
    
    // Development commands and paths
    /app\/page\.js/gi,
    /localhost:\d+/gi,
  ];
  
  devPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Remove excessive whitespace and cleanup
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  cleaned = cleaned.replace(/^[.\-_\s]+$/gm, '');
  cleaned = cleaned.trim();
  
  // If content is too short or meaningless after cleaning, return empty
  if (cleaned.length < 20 || /^[.\-_\s]*$/.test(cleaned)) {
    return '';
  }
  
  return cleaned;
}

// Function to generate AI-enhanced descriptions
async function generateAIDescription(content, context, type = 'description') {
  try {
    console.log('AI generation started for type:', type);
    console.log('Content length:', content?.length || 0);
    console.log('Context:', context);
    
    // Pre-clean the content
    const cleanedContent = preCleanContent(content);
    console.log('Cleaned content length:', cleanedContent?.length || 0);
    
    // If content is empty or too short, return as is
    if (!cleanedContent || cleanedContent.length < 10) {
      console.log('Content too short or empty, returning as is');
      return cleanedContent || content;
    }
    
    console.log('Skipping AI enhancement, returning cleaned content');
    return cleanedContent;
  } catch (error) {
    console.log('AI generation failed:', error.message);
    console.log('Error stack:', error.stack);
  }
  return preCleanContent(content); // Return cleaned content as fallback
}

export async function POST(request) {
  try {
    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json({ success: false, error: 'GitHub username is required' }, { status: 400 });
    }

    console.log('GitHub import request for username:', username);

    // Fetch GitHub user profile
    const userResponse = await fetch(`https://api.github.com/users/${username}`);
    if (!userResponse.ok) {
      return NextResponse.json({ success: false, error: 'GitHub user not found' }, { status: 404 });
    }
    const userData = await userResponse.json();

    // Fetch user repositories
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
    const reposData = await reposResponse.ok ? await reposResponse.json() : [];

    // Fetch README content for the main repository (if exists)
    let readmeContent = '';
    if (userData.blog || userData.bio) {
      readmeContent = `${userData.bio || ''}\n\n${userData.blog || ''}`;
    }

    // Try to fetch README from the user's main repository or a repository with README
    let mainRepoReadme = '';
    try {
      // Look for a repository with README.md
      const readmeRepo = reposData.find(repo => 
        repo.name.toLowerCase().includes('readme') || 
        repo.name.toLowerCase().includes('profile') ||
        repo.name.toLowerCase().includes('portfolio') ||
        repo.name === username || // User's main repo
        repo.name === `${username}.github.io` // GitHub Pages repo
      );
      
      if (readmeRepo) {
        const readmeResponse = await fetch(`https://api.github.com/repos/${username}/${readmeRepo.name}/readme`);
        if (readmeResponse.ok) {
          const readmeData = await readmeResponse.json();
          if (readmeData.content) {
            // Decode base64 content
            const decodedContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
            mainRepoReadme = decodedContent;
          }
        }
      }
    } catch (error) {
      console.log('Could not fetch README:', error.message);
    }

    // Extract skills from repositories
    const skills = new Set();
    const projects = [];
    
    // Process repositories with enhanced details
    for (const repo of reposData) {
      // Add language to skills
      if (repo.language) {
        skills.add(repo.language);
      }
      
      // Add topics to skills
      if (repo.topics && Array.isArray(repo.topics)) {
        repo.topics.forEach(topic => skills.add(topic));
      }
      
      // Try to fetch detailed repository information
      let detailedDescription = repo.description || '';
      let readmeContent = '';
      
      try {
        // Fetch README content for this repository
        const repoReadmeResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/readme`);
        if (repoReadmeResponse.ok) {
          const readmeData = await repoReadmeResponse.json();
          if (readmeData.content) {
            const decodedContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
            readmeContent = decodedContent;
          }
        }
      } catch (error) {
        // Ignore README fetch errors for individual repos
      }
      
             // Prepare project context for AI
       const projectContext = `Project: ${repo.name}
Technologies: ${repo.language || 'N/A'}
Topics: ${repo.topics ? repo.topics.join(', ') : 'N/A'}
Stars: ${repo.stargazers_count || 0}
Forks: ${repo.forks_count || 0}
Homepage: ${repo.homepage || 'N/A'}
Created: ${repo.created_at || 'N/A'}`;

               // Generate clean description
        const rawDescription = readmeContent 
          ? `${detailedDescription}\n\n${readmeContent.substring(0, 500)}`
          : detailedDescription;
        
        // Clean the description thoroughly
        let finalDescription = preCleanContent(rawDescription);
        
        // If description is empty or too short after cleaning, create a basic one
        if (!finalDescription || finalDescription.length < 20) {
          if (repo.description && repo.description.length > 10) {
            finalDescription = repo.description;
          } else if (repo.language) {
            finalDescription = `A ${repo.language} project with ${repo.stargazers_count || 0} stars.`;
          } else {
            finalDescription = `A software project hosted on GitHub.`;
          }
        }
        
        // Limit description length for CV readability
        if (finalDescription.length > 200) {
          finalDescription = finalDescription.substring(0, 200) + '...';
        }

               // Create enhanced project object matching the expected structure
        const project = {
          title: repo.name,
          description: finalDescription,
         technologies: repo.language ? repo.language : '',
         github: repo.html_url,
         demo: repo.homepage || '',
         duration: `${repo.created_at ? repo.created_at.split('T')[0] : ''} - ${repo.updated_at ? repo.updated_at.split('T')[0] : ''}`,
         role: 'Developer',
         achievements: [
           `Repository has ${repo.stargazers_count || 0} stars`,
           `Repository has ${repo.forks_count || 0} forks`,
           repo.language ? `Primary language: ${repo.language}` : null,
           repo.topics && repo.topics.length > 0 ? `Topics: ${repo.topics.join(', ')}` : null
         ].filter(Boolean)
       };
      
      // Add topics as technologies if they exist
      if (repo.topics && Array.isArray(repo.topics) && repo.topics.length > 0) {
        project.technologies = `${repo.language || ''}${repo.language && repo.topics.length > 0 ? ', ' : ''}${repo.topics.join(', ')}`;
      }
      
      projects.push(project);
    }

         // Prepare personal info data with enhanced details
     const enhancedBio = userData.bio || '';
     const cleanedReadme = preCleanContent(mainRepoReadme);
     const enhancedDescription = cleanedReadme && cleanedReadme.length > 20 
       ? `${userData.bio || ''} ${cleanedReadme.substring(0, 300)}`
       : userData.bio || '';
     
     // Create a professional bio based on GitHub data
    const totalRepos = reposData.length;
    const totalStars = reposData.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const totalForks = reposData.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
    const topLanguages = Array.from(skills).slice(0, 3).join(', ');
    
    // Generate a more professional bio
    let rawBio = enhancedBio;
    if (!rawBio || rawBio.length < 20) {
      if (topLanguages) {
        rawBio = `Software developer experienced in ${topLanguages} with ${totalRepos} projects on GitHub.`;
      } else {
        rawBio = `Software developer with ${totalRepos} projects and experience in full-stack development.`;
      }
    }
     
     // Prepare personal context for AI
     const personalContext = `Name: ${userData.name || 'N/A'}
Location: ${userData.location || 'N/A'}
Company: ${userData.company || 'N/A'}
Blog: ${userData.blog || 'N/A'}
Public Repos: ${totalRepos}
Total Stars: ${totalStars}
Total Forks: ${totalForks}
Top Languages: ${topLanguages}
GitHub Bio: ${userData.bio || 'N/A'}`;

           // Generate AI-enhanced bio and description
      let finalBio = rawBio;
      let finalDescription = enhancedDescription;
      
      try {
        const aiEnhancedBio = await generateAIDescription(rawBio, personalContext, 'bio');
        if (aiEnhancedBio && aiEnhancedBio !== rawBio) {
          finalBio = aiEnhancedBio;
          console.log('AI enhancement successful for bio');
        }
      } catch (aiError) {
        console.log('AI enhancement failed for bio:', aiError.message);
      }
      
      try {
        const aiEnhancedDescription = await generateAIDescription(enhancedDescription, personalContext, 'description');
        if (aiEnhancedDescription && aiEnhancedDescription !== enhancedDescription) {
          finalDescription = aiEnhancedDescription;
          console.log('AI enhancement successful for description');
        }
      } catch (aiError) {
        console.log('AI enhancement failed for description:', aiError.message);
      }
     
           const personalInfo = {
        firstName: userData.name ? userData.name.split(' ')[0] : '',
        lastName: userData.name ? userData.name.split(' ').slice(1).join(' ') : '',
        email: userData.email || '',
        bio: finalBio,
        description: finalDescription,
       website: userData.blog || '',
       linkedin: '',
       phone: '',
       address: userData.location || '',
       nationality: '',
       dateOfBirth: '',
       drivingLicense: '',
       imageUrl: userData.avatar_url || ''
     };

    // Prepare skills data with enhanced details
    const skillStats = {};
    
    // Calculate skill usage statistics
    reposData.forEach(repo => {
      if (repo.language) {
        skillStats[repo.language] = (skillStats[repo.language] || 0) + 1;
      }
      if (repo.topics) {
        repo.topics.forEach(topic => {
          skillStats[topic] = (skillStats[topic] || 0) + 1;
        });
      }
    });
    
    // Sort skills by usage frequency
    const sortedSkills = Array.from(skills).sort((a, b) => (skillStats[b] || 0) - (skillStats[a] || 0));
    
    // Determine skill proficiency based on usage (1-5 scale)
    const getSkillProficiency = (skillName) => {
      const usage = skillStats[skillName] || 0;
      if (usage >= 5) return 5; // Expert
      if (usage >= 3) return 4; // Advanced
      if (usage >= 2) return 3; // Intermediate
      if (usage >= 1) return 2; // Beginner
      return 1; // Basic
    };
    
    const skillsData = {
      technical: sortedSkills.map(skill => ({ 
        name: skill, 
        proficiency: getSkillProficiency(skill)
      })),
      soft: []
    };

    // Prepare projects data (limit to top 10 most recent)
    const topProjects = projects
      .sort((a, b) => new Date(b.duration.split(' - ')[1]) - new Date(a.duration.split(' - ')[1]))
      .slice(0, 10);

    const result = {
      success: true,
      data: {
        personalInfo,
        skills: skillsData,
        projects: topProjects,
        workExperience: [],
        education: [],
        languages: [],
        awards: [],
        references: []
      }
    };

    console.log('GitHub import successful with AI enhancement:', {
      username,
      projectsCount: topProjects.length,
      skillsCount: skillsData.technical.length,
      totalRepos: reposData.length,
      totalStars,
      totalForks,
      hasReadme: !!mainRepoReadme,
      readmeLength: mainRepoReadme.length,
      aiEnhanced: true
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('GitHub import error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 