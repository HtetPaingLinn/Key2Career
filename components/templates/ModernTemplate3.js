import { Mail, Phone, MapPin, Globe, Briefcase, Award, Github, Linkedin } from 'lucide-react';
import { transformCVDataForTemplates, extractGitHubUsername } from '@/lib/cvDataTransformer';

export function ModernTemplate3({ cvData }) {
  const data = transformCVDataForTemplates(cvData);
  if (!data) return null;

  const githubUsername = extractGitHubUsername(cvData.projects);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-xl overflow-hidden">
      {/* Angular Header */}
      <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-black overflow-hidden">
        {/* Geometric Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 lg:w-64 h-32 lg:h-64 border-4 border-white transform rotate-45 translate-x-8 lg:translate-x-16 -translate-y-8 lg:-translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 lg:w-48 h-24 lg:h-48 border-4 border-white transform -rotate-12 -translate-x-4 lg:-translate-x-8 translate-y-4 lg:translate-y-8"></div>
        </div>
        
        <div className="relative z-10 p-4 lg:p-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            <div className="text-center lg:text-left flex-1 order-2 lg:order-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 lg:mb-4 break-words">{data.personalInfo.name}</h1>
              <div className="bg-red-500 bg-opacity-80 backdrop-blur-sm rounded-lg px-4 py-2 inline-block mb-4 lg:mb-6">
                <p className="text-white text-base lg:text-lg font-medium break-words">{data.personalInfo.title}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-red-100 max-w-md mx-auto lg:mx-0">
                {data.personalInfo.email && (
                  <div className="flex items-center justify-center lg:justify-start">
                    <Mail size={14} className="mr-2 text-red-300 flex-shrink-0" />
                    <span className="break-all text-wrap">{data.personalInfo.email}</span>
                  </div>
                )}
                {data.personalInfo.phone && (
                  <div className="flex items-center justify-center lg:justify-start">
                    <Phone size={14} className="mr-2 text-red-300 flex-shrink-0" />
                    <span className="break-all">{data.personalInfo.phone}</span>
                  </div>
                )}
                {data.personalInfo.location && (
                  <div className="flex items-center justify-center lg:justify-start">
                    <MapPin size={14} className="mr-2 text-red-300 flex-shrink-0" />
                    <span className="break-words">{data.personalInfo.location}</span>
                  </div>
                )}
                {data.personalInfo.website && (
                  <div className="flex items-center justify-center lg:justify-start">
                    <Globe size={14} className="mr-2 text-red-300 flex-shrink-0" />
                    <span className="break-all">{data.personalInfo.website}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Striking Photo Placement */}
            <div className="flex-shrink-0 order-1 lg:order-2">
              <div className="relative">
                <div className="w-32 h-32 lg:w-40 lg:h-40 overflow-hidden border-4 border-white shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  {data.personalInfo.imageUrl ? (
                    <img 
                      src={data.personalInfo.imageUrl}
                      alt="Professional headshot"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-red-500 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {data.personalInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 lg:w-8 lg:h-8 bg-red-500 border-4 border-white transform rotate-45"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8">
        {/* Bio */}
        {data.personalInfo.bio && (
          <div className="mb-8 lg:mb-12 text-center">
            <div className="inline-block bg-gradient-to-r from-red-600 to-black text-white px-6 lg:px-8 py-3 mb-4 lg:mb-6 transform -skew-x-3">
              <h2 className="text-lg lg:text-xl font-medium">Bio</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-600 leading-relaxed text-base lg:text-lg break-words">{data.personalInfo.bio}</p>
            </div>
          </div>
        )}

        {/* Professional Summary */}
        {data.profileSummary && (
          <div className="mb-8 lg:mb-12 text-center">
            <div className="inline-block bg-gradient-to-r from-red-600 to-black text-white px-6 lg:px-8 py-3 mb-4 lg:mb-6 transform -skew-x-3">
              <h2 className="text-lg lg:text-xl font-medium">Professional Profile</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-600 leading-relaxed text-base lg:text-lg break-words">{data.profileSummary}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Skills Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Technical Skills */}
            {data.technicalSkills.length > 0 && (
              <div className="bg-black text-white p-4 lg:p-6 rounded-lg transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-red-400 font-bold mb-4 text-lg">Technical Arsenal</h3>
                <div className="space-y-3">
                  {data.technicalSkills.slice(0, 6).map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm break-words">{skill}</span>
                        <span className="text-red-400 text-xs flex-shrink-0">{Math.floor(Math.random() * 30) + 70}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.floor(Math.random() * 30) + 70}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Soft Skills */}
            {data.softSkills.length > 0 && (
              <div className="bg-gradient-to-br from-red-50 to-gray-50 p-4 lg:p-6 rounded-lg border-l-4 border-red-600">
                <h3 className="text-gray-900 font-bold mb-4">Leadership</h3>
                <div className="space-y-2">
                  {data.softSkills.map((skill, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-red-600 transform rotate-45 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm break-words">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {data.languages.length > 0 && (
              <div className="bg-gradient-to-br from-gray-50 to-red-50 p-4 lg:p-6 rounded-lg border-l-4 border-red-600">
                <h3 className="text-gray-900 font-bold mb-4">Languages</h3>
                <div className="space-y-2">
                  {data.languages.map((lang, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-700 text-sm">{lang.name}</span>
                      <span className="text-red-600 text-xs font-medium">
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

            {/* Awards */}
            {data.awardsAndHonors.length > 0 && (
              <div className="bg-gradient-to-r from-red-600 to-black text-white p-4 lg:p-6 rounded-lg">
                <h3 className="font-bold mb-4 flex items-center">
                  <Award size={18} className="mr-2 text-red-300" />
                  Recognition
                </h3>
                <div className="space-y-2 text-sm">
                  {data.awardsAndHonors.slice(0, 3).map((award, index) => (
                    <div key={index} className="break-words">{award.title}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Links */}
            <div className="bg-gray-900 text-white p-4 lg:p-6 rounded-lg">
              <h3 className="font-bold mb-4">Connect</h3>
              <div className="space-y-2 text-sm">
                {data.personalInfo.linkedin && (
                  <div className="flex items-center">
                    <Linkedin size={14} className="mr-2 text-red-400 flex-shrink-0" />
                    <span className="break-words">LinkedIn Profile</span>
                  </div>
                )}
                {githubUsername && (
                  <div className="flex items-center">
                    <Github size={14} className="mr-2 text-red-400 flex-shrink-0" />
                    <span className="break-words">GitHub Profile</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6 lg:space-y-8">
            {/* Experience */}
            {data.workExperience.length > 0 && (
              <div>
                <div className="inline-block bg-gradient-to-r from-red-600 to-black text-white px-6 lg:px-8 py-3 mb-4 lg:mb-6 transform -skew-x-3">
                  <h2 className="text-lg lg:text-xl font-medium flex items-center">
                    <Briefcase size={20} className="mr-2" />
                    Professional Experience
                  </h2>
                </div>
                
                <div className="space-y-6">
                  {data.workExperience.map((job, index) => (
                    <div key={index} className="relative group">
                      <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-red-600 to-black rounded-full group-hover:w-2 transition-all duration-300"></div>
                      <div className="ml-6 bg-white border border-gray-200 rounded-lg p-4 lg:p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-3 gap-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 break-words">{job.position}</h3>
                            <p className="text-red-700 font-medium break-words">{job.company}</p>
                            {job.location && (
                              <p className="text-gray-500 text-sm">{job.location}</p>
                            )}
                          </div>
                          <div className="bg-black text-white px-3 py-1 text-sm font-medium transform -skew-x-3 self-start lg:self-auto whitespace-nowrap">
                            {job.period}
                          </div>
                        </div>
                        {job.description && (
                          <p className="text-gray-600 leading-relaxed break-words whitespace-pre-line">{job.description}</p>
                        )}
                        
                        {job.achievements && job.achievements.length > 0 && (
                          <ul className="mt-4 space-y-1">
                            {job.achievements.slice(0, 2).map((achievement, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start">
                                <span className="text-red-500 mr-2">•</span>
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education & Projects */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.education.length > 0 && (
                <div>
                  <div className="inline-block bg-gradient-to-r from-red-600 to-black text-white px-4 lg:px-6 py-2 mb-4 transform -skew-x-3">
                    <h2 className="text-lg font-medium">Education</h2>
                  </div>
                  {data.education.map((edu, index) => (
                    <div key={index} className="bg-gray-50 border-l-4 border-red-600 p-4 lg:p-6 mb-4">
                      <h3 className="font-bold text-gray-900 break-words">{edu.degree}</h3>
                      <p className="text-red-700 font-medium break-words">{edu.school}</p>
                      {edu.field && (
                        <p className="text-gray-600 text-sm mt-1">{edu.field}</p>
                      )}
                      <p className="text-gray-500 text-sm mt-2 break-words">{edu.period}</p>
                      {edu.description && (
                        <p className="text-gray-600 text-sm mt-2 leading-relaxed break-words">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {data.projects.length > 0 && (
                <div>
                  <div className="inline-block bg-gradient-to-r from-red-600 to-black text-white px-4 lg:px-6 py-2 mb-4 transform -skew-x-3">
                    <h2 className="text-lg font-medium">Key Projects</h2>
                  </div>
                  {data.projects.slice(0, 3).map((project, index) => (
                    <div key={index} className="bg-gradient-to-r from-gray-50 to-red-50 p-4 lg:p-6 mb-4 border border-gray-200 rounded-lg">
                      <h3 className="font-bold text-gray-900 break-words">{project.name}</h3>
                      {project.tech && (
                        <p className="text-red-700 text-sm font-medium break-words">{project.tech}</p>
                      )}
                      {project.description && (
                        <p className="text-gray-600 text-sm mt-2 leading-relaxed break-words">{project.description}</p>
                      )}
                      {project.highlights && project.highlights.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {project.highlights.slice(0, 2).map((highlight, idx) => (
                            <span key={idx} className="bg-red-100 text-red-800 px-2 py-1 text-xs transform -skew-x-1">
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
