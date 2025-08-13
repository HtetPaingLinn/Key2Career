import { User } from 'lucide-react';
import { transformCVDataForTemplates, extractGitHubUsername } from '@/lib/cvDataTransformer';

export function ModernTemplate11({ cvData }) {
  const data = transformCVDataForTemplates(cvData);
  if (!data) return null;

  const githubUsername = extractGitHubUsername(cvData.projects);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-sm border border-gray-200">
      {/* Minimalist Header */}
      <div className="bg-white p-8 border-b border-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
            {data.personalInfo.imageUrl ? (
              <img
                src={data.personalInfo.imageUrl}
                alt="Professional headshot"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face';
                }}
              />
            ) : (
              <User size={32} className="text-gray-600" />
            )}
          </div>
          <h1 className="text-3xl font-light text-gray-900 mb-2 break-words">{data.personalInfo.name}</h1>
          <p className="text-red-800 text-lg break-words">{data.personalInfo.title}</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-red-50 px-8 py-4 border-b border-gray-200">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-gray-700">
          {data.personalInfo.email && <span className="break-all">{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span className="break-all">{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span className="break-words">{data.personalInfo.location}</span>}
          {data.personalInfo.website && <span className="break-all">{data.personalInfo.website}</span>}
        </div>
      </div>

      <div className="p-8">
        {/* Bio */}
        {data.personalInfo.bio && (
          <div className="text-center mb-8">
            <h2 className="text-xl font-light text-gray-900 mb-4 pb-2 border-b border-gray-200">Bio</h2>
            <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto break-words">{data.personalInfo.bio}</p>
          </div>
        )}

        {/* Professional Summary */}
        {data.profileSummary && (
          <div className="text-center mb-8">
            <h2 className="text-xl font-light text-gray-900 mb-4 pb-2 border-b border-gray-200">Professional Summary</h2>
            <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto break-words">{data.profileSummary}</p>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="space-y-8">
            {data.workExperience.length > 0 && (
              <div>
                <h3 className="text-lg font-light text-gray-900 mb-4 pb-2 border-b border-gray-200">Professional Experience</h3>
                {data.workExperience.map((job, index) => (
                  <div key={index} className="mb-6">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 break-words">{job.position}</h4>
                        <p className="text-red-700 break-words">{job.company}</p>
                        {job.location && <p className="text-gray-500 text-sm break-words">{job.location}</p>}
                      </div>
                      <span className="text-sm text-gray-600 whitespace-nowrap ml-4">{job.period}</span>
                    </div>
                    {job.description && (
                      <p className="text-gray-700 text-sm leading-relaxed break-words">{job.description}</p>
                    )}
                    {job.achievements && job.achievements.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {job.achievements.map((achievement, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start">
                            <span className="text-red-700 mr-2">•</span>
                            <span className="break-words">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {data.education.length > 0 && (
              <div>
                <h3 className="text-lg font-light text-gray-900 mb-4 pb-2 border-b border-gray-200">Education</h3>
                {data.education.map((edu, index) => (
                  <div key={index} className="mb-4">
                    <h4 className="font-medium text-gray-900 break-words">{edu.degree}</h4>
                    <p className="text-red-700 break-words">{edu.school}</p>
                    {edu.field && <p className="text-gray-500 text-sm break-words">{edu.field}</p>}
                    <p className="text-gray-500 text-sm break-words">{edu.period}</p>
                    {edu.description && (
                      <p className="text-gray-600 text-sm leading-relaxed mt-1 break-words">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {data.technicalSkills.length > 0 && (
              <div>
                <h3 className="text-lg font-light text-gray-900 mb-4 pb-2 border-b border-gray-200">Technical Skills</h3>
                <div className="grid grid-cols-2 gap-2">
                  {data.technicalSkills.map((skill, index) => (
                    <div key={index} className="text-sm text-gray-700 py-2 text-center border border-gray-200 break-words">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.softSkills.length > 0 && (
              <div>
                <h3 className="text-lg font-light text-gray-900 mb-4 pb-2 border-b border-gray-200">Core Competencies</h3>
                <div className="space-y-2">
                  {data.softSkills.map((skill, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-red-800 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="break-words">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.projects.length > 0 && (
              <div>
                <h3 className="text-lg font-light text-gray-900 mb-4 pb-2 border-b border-gray-200">Notable Projects</h3>
                {data.projects.map((project, index) => (
                  <div key={index} className="mb-4">
                    <h4 className="font-medium text-gray-900 text-sm break-words">{project.name}</h4>
                    {project.tech && <p className="text-red-700 text-xs break-words">{project.tech}</p>}
                    {project.description && (
                      <p className="text-gray-700 text-xs leading-relaxed mt-1 break-words">{project.description}</p>
                    )}
                    {project.highlights && project.highlights.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {project.highlights.slice(0, 2).map((highlight, idx) => (
                          <span key={idx} className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {data.awardsAndHonors.length > 0 && (
              <div>
                <h3 className="text-lg font-light text-gray-900 mb-4 pb-2 border-b border-gray-200">Certifications</h3>
                <div className="space-y-2">
                  {data.awardsAndHonors.map((cert, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      <div className="font-medium break-words">{cert.title}</div>
                      <div className="text-red-700 text-xs break-words">{cert.issuer}</div>
                      {cert.year && <div className="text-gray-500 text-xs">{cert.year}</div>}
                      {cert.description && (
                        <div className="text-gray-600 text-xs leading-relaxed mt-1 break-words">{cert.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.languages.length > 0 && (
              <div>
                <h3 className="text-lg font-light text-gray-900 mb-4 pb-2 border-b border-gray-200">Languages</h3>
                <div className="space-y-2">
                  {data.languages.map((lang, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      <div className="font-medium break-words">{lang.name}</div>
                      <div className="text-red-700 text-xs">
                        {lang.proficiency === 5 ? 'Native' : 
                         lang.proficiency === 4 ? 'Fluent' : 
                         lang.proficiency === 3 ? 'Intermediate' : 
                         lang.proficiency === 2 ? 'Basic' : 'Beginner'}
                      </div>
                      {lang.description && (
                        <div className="text-gray-600 text-xs leading-relaxed mt-1 break-words">{lang.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
