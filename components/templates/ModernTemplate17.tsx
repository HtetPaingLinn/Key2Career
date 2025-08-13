import { Mail, Phone, MapPin, Globe, Code2, Briefcase, GraduationCap, Award, Users, Target } from 'lucide-react';
import { transformCVDataForTemplates } from '@/lib/cvDataTransformer';

export function ModernTemplate17({ cvData }: { cvData: any }) {
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

  const totalProjects = data.projects.length;
  const totalCompanies = data.workExperience.length;
  const totalEducation = data.education.length;

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-50 shadow-xl overflow-hidden">
      <div className="bg-white m-4 rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-8">
          <div className="flex items-center space-x-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-emerald-700 flex items-center justify-center">
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
                <div className={`w-full h-full text-white text-3xl font-bold items-center justify-center ${data.personalInfo.imageUrl ? 'hidden' : 'flex'}`}>
                  {getInitials(fullName)}
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full border-4 border-white flex items-center justify-center">
                <Award size={16} className="text-yellow-800" />
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-medium mb-3 break-words">{fullName}</h1>
              {data.personalInfo.title && (
                <p className="text-emerald-100 text-xl mb-4 break-words">{data.personalInfo.title}</p>
              )}
              {(data.profileSummary || data.personalInfo.bio) && (
                <p className="text-emerald-200 leading-relaxed max-w-2xl break-words">
                  {data.profileSummary || data.personalInfo.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {(data.personalInfo.email || data.personalInfo.phone || data.personalInfo.location || data.personalInfo.website) && (
        <div className="px-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.personalInfo.email && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <Mail size={18} className="text-emerald-600 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="text-gray-900 font-medium text-sm break-all">{data.personalInfo.email}</p>
                  </div>
                </div>
              </div>
            )}
            {data.personalInfo.phone && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <Phone size={18} className="text-teal-600 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                    <p className="text-gray-900 font-medium text-sm break-all">{data.personalInfo.phone}</p>
                  </div>
                </div>
              </div>
            )}
            {(data.personalInfo.location || data.personalInfo.address) && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <MapPin size={18} className="text-cyan-600 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                    <p className="text-gray-900 font-medium text-sm break-words">{data.personalInfo.location || data.personalInfo.address}</p>
                  </div>
                </div>
              </div>
            )}
            {data.personalInfo.website && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <Globe size={18} className="text-emerald-600 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Portfolio</p>
                    <p className="text-gray-900 font-medium text-sm break-all">{data.personalInfo.website}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {data.technicalSkills.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <Code2 size={20} className="text-emerald-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">Technical Skills</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {data.technicalSkills.slice(0, 8).map((skill: string, index: number) => (
                    <div key={index} className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-200">
                      <span className="text-emerald-800 text-sm font-medium break-words">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.softSkills.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <Users size={20} className="text-teal-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">Leadership</h3>
                </div>
                <div className="space-y-3">
                  {data.softSkills.map((skill: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                      <span className="text-gray-700 text-sm break-words">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.languages.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <Target size={20} className="text-emerald-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">Languages</h3>
                </div>
                <div className="space-y-2">
                  {data.languages.map((lang: any, i: number) => (
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

            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-medium mb-4">Professional Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100">Companies</span>
                  <span className="font-bold text-xl">{totalCompanies}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100">Projects</span>
                  <span className="font-bold text-xl">{totalProjects}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-100">Education</span>
                  <span className="font-bold text-xl">{totalEducation}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-4">
            {(data.profileSummary || data.personalInfo.bio) && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <Target size={20} className="text-cyan-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">Professional Summary</h3>
                </div>
                <p className="text-gray-600 leading-relaxed break-words">{data.profileSummary || data.personalInfo.bio}</p>
              </div>
            )}

            {data.workExperience.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-6">
                  <Briefcase size={20} className="text-emerald-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">Professional Experience</h3>
                </div>
                <div className="space-y-6">
                  {data.workExperience.map((job: any, index: number) => (
                    <div key={index} className="relative">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 break-words">{job.position}</h4>
                          <p className="text-emerald-700 font-medium break-words">{job.company}</p>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                          {job.period}
                        </span>
                      </div>
                      {job.description && (
                        <p className="text-gray-600 leading-relaxed break-words">{job.description}</p>
                      )}
                      {index < data.workExperience.length - 1 && (
                        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.education.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center mb-4">
                    <GraduationCap size={20} className="text-teal-600 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900">Education</h3>
                  </div>
                  <div className="space-y-4">
                    {data.education.map((edu: any, index: number) => (
                      <div key={index} className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-200">
                        <h4 className="font-medium text-gray-900 break-words">{edu.degree}</h4>
                        <p className="text-teal-700 font-medium break-words">{edu.school}</p>
                        {edu.period && <p className="text-gray-500 text-sm break-words">{edu.period}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.projects.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center mb-4">
                    <Code2 size={20} className="text-cyan-600 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900">Key Projects</h3>
                  </div>
                  <div className="space-y-4">
                    {data.projects.map((project: any, index: number) => (
                      <div key={index} className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200">
                        <h4 className="font-medium text-gray-900 text-sm break-words">{project.name}</h4>
                        {project.tech && <p className="text-cyan-700 text-xs font-medium break-words">{project.tech}</p>}
                        {project.description && <p className="text-gray-600 text-xs mt-1 leading-relaxed break-words">{project.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {data.awardsAndHonors.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <Award size={20} className="text-amber-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">Awards & Honors</h3>
                </div>
                <div className="space-y-3">
                  {data.awardsAndHonors.map((aw: any, i: number) => (
                    <div key={i} className="border border-amber-100 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 text-sm break-words">{aw.title}</h4>
                      {(aw.issuer || aw.year) && (
                        <p className="text-amber-700 text-xs font-medium break-words">{[aw.issuer, aw.year].filter(Boolean).join(' • ')}</p>
                      )}
                      {aw.description && (
                        <p className="text-gray-600 text-xs mt-1 leading-relaxed break-words">{aw.description}</p>
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
