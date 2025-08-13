import { Mail, Phone, MapPin, Globe, User } from 'lucide-react';
import { transformCVDataForTemplates, extractGitHubUsername } from '@/lib/cvDataTransformer';

export function ModernTemplate8({ cvData }) {
  const data = transformCVDataForTemplates(cvData);
  if (!data) return null;

  const githubUsername = extractGitHubUsername(cvData.projects);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-sm border border-gray-200">
      {/* Executive Header */}
      <div className="bg-blue-700 p-8">
        <div className="flex items-center text-white">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mr-8">
            {data.personalInfo.imageUrl ? (
              <img 
                src={data.personalInfo.imageUrl}
                alt="Professional headshot"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face';
                }}
              />
            ) : (
              <User size={48} className="text-blue-700" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-normal mb-2 break-words">{data.personalInfo.name}</h1>
            <p className="text-blue-200 text-lg break-words">{data.personalInfo.title}</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-stone-100 px-8 py-4 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-sm text-gray-700">
          {data.personalInfo.email && (
            <div className="flex items-center">
              <Mail size={14} className="mr-2 text-blue-700" />
              <span className="break-all">{data.personalInfo.email}</span>
            </div>
          )}
          {data.personalInfo.phone && (
            <div className="flex items-center">
              <Phone size={14} className="mr-2 text-blue-700" />
              <span className="break-all">{data.personalInfo.phone}</span>
            </div>
          )}
          {data.personalInfo.location && (
            <div className="flex items-center">
              <MapPin size={14} className="mr-2 text-blue-700" />
              <span className="break-words">{data.personalInfo.location}</span>
            </div>
          )}
          {data.personalInfo.website && (
            <div className="flex items-center">
              <Globe size={14} className="mr-2 text-blue-700" />
              <span className="break-all">{data.personalInfo.website}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        {/* Bio */}
        {data.personalInfo.bio && (
          <div className="mb-8">
            <h2 className="text-xl font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Bio
            </h2>
            <p className="text-gray-700 leading-relaxed break-words">{data.personalInfo.bio}</p>
          </div>
        )}

        {/* Executive Summary */}
        {data.profileSummary && (
          <div className="mb-8">
            <h2 className="text-xl font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Executive Summary
            </h2>
            <p className="text-gray-700 leading-relaxed break-words">{data.profileSummary}</p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-8">
          {/* Skills Sidebar */}
          <div className="space-y-8">
            {data.technicalSkills.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Expertise</h3>
                <div className="space-y-2">
                  {data.technicalSkills.slice(0, 8).map((skill, index) => (
                    <div key={index} className="text-sm text-gray-700 py-1 break-words">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.softSkills.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Leadership</h3>
                <div className="space-y-2">
                  {data.softSkills.map((skill, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-blue-700 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="break-words">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.languages.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Languages</h3>
                <div className="space-y-2">
                  {data.languages.map((lang, index) => (
                    <div key={index} className="flex justify-between items-center text-sm text-gray-700">
                      <span className="break-words">{lang.name}</span>
                      <span className="text-blue-700 text-xs">
                        {lang.proficiency === 5 ? 'Native' : 
                         lang.proficiency === 4 ? 'Fluent' :
                         lang.proficiency === 3 ? 'Intermediate' :
                         lang.proficiency === 2 ? 'Basic' : 'Beginner'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.awardsAndHonors.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Credentials</h3>
                <div className="space-y-2">
                  {data.awardsAndHonors.map((award, index) => (
                    <div key={index} className="text-sm text-gray-700 leading-relaxed">
                      <div className="font-medium break-words">{award.title}</div>
                      <div className="text-blue-700 text-xs break-words">{award.issuer}</div>
                      {award.year && (
                        <div className="text-gray-500 text-xs">{award.year}</div>
                      )}
                      {award.description && (
                        <div className="text-gray-600 text-xs leading-relaxed mt-1 break-words">
                          {award.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="col-span-3 space-y-8">
            {data.workExperience.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Professional Achievements</h3>
                {data.workExperience.map((job, index) => (
                  <div key={index} className="mb-6 border-l-2 border-blue-700 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 break-words">{job.position}</h4>
                        <p className="text-blue-700 font-medium break-words">{job.company}</p>
                        {job.location && (
                          <p className="text-gray-500 text-sm">{job.location}</p>
                        )}
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
                            <span className="text-blue-700 mr-2">•</span>
                            <span className="break-words">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-8">
              {data.education.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Background</h3>
                  {data.education.map((edu, index) => (
                    <div key={index} className="mb-4">
                      <h4 className="font-medium text-gray-900 break-words">{edu.degree}</h4>
                      <p className="text-blue-700 break-words">{edu.school}</p>
                      {edu.field && (
                        <p className="text-gray-600 text-sm break-words">{edu.field}</p>
                      )}
                      <p className="text-gray-500 text-sm break-words">{edu.period}</p>
                      {edu.description && (
                        <p className="text-gray-600 text-sm leading-relaxed mt-1 break-words">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {data.projects.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Signature Projects</h3>
                  {data.projects.map((project, index) => (
                    <div key={index} className="mb-4">
                      <h4 className="font-medium text-gray-900 text-sm break-words">{project.name}</h4>
                      {project.tech && (
                        <p className="text-blue-700 text-xs break-words">{project.tech}</p>
                      )}
                      {project.description && (
                        <p className="text-gray-700 text-xs leading-relaxed mt-1 break-words">{project.description}</p>
                      )}
                      {project.highlights && project.highlights.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {project.highlights.slice(0, 2).map((highlight, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                              {highlight}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

