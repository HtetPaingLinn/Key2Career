import { Mail, Phone, MapPin, Globe, Hexagon, Triangle, Circle, Square, Award, Target } from 'lucide-react';
import { transformCVDataForTemplates } from '@/lib/cvDataTransformer';

export function ModernTemplate20({ cvData }: { cvData: any }) {
  console.log('ModernTemplate20 rendering with cvData:', cvData);
  const data = transformCVDataForTemplates(cvData);
  console.log('Transformed data:', data);
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
      {/* Hexagonal Header */}
      <div className="relative bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 overflow-hidden">
        {/* Geometric Background */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-white hidden lg:block"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: '30px',
                height: '30px',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 p-4 lg:p-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-6">
            <div className="text-center lg:text-left flex-1">
              <div className="flex items-center justify-center lg:justify-start mb-3 lg:mb-4">
                <Hexagon size={20} className="text-cyan-300 mr-3" />
                <span className="text-cyan-200 text-sm font-medium tracking-wider uppercase">Digital Innovator</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 lg:mb-3 break-words">{fullName}</h1>
              {data.personalInfo.title && (
                <p className="text-cyan-200 text-lg lg:text-xl font-light mb-3 lg:mb-4 break-words">{data.personalInfo.title}</p>
              )}
              
                             <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-4">
                 <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center justify-center">
                   <Triangle size={14} className="text-blue-300 mr-2 flex-shrink-0" />
                   <span className="text-blue-300 text-sm">Innovation</span>
                 </div>
                 <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center justify-center">
                   <Circle size={14} className="text-blue-300 mr-2 flex-shrink-0" />
                   <span className="text-blue-300 text-sm">Excellence</span>
                 </div>
               </div>
            </div>
            
            {/* Hexagonal Photo & Contact */}
            <div className="flex-shrink-0 space-y-4">
              <div className="relative mx-auto lg:mx-0">
                <div className="w-24 h-24 lg:w-32 lg:h-32 overflow-hidden shadow-xl border-4 border-white" 
                     style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
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
                  <div className={`w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xl font-bold items-center justify-center ${data.personalInfo.imageUrl ? 'hidden' : 'flex'}`}>
                    {getInitials(fullName)}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 lg:w-8 lg:h-8 bg-yellow-400 border-4 border-white shadow-lg"
                     style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1 h-1 lg:w-2 lg:h-2 bg-yellow-800 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Geometric Contact */}
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 lg:p-4 rounded-2xl">
                <div className="grid grid-cols-2 gap-2 lg:gap-3 text-xs lg:text-sm text-white">
                                     {data.personalInfo.email && (
                     <div className="flex items-center">
                       <Mail size={12} className="mr-1 lg:mr-2 text-blue-300 flex-shrink-0" />
                       <span className="truncate text-wrap break-all text-blue-300">{data.personalInfo.email}</span>
                     </div>
                   )}
                  {data.personalInfo.phone && (
                    <div className="flex items-center">
                      <Phone size={12} className="mr-1 lg:mr-2 text-cyan-300 flex-shrink-0" />
                      <span className="break-all">{data.personalInfo.phone}</span>
                    </div>
                  )}
                                     {(data.personalInfo.location || data.personalInfo.address) && (
                     <div className="flex items-center">
                       <MapPin size={12} className="mr-1 lg:mr-2 text-blue-300 flex-shrink-0" />
                       <span className="break-words text-blue-300">{data.personalInfo.location || data.personalInfo.address}</span>
                     </div>
                   )}
                  {data.personalInfo.website && (
                    <div className="flex items-center">
                      <Globe size={12} className="mr-1 lg:mr-2 text-cyan-300 flex-shrink-0" />
                      <span className="break-all">{data.personalInfo.website}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8">
        {/* Professional Summary with Geometric Design */}
        {(data.profileSummary || data.personalInfo.bio) && (
          <div className="mb-8 lg:mb-12">
            <div className="text-center mb-6 lg:mb-8">
              <div className="inline-flex items-center bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full px-4 lg:px-6 py-2 lg:py-3 mb-4 lg:mb-6">
                <Square size={18} className="text-cyan-600 mr-3" />
                <h2 className="text-lg lg:text-xl font-medium text-gray-900">Professional Profile</h2>
              </div>
              <div className="max-w-3xl mx-auto">
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed break-words">{data.profileSummary || data.personalInfo.bio}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Skills Hexagon Grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Technical Skills */}
            {data.technicalSkills.length > 0 && (
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-4 lg:p-6 border border-cyan-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Hexagon size={18} className="text-cyan-600 mr-2" />
                  Technical Skills
                </h3>
                <div className="grid grid-cols-2 gap-2 lg:gap-3">
                  {data.technicalSkills.slice(0, 8).map((skill: string, index: number) => (
                    <div key={index} className="relative">
                      <div className="bg-white p-2 lg:p-3 text-center border border-cyan-200 shadow-sm text-xs lg:text-sm"
                           style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                        <span className="text-cyan-800 font-medium break-words">{skill}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Soft Skills */}
            {data.softSkills.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 lg:p-6 border border-indigo-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Triangle size={18} className="text-indigo-600 mr-2" />
                  Leadership
                </h3>
                <div className="space-y-3">
                  {data.softSkills.map((skill: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <div className="w-3 h-3 bg-indigo-500 mr-3 flex-shrink-0" 
                           style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                      <span className="text-gray-700 text-sm break-words">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {data.languages.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 lg:p-6 border border-green-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Target size={18} className="text-green-600 mr-2" />
                  Languages
                </h3>
                <div className="space-y-3">
                  {data.languages.map((lang: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm break-words">{lang.name}</span>
                      <span className="text-green-600 text-xs font-semibold">
                        {lang.proficiency === 5 ? 'Native' : lang.proficiency === 4 ? 'Fluent' : lang.proficiency === 3 ? 'Intermediate' : lang.proficiency === 2 ? 'Basic' : 'Beginner'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-2xl p-4 lg:p-6 text-white">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Circle size={18} className="text-cyan-400 mr-2" />
                Achievements
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Experience</span>
                  <span className="text-cyan-400 font-bold">{data.workExperience.length}+ Years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Projects</span>
                  <span className="text-cyan-400 font-bold">{data.projects.length}+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Awards</span>
                  <span className="text-cyan-400 font-bold">{data.awardsAndHonors.length}+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-5 space-y-6">
            {/* Experience */}
            {data.workExperience.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-medium text-gray-900 mb-4 lg:mb-6 flex items-center">
                  <Square size={20} className="text-blue-600 mr-3" />
                  Professional Experience
                </h3>
                
                <div className="space-y-6 lg:space-y-8">
                  {data.workExperience.map((job: any, index: number) => (
                    <div key={index} className="relative group">
                      <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full"></div>
                      <div className="ml-4 lg:ml-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 lg:p-6 border border-blue-200">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-3 lg:mb-4 gap-2">
                          <div className="flex-1">
                            <h4 className="text-base lg:text-lg font-medium text-gray-900 break-words">{job.position}</h4>
                            <p className="text-blue-700 font-medium text-base lg:text-lg break-words">{job.company}</p>
                          </div>
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 lg:px-4 py-1 lg:py-2 rounded-full shadow-lg self-start lg:self-auto">
                            <span className="font-medium text-sm whitespace-nowrap">{job.period}</span>
                          </div>
                        </div>
                        {job.description && (
                          <p className="text-gray-600 leading-relaxed mb-4 break-words">{job.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {['Innovation', 'Leadership', 'Results'].map((tag, i) => (
                            <span key={i} className="bg-white text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education & Projects */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {data.education.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 lg:p-6 border border-green-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Triangle size={18} className="text-green-600 mr-2" />
                    Education
                  </h3>
                  {data.education.map((edu: any, index: number) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
                        <h4 className="font-medium text-gray-900 break-words">{edu.degree}</h4>
                        <p className="text-green-700 font-medium break-words">{edu.school}</p>
                        {edu.period && <p className="text-gray-500 text-sm break-words">{edu.period}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {data.projects.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 lg:p-6 border border-purple-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Hexagon size={18} className="text-purple-600 mr-2" />
                    Key Projects
                  </h3>
                  {data.projects.slice(0, 3).map((project: any, index: number) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
                        <h4 className="font-medium text-gray-900 text-sm break-words">{project.name}</h4>
                        {project.tech && <p className="text-purple-700 text-xs font-medium break-words">{project.tech}</p>}
                        {project.description && <p className="text-gray-600 text-xs mt-1 leading-relaxed break-words">{project.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Awards & Honors */}
            {data.awardsAndHonors.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 lg:p-6 border border-amber-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Award size={18} className="text-amber-600 mr-2" />
                  Awards & Honors
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {data.awardsAndHonors.map((aw: any, i: number) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
                      <h4 className="font-medium text-gray-900 text-sm break-words">{aw.title}</h4>
                      {(aw.issuer || aw.year) && (
                        <p className="text-amber-700 text-xs font-medium break-words">{[aw.issuer, aw.year].filter(Boolean).join(' • ')}</p>
                      )}
                      {aw.description && <p className="text-gray-600 text-xs mt-1 leading-relaxed break-words">{aw.description}</p>}
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
