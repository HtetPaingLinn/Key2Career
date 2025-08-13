import { Mail, Phone, MapPin, Globe, Camera, Palette, Monitor, Star, Award, Target } from 'lucide-react';
import { transformCVDataForTemplates } from '@/lib/cvDataTransformer';

export function ModernTemplate18({ cvData }: { cvData: any }) {
  console.log('ModernTemplate18 rendering with cvData:', cvData);
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
      {/* Portfolio Header */}
      <div className="relative h-80 lg:h-96 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 lg:top-20 left-10 lg:left-20 w-16 lg:w-20 h-16 lg:h-20 border-2 border-white rounded-lg rotate-12"></div>
          <div className="absolute bottom-16 lg:bottom-32 right-16 lg:right-32 w-12 lg:w-16 h-12 lg:h-16 border-2 border-white rounded-full"></div>
          <div className="absolute top-20 lg:top-40 right-10 lg:right-20 w-8 lg:w-12 h-8 lg:h-12 bg-white bg-opacity-30 rounded-lg rotate-45"></div>
          <div className="absolute bottom-10 lg:bottom-20 left-20 lg:left-40 w-20 lg:w-24 h-20 lg:h-24 border-2 border-white rounded-lg -rotate-12"></div>
        </div>
        
        <div className="relative z-10 p-4 lg:p-8 h-full flex items-center">
          <div className="flex flex-col lg:flex-row items-center lg:items-start w-full gap-6 lg:gap-8">
            <div className="text-center lg:text-left flex-1">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4 lg:p-8 max-w-2xl mx-auto lg:mx-0">
                <div className="flex items-center justify-center lg:justify-start mb-4 lg:mb-6">
                  <Palette size={24} className="text-yellow-300 mr-3" />
                  <span className="text-gray-900 text-xs lg:text-sm font-medium tracking-wider uppercase">Creative Professional</span>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-4 leading-tight break-words">
                  {fullName}
                </h1>
                {data.personalInfo.title && (
                  <p className="text-gray-700 text-lg lg:text-xl font-light mb-4 lg:mb-6 break-words">{data.personalInfo.title}</p>
                )}
                
                                 <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-2 lg:gap-3">
                   <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 lg:px-4 py-2 flex items-center justify-center">
                     <Monitor size={16} className="text-gray-800 mr-2 flex-shrink-0" />
                     <span className="text-gray-800 text-xs lg:text-sm font-medium">UI/UX Design</span>
                   </div>
                   <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 lg:px-4 py-2 flex items-center justify-center">
                     <Camera size={16} className="text-gray-800 mr-2 flex-shrink-0" />
                     <span className="text-gray-800 text-xs lg:text-sm font-medium">Frontend Dev</span>
                   </div>
                 </div>
              </div>
            </div>
            
            {/* Large Portfolio Image */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-40 h-48 lg:w-56 lg:h-72 rounded-3xl overflow-hidden shadow-2xl border-4 border-white border-opacity-30 transform rotate-3 hover:rotate-0 transition-transform duration-300">
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
                  <div className={`w-full h-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white text-4xl font-bold items-center justify-center ${data.personalInfo.imageUrl ? 'hidden' : 'flex'}`}>
                    {getInitials(fullName)}
                  </div>
                </div>
                <div className="absolute -bottom-2 lg:-bottom-4 -left-2 lg:-left-4 w-8 lg:w-12 h-8 lg:h-12 bg-yellow-400 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <Star size={20} className="text-yellow-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Bar */}
      {(data.personalInfo.email || data.personalInfo.phone || data.personalInfo.location || data.personalInfo.website) && (
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 px-4 lg:px-8 py-4 lg:py-6 border-b border-purple-200">
          <div className="flex flex-col sm:flex-row justify-center sm:space-x-8 space-y-2 sm:space-y-0">
            {data.personalInfo.email && (
              <div className="flex items-center justify-center bg-white rounded-full px-3 lg:px-4 py-2 shadow-sm">
                <Mail size={16} className="text-purple-600 mr-2 flex-shrink-0" />
                <span className="text-gray-800 text-xs lg:text-sm font-medium break-all text-wrap">{data.personalInfo.email}</span>
              </div>
            )}
            {data.personalInfo.phone && (
              <div className="flex items-center justify-center bg-white rounded-full px-3 lg:px-4 py-2 shadow-sm">
                <Phone size={16} className="text-purple-600 mr-2 flex-shrink-0" />
                <span className="text-gray-800 text-xs lg:text-sm font-medium break-all">{data.personalInfo.phone}</span>
              </div>
            )}
            {(data.personalInfo.location || data.personalInfo.address) && (
              <div className="flex items-center justify-center bg-white rounded-full px-3 lg:px-4 py-2 shadow-sm">
                <MapPin size={16} className="text-purple-600 mr-2 flex-shrink-0" />
                <span className="text-gray-800 text-xs lg:text-sm font-medium break-words">{data.personalInfo.location || data.personalInfo.address}</span>
              </div>
            )}
            {data.personalInfo.website && (
              <div className="flex items-center justify-center bg-white rounded-full px-3 lg:px-4 py-2 shadow-sm">
                <Globe size={16} className="text-purple-600 mr-2 flex-shrink-0" />
                <span className="text-gray-800 text-xs lg:text-sm font-medium break-all">{data.personalInfo.website}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4 lg:p-8">
        {/* Creative Brief */}
        {(data.profileSummary || data.personalInfo.bio) && (
          <div className="mb-8 lg:mb-12 text-center">
            <div className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 lg:px-8 py-3 rounded-full mb-4 lg:mb-6">
              <h2 className="text-lg lg:text-xl font-medium">Creative Brief</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-base lg:text-lg leading-relaxed break-words">
                {data.profileSummary || data.personalInfo.bio}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Skills & Expertise */}
          <div className="space-y-6">
            {/* Design Skills */}
            {data.technicalSkills.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 lg:p-6 border border-purple-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Palette size={18} className="text-purple-600 mr-2" />
                  Technical Skills
                </h3>
                <div className="space-y-4">
                  {data.technicalSkills.slice(0, 4).map((skill: string, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-800 font-medium text-sm break-words">{skill}</span>
                        <span className="text-purple-600 text-xs font-bold flex-shrink-0">{85 + (index * 3)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700"
                          style={{ width: `${85 + (index * 3)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Technical Skills */}
            {data.technicalSkills.length > 4 && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 lg:p-6 border border-indigo-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Monitor size={18} className="text-indigo-600 mr-2" />
                  Additional Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.technicalSkills.slice(4, 10).map((skill: string, index: number) => (
                    <span key={index} className="bg-white text-indigo-700 px-3 py-1 rounded-full text-xs font-medium border border-indigo-200 break-words">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Soft Skills */}
            {data.softSkills.length > 0 && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 lg:p-6 border border-yellow-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Soft Skills</h3>
                <div className="space-y-2">
                  {data.softSkills.map((skill: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <Star size={12} className="text-yellow-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-800 text-sm break-words">{skill}</span>
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
                <div className="space-y-2">
                  {data.languages.map((lang: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm break-words">{lang.name}</span>
                      <span className="text-green-600 text-xs font-medium">
                        {lang.proficiency === 5 ? 'Native' : lang.proficiency === 4 ? 'Fluent' : lang.proficiency === 3 ? 'Intermediate' : lang.proficiency === 2 ? 'Basic' : 'Beginner'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Experience & Projects */}
          <div className="lg:col-span-2 space-y-6">
            {/* Experience */}
            {data.workExperience.length > 0 && (
              <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-medium text-gray-900 mb-4 lg:mb-6 pb-3 border-b border-gray-200">
                  Professional Journey
                </h3>
                <div className="space-y-6">
                  {data.workExperience.map((job: any, index: number) => (
                    <div key={index} className="group">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-3 gap-2">
                        <div className="flex-1">
                          <h4 className="text-base lg:text-lg font-medium text-gray-900 group-hover:text-purple-600 transition-colors break-words">
                            {job.position}
                          </h4>
                          <p className="text-purple-700 font-medium break-words">{job.company}</p>
                        </div>
                        <span className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-3 lg:px-4 py-1 lg:py-2 rounded-full text-sm font-medium self-start lg:self-auto whitespace-nowrap">
                          {job.period}
                        </span>
                      </div>
                      {job.description && (
                        <p className="text-gray-700 leading-relaxed break-words">{job.description}</p>
                      )}
                      
                      {/* Project Highlights */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {['Creative Direction', 'Team Collaboration', 'Innovation'].map((highlight, i) => (
                          <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                            {highlight}
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
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 lg:p-6 border border-green-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Education</h3>
                  {data.education.map((edu: any, index: number) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <h4 className="font-medium text-gray-900 break-words">{edu.degree}</h4>
                      <p className="text-green-700 font-medium break-words">{edu.school}</p>
                      {edu.period && <p className="text-gray-600 text-sm break-words">{edu.period}</p>}
                    </div>
                  ))}
                </div>
              )}

              {data.projects.length > 0 && (
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 lg:p-6 border border-pink-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Featured Work</h3>
                  {data.projects.map((project: any, index: number) => (
                    <div key={index} className="mb-4 last:mb-0 p-3 bg-white rounded-lg border border-pink-100">
                      <h4 className="font-medium text-gray-900 text-sm break-words">{project.name}</h4>
                      {project.tech && <p className="text-pink-700 text-xs font-medium break-words">{project.tech}</p>}
                      {project.description && <p className="text-gray-700 text-xs mt-1 leading-relaxed break-words">{project.description}</p>}
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
                <div className="space-y-3">
                  {data.awardsAndHonors.map((aw: any, i: number) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-amber-100">
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
