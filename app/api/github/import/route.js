import { NextResponse } from 'next/server';

// Function to pre-clean content before AI processing
function preCleanContent(content) {
  if (!content) return '';
  
  let cleaned = content;
  
  // Remove markdown headers
  cleaned = cleaned.replace(/^#{1,6}\s+.*$/gm, '');
  
  // Remove markdown links but keep the text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove markdown formatting
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // Bold
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // Italic
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1'); // Code
  
  // Remove code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // Remove emojis
  cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  
  // Remove excessive dots and ellipsis
  cleaned = cleaned.replace(/\.{3,}/g, '...');
  
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  
  // Remove common GitHub template text
  const templatePatterns = [
    /This template provides a minimal setup to get .* working in .* with HMR and some ESLint rules\./gi,
    /This is a .* template for .*\./gi,
    /Click the preview link to take a look at your changes\./gi,
    /Edit .* and save to test HMR/gi,
    /Check out the .* documentation to learn more\./gi,
    /Recommended IDE setup: .*/gi,
    /Vite is a build tool that aims to provide a faster and leaner development experience/gi,
    /React is a JavaScript library for building user interfaces/gi,
    /Node\.js is a JavaScript runtime built on Chrome's V8 JavaScript engine/gi,
    /TypeScript is a strongly typed programming language that builds on JavaScript/gi,
    /Next\.js is a React framework that gives you building blocks to create web applications/gi,
    /Tailwind CSS is a utility-first CSS framework/gi,
    /npm is a package manager for the JavaScript programming language/gi,
    /yarn is a package manager that doubles down as project manager/gi,
    /GitHub is where over 100 million developers shape the future of software/gi,
    /Welcome to my GitHub profile/gi,
    /Feel free to reach out if you have any questions/gi,
    /Don't forget to give a star if you like this project/gi,
    /Contributions are welcome/gi,
    /Please read the contributing guidelines/gi,
    /This project is licensed under the .* License/gi
  ];
  
  templatePatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Remove lines that are just dots or dashes
  cleaned = cleaned.replace(/^[.\-_\s]+$/gm, '');
  
  // Remove empty lines at the beginning and end
  cleaned = cleaned.trim();
  
  // If content is too short after cleaning, return original content
  if (cleaned.length < 10) {
    console.log('Content too short after cleaning, returning original');
    return content;
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
    
    // Check if GROQ_API_KEY is available
    if (!process.env.GROQ_API_KEY) {
      console.log('GROQ_API_KEY not found, skipping AI enhancement');
      return cleanedContent;
    }
    console.log('GROQ_API_KEY found, proceeding with AI enhancement');
    
    let prompt = '';
    
    if (type === 'description') {
      prompt = `Transform this technical GitHub content into a professional, human-readable description suitable for a CV. 
      
      Requirements:
      - Remove any markdown formatting, headers, or technical boilerplate
      - Focus on the actual project functionality and achievements
      - Write in clear, professional language
      - Highlight key features, technologies used, and business value
      - Keep it concise but informative (2-3 sentences)
      - Make it suitable for a professional CV/resume
      
      Content to transform: ${cleanedContent}`;
    } else if (type === 'bio') {
      prompt = `Transform this GitHub bio/profile content into a professional, concise bio suitable for a CV.
      
      Requirements:
      - Remove any markdown formatting, emojis, or technical jargon
      - Focus on professional achievements, skills, and experience
      - Write in clear, professional language
      - Keep it concise (1-2 sentences)
      - Highlight key skills and expertise
      - Make it suitable for a professional CV/resume
      
      Content to transform: ${cleanedContent}`;
    } else {
      prompt = `Convert this technical content into a professional, human-readable description for a CV. Remove any markdown, headers, or unnecessary formatting: ${cleanedContent}`;
    }
    
    // Import the groq functions directly instead of making HTTP calls
    const { generateDescription, checkGrammar } = await import('@/lib/groq');
    
    if (type === 'description') {
      console.log('Calling generateDescription...');
      const result = await generateDescription(prompt, context);
      console.log('AI result:', result);
      return result || cleanedContent;
    } else {
      console.log('Calling checkGrammar...');
      const result = await checkGrammar(cleanedContent);
      console.log('AI result:', result);
      return result || cleanedContent;
    }
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

               // Generate AI-enhanced description
        const rawDescription = readmeContent 
          ? `${detailedDescription}\n\n${readmeContent.substring(0, 800)}...`
          : detailedDescription;
        
        let finalDescription = rawDescription;
        try {
          const aiEnhancedDescription = await generateAIDescription(
            rawDescription, 
            projectContext, 
            'description'
          );
          if (aiEnhancedDescription && aiEnhancedDescription !== rawDescription) {
            finalDescription = aiEnhancedDescription;
            console.log('AI enhancement successful for project:', repo.name);
          } else {
            console.log('AI enhancement skipped for project:', repo.name);
          }
        } catch (aiError) {
          console.log('AI enhancement failed for project:', repo.name, aiError.message);
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
     const enhancedDescription = mainRepoReadme 
       ? `${userData.bio || ''}\n\n${mainRepoReadme.substring(0, 1000)}...`
       : readmeContent || userData.bio || '';
     
     // Create a more detailed bio based on GitHub stats
     const totalRepos = reposData.length;
     const totalStars = reposData.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
     const totalForks = reposData.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
     const topLanguages = Array.from(skills).slice(0, 5).join(', ');
     
     const rawBio = enhancedBio || `Full-stack developer with ${totalRepos} repositories, ${totalStars} stars, and ${totalForks} forks on GitHub. Specialized in ${topLanguages}.`;
     
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
      .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
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