import { Mail, Phone, MapPin, Globe, Calendar, BarChart3, User } from 'lucide-react';
import { transformCVDataForTemplates, extractGitHubUsername } from '@/lib/cvDataTransformer';

export function ModernTemplate13({ cvData }) {
  const data = transformCVDataForTemplates(cvData);
  if (!data) return null;

  const githubUsername = extractGitHubUsername(cvData.projects);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-lg border border-gray-200 overflow-hidden">
      <div className="flex min-h-[800px]">
        {/* Left Sidebar - Notebook Design */}
        <div className="w-1/3 bg-blue-600 relative">
          {/* Spiral Binding Effect */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-blue-700 flex flex-col justify-center space-y-4 z-10">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-300 rounded-full mx-auto border-2 border-gray-400"></div>
            ))}
          </div>
          
          <div className="p-8 pr-12 text-white relative">
            {/* Professional Photo */}
            <div className="mb-8">
              <div className="w-40 h-48 bg-white rounded-lg overflow-hidden shadow-lg mx-auto border-4 border-orange-400">
                {data.personalInfo.imageUrl ? (
                  <img
                    src={data.personalInfo.imageUrl}
                    alt="Professional headshot"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={64} className="text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2 break-words">{data.personalInfo.name}</h1>
              <div className="bg-orange-500 px-4 py-2 rounded-full inline-block">
                <span className="text-white font-medium text-sm break-words">{data.personalInfo.title}</span>
              </div>
            </div>

            {/* Chart Visualization */}
            <div className="mb-8">
              <div className="bg-orange-500 p-4 rounded-lg">
                <div className="flex items-end space-x-2 h-20">
                  <div className="w-6 bg-blue-300 rounded-t" style={{height: '80%'}}></div>
                  <div className="w-6 bg-blue-300 rounded-t" style={{height: '60%'}}></div>
                  <div className="w-6 bg-blue-300 rounded-t" style={{height: '90%'}}></div>
                  <div className="w-6 bg-blue-300 rounded-t" style={{height: '70%'}}></div>
                  <div className="w-6 bg-blue-300 rounded-t" style={{height: '85%'}}></div>
                </div>
                <div className="flex justify-center mt-2">
                  <BarChart3 size={20} className="text-white" />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-orange-300 font-medium text-sm uppercase tracking-wide">Contact</h3>
              <div className="space-y-3 text-sm">
                {data.personalInfo.phone && (
                  <div className="flex items-center">
                    <Phone size={14} className="mr-3 text-orange-300" />
                    <span className="break-all">{data.personalInfo.phone}</span>
                  </div>
                )}
                {data.personalInfo.email && (
                  <div className="flex items-center">
                    <Mail size={14} className="mr-3 text-orange-300" />
                    <span className="break-all">{data.personalInfo.email}</span>
                  </div>
                )}
                {data.personalInfo.website && (
                  <div className="flex items-center">
                    <Globe size={14} className="mr-3 text-orange-300" />
                    <span className="break-all">{data.personalInfo.website}</span>
                  </div>
                )}
                {data.personalInfo.location && (
                  <div className="flex items-center">
                    <MapPin size={14} className="mr-3 text-orange-300" />
                    <span className="break-words">{data.personalInfo.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 p-8 bg-orange-50">
          {/* Bio */}
          {data.personalInfo.bio && (
            <div className="mb-8">
              <div className="bg-blue-700 text-white px-6 py-3 rounded-full inline-block mb-4">
                <h2 className="text-lg font-medium">BIO</h2>
              </div>
              <div className="bg-orange-400 p-6 rounded-lg text-white">
                <p className="leading-relaxed break-words">{data.personalInfo.bio}</p>
              </div>
            </div>
          )}

          {/* About Me */}
          {data.profileSummary && (
            <div className="mb-8">
              <div className="bg-blue-700 text-white px-6 py-3 rounded-full inline-block mb-4">
                <h2 className="text-lg font-medium">ABOUT ME</h2>
              </div>
              <div className="bg-orange-400 p-6 rounded-lg text-white">
                <p className="leading-relaxed break-words">{data.profileSummary}</p>
              </div>
            </div>
          )}

          {/* Experience */}
          {data.workExperience.length > 0 && (
            <div className="mb-8">
              <div className="bg-blue-700 text-white px-6 py-3 rounded-full inline-block mb-4">
                <h2 className="text-lg font-medium">EXPERIENCE</h2>
              </div>
              <div className="space-y-6">
                {data.workExperience.map((job, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 break-words">{job.position}</h3>
                        <p className="text-blue-700 font-medium break-words">{job.company}</p>
                        {job.location && <p className="text-gray-500 text-sm break-words">{job.location}</p>}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 ml-4">
                        <Calendar size={14} className="mr-1" />
                        <span className="whitespace-nowrap">{job.period}</span>
                      </div>
                    </div>
                    {job.description && (
                      <p className="text-gray-700 text-sm leading-relaxed mb-3 break-words">{job.description}</p>
                    )}
                    {job.achievements && job.achievements.length > 0 && (
                      <ul className="space-y-2 text-gray-700 text-sm">
                        {job.achievements.map((achievement, idx) => (
                          <li key={idx} className="flex items-start">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span className="break-words">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <div className="mb-8">
              <div className="bg-blue-700 text-white px-6 py-3 rounded-full inline-block mb-4">
                <h2 className="text-lg font-medium">EDUCATION</h2>
              </div>
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-blue-700 text-sm font-medium break-words">{edu.period}</p>
                        <h3 className="font-medium text-gray-900 break-words">{edu.degree}</h3>
                        <p className="text-gray-600 break-words">{edu.school}</p>
                        {edu.field && <p className="text-gray-500 text-sm break-words">{edu.field}</p>}
                        {edu.description && (
                          <p className="text-gray-600 text-sm leading-relaxed mt-2 break-words">{edu.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {(data.technicalSkills.length > 0 || data.softSkills.length > 0) && (
            <div className="mb-8">
              <div className="bg-blue-700 text-white px-6 py-3 rounded-full inline-block mb-4">
                <h2 className="text-lg font-medium">SKILLS</h2>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                {data.technicalSkills.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.technicalSkills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm break-words">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {data.softSkills.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Core Competencies</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.softSkills.map((skill, index) => (
                        <span key={index} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm break-words">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Projects */}
          {data.projects.length > 0 && (
            <div className="mb-8">
              <div className="bg-blue-700 text-white px-6 py-3 rounded-full inline-block mb-4">
                <h2 className="text-lg font-medium">PROJECTS</h2>
              </div>
              <div className="space-y-4">
                {data.projects.map((project, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="font-medium text-gray-900 mb-2 break-words">{project.name}</h3>
                    {project.tech && <p className="text-blue-700 text-sm mb-2 break-words">{project.tech}</p>}
                    {project.description && (
                      <p className="text-gray-700 text-sm leading-relaxed break-words">{project.description}</p>
                    )}
                    {project.highlights && project.highlights.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.highlights.map((highlight, idx) => (
                          <span key={idx} className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages.length > 0 && (
            <div>
              <div className="bg-blue-700 text-white px-6 py-3 rounded-full inline-block mb-4">
                <h2 className="text-lg font-medium">LANGUAGES</h2>
              </div>
              <div className="space-y-4">
                {data.languages.map((lang, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-900 break-words">{lang.name}</h3>
                      <span className="text-blue-700 text-sm font-medium">
                        {lang.proficiency === 5 ? 'Native' : 
                         lang.proficiency === 4 ? 'Fluent' : 
                         lang.proficiency === 3 ? 'Intermediate' : 
                         lang.proficiency === 2 ? 'Basic' : 'Beginner'}
                      </span>
                    </div>
                    {lang.description && (
                      <p className="text-gray-600 text-sm leading-relaxed mt-2 break-words">{lang.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
