import { Mail, Phone, MapPin, Globe, Clock, Target, Star } from 'lucide-react';
import { transformCVDataForTemplates } from '@/lib/cvDataTransformer';

export function ModernTemplate16({ cvData }: { cvData: any }) {
  const data = transformCVDataForTemplates(cvData);
  if (!data) return <div>No data available</div>;

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const fullName = data.personalInfo.name || `${data.personalInfo.firstName || ''} ${data.personalInfo.lastName || ''}`.trim() || 'Your Name';

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-xl overflow-hidden">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white p-4 lg:p-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-6">
          <div className="text-center lg:text-left flex-1">
            <div className="flex items-center justify-center lg:justify-start mb-3 lg:mb-4">
              <Clock size={20} className="mr-3 text-cyan-400" />
              <span className="text-cyan-200 text-sm font-medium tracking-wider uppercase">Available for new opportunities</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-light mb-2 lg:mb-4 text-white break-words">{fullName}</h1>
            {data.personalInfo.title && (
              <div className="bg-cyan-500/20 backdrop-blur-sm rounded-lg px-4 lg:px-6 py-2 lg:py-3 inline-block mb-4 lg:mb-6">
                <p className="text-cyan-100 text-base lg:text-lg font-medium break-words">{data.personalInfo.title}</p>
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden border-4 border-cyan-400 shadow-xl relative bg-slate-700 flex items-center justify-center">
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
              <div className={`w-full h-full items-center justify-center text-white text-xl font-bold ${data.personalInfo.imageUrl ? 'hidden' : 'flex'}`}>
                {getInitials(fullName)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 lg:w-8 lg:h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-1 h-1 lg:w-2 lg:h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Strip */}
      {(data.personalInfo.email || data.personalInfo.phone || data.personalInfo.location || data.personalInfo.website) && (
        <div className="bg-cyan-50 px-4 lg:px-8 py-3 lg:py-4 border-b border-cyan-200">
          <div className="flex flex-col sm:flex-row justify-center sm:space-x-8 space-y-2 sm:space-y-0 text-sm text-gray-700">
            {data.personalInfo.email && (
              <div className="flex items-center justify-center">
                <Mail size={14} className="mr-2 text-cyan-600 flex-shrink-0" />
                <span className="break-all text-wrap">{data.personalInfo.email}</span>
              </div>
            )}
            {data.personalInfo.phone && (
              <div className="flex items-center justify-center">
                <Phone size={14} className="mr-2 text-cyan-600 flex-shrink-0" />
                <span className="break-all">{data.personalInfo.phone}</span>
              </div>
            )}
            {(data.personalInfo.location || data.personalInfo.address) && (
              <div className="flex items-center justify-center">
                <MapPin size={14} className="mr-2 text-cyan-600 flex-shrink-0" />
                <span className="break-words">{data.personalInfo.location || data.personalInfo.address}</span>
              </div>
            )}
            {data.personalInfo.website && (
              <div className="flex items-center justify-center">
                <Globe size={14} className="mr-2 text-cyan-600 flex-shrink-0" />
                <span className="break-all">{data.personalInfo.website}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4 lg:p-8">
        {/* Professional Summary / Bio */}
        {(data.profileSummary || data.personalInfo.bio) && (
          <div className="mb-6 lg:mb-8 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-center mb-3 lg:mb-4">
                <Target size={24} className="text-cyan-600 mr-3" />
                <h2 className="text-xl lg:text-2xl font-light text-gray-900">Professional Overview</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-base lg:text-lg break-words">{data.profileSummary || data.personalInfo.bio}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Skills Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Core Skills */}
            {data.technicalSkills.length > 0 && (
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 lg:p-6 rounded-xl border border-cyan-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Star size={18} className="text-cyan-600 mr-2" />
                  Core Skills
                </h3>
                <div className="space-y-3">
                  {data.technicalSkills.slice(0, 6).map((skill, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-cyan-100">
                      <span className="text-gray-800 text-sm font-medium break-words">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Soft Skills */}
            {data.softSkills.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 lg:p-6 rounded-xl border border-indigo-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Leadership</h3>
                <div className="space-y-2">
                  {data.softSkills.map((skill, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm break-words">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {data.languages.length > 0 && (
              <div className="bg-gradient-to-br from-sky-50 to-cyan-50 p-4 lg:p-6 rounded-xl border border-sky-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Languages</h3>
                <div className="space-y-2">
                  {data.languages.map((lang, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm break-words">{lang.name}</span>
                      <span className="text-gray-500 text-xs">
                        {lang.proficiency === 5 ? 'Native' : lang.proficiency === 4 ? 'Fluent' : lang.proficiency === 3 ? 'Intermediate' : lang.proficiency === 2 ? 'Basic' : 'Beginner'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications (if any in data) */}
            {data.certifications && data.certifications.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 lg:p-6 rounded-xl border border-green-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Certifications</h3>
                <div className="space-y-2">
                  {data.certifications.slice(0, 3).map((cert: any, index: number) => (
                    <div key={index} className="text-gray-700 text-sm leading-relaxed break-words">
                      {typeof cert === 'string' ? cert : cert.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timeline Content */}
          <div className="lg:col-span-3">
            {(data.workExperience.length > 0 || data.education.length > 0 || data.projects.length > 0) && (
              <h2 className="text-xl lg:text-2xl font-light text-gray-900 mb-6 lg:mb-8 text-center">Career Timeline</h2>
            )}

            {/* Timeline */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 lg:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-600"></div>

              <div className="space-y-8 lg:space-y-12">
                {/* Experience Items */}
                {data.workExperience.map((job, index) => (
                  <div key={index} className="relative flex items-start">
                    {/* Timeline Dot */}
                    <div className="absolute left-2 lg:left-6 w-4 h-4 bg-cyan-500 rounded-full border-4 border-white shadow-lg z-10"></div>

                    {/* Content */}
                    <div className="ml-10 lg:ml-20 bg-white rounded-xl shadow-md border border-gray-200 p-4 lg:p-6 hover:shadow-lg transition-shadow duration-300 w-full">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-3 lg:mb-4 gap-2">
                        <div className="flex-1">
                          <h3 className="text-lg lg:text-xl font-medium text-gray-900 break-words">{job.position}</h3>
                          <p className="text-cyan-700 font-medium text-base lg:text-lg break-words">{job.company}</p>
                        </div>
                        <div className="bg-gradient-to-r from-cyan-100 to-blue-100 px-3 lg:px-4 py-1 lg:py-2 rounded-full self-start lg:self-auto">
                          <span className="text-cyan-800 font-medium text-sm whitespace-nowrap">{job.period}</span>
                        </div>
                      </div>
                      {job.description && (
                        <p className="text-gray-700 leading-relaxed mb-4 break-words">{job.description}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Education Timeline */}
                {data.education.map((edu, index) => (
                  <div key={index} className="relative flex items-start">
                    <div className="absolute left-2 lg:left-6 w-4 h-4 bg-indigo-500 rounded-full border-4 border-white shadow-lg z-10"></div>

                    <div className="ml-10 lg:ml-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-4 lg:p-6 w-full">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-2 lg:mb-3 gap-2">
                        <div className="flex-1">
                          <h3 className="text-base lg:text-lg font-medium text-gray-900 break-words">{edu.degree}</h3>
                          <p className="text-indigo-700 font-medium break-words">{edu.school}</p>
                        </div>
                        {edu.period && (
                          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium self-start lg:self-auto whitespace-nowrap">
                            {edu.period}
                          </span>
                        )}
                      </div>
                      {edu.achievements && edu.achievements.length > 0 && (
                        <div className="flex items-center">
                          <Star size={14} className="text-indigo-600 mr-2 flex-shrink-0" />
                          <span className="text-indigo-800 text-sm font-medium break-words">{edu.achievements[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Projects */}
                {data.projects.length > 0 && (
                  <div className="relative">
                    <div className="absolute left-2 lg:left-6 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                    <div className="ml-10 lg:ml-20">
                      <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-4">Notable Projects</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {data.projects.map((project, index) => (
                          <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
                            <h4 className="font-medium text-gray-900 text-sm break-words">{project.name}</h4>
                            {project.tech && (
                              <p className="text-green-700 text-xs font-medium mb-2 break-words">{project.tech}</p>
                            )}
                            {project.description && (
                              <p className="text-gray-700 text-xs leading-relaxed break-words">{project.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Awards */}
                {data.awardsAndHonors.length > 0 && (
                  <div className="relative">
                    <div className="absolute left-2 lg:left-6 w-4 h-4 bg-amber-500 rounded-full border-4 border-white shadow-lg z-10"></div>
                    <div className="ml-10 lg:ml-20">
                      <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-4">Awards & Honors</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {data.awardsAndHonors.map((award, i) => (
                          <div key={i} className="bg-white rounded-lg border border-amber-100 p-4 shadow-sm">
                            <h4 className="font-medium text-gray-900 text-sm break-words">{award.title}</h4>
                            {(award.issuer || award.year) && (
                              <p className="text-amber-700 text-xs font-medium mb-2 break-words">{[award.issuer, award.year].filter(Boolean).join(' • ')}</p>
                            )}
                            {award.description && (
                              <p className="text-gray-700 text-xs leading-relaxed break-words">{award.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
