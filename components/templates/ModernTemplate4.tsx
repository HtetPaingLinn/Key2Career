import { Mail, Phone, MapPin, Globe, Award, Star, Briefcase } from 'lucide-react';
import { transformCVDataForTemplates, extractGitHubUsername } from '@/lib/cvDataTransformer';

export function ModernTemplate4({ cvData }) {
  const data = transformCVDataForTemplates(cvData);
  if (!data) return null;

  const githubUsername = extractGitHubUsername(cvData.projects);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-xl overflow-hidden">
      {/* Executive Header */}
      <div className="relative bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 text-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-5 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 p-4 lg:p-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            <div className="text-center lg:text-left flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 lg:mb-4 break-words">{data.personalInfo.name}</h1>
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg px-4 lg:px-6 py-2 lg:py-3 inline-block mb-4 lg:mb-6">
                <p className="text-white text-base lg:text-lg font-medium break-words">{data.personalInfo.title}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-purple-100 max-w-md mx-auto lg:mx-0">
                {data.personalInfo.email && (
                  <div className="flex items-center justify-center lg:justify-start">
                    <Mail size={14} className="mr-2 text-purple-300 flex-shrink-0" />
                    <span className="break-all text-wrap">{data.personalInfo.email}</span>
                  </div>
                )}
                {data.personalInfo.phone && (
                  <div className="flex items-center justify-center lg:justify-start">
                    <Phone size={14} className="mr-2 text-purple-300 flex-shrink-0" />
                    <span className="break-all">{data.personalInfo.phone}</span>
                  </div>
                )}
                {data.personalInfo.location && (
                  <div className="flex items-center justify-center lg:justify-start">
                    <MapPin size={14} className="mr-2 text-purple-300 flex-shrink-0" />
                    <span className="break-words">{data.personalInfo.location}</span>
                  </div>
                )}
                {data.personalInfo.website && (
                  <div className="flex items-center justify-center lg:justify-start">
                    <Globe size={14} className="mr-2 text-purple-300 flex-shrink-0" />
                    <span className="break-all">{data.personalInfo.website}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Circular Photo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl">
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
                  <div className="w-full h-full bg-purple-400 flex items-center justify-center">
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
            <div className="inline-block bg-gradient-to-r from-purple-700 to-indigo-800 text-white px-6 lg:px-8 py-3 rounded-lg mb-4 lg:mb-6">
              <h2 className="text-lg lg:text-xl font-medium">Bio</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 leading-relaxed text-base lg:text-lg break-words">{data.personalInfo.bio}</p>
            </div>
          </div>
        )}

        {/* Executive Summary */}
        {data.profileSummary && (
          <div className="mb-8 lg:mb-12 text-center">
            <div className="inline-block bg-gradient-to-r from-purple-700 to-indigo-800 text-white px-6 lg:px-8 py-3 rounded-lg mb-4 lg:mb-6">
              <h2 className="text-lg lg:text-xl font-medium">Executive Summary</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 leading-relaxed text-base lg:text-lg break-words">{data.profileSummary}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Skills & Metrics */}
          <div className="space-y-6">
            {/* Skill Progress Indicators */}
            {data.technicalSkills.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 lg:p-6 rounded-xl border border-purple-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Star size={18} className="text-purple-600 mr-2" />
                  Core Competencies
                </h3>
                <div className="space-y-4">
                  {data.technicalSkills.slice(0, 6).map((skill, index) => (
                    <div key={index} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-800 font-medium text-sm break-words">{skill}</span>
                        <span className="text-purple-600 text-xs font-bold flex-shrink-0">{Math.floor(Math.random() * 30) + 70}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700 group-hover:scale-105"
                          style={{ width: `${Math.floor(Math.random() * 30) + 70}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leadership Skills */}
            {data.softSkills.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 lg:p-6 rounded-xl border border-indigo-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Leadership Excellence</h3>
                <div className="space-y-3">
                  {data.softSkills.map((skill, index) => (
                    <div key={index} className="flex items-center">
                      <Award size={14} className="text-indigo-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm break-words">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Executive Metrics */}
            <div className="bg-gradient-to-br from-purple-800 to-indigo-900 text-white p-4 lg:p-6 rounded-xl">
              <h3 className="text-lg font-medium mb-4">Executive Impact</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-purple-200 text-sm">Years Leadership</span>
                  <span className="text-white font-bold">8+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-200 text-sm">Team Members Led</span>
                  <span className="text-white font-bold">25+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-200 text-sm">Budget Managed</span>
                  <span className="text-white font-bold">$2M+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-200 text-sm">ROI Delivered</span>
                  <span className="text-white font-bold">150%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6 lg:space-y-8">
            {/* Professional Experience */}
            {data.workExperience.length > 0 && (
              <div>
                <div className="inline-block bg-gradient-to-r from-purple-700 to-indigo-800 text-white px-6 lg:px-8 py-3 rounded-lg mb-4 lg:mb-6">
                  <h2 className="text-lg lg:text-xl font-medium flex items-center">
                    <Briefcase size={20} className="mr-2" />
                    Executive Experience
                  </h2>
                </div>
                
                <div className="space-y-6">
                  {data.workExperience.map((job, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-3 gap-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 break-words">{job.position}</h3>
                          <p className="text-purple-700 font-medium text-lg break-words">{job.company}</p>
                          {job.location && (
                            <p className="text-gray-500 text-sm">{job.location}</p>
                          )}
                        </div>
                        <span className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium self-start lg:self-auto whitespace-nowrap">
                          {job.period}
                        </span>
                      </div>
                      {job.description && (
                        <p className="text-gray-700 leading-relaxed break-words mb-4">{job.description}</p>
                      )}
                      
                      {job.achievements && job.achievements.length > 0 && (
                        <ul className="mb-4 space-y-1">
                          {job.achievements.map((achievement, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <span className="text-purple-500 mr-2">•</span>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {['Strategic Leadership', 'Innovation', 'Results Delivery'].map((tag, i) => (
                          <span key={i} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
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
                  <div className="inline-block bg-gradient-to-r from-purple-700 to-indigo-800 text-white px-4 lg:px-6 py-2 rounded-lg mb-4">
                    <h2 className="text-lg font-medium">Education</h2>
                  </div>
                  {data.education.map((edu, index) => (
                    <div key={index} className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 lg:p-6 rounded-xl border border-purple-100 mb-4">
                      <h3 className="font-bold text-gray-900 break-words">{edu.degree}</h3>
                      <p className="text-purple-700 font-medium break-words">{edu.school}</p>
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
                        <Award size={14} className="text-purple-600 mr-2 flex-shrink-0" />
                        <span className="text-purple-800 text-xs font-medium">Magna Cum Laude</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {data.projects.length > 0 && (
                <div>
                  <div className="inline-block bg-gradient-to-r from-purple-700 to-indigo-800 text-white px-4 lg:px-6 py-2 rounded-lg mb-4">
                    <h2 className="text-lg font-medium">Strategic Projects</h2>
                  </div>
                  {data.projects.map((project, index) => (
                    <div key={index} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 lg:p-6 rounded-xl border border-indigo-100 mb-4">
                      <h3 className="font-bold text-gray-900 break-words">{project.name}</h3>
                      {project.tech && (
                        <p className="text-indigo-700 text-sm font-medium break-words">{project.tech}</p>
                      )}
                      {project.description && (
                        <p className="text-gray-700 text-sm mt-2 leading-relaxed break-words">{project.description}</p>
                      )}
                      {project.highlights && project.highlights.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {project.highlights.slice(0, 3).map((highlight, idx) => (
                            <span key={idx} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">
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
                <div className="inline-block bg-gradient-to-r from-purple-700 to-indigo-800 text-white px-4 lg:px-6 py-2 rounded-lg mb-4">
                  <h2 className="text-lg font-medium">Awards & Honors</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {data.awardsAndHonors.map((award, index) => (
                    <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 lg:p-6 rounded-xl border border-yellow-100">
                      <h3 className="font-bold text-gray-900 break-words">{award.title}</h3>
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
                <div className="inline-block bg-gradient-to-r from-purple-700 to-indigo-800 text-white px-4 lg:px-6 py-2 rounded-lg mb-4">
                  <h2 className="text-lg font-medium">Languages</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {data.languages.map((lang, index) => (
                    <div key={index} className="bg-gradient-to-br from-green-50 to-teal-50 p-4 lg:p-6 rounded-xl border border-green-100">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 break-words">{lang.name}</h3>
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
