import { Mail, Phone, MapPin, Globe, Award, Users, Target } from 'lucide-react';
import { transformCVDataForTemplates } from '@/lib/cvDataTransformer';
import { extractGitHubUsername } from '@/lib/cvDataTransformer';

export function ModernTemplate14({ cvData }: { cvData: any }) {
  const data = transformCVDataForTemplates(cvData);

  if (!data) {
    return <div>No data available</div>;
  }

  // Get initials for fallback image
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-lg overflow-hidden">
      {/* Header with Curved Design */}
      <div className="relative bg-gradient-to-r from-orange-400 to-orange-500 overflow-hidden">
        {/* Background Curves */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full transform translate-x-32 -translate-y-32 opacity-80"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400 rounded-full transform -translate-x-16 translate-y-16 opacity-60"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white rounded-full opacity-20"></div>
        
        <div className="relative z-10 p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 break-words">{data.personalInfo.name.split(' ')[0] || 'Your'}</h1>
              <h1 className="text-4xl font-bold text-white mb-4 break-words">{data.personalInfo.name.split(' ')[1] || 'Name'}</h1>
              <p className="text-orange-100 text-xl mb-6 uppercase tracking-wide break-words">{data.personalInfo.title}</p>
            </div>
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
              {data.personalInfo.imageUrl ? (
                <img 
                  src={data.personalInfo.imageUrl} 
                  alt="Professional headshot"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-orange-300 flex items-center justify-center text-white text-2xl font-bold ${data.personalInfo.imageUrl ? 'hidden' : ''}`}>
                {getInitials(data.personalInfo.name)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Work Experience */}
            {data.workExperience.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-orange-600">WORK EXPERIENCE</h2>
                <div className="space-y-6">
                  {data.workExperience.slice(0, 2).map((job, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-3 h-3 bg-orange-500 rounded-full mt-2 mr-4"></div>
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-gray-900 break-words">{job.company}</h3>
                              <p className="text-orange-600 font-medium break-words">{job.position}</p>
                            </div>
                            <span className="text-sm text-gray-600 bg-yellow-100 px-2 py-1 rounded">
                              {job.period}
                            </span>
                          </div>
                          {job.description && (
                            <p className="text-gray-700 text-sm mb-2 break-words">{job.description}</p>
                          )}
                          {job.achievements && job.achievements.length > 0 && (
                            <ul className="space-y-1 text-gray-700 text-sm">
                              {job.achievements.slice(0, 3).map((achievement, idx) => (
                                <li key={idx} className="flex items-start">
                                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                  <span className="break-words">{achievement}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Academic Summary */}
            {data.education.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-orange-600">ACADEMIC SUMMARY</h2>
                <div className="space-y-4">
                  {data.education.map((edu, index) => (
                    <div key={index} className="bg-yellow-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <h3 className="font-bold text-gray-900 break-words">{edu.school}</h3>
                      <p className="text-orange-600 font-medium break-words">{edu.degree}</p>
                      <p className="text-gray-600 text-sm">{edu.period}</p>
                      {edu.field && (
                        <p className="text-gray-600 text-sm break-words">Field: {edu.field}</p>
                      )}
                      {edu.description && (
                        <p className="text-gray-600 text-sm mt-2 break-words">{edu.description}</p>
                      )}
                      {edu.achievements && edu.achievements.length > 0 && (
                        <ul className="mt-2 space-y-1 text-gray-700 text-sm">
                          {edu.achievements.slice(0, 3).map((achievement, idx) => (
                            <li key={idx} className="flex items-start">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                              <span className="break-words">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {data.languages.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-orange-600">LANGUAGES</h2>
                <div className="space-y-4">
                  {data.languages.map((lang, index) => (
                    <div key={index} className="bg-white border border-orange-200 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 break-words">{lang.name}</h3>
                        <span className="text-orange-600 text-sm font-medium">
                          {lang.proficiency === 5 ? 'Native' :
                           lang.proficiency === 4 ? 'Fluent' :
                           lang.proficiency === 3 ? 'Intermediate' :
                           lang.proficiency === 2 ? 'Basic' : 'Beginner'}
                        </span>
                      </div>
                      {lang.description && (
                        <p className="text-gray-600 text-sm mt-1 break-words">{lang.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal References */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-orange-600">PERSONAL REFERENCES</h2>
              <div className="space-y-4">
                <div className="bg-white border border-orange-200 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900">John Smith</h3>
                  <p className="text-orange-600 text-sm">Senior Engineering Manager</p>
                  <p className="text-gray-600 text-sm">TechCorp Inc.</p>
                  <p className="text-gray-600 text-sm mt-1">john.smith@techcorp.com</p>
                </div>
                <div className="bg-white border border-orange-200 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900">Sarah Johnson</h3>
                  <p className="text-orange-600 text-sm">Lead Developer</p>
                  <p className="text-gray-600 text-sm">Innovation Labs</p>
                  <p className="text-gray-600 text-sm mt-1">sarah.j@innovationlabs.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Bio */}
            {data.personalInfo.bio && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-orange-600">BIO</h2>
                <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-gray-700 leading-relaxed break-words">
                    {data.personalInfo.bio}
                  </p>
                </div>
              </div>
            )}

            {/* Get to Know Me */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-orange-600">GET TO KNOW ME</h2>
              <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
                <p className="text-gray-700 leading-relaxed break-words">
                  {data.profileSummary || "I am a passionate software engineer with expertise in full-stack development. I love creating innovative solutions and working with cutting-edge technologies. My goal is to build products that make a real impact on users' lives."}
                </p>
              </div>
            </div>

            {/* Expertise & Skills */}
            {(data.technicalSkills.length > 0 || data.softSkills.length > 0) && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-orange-600">EXPERTISE & SKILLS</h2>
                <div className="space-y-4">
                  {data.technicalSkills.length > 0 && (
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Target className="text-orange-500 mr-2" size={20} />
                        <h3 className="font-bold text-gray-900">Technical Skills</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.technicalSkills.slice(0, 6).map((skill, index) => (
                          <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm break-words">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {data.softSkills.length > 0 && (
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Users className="text-yellow-500 mr-2" size={20} />
                        <h3 className="font-bold text-gray-900">Soft Skills</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {data.softSkills.map((skill, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                            <span className="text-gray-700 text-sm break-words">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Projects */}
            {data.projects.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-orange-600">KEY PROJECTS</h2>
                <div className="space-y-4">
                  {data.projects.slice(0, 3).map((project, index) => (
                    <div key={index} className="bg-white border border-orange-200 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-900 break-words">{project.name}</h3>
                      {project.tech && (
                        <p className="text-orange-600 text-sm break-words">Tech: {project.tech}</p>
                      )}
                      {project.description && (
                        <p className="text-gray-600 text-sm mt-1 break-words">{project.description}</p>
                      )}
                      {project.highlights && project.highlights.length > 0 && (
                        <ul className="mt-2 space-y-1 text-gray-700 text-sm">
                          {project.highlights.slice(0, 2).map((highlight, idx) => (
                            <li key={idx} className="flex items-start">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                              <span className="break-words">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How to Reach Me */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-orange-600">HOW TO REACH ME</h2>
              <div className="bg-orange-500 text-white p-6 rounded-lg">
                <div className="space-y-4">
                  {data.personalInfo.email && (
                    <div className="flex items-center">
                      <Mail size={16} className="mr-3 text-orange-100" />
                      <span className="text-sm break-words">{data.personalInfo.email}</span>
                    </div>
                  )}
                  {data.personalInfo.phone && (
                    <div className="flex items-center">
                      <Phone size={16} className="mr-3 text-orange-100" />
                      <span className="text-sm break-words">{data.personalInfo.phone}</span>
                    </div>
                  )}
                  {data.personalInfo.website && (
                    <div className="flex items-center">
                      <Globe size={16} className="mr-3 text-orange-100" />
                      <span className="text-sm break-words">{data.personalInfo.website}</span>
                    </div>
                  )}
                  {data.personalInfo.location && (
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-3 text-orange-100" />
                      <span className="text-sm break-words">{data.personalInfo.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Awards */}
            {data.awardsAndHonors.length > 0 && (
              <div>
                <div className="bg-yellow-400 text-white p-4 rounded-lg">
                  <div className="flex items-center justify-center">
                    <Award size={24} className="mr-2" />
                    <span className="font-bold break-words">{data.awardsAndHonors[0].title}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

