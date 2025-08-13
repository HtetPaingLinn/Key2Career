import { Mail, Phone, MapPin, Globe, Award, Code, Briefcase } from 'lucide-react';
import { transformCVDataForTemplates } from '@/lib/cvDataTransformer';

export function ModernTemplate15({ cvData }: { cvData: any }) {
  const data = transformCVDataForTemplates(cvData);

  if (!data) return <div>No data available</div>;

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const firstName = (data.personalInfo.name || '').split(' ')[0] || data.personalInfo.firstName || 'Your';
  const lastName = (data.personalInfo.name || '').split(' ')[1] || data.personalInfo.lastName || 'Name';

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-xl overflow-hidden">
      {/* Magazine-style Header */}
      <div className="relative h-64 lg:h-80 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 lg:top-10 left-5 lg:left-10 w-16 lg:w-32 h-16 lg:h-32 border border-white rounded-full" />
          <div className="absolute bottom-10 lg:bottom-20 right-10 lg:right-20 w-12 lg:w-24 h-12 lg:h-24 border border-white rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-8 lg:w-16 h-8 lg:h-16 border border-white rounded-full" />
        </div>

        <div className="relative z-10 p-4 lg:p-8 h-full flex items-center">
          <div className="flex flex-col lg:flex-row lg:items-center w-full gap-4 lg:gap-8">
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-4 lg:mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 lg:px-4 py-1 lg:py-2 inline-block mb-3 lg:mb-4">
                  <span className="text-white text-xs lg:text-sm font-medium tracking-wider uppercase">Featured Professional</span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-light text-white mb-2 lg:mb-4 leading-tight break-words">
                  {firstName}
                  <span className="block font-medium">{lastName}</span>
                </h1>
                {data.personalInfo.title && (
                  <p className="text-pink-200 text-lg lg:text-xl font-light tracking-wide break-words">{data.personalInfo.title}</p>
                )}
              </div>

              <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-2 lg:space-y-0 text-white text-sm">
                {data.personalInfo.email && (
                  <div className="flex items-center justify-center lg:justify-start space-x-2">
                    <Mail size={16} className="text-pink-300 flex-shrink-0" />
                    <span className="break-all text-wrap">{data.personalInfo.email}</span>
                  </div>
                )}
                {data.personalInfo.phone && (
                  <div className="flex items-center justify-center lg:justify-start space-x-2">
                    <Phone size={16} className="text-pink-300 flex-shrink-0" />
                    <span className="break-all">{data.personalInfo.phone}</span>
                  </div>
                )}
                {(data.personalInfo.location || data.personalInfo.address) && (
                  <div className="flex items-center justify-center lg:justify-start space-x-2">
                    <MapPin size={16} className="text-pink-300 flex-shrink-0" />
                    <span className="break-words">{data.personalInfo.location || data.personalInfo.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              <div className="w-32 h-40 lg:w-48 lg:h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-indigo-700 flex items-center justify-center">
                {data.personalInfo.imageUrl ? (
                  <img
                    src={data.personalInfo.imageUrl}
                    alt="Professional headshot"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      const sibling = img.nextElementSibling as HTMLElement | null;
                      if (sibling) sibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full items-center justify-center text-white text-2xl font-bold ${data.personalInfo.imageUrl ? 'hidden' : 'flex'}`}>
                  {getInitials(`${firstName} ${lastName}`)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8">
        {/* Featured Quote or Bio */}
        {(data.profileSummary || data.personalInfo.bio) && (
          <div className="mb-8 lg:mb-12 text-center">
            <div className="w-12 h-1 bg-gradient-to-r from-indigo-600 to-pink-600 mx-auto mb-4 lg:mb-6" />
            <blockquote className="text-lg lg:text-2xl font-light text-gray-700 italic max-w-3xl mx-auto leading-relaxed break-words">
              {data.profileSummary || data.personalInfo.bio}
            </blockquote>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - 4 cols */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            {/* About / Bio */}
            {data.personalInfo.bio && (
              <div>
                <h2 className="text-xl lg:text-2xl font-light text-gray-900 mb-4 lg:mb-6 pb-2 border-b border-gray-200">About</h2>
                <p className="text-gray-600 leading-relaxed break-words">{data.personalInfo.bio}</p>
              </div>
            )}

            {/* Expertise */}
            {(data.technicalSkills.length > 0 || data.softSkills.length > 0) && (
              <div>
                <h2 className="text-xl lg:text-2xl font-light text-gray-900 mb-4 lg:mb-6 pb-2 border-b border-gray-200">Expertise</h2>
                <div className="space-y-4">
                  {data.technicalSkills.slice(0, 4).map((skill, index) => (
                    <div key={index} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium break-words">{skill}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-700 group-hover:scale-105`} style={{ width: '90%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {data.languages.length > 0 && (
              <div>
                <h2 className="text-xl lg:text-2xl font-light text-gray-900 mb-4 lg:mb-6 pb-2 border-b border-gray-200">Languages</h2>
                <div className="space-y-2">
                  {data.languages.map((lang, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-gray-700 break-words">{lang.name}</span>
                      <span className="text-gray-500 text-sm">
                        {lang.proficiency === 5 ? 'Native' : lang.proficiency === 4 ? 'Fluent' : lang.proficiency === 3 ? 'Intermediate' : lang.proficiency === 2 ? 'Basic' : 'Beginner'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            {(data.personalInfo.website || data.personalInfo.linkedin) && (
              <div className="bg-gradient-to-br from-indigo-50 to-pink-50 p-4 lg:p-6 rounded-2xl">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Get In Touch</h3>
                <div className="space-y-3">
                  {data.personalInfo.website && (
                    <div className="flex items-center">
                      <Globe size={16} className="mr-3 text-indigo-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm break-all">{data.personalInfo.website}</span>
                    </div>
                  )}
                  {data.personalInfo.linkedin && (
                    <div className="flex items-center">
                      <Briefcase size={16} className="mr-3 text-pink-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm break-all">{data.personalInfo.linkedin}</span>
                    </div>
                  )}
                  {data.personalInfo.github && (
                    <div className="flex items-center">
                      <Code size={16} className="mr-3 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm break-all">{data.personalInfo.github}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - 8 cols */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            {/* Experience */}
            {data.workExperience.length > 0 && (
              <div>
                <h2 className="text-xl lg:text-2xl font-light text-gray-900 mb-4 lg:mb-6 pb-2 border-b border-gray-200">Professional Journey</h2>
                <div className="space-y-6 lg:space-y-8">
                  {data.workExperience.map((job, index) => (
                    <div key={index} className="relative group">
                      <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-indigo-600 to-pink-600 rounded-full group-hover:w-2 transition-all duration-300" />
                      <div className="ml-6 lg:ml-8 bg-white border border-gray-100 rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-3 lg:mb-4 gap-2">
                          <div className="flex-1">
                            <h3 className="text-lg lg:text-xl font-medium text-gray-900 break-words">{job.position}</h3>
                            <p className="text-indigo-600 font-medium break-words">{job.company}</p>
                          </div>
                          <span className="bg-gradient-to-r from-indigo-100 to-pink-100 text-indigo-800 px-3 lg:px-4 py-1 lg:py-2 rounded-full text-sm font-medium self-start lg:self-auto whitespace-nowrap">
                            {job.period}
                          </span>
                        </div>
                        {job.description && (
                          <p className="text-gray-600 leading-relaxed break-words">{job.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education & Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {data.education.length > 0 && (
                <div>
                  <h2 className="text-xl lg:text-2xl font-light text-gray-900 mb-4 lg:mb-6 pb-2 border-b border-gray-200">Education</h2>
                  {data.education.map((edu, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 lg:p-6 rounded-xl border border-blue-100 mb-4">
                      <h3 className="font-medium text-gray-900 break-words">{edu.degree}</h3>
                      <p className="text-blue-700 font-medium break-words">{edu.school}</p>
                      {edu.period && <p className="text-gray-500 text-sm mt-2 break-words">{edu.period}</p>}
                      {edu.achievements && edu.achievements.length > 0 && (
                        <div className="mt-3 flex items-center">
                          <Award size={14} className="text-blue-600 mr-2 flex-shrink-0" />
                          <span className="text-blue-800 text-xs font-medium break-words">{edu.achievements[0]}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {data.projects.length > 0 && (
                <div>
                  <h2 className="text-xl lg:text-2xl font-light text-gray-900 mb-4 lg:mb-6 pb-2 border-b border-gray-200">Featured Projects</h2>
                  {data.projects.map((project, index) => (
                    <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 lg:p-6 rounded-xl border border-purple-100 mb-4">
                      <h3 className="font-medium text-gray-900 break-words">{project.name}</h3>
                      {project.tech && <p className="text-purple-700 text-sm font-medium break-words">{project.tech}</p>}
                      {project.description && (
                        <p className="text-gray-600 text-sm mt-2 leading-relaxed break-words">{project.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Awards */}
            {data.awardsAndHonors.length > 0 && (
              <div>
                <h2 className="text-xl lg:text-2xl font-light text-gray-900 mb-4 lg:mb-6 pb-2 border-b border-gray-200">Awards & Honors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.awardsAndHonors.map((award, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Award size={16} className="text-amber-500 flex-shrink-0" />
                        <h3 className="font-medium text-gray-900 break-words">{award.title}</h3>
                      </div>
                      {(award.issuer || award.year) && (
                        <p className="text-gray-500 text-sm break-words">{[award.issuer, award.year].filter(Boolean).join(' • ')}</p>
                      )}
                      {award.description && (
                        <p className="text-gray-600 text-sm mt-2 break-words">{award.description}</p>
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
