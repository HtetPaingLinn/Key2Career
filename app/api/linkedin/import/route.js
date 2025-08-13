import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

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
  
  // Remove LinkedIn-specific template text
  const templatePatterns = [
    /Connect with me on LinkedIn/gi,
    /Let's connect/gi,
    /Open to new opportunities/gi,
    /Available for freelance work/gi,
    /Feel free to reach out/gi,
    /Looking for new challenges/gi,
    /Passionate about/gi,
    /Experienced in/gi,
    /Specialized in/gi
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
      prompt = `Transform this LinkedIn content into a professional, human-readable description suitable for a CV. 
      
      Requirements:
      - Remove any LinkedIn-specific formatting or boilerplate
      - Focus on the actual professional achievements and experience
      - Write in clear, professional language
      - Highlight key skills, achievements, and business value
      - Keep it concise but informative (2-3 sentences)
      - Make it suitable for a professional CV/resume
      
      Content to transform: ${cleanedContent}`;
    } else if (type === 'bio') {
      prompt = `Transform this LinkedIn profile content into a professional, concise bio suitable for a CV.
      
      Requirements:
      - Remove any LinkedIn-specific formatting, emojis, or informal language
      - Focus on professional achievements, skills, and experience
      - Write in clear, professional language
      - Keep it concise (1-2 sentences)
      - Highlight key skills and expertise
      - Make it suitable for a professional CV/resume
      
      Content to transform: ${cleanedContent}`;
    } else {
      prompt = `Convert this LinkedIn content into a professional, human-readable description for a CV. Remove any formatting or unnecessary text: ${cleanedContent}`;
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
    const { linkedinUrl } = await request.json();
    
    if (!linkedinUrl) {
      return NextResponse.json({ success: false, error: 'LinkedIn URL is required' }, { status: 400 });
    }

         console.log('LinkedIn import request for URL:', linkedinUrl);

     // Check if APIFY_API_TOKEN is available
     if (!process.env.APIFY_API_TOKEN) {
       return NextResponse.json({ 
         success: false, 
         error: 'Apify API token not configured. Please set APIFY_API_TOKEN environment variable.' 
       }, { status: 500 });
     }

     // Initialize the ApifyClient with API token
     const client = new ApifyClient({
       token: process.env.APIFY_API_TOKEN,
     });

     console.log('Apify client initialized, starting data extraction...');

     try {
       // Prepare Actor input
       const input = {
         "url": linkedinUrl
       };

       console.log('Running Apify actor for LinkedIn profile extraction...');
       
       // Run the Actor and wait for it to finish
       const run = await client.actor("e1xYKjtHLG2Js5YdC").call(input);
       
       console.log('Apify actor completed, fetching results...');

       // Fetch Actor results from the run's dataset
       const { items } = await client.dataset(run.defaultDatasetId).listItems();
       
       if (!items || items.length === 0) {
         return NextResponse.json({ 
           success: false, 
           error: 'No data found for the provided LinkedIn URL. Please check the URL and try again.' 
         }, { status: 404 });
       }

       console.log('Apify results received:', items.length, 'items');
       
       // Get the first (and should be only) item from the results
       const linkedinData = items[0];
       
                                                                                               console.log('LinkedIn data extracted:', {
          name: linkedinData.name || linkedinData.fullName,
          username: linkedinData.id || linkedinData.linkedin_id,
          headline: linkedinData.headline,
          location: linkedinData.location,
          city: linkedinData.city,
          country: linkedinData.country_code,
          profilePicture: linkedinData.profilePicture || linkedinData.avatar || 'Not available',
          about: linkedinData.about,
          experienceCount: linkedinData.experience?.length || 0,
          educationCount: linkedinData.education?.length || 0,
          skillsCount: linkedinData.skills?.length || 0,
          certificationsCount: linkedinData.certifications?.length || 0,
          languagesCount: linkedinData.languages?.length || 0,
          volunteerCount: linkedinData.volunteerExperience?.length || 0,
          publicationsCount: linkedinData.publications?.length || 0,
          awardsCount: linkedinData.awards?.length || 0,
          honorsAndAwardsCount: linkedinData.honors_and_awards?.length || 0,
          projectsCount: linkedinData.projects?.length || 0,
          coursesCount: linkedinData.courses?.length || 0,
          connections: linkedinData.connections,
          followers: linkedinData.followers
        });

        // Log detailed certification info if available
        if (linkedinData.certifications && linkedinData.certifications.length > 0) {
          console.log('Certifications found:', linkedinData.certifications.map(cert => ({
            title: cert.title,
            subtitle: cert.subtitle,
            meta: cert.meta,
            credentialUrl: cert.credential_url
          })));
        }

                 // Log detailed education info if available
         if (linkedinData.education && linkedinData.education.length > 0) {
           console.log('Education found:', linkedinData.education.map(edu => ({
             degree: edu.degree,
             title: edu.title,
             field: edu.field,
             startYear: edu.start_year,
             endYear: edu.end_year,
             instituteLogo: edu.institute_logo_url,
             description: edu.description,
             descriptionHtml: edu.description_html,
             url: edu.url
           })));
         }

         // Log detailed honors and awards info if available
         if (linkedinData.honors_and_awards && linkedinData.honors_and_awards.length > 0) {
           console.log('Honors and Awards found:', linkedinData.honors_and_awards.map(honor => ({
             title: honor.title,
             publication: honor.publication,
             date: honor.date,
             description: honor.description
           })));
         }

         // Log detailed projects info if available
         if (linkedinData.projects && linkedinData.projects.length > 0) {
           console.log('Projects found:', linkedinData.projects.map(project => ({
             title: project.title,
             description: project.description,
             startDate: project.start_date,
             endDate: project.end_date
           })));
         }

         // Log detailed courses info if available
         if (linkedinData.courses && linkedinData.courses.length > 0) {
           console.log('Courses found:', linkedinData.courses.map(course => ({
             title: course.title,
             subtitle: course.subtitle
           })));
         }

                                   // Process the LinkedIn data with comprehensive fields
          const personalInfo = {
            firstName: linkedinData.first_name || (linkedinData.name ? linkedinData.name.split(' ')[0] : ''),
            lastName: linkedinData.last_name || (linkedinData.name ? linkedinData.name.split(' ').slice(1).join(' ') : ''),
            fullName: linkedinData.name || linkedinData.fullName || '',
            username: linkedinData.id || linkedinData.linkedin_id || '',
            email: linkedinData.email || '',
            bio: linkedinData.headline || '',
            description: linkedinData.about || linkedinData.summary || '',
            website: linkedinData.website || '',
            linkedin: linkedinUrl,
            phone: linkedinData.phone || '',
            address: `${linkedinData.location || ''}${linkedinData.city ? `, ${linkedinData.city}` : ''}`.trim(),
            city: linkedinData.city || '',
            country: linkedinData.country_code || '',
            nationality: linkedinData.nationality || '',
            dateOfBirth: linkedinData.dateOfBirth || '',
            drivingLicense: linkedinData.drivingLicense || '',
            imageUrl: linkedinData.profilePicture || linkedinData.avatar || linkedinData.profileImage || '',
            connections: linkedinData.connections || 0,
            followers: linkedinData.followers || 0,
            currentCompany: linkedinData.current_company?.name || '',
            currentPosition: linkedinData.current_company?.title || linkedinData.position || ''
          };

                                   // Process work experience with detailed information
          const workExperience = (linkedinData.experience || []).map(exp => {
            // Handle invalid dates by replacing with "Present"
            let startDate = exp.startDate || exp.start_date || exp.startYear || exp.start_year || '';
            let endDate = exp.endDate || exp.end_date || exp.endYear || exp.end_year || '';
            
            // Clean and validate start date
            if (startDate && typeof startDate === 'string') {
              startDate = startDate.trim();
              if (startDate === '' || startDate === 'null' || startDate === 'undefined' || 
                  startDate === 'Invalid Date' || startDate === 'N/A' || startDate === 'TBD') {
                startDate = '';
              }
            }
            
            // Clean and validate end date - if invalid/empty, it means job is ongoing
            if (endDate && typeof endDate === 'string') {
              endDate = endDate.trim();
              if (endDate === '' || endDate === 'null' || endDate === 'undefined' || 
                  endDate === 'Invalid Date' || endDate === 'N/A' || endDate === 'TBD' ||
                  endDate === 'Present' || endDate === 'Current' || endDate === 'Ongoing' || 
                  endDate === 'Now' || endDate === 'Till Date' || endDate === 'Till Now') {
                endDate = 'Present';
              }
            } else if (!endDate) {
              // If no end date provided, assume it's ongoing
              endDate = 'Present';
            }
            
            // Clean and validate other fields
            const title = exp.title || exp.jobTitle || '';
            const company = exp.company || exp.companyName || exp.organization || '';
            const location = exp.location || '';
            const employmentType = exp.employmentType || exp.employment_type || '';
            
            // Clean description - remove invalid data markers
            let description = exp.description || exp.summary || exp.descriptionHtml || '';
            if (description && typeof description === 'string') {
              description = description.trim();
              if (description === 'null' || description === 'undefined' || description === 'Invalid Data') {
                description = '';
              }
            }
            
            return {
              title: title,
              company: company,
              duration: exp.duration || exp.timePeriod || `${startDate} - ${endDate}`,
              description: description,
              achievements: exp.achievements || [],
              location: location,
              employmentType: employmentType,
              companyLogo: exp.companyLogo || exp.company_logo_url || exp.instituteLogoUrl || '',
              companyUrl: exp.companyUrl || exp.company_url || exp.url || '',
              startDate: startDate,
              endDate: endDate,
              current: endDate === 'Present' || exp.current || false
            };
          });

                                   // Process education with detailed information
          const education = (linkedinData.education || []).map(edu => {
            // Handle invalid dates by replacing with "Present"
            let startYear = edu.startYear || edu.start_year || '';
            let endYear = edu.endYear || edu.end_year || '';
            
            // Clean and validate start year
            if (startYear && typeof startYear === 'string') {
              startYear = startYear.trim();
              if (startYear === '' || startYear === 'null' || startYear === 'undefined' || 
                  startYear === 'Invalid Date' || startYear === 'N/A' || startYear === 'TBD') {
                startYear = '';
              }
            }
            
            // Clean and validate end year - if invalid/empty, it means education is ongoing
            if (endYear && typeof endYear === 'string') {
              endYear = endYear.trim();
              if (endYear === '' || endYear === 'null' || endYear === 'undefined' || 
                  endYear === 'Invalid Date' || endYear === 'N/A' || endYear === 'TBD' ||
                  endYear === 'Present' || endYear === 'Current' || endYear === 'Ongoing' || 
                  endYear === 'Now' || endYear === 'Till Date' || endYear === 'Till Now') {
                endYear = 'Present';
              }
            } else if (!endYear) {
              // If no end year provided, assume it's ongoing
              endYear = 'Present';
            }
            
            // Clean and validate other fields
            const degree = edu.degree || edu.degreeName || '';
            const school = edu.school || edu.schoolName || edu.title || edu.institute || '';
            const institution = edu.title || edu.institute || edu.school || edu.schoolName || '';
            const field = edu.field || edu.fieldOfStudy || '';
            const grade = edu.grade || edu.gpa || '';
            const location = edu.location || '';
            
            // Clean description - remove invalid data markers
            let description = edu.description || edu.summary || edu.descriptionHtml || edu.field || '';
            if (description && typeof description === 'string') {
              description = description.trim();
              if (description === 'null' || description === 'undefined' || description === 'Invalid Data') {
                description = '';
              }
            }
            
            return {
              degree: degree,
              school: school,
              institution: institution,
              duration: edu.duration || edu.timePeriod || `${startYear} - ${endYear}`,
              description: description,
              achievements: edu.achievements || [],
              field: field,
              grade: grade,
              activities: edu.activities || [],
              instituteLogo: edu.instituteLogo || edu.institute_logo_url || edu.instituteLogoUrl || '',
              instituteUrl: edu.instituteUrl || edu.institute_url || edu.url || '',
              startYear: startYear,
              endYear: endYear,
              current: endYear === 'Present' || edu.current || false,
              // Additional detailed fields
              startDate: edu.startDate || edu.start_date || startYear || '',
              endDate: edu.endDate || edu.end_date || endYear || '',
              location: location,
              descriptionHtml: edu.descriptionHtml || edu.description_html || '',
              activitiesAndSocieties: edu.activitiesAndSocieties || edu.activities_and_societies || [],
              honors: edu.honors || [],
              additionalInfo: edu.additionalInfo || edu.additional_info || ''
            };
          });

                 // Process technical and soft skills
         const allSkills = linkedinData.skills || [];
         const skillsData = {
           technical: allSkills.map(skill => ({ 
             name: skill.name || skill, 
             proficiency: skill.proficiency || 4
           })),
           soft: [] // Apify doesn't typically separate soft skills
         };

         // Process courses as additional skills
         const courses = (linkedinData.courses || []).map(course => ({
           name: course.title || '',
           proficiency: 4,
           type: 'course'
         }));

                                   // Process certifications with detailed information
          const certifications = (linkedinData.certifications || []).map(cert => {
            // Extract date from meta information
            let issueDate = '';
            if (cert.meta) {
              const dateMatch = cert.meta.match(/(?:Issued|Completed)\s+(\w+\s+\d{4})/i);
              if (dateMatch) {
                issueDate = dateMatch[1];
              }
            }
            
            // If no date found, use fallback
            if (!issueDate) {
              issueDate = cert.issueDate || cert.date || 'Present';
            }
            
            // Extract expiry date from meta information
            let expiryDate = '';
            if (cert.meta) {
              const expiryMatch = cert.meta.match(/Expires\s+(\w+\s+\d{4})/i);
              if (expiryMatch) {
                expiryDate = expiryMatch[1];
              }
            }
            
            return {
              title: cert.title || cert.name || '',
              subtitle: cert.subtitle || '',
              issuer: cert.subtitle || cert.issuer || cert.issuingOrganization || '',
              date: issueDate,
              expiryDate: expiryDate || cert.expiryDate || '',
              description: cert.description || '',
              credential_id: cert.credential_id || cert.credentialId || '',
              credential_url: cert.credential_url || cert.credentialUrl || '',
              meta: cert.meta || '',
              // Additional detailed fields for certifications
              degree: cert.degree || '',
              field: cert.field || '',
              instituteLogo: cert.institute_logo_url || '',
              instituteUrl: cert.url || '',
              startYear: cert.start_year || '',
              endYear: cert.end_year || '',
              descriptionHtml: cert.description_html || '',
              activitiesAndSocieties: cert.activities_and_societies || [],
              honors: cert.honors || [],
              additionalInfo: cert.additional_info || '',
              category: cert.category || '',
              recognitionType: cert.recognitionType || cert.recognition_type || ''
            };
          });

        // Process languages with proper mapping
        const languages = (linkedinData.languages || []).map(lang => {
          // Generate random proficiency level between 3-5 (intermediate to native)
          const randomProficiency = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
          
          return {
            name: lang.title || lang.name || lang.language || '',
            language: lang.title || lang.name || lang.language || '', // Store as both name and language
            proficiency: randomProficiency,
            description: '',
            achievements: []
          };
        });

                                   // Process volunteer experience as work experience
          const volunteerExperience = (linkedinData.volunteerExperience || []).map(vol => {
            // Handle invalid dates by replacing with "Present"
            let startDate = vol.startDate || vol.start_date || vol.startYear || vol.start_year || '';
            let endDate = vol.endDate || vol.end_date || vol.endYear || vol.end_year || '';
            
            // Clean and validate start date
            if (startDate && typeof startDate === 'string') {
              startDate = startDate.trim();
              if (startDate === '' || startDate === 'null' || startDate === 'undefined' || 
                  startDate === 'Invalid Date' || startDate === 'N/A' || startDate === 'TBD') {
                startDate = '';
              }
            }
            
            // Clean and validate end date - if invalid/empty, it means volunteer work is ongoing
            if (endDate && typeof endDate === 'string') {
              endDate = endDate.trim();
              if (endDate === '' || endDate === 'null' || endDate === 'undefined' || 
                  endDate === 'Invalid Date' || endDate === 'N/A' || endDate === 'TBD' ||
                  endDate === 'Present' || endDate === 'Current' || endDate === 'Ongoing' || 
                  endDate === 'Now' || endDate === 'Till Date' || endDate === 'Till Now') {
                endDate = 'Present';
              }
            } else if (!endDate) {
              // If no end date provided, assume it's ongoing
              endDate = 'Present';
            }
            
            // Clean and validate other fields
            const title = vol.title || vol.role || '';
            const company = vol.organization || vol.company || vol.organizationName || '';
            const location = vol.location || '';
            
            // Clean description - remove invalid data markers
            let description = vol.description || vol.summary || vol.descriptionHtml || '';
            if (description && typeof description === 'string') {
              description = description.trim();
              if (description === 'null' || description === 'undefined' || description === 'Invalid Data') {
                description = '';
              }
            }
            
            return {
              title: title,
              company: company,
              duration: vol.duration || vol.timePeriod || `${startDate} - ${endDate}`,
              description: description,
              achievements: vol.achievements || [],
              location: location,
              organizationLogo: vol.organizationLogo || vol.organization_logo_url || '',
              organizationUrl: vol.organizationUrl || vol.organization_url || vol.url || '',
              startDate: startDate,
              endDate: endDate,
              current: endDate === 'Present' || vol.current || false
            };
          });

                 // Process publications
         const publications = (linkedinData.publications || []).map(pub => ({
           title: pub.title || pub.name || '',
           issuer: pub.publisher || pub.publication || pub.issuer || '',
           date: pub.date || pub.publicationDate || pub.issueDate || '',
           description: pub.description || pub.summary || pub.descriptionHtml || '',
           achievements: [pub.url ? `URL: ${pub.url}` : null].filter(Boolean),
           url: pub.url || '',
           publisher: pub.publisher || '',
           publicationDate: pub.publicationDate || pub.date || '',
           coAuthors: pub.coAuthors || pub.co_authors || []
         }));

                                   // Process awards and honors with detailed information
          const awards = (linkedinData.awards || []).map(award => {
            // Handle invalid dates by replacing with "Present"
            let awardDate = award.date || award.issueDate || award.year || '';
            
            // Check if date is invalid or indicates ongoing
            if (!awardDate || awardDate === 'Present' || awardDate === 'Current' || awardDate === 'Ongoing' || 
                awardDate === 'Now' || awardDate === 'Till Date' || awardDate === 'Till Now') {
              awardDate = 'Present';
            }
            
            return {
              title: award.title || award.name || '',
              issuer: award.issuer || award.issuingOrganization || award.organization || '',
              date: awardDate,
              description: award.description || award.summary || award.descriptionHtml || '',
              achievements: [],
              organization: award.organization || award.issuingOrganization || '',
              year: awardDate,
              url: award.url || '',
              // Additional detailed fields
              issueDate: awardDate,
              expiryDate: award.expiryDate || '',
              credentialId: award.credentialId || award.credential_id || '',
              credentialUrl: award.credentialUrl || award.credential_url || '',
              meta: award.meta || '',
              subtitle: award.subtitle || '',
              location: award.location || '',
              category: award.category || '',
              recognitionType: award.recognitionType || award.recognition_type || ''
            };
          });

          // Process honors and awards (separate from regular awards)
          const honorsAndAwards = (linkedinData.honors_and_awards || []).map(honor => {
            // Handle invalid dates by replacing with "Present"
            let honorDate = honor.date || '';
            
            // Check if date is invalid or indicates ongoing
            if (!honorDate || honorDate === 'Present' || honorDate === 'Current' || honorDate === 'Ongoing' || 
                honorDate === 'Now' || honorDate === 'Till Date' || honorDate === 'Till Now') {
              honorDate = 'Present';
            }
            
            // Extract year from date if it's a valid date
            let year = '';
            if (honorDate && honorDate !== 'Present') {
              try {
                year = new Date(honorDate).getFullYear().toString();
              } catch (e) {
                year = honorDate;
              }
            } else {
              year = honorDate;
            }
            
            return {
              title: honor.title || '',
              issuer: honor.publication || honor.issuer || honor.issuingOrganization || '',
              date: honorDate,
              description: honor.description || '',
              achievements: [],
              publication: honor.publication || '',
              year: year,
              url: honor.url || ''
            };
          });

                  // Process projects
          const projects = (linkedinData.projects || []).map(project => {
            // Handle invalid dates by replacing with "Present"
            const startDate = project.start_date || project.startDate || '';
            let endDate = project.end_date || project.endDate || '';
            
            // Check if end date is invalid or indicates ongoing
            if (!endDate || endDate === 'Present' || endDate === 'Current' || endDate === 'Ongoing' || 
                endDate === 'Now' || endDate === 'Till Date' || endDate === 'Till Now') {
              endDate = 'Present';
            }
            
            return {
              title: project.title || '',
              description: project.description || '',
              startDate: startDate,
              endDate: endDate,
              duration: project.duration || `${startDate} - ${endDate}`,
              url: project.url || '',
              achievements: []
            };
          });

          const result = {
            success: true,
            data: {
              personalInfo,
              skills: skillsData,
              workExperience: [...workExperience, ...volunteerExperience], // Include volunteer experience
              education,
              projects, // Use actual projects from LinkedIn
              languages,
              certifications, // Separate certifications section
              awardsAndHonors: [...awards, ...honorsAndAwards], // Awards and honors (separate from certifications)
              references: [],
              publications // Keep empty for now, will be used for actual publications later
            }
          };

                  console.log('LinkedIn import successful:', {
            linkedinUrl,
            workExperienceCount: workExperience.length + volunteerExperience.length,
            educationCount: education.length,
            skillsCount: skillsData.technical.length + skillsData.soft.length,
            languagesCount: languages.length,
            awardsCount: awards.length + honorsAndAwards.length,
            publicationsCount: publications.length,
            certificationsCount: certifications.length,
            projectsCount: projects.length,
            coursesCount: courses.length
          });

        return NextResponse.json(result);

      } catch (apifyError) {
        console.error('Apify extraction failed:', apifyError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to extract LinkedIn data. Please check the URL and try again.' 
        }, { status: 500 });
      }

           
   } catch (error) {
     console.error('LinkedIn import error:', error);
     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
   }
} 