import { Mail, Phone, MapPin, Globe, Zap, Shield, Layers, Rocket, Award, Target } from 'lucide-react';
import { transformCVDataForTemplates } from '@/lib/cvDataTransformer';

export function ModernTemplate19({ cvData }: { cvData: any }) {
  console.log('ModernTemplate19 rendering with cvData:', cvData);
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
    <div className="w-full max-w-4xl mx-auto bg-gray-100 p-4 lg:p-6 shadow-xl overflow-hidden">
      {/* Header Card */}
      <div className="relative mb-4 lg:mb-6">
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-3xl p-6 lg:p-8 text-white shadow-2xl transform hover:scale-105 transition-transform duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col lg:flex-row items-center lg:items-start lg:space-x-8 text-center lg:text-left">
              <div className="relative mb-4 lg:mb-0">
                <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
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
                  <div className={`w-full h-full bg-gradient-to-br from-orange-500 to-red-500 text-white text-2xl font-bold items-center justify-center ${data.personalInfo.imageUrl ? 'hidden' : 'flex'}`}>
                    {getInitials(fullName)}
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 lg:w-8 lg:h-8 bg-yellow-400 rounded-full border-4 border-white flex items-center justify-center">
                  <Zap size={16} className="text-yellow-800" />
                </div>
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold mb-2 lg:mb-3 text-gray-900 break-words">{fullName}</h1>
                {data.personalInfo.title && (
                  <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-4 lg:px-6 py-2 lg:py-3 inline-block mb-3 lg:mb-4 shadow-lg">
                    <p className="text-orange-700 text-base lg:text-lg font-semibold break-words">{data.personalInfo.title}</p>
                  </div>
                )}
                {(data.profileSummary || data.personalInfo.bio) && (
                  <p className="text-gray-800 max-w-md mx-auto lg:mx-0 text-sm lg:text-base break-words font-medium">
                    {data.profileSummary || data.personalInfo.bio}
                  </p>
                )}
              </div>
            </div>
            
            {/* Contact Quick Access */}
            <div className="text-center lg:text-right space-y-2">
              {data.personalInfo.phone && (
                <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-3 lg:px-4 py-2 shadow-md">
                  <p className="text-orange-600 text-xs font-semibold">Quick Connect</p>
                  <p className="text-gray-800 font-semibold text-sm break-all">{data.personalInfo.phone}</p>
                </div>
              )}
              {data.personalInfo.email && (
                <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-3 lg:px-4 py-2 shadow-md">
                  <p className="text-orange-600 text-xs font-semibold">Email</p>
                  <p className="text-gray-800 font-semibold text-sm break-all text-wrap">{data.personalInfo.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
        {(data.personalInfo.location || data.personalInfo.address) && (
          <div className="bg-white rounded-2xl p-3 lg:p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <MapPin size={18} className="text-red-500 mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 uppercase">Location</p>
                <p className="text-gray-900 font-medium text-xs lg:text-sm break-words">{data.personalInfo.location || data.personalInfo.address}</p>
              </div>
            </div>
          </div>
        )}
        
        {data.personalInfo.website && (
          <div className="bg-white rounded-2xl p-3 lg:p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <Globe size={18} className="text-orange-500 mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 uppercase">Portfolio</p>
                <p className="text-gray-900 font-medium text-xs lg:text-sm break-all">{data.personalInfo.website}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-2xl p-3 lg:p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <Shield size={18} className="text-green-500 mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase">Experience</p>
              <p className="text-gray-900 font-medium text-xs lg:text-sm">{data.workExperience.length}+ Years</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-3 lg:p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <Rocket size={18} className="text-purple-500 mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase">Projects</p>
              <p className="text-gray-900 font-medium text-xs lg:text-sm">{data.projects.length}+ Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Skills Card */}
        <div className="bg-white rounded-3xl p-4 lg:p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <Layers size={24} className="text-orange-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Tech Stack</h3>
          </div>
          
          <div className="space-y-4">
            {data.technicalSkills.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="font-medium text-gray-900 mb-3 text-base">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                                     {data.technicalSkills.slice(0, 6).map((skill: string, i: number) => (
                     <span key={i} className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold break-words shadow-sm">
                       {skill}
                     </span>
                   ))}
                </div>
              </div>
            )}

            {data.softSkills.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="font-medium text-gray-900 mb-3 text-base">Soft Skills</h4>
                <div className="flex flex-wrap gap-2">
                                     {data.softSkills.slice(0, 4).map((skill: string, i: number) => (
                     <span key={i} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold break-words shadow-sm">
                       {skill}
                     </span>
                   ))}
                </div>
              </div>
            )}

            {data.languages.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-4">
                <h4 className="font-medium text-gray-900 mb-3 text-base">Languages</h4>
                <div className="space-y-2">
                  {data.languages.map((lang: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm break-words">{lang.name}</span>
                                             <span className="text-orange-600 text-xs font-semibold">
                         {lang.proficiency === 5 ? 'Native' : lang.proficiency === 4 ? 'Fluent' : lang.proficiency === 3 ? 'Intermediate' : lang.proficiency === 2 ? 'Basic' : 'Beginner'}
                       </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3 text-base">Core Competencies</h4>
            <div className="space-y-2">
                             {['Problem Solving', 'Team Leadership', 'Innovation', 'Communication'].map((skill, index) => (
                 <div key={index} className="flex items-center">
                   <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mr-3 flex-shrink-0"></div>
                   <span className="text-gray-800 text-sm font-medium break-words">{skill}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Experience Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-4 lg:p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Zap size={24} className="text-orange-600 mr-3" />
            Professional Experience
          </h3>
          
          <div className="space-y-8">
            {data.workExperience.map((job: any, index: number) => (
              <div key={index} className="relative group">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200 hover:border-orange-300 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 gap-2">
                    <div className="flex-1">
                                             <h4 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors break-words">
                         {job.position}
                       </h4>
                       <p className="text-orange-600 font-semibold text-lg break-words">{job.company}</p>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg self-start lg:self-auto whitespace-nowrap">
                      {job.period}
                    </div>
                  </div>
                  {job.description && (
                    <p className="text-gray-700 leading-relaxed mb-4 text-base break-words">{job.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                                         {['Innovation', 'Leadership', 'Results'].map((tag, i) => (
                       <span key={i} className="bg-white text-orange-600 px-3 py-1 rounded-full text-xs font-semibold border border-orange-300 shadow-sm">
                         {tag}
                       </span>
                     ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mt-6">
        {/* Education Card */}
        {data.education.length > 0 && (
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl">
            <h3 className="text-xl font-bold mb-4">Education</h3>
            {data.education.map((edu: any, index: number) => (
              <div key={index} className="mb-4 last:mb-0">
                                 <h4 className="font-semibold text-purple-100 text-base break-words">{edu.degree}</h4>
                 <p className="text-white font-bold text-base break-words">{edu.school}</p>
                 {edu.period && <p className="text-purple-200 text-sm mt-1 font-medium break-words">{edu.period}</p>}
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-purple-400">
              <div className="flex items-center">
                <Shield size={16} className="text-purple-200 mr-2 flex-shrink-0" />
                                 <span className="text-purple-200 text-sm font-semibold">Academic Excellence</span>
              </div>
            </div>
          </div>
        )}

                 {/* Projects Card */}
         {data.projects.length > 0 && (
           <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl p-6 text-white shadow-xl">
                          <h3 className="text-xl font-bold mb-4 text-white">Featured Projects</h3>
              {data.projects.slice(0, 2).map((project: any, index: number) => (
                <div key={index} className="mb-4 last:mb-0 bg-white bg-opacity-25 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-30">
                  <h4 className="font-bold text-gray-800 text-sm break-words mb-1">{project.name}</h4>
                  {project.tech && <p className="text-gray-600 font-semibold text-xs break-words mb-2">{project.tech}</p>}
                  {project.description && <p className="text-gray-700 text-xs leading-relaxed font-medium break-words">{project.description}</p>}
                </div>
              ))}
           </div>
         )}

                 {/* Awards & Honors Card */}
         {data.awardsAndHonors.length > 0 ? (
           <div className="bg-gradient-to-br from-amber-600 to-yellow-600 rounded-3xl p-6 text-white shadow-xl">
                        <h3 className="text-xl font-bold mb-4 flex items-center text-white">
              <Award size={20} className="mr-2 text-yellow-300" />
              Awards & Honors
            </h3>
            {data.awardsAndHonors.map((aw: any, i: number) => (
              <div key={i} className="mb-4 last:mb-0 bg-white bg-opacity-25 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-30">
                <h4 className="font-bold text-gray-800 text-sm break-words mb-1">{aw.title}</h4>
                {(aw.issuer || aw.year) && (
                  <p className="text-gray-600 font-semibold text-xs break-words mb-2">{[aw.issuer, aw.year].filter(Boolean).join(' • ')}</p>
                )}
                {aw.description && <p className="text-gray-700 text-xs leading-relaxed font-medium break-words">{aw.description}</p>}
              </div>
            ))}
           </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 text-white shadow-xl">
            <h3 className="text-xl font-bold mb-4">Professional Summary</h3>
                         <p className="text-gray-200 leading-relaxed text-sm mb-4 font-medium break-words">
               {data.profileSummary || data.personalInfo.bio || 'Passionate professional with expertise in innovative solutions and creative problem-solving.'}
             </p>
             <div className="flex items-center">
               <Rocket size={16} className="text-yellow-300 mr-2 flex-shrink-0" />
               <span className="text-yellow-300 font-semibold text-sm">Ready for new challenges</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
