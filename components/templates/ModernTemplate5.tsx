import { Mail, Phone, MapPin, Globe, Star, Award, Briefcase } from 'lucide-react';
import { transformCVDataForTemplates, extractGitHubUsername } from '@/lib/cvDataTransformer';

export function ModernTemplate5({ cvData }) {
  const data = transformCVDataForTemplates(cvData);
  if (!data) return null;

  const githubUsername = extractGitHubUsername(cvData.projects);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-xl overflow-hidden">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-4 lg:p-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
          <div className="text-center lg:text-left flex-1">
            <h1 className="text-3xl lg:text-4xl font-medium mb-2 lg:mb-4 text-white break-words">{data.personalInfo.name}</h1>
            <div className="bg-emerald-500 bg-opacity-30 backdrop-blur-sm rounded-lg px-4 lg:px-6 py-2 lg:py-3 inline-block mb-4 lg:mb-6">
              <p className="text-emerald-100 text-base lg:text-lg font-medium break-words">{data.personalInfo.title}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-emerald-100 max-w-md mx-auto lg:mx-0">
              {data.personalInfo.email && (
                <div className="flex items-center justify-center lg:justify-start">
                  <Mail size={14} className="mr-2 text-emerald-300 flex-shrink-0" />
                  <span className="break-all text-wrap">{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo.phone && (
                <div className="flex items-center justify-center lg:justify-start">
                  <Phone size={14} className="mr-2 text-emerald-300 flex-shrink-0" />
                  <span className="break-all">{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo.location && (
                <div className="flex items-center justify-center lg:justify-start">
                  <MapPin size={14} className="mr-2 text-emerald-300 flex-shrink-0" />
                  <span className="break-words">{data.personalInfo.location}</span>
                </div>
              )}
              {data.personalInfo.website && (
                <div className="flex items-center justify-center lg:justify-start">
                  <Globe size={14} className="mr-2 text-emerald-300 flex-shrink-0" />
                  <span className="break-all">{data.personalInfo.website}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Professional Photo */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-xl overflow-hidden border-4 border-white shadow-2xl">
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
                <div className="w-full h-full bg-emerald-400 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {data.personalInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              )}
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
              <p className="text-gray-700 leading-relaxed text-base lg:text-lg break-words">{data.personalInfo.bio}</p>
            </div>
          </div>
        )}

        {/* Professional Summary */}
        {data.profileSummary && (
          <div className="mb-8 lg:mb-12 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl lg:text-2xl font-medium text-gray-900 mb-4 lg:mb-6">Professional Summary</h2>
              <p className="text-gray-700 leading-relaxed text-base lg:text-lg break-words">{data.profileSummary}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Skills Column */}
          <div className="space-y-6">
            {/* Star Skill Ratings */}
            {data.technicalSkills.length > 0 && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 lg:p-6 rounded-xl border border-emerald-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Star size={18} className="text-emerald-600 mr-2" />
                  Technical Expertise
                </h3>
                <div className="space-y-4">
                  {data.technicalSkills.slice(0, 6).map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-800 font-medium text-sm break-words">{skill}</span>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < Math.floor(Math.random() * 3) + 3 ? "text-emerald-500 fill-current" : "text-gray-300"} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Soft Skills */}
            {data.softSkills.length > 0 && (
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 lg:p-6 rounded-xl border border-teal-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Leadership Skills</h3>
                <div className="space-y-3">
                  {data.softSkills.map((skill, index) => (
                    <div key={index} className="flex items-center">
                      <Award size={14} className="text-teal-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-800 text-sm break-words">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Professional Stats */}
            <div className="bg-gray-900 text-white p-4 lg:p-6 rounded-xl">
              <h3 className="text-lg font-medium mb-4">Career Highlights</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Years Experience</span>
                  <span className="text-emerald-400 font-bold">6+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Projects Delivered</span>
                  <span className="text-emerald-400 font-bold">50+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Team Members</span>
                  <span className="text-emerald-400 font-bold">15+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Success Rate</span>
                  <span className="text-emerald-400 font-bold">98%</span>
                </div>
              </div>
            </div>
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
                          <h3 className="text-base lg:text-lg font-medium text-gray-900 break-words">{job.position}</h3>
                          <p className="text-emerald-700 font-medium break-words">{job.company}</p>
                          {job.location && (
                            <p className="text-gray-500 text-sm">{job.location}</p>
                          )}
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium self-start lg:self-auto whitespace-nowrap">
                          {job.period}
                        </span>
                      </div>
                      {job.description && (
                        <p className="text-gray-700 leading-relaxed break-words">{job.description}</p>
                      )}
                      
                      {job.achievements && job.achievements.length > 0 && (
                        <ul className="mt-4 space-y-1">
                          {job.achievements.map((achievement, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <span className="text-emerald-500 mr-2">•</span>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {['Leadership', 'Innovation', 'Technical Excellence'].map((tag, i) => (
                          <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education & Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.education.length > 0 && (
                <div>
                  <h2 className="text-xl font-medium text-gray-900 mb-4 lg:mb-6">Education</h2>
                  {data.education.map((edu, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 lg:p-6 rounded-xl border border-blue-100 mb-4">
                      <h3 className="font-medium text-gray-900 break-words">{edu.degree}</h3>
                      <p className="text-blue-700 font-medium break-words">{edu.school}</p>
                      {edu.field && (
                        <p className="text-gray-600 text-sm mt-1">{edu.field}</p>
                      )}
                      <p className="text-gray-600 text-sm mt-2 break-words">{edu.period}</p>
                      {edu.description && (
                        <p className="text-gray-600 text-sm mt-2 leading-relaxed break-words">
                          {edu.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center">
                        <Award size={14} className="text-blue-600 mr-2 flex-shrink-0" />
                        <span className="text-blue-800 text-xs font-medium">Magna Cum Laude</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {data.projects.length > 0 && (
                <div>
                  <h2 className="text-xl font-medium text-gray-900 mb-4 lg:mb-6">Key Projects</h2>
                  {data.projects.map((project, index) => (
                    <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 lg:p-6 rounded-xl border border-purple-100 mb-4">
                      <h3 className="font-medium text-gray-900 break-words">{project.name}</h3>
                      {project.tech && (
                        <p className="text-purple-700 text-sm font-medium break-words">{project.tech}</p>
                      )}
                      {project.description && (
                        <p className="text-gray-700 text-sm mt-2 leading-relaxed break-words">{project.description}</p>
                      )}
                      {project.highlights && project.highlights.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {project.highlights.slice(0, 3).map((highlight, idx) => (
                            <span key={idx} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
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

            {/* Languages */}
            {data.languages.length > 0 && (
              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-4 lg:mb-6">Languages</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {data.languages.map((lang, index) => (
                    <div key={index} className="bg-gradient-to-br from-green-50 to-teal-50 p-4 lg:p-6 rounded-xl border border-green-100">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900 break-words">{lang.name}</h3>
                        <span className="text-green-700 text-sm font-medium">
                          {lang.proficiency === 5 ? 'Native' : 
                           lang.proficiency === 4 ? 'Fluent' : 
                           lang.proficiency === 3 ? 'Intermediate' : 
                           lang.proficiency === 2 ? 'Basic' : 'Beginner'}
                        </span>
                      </div>
                      {lang.description && (
                        <p className="text-gray-600 text-sm mt-2 leading-relaxed break-words">
                          {lang.description}
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
