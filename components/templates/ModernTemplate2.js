import { Mail, Phone, MapPin, Globe, Award, Star, Github, Linkedin } from 'lucide-react';
import { transformCVDataForTemplates, extractGitHubUsername } from '@/lib/cvDataTransformer';

export function ModernTemplate2({ cvData }) {
  const data = transformCVDataForTemplates(cvData);
  if (!data) return null;

  const githubUsername = extractGitHubUsername(cvData.projects);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-xl overflow-hidden">
      {/* Header with Curved Design */}
      <div className="relative bg-gradient-to-br from-teal-600 via-green-600 to-emerald-700 overflow-hidden">
        {/* Background Curves */}
        <div className="absolute top-0 right-0 w-48 lg:w-96 h-48 lg:h-96 bg-teal-300 rounded-full transform translate-x-16 lg:translate-x-32 -translate-y-16 lg:-translate-y-32 opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-32 lg:w-64 h-32 lg:h-64 bg-green-400 rounded-full transform -translate-x-8 lg:-translate-x-16 translate-y-8 lg:translate-y-16 opacity-40"></div>
        
        <div className="relative z-10 p-4 lg:p-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-6">
            <div className="text-center lg:text-left flex-1">
              <h1 className="text-3xl lg:text-4xl font-medium text-white mb-2 lg:mb-4 break-words">{data.personalInfo.name}</h1>
                             <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 inline-block mb-4 lg:mb-6">
                 <p className="text-green-600 font-semibold text-base lg:text-lg break-words drop-shadow-lg">{data.personalInfo.title}</p>
               </div>
              
              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-2 lg:space-y-0 text-sm text-teal-100">
                {data.personalInfo.email && (
                  <div className="flex items-center justify-center lg:justify-start">
                    <Mail size={16} className="mr-2 text-teal-300" />
                    <span className="break-all">{data.personalInfo.email}</span>
                  </div>
                )}
                {data.personalInfo.phone && (
                  <div className="flex items-center justify-center lg:justify-start">
                    <Phone size={16} className="mr-2 text-teal-300" />
                    <span className="break-all">{data.personalInfo.phone}</span>
                  </div>
                )}
                {data.personalInfo.location && (
                  <div className="flex items-center justify-center lg:justify-start">
                    <MapPin size={16} className="mr-2 text-teal-300" />
                    <span className="break-words">{data.personalInfo.location}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Professional Photo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl">
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
                  <div className="w-full h-full bg-teal-400 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {data.personalInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8">
        {/* Bio */}
        {data.personalInfo.bio && (
          <div className="mb-8 lg:mb-12 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl lg:text-2xl font-medium text-gray-900 mb-4 lg:mb-6">Bio</h2>
              <p className="text-gray-600 leading-relaxed text-base lg:text-lg break-words">{data.personalInfo.bio}</p>
            </div>
          </div>
        )}

        {/* Professional Summary */}
        {data.profileSummary && (
          <div className="mb-8 lg:mb-12 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl lg:text-2xl font-medium text-gray-900 mb-4 lg:mb-6">Professional Summary</h2>
              <p className="text-gray-600 leading-relaxed text-base lg:text-lg break-words">{data.profileSummary}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Skills Column */}
          <div className="space-y-6 lg:space-y-8">
            {/* Technical Skills */}
            {data.technicalSkills.length > 0 && (
              <div className="bg-gradient-to-br from-teal-50 to-green-50 p-4 lg:p-6 rounded-xl border border-teal-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Award size={18} className="text-teal-600 mr-2" />
                  Technical Skills
                </h3>
                <div className="space-y-3">
                  {data.technicalSkills.slice(0, 6).map((skill, index) => (
                    <div key={index} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium text-sm break-words">{skill}</span>
                        <span className="text-teal-600 text-xs font-bold flex-shrink-0">{Math.floor(Math.random() * 30) + 70}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-teal-500 to-green-500 rounded-full transition-all duration-700 group-hover:scale-105"
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
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 lg:p-6 rounded-xl border border-green-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Leadership & Soft Skills</h3>
                <div className="space-y-3">
                  {data.softSkills.map((skill, index) => (
                    <div key={index} className="flex items-center">
                      <Star size={14} className="text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm break-words">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {data.languages.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 lg:p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Languages</h3>
                <div className="space-y-3">
                  {data.languages.map((lang, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-700 text-sm">{lang.name}</span>
                      <span className="text-blue-600 text-xs font-medium">
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

            {/* Contact */}
            <div className="bg-gray-900 text-white p-4 lg:p-6 rounded-xl">
              <h3 className="text-lg font-medium mb-4">Contact Information</h3>
              <div className="space-y-3 text-sm">
                {data.personalInfo.website && (
                  <div className="flex items-center">
                    <Globe size={14} className="mr-3 text-teal-400 flex-shrink-0" />
                    <span className="break-all">{data.personalInfo.website}</span>
                  </div>
                )}
                {data.personalInfo.linkedin && (
                  <div className="flex items-center">
                    <Linkedin size={14} className="mr-3 text-teal-400 flex-shrink-0" />
                    <span className="break-words">LinkedIn Profile</span>
                  </div>
                )}
                {githubUsername && (
                  <div className="flex items-center">
                    <Github size={14} className="mr-3 text-teal-400 flex-shrink-0" />
                    <span className="break-words">GitHub Profile</span>
                  </div>
                )}
                <div className="text-teal-300 break-words">Available for new opportunities</div>
              </div>
            </div>

            {/* Key Projects */}
            {data.projects.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 lg:p-6 rounded-xl border border-purple-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Key Projects</h3>
                <div className="space-y-4">
                  {data.projects.slice(0, 3).map((project, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-gray-900 text-sm break-words">{project.name}</h4>
                      {project.tech && (
                        <p className="text-purple-700 text-xs font-medium break-words mt-1">{project.tech}</p>
                      )}
                      {project.description && (
                        <p className="text-gray-600 text-xs mt-2 leading-relaxed break-words line-clamp-3">{project.description}</p>
                      )}
                      {project.highlights && project.highlights.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {project.highlights.slice(0, 2).map((highlight, idx) => (
                            <span key={idx} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
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
          </div>

          {/* Experience & Projects */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Experience */}
            {data.workExperience.length > 0 && (
              <div>
                <h2 className="text-xl lg:text-2xl font-medium text-gray-900 mb-4 lg:mb-6 text-center lg:text-left">Professional Experience</h2>
                <div className="space-y-6">
                  {data.workExperience.map((job, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-3 gap-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 break-words">{job.position}</h3>
                          <p className="text-teal-700 font-medium break-words">{job.company}</p>
                          {job.location && (
                            <p className="text-gray-500 text-sm">{job.location}</p>
                          )}
                        </div>
                        <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium self-start lg:self-auto whitespace-nowrap">
                          {job.period}
                        </span>
                      </div>
                      {job.description && (
                        <p className="text-gray-600 leading-relaxed break-words whitespace-pre-line">{job.description}</p>
                      )}
                      
                      {job.achievements && job.achievements.length > 0 && (
                        <ul className="mt-4 space-y-1">
                          {job.achievements.map((achievement, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <span className="text-teal-500 mr-2">•</span>
                              {achievement}
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
              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-4 lg:mb-6">Education</h2>
                <div className="space-y-4">
                  {data.education.map((edu, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 lg:p-6 rounded-xl border border-blue-100">
                      <h3 className="font-medium text-gray-900 break-words">{edu.degree}</h3>
                      <p className="text-blue-700 font-medium break-words">{edu.school}</p>
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
              </div>
            )}

            {/* Awards & Honors */}
            {data.awardsAndHonors.length > 0 && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-4 lg:mb-6">Awards & Honors</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {data.awardsAndHonors.map((award, index) => (
                    <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 lg:p-6 rounded-xl border border-yellow-100">
                      <h3 className="font-medium text-gray-900 break-words">{award.title}</h3>
                      <p className="text-orange-700 font-medium break-words">{award.issuer}</p>
                      {award.year && (
                        <p className="text-gray-500 text-sm mt-1">{award.year}</p>
                      )}
                      {award.description && (
                        <p className="text-gray-600 text-sm mt-2 leading-relaxed break-words">
                          {award.description}
                        </p>
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
