import { Mail, Phone, MapPin, Globe, Github, Linkedin } from 'lucide-react';
import { transformCVDataForTemplates, extractGitHubUsername } from '@/lib/cvDataTransformer';

export function ModernTemplate1({ cvData }) {
  const data = transformCVDataForTemplates(cvData);
  if (!data) return null;

  const githubUsername = extractGitHubUsername(cvData.projects);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-lg border border-gray-200 overflow-hidden">
      <div className="flex flex-col lg:flex-row min-h-[800px]">
        {/* Left Sidebar - Navy Blue */}
        <div className="w-full lg:w-1/3 bg-slate-800 text-white p-4 lg:p-8">
          {/* Professional Photo */}
          <div className="text-center mb-6 lg:mb-8">
            <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-4 lg:mb-6 rounded-full overflow-hidden border-4 border-teal-400 shadow-lg">
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
                  <span className="text-2xl font-bold text-white">
                    {data.personalInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-xl lg:text-2xl font-medium mb-2 text-white break-words">{data.personalInfo.name}</h1>
            <p className="text-teal-200 text-base lg:text-lg break-words">{data.personalInfo.title}</p>
          </div>

          {/* Bio */}
          {data.personalInfo.bio && (
            <div className="mb-6 lg:mb-8">
              <h3 className="text-teal-200 font-medium mb-3 lg:mb-4 text-sm uppercase tracking-wide border-b border-teal-600 pb-2">
                Bio
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed break-words">
                {data.personalInfo.bio}
              </p>
            </div>
          )}

          {/* About Me */}
          {data.profileSummary && (
            <div className="mb-6 lg:mb-8">
              <h3 className="text-teal-200 font-medium mb-3 lg:mb-4 text-sm uppercase tracking-wide border-b border-teal-600 pb-2">
                About Me
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed break-words">
                {data.profileSummary}
              </p>
            </div>
          )}

          {/* Contact Information */}
          <div className="mb-6 lg:mb-8">
            <h3 className="text-teal-200 font-medium mb-3 lg:mb-4 text-sm uppercase tracking-wide border-b border-teal-600 pb-2">
              Contact
            </h3>
            <div className="space-y-3 text-sm">
              {data.personalInfo.phone && (
                <div className="flex items-center">
                  <Phone size={14} className="mr-3 text-teal-400 flex-shrink-0" />
                  <span className="text-slate-200 break-all">{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo.email && (
                <div className="flex items-center">
                  <Mail size={14} className="mr-3 text-teal-400 flex-shrink-0" />
                  <span className="text-slate-200 break-all text-wrap">{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo.website && (
                <div className="flex items-center">
                  <Globe size={14} className="mr-3 text-teal-400 flex-shrink-0" />
                  <span className="text-slate-200 break-all">{data.personalInfo.website}</span>
                </div>
              )}
              {data.personalInfo.location && (
                <div className="flex items-center">
                  <MapPin size={14} className="mr-3 text-teal-400 flex-shrink-0" />
                  <span className="text-slate-200 break-words">{data.personalInfo.location}</span>
                </div>
              )}
              {data.personalInfo.linkedin && (
                <div className="flex items-center">
                  <Linkedin size={14} className="mr-3 text-teal-400 flex-shrink-0" />
                  <span className="text-slate-200 break-words">LinkedIn Profile</span>
                </div>
              )}
              {githubUsername && (
                <div className="flex items-center">
                  <Github size={14} className="mr-3 text-teal-400 flex-shrink-0" />
                  <span className="text-slate-200 break-words">GitHub Profile</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {data.technicalSkills.length > 0 && (
            <div className="mb-6 lg:mb-8">
              <h3 className="text-teal-200 font-medium mb-3 lg:mb-4 text-sm uppercase tracking-wide border-b border-teal-600 pb-2">
                Technical Skills
              </h3>
              <div className="space-y-3">
                {data.technicalSkills.slice(0, 6).map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-200 text-sm break-words">{skill}</span>
                      <span className="text-teal-300 text-xs flex-shrink-0">{Math.floor(Math.random() * 30) + 70}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-teal-400 to-teal-500 h-2 rounded-full transition-all duration-300"
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
            <div className="mb-6 lg:mb-8">
              <h3 className="text-teal-200 font-medium mb-3 lg:mb-4 text-sm uppercase tracking-wide border-b border-teal-600 pb-2">
                Soft Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.softSkills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-teal-600 text-white text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages.length > 0 && (
            <div>
              <h3 className="text-teal-200 font-medium mb-3 lg:mb-4 text-sm uppercase tracking-wide border-b border-teal-600 pb-2">
                Languages
              </h3>
              <div className="space-y-2">
                {data.languages.map((lang, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-slate-200 text-sm">{lang.name}</span>
                    <span className="text-teal-300 text-xs">
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
        </div>

        {/* Right Content Area */}
        <div className="w-full lg:w-2/3 p-4 lg:p-8 bg-white">
          {/* Work Experience */}
          {data.workExperience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b-2 border-teal-500 pb-2">
                Work Experience
              </h2>
              <div className="space-y-6">
                {data.workExperience.map((exp, index) => (
                  <div key={index} className="border-l-4 border-teal-500 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">{exp.position}</h3>
                      <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {exp.period}
                      </span>
                    </div>
                    <p className="text-teal-600 font-medium mb-2">{exp.company}</p>
                    {exp.location && (
                      <p className="text-sm text-slate-600 mb-3">{exp.location}</p>
                    )}
                    {exp.description && (
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {exp.achievements.map((achievement, idx) => (
                          <li key={idx} className="text-sm text-slate-700 flex items-start">
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
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b-2 border-teal-500 pb-2">
                Education
              </h2>
              <div className="space-y-6">
                {data.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-teal-500 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">{edu.degree}</h3>
                      <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {edu.period}
                      </span>
                    </div>
                    <p className="text-teal-600 font-medium mb-2">{edu.school}</p>
                    {edu.field && (
                      <p className="text-sm text-slate-600 mb-3">{edu.field}</p>
                    )}
                    {edu.description && (
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {data.projects.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b-2 border-teal-500 pb-2">
                Projects
              </h2>
              <div className="space-y-6">
                {data.projects.map((proj, index) => (
                  <div key={index} className="border-l-4 border-teal-500 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">{proj.name}</h3>
                      {proj.duration && (
                        <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {proj.duration}
                        </span>
                      )}
                    </div>
                    {proj.tech && (
                      <p className="text-teal-600 font-medium mb-2">{proj.tech}</p>
                    )}
                    {proj.description && (
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line mb-3">
                        {proj.description}
                      </p>
                    )}
                    {proj.highlights && proj.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {proj.highlights.map((highlight, idx) => (
                          <span key={idx} className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded">
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

          {/* Awards & Honors */}
          {data.awardsAndHonors.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b-2 border-teal-500 pb-2">
                Awards & Honors
              </h2>
              <div className="space-y-4">
                {data.awardsAndHonors.map((award, index) => (
                  <div key={index} className="border-l-4 border-teal-500 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">{award.title}</h3>
                      {award.year && (
                        <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {award.year}
                        </span>
                      )}
                    </div>
                    <p className="text-teal-600 font-medium mb-2">{award.issuer}</p>
                    {award.description && (
                      <p className="text-slate-700 text-sm leading-relaxed">
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
  );
}
