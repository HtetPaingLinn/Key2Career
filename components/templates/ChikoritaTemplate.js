import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faEnvelope, faPhone, faMapMarkerAlt, faGlobe, faLink, faCogs, faCertificate, faLanguage, faUsers, faBriefcase, faGraduationCap, faProjectDiagram, faAward, faBook, faHandsHelping, faUserFriends, faFileAlt, faStar, faPaperclip, faCar, faLinkedin
} from '@fortawesome/free-solid-svg-icons';
import { faLinkedin as faLinkedinBrand } from '@fortawesome/free-brands-svg-icons';
import { transformToReactiveResumeFormat } from '@/lib/cvDataTransformer';

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

const formatDateRange = (startDate, endDate, current = false) => {
  const start = formatDate(startDate);
  const end = current ? 'Present' : formatDate(endDate);
  return `${start} - ${end}`;
};

const isEmptyString = (str) => !str || str.trim() === '';
const isUrl = (str) => str && (str.startsWith('http://') || str.startsWith('https://'));

const ProgressBar = ({ value, max = 5 }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }}></div>
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{value}/{max}</span>
    </div>
  );
};

const Link = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">
    {children}
  </a>
);

const Section = ({ title, children, className = "" }) => (
  <div className={`mb-8 ${className}`}>
    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
      <div className="w-1 h-6 bg-green-500 mr-3 rounded"></div>
      {title}
    </h3>
    {children}
  </div>
);

export const ChikoritaTemplate = ({ cvData, columns = 1, isFirstPage = false }) => {
  const reactiveResumeData = transformToReactiveResumeFormat(cvData);
  const { basics, sections } = reactiveResumeData;

  return (
    <div className="w-full h-full bg-white print:bg-white text-sm font-sans relative">
      {/* Minimal Header */}
      <header className="border-b-4 border-green-500 p-8 print:border-green-500">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{basics.name}</h1>
            <p className="text-xl text-green-600 font-medium mb-6">{basics.headline}</p>
            
            {/* Contact Info */}
            <div className="flex flex-wrap justify-center gap-6 text-gray-600">
              {basics.email && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-green-500" />
                  <span>{basics.email}</span>
                </div>
              )}
              {basics.phone && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faPhone} className="w-4 h-4 text-green-500" />
                  <span>{basics.phone}</span>
                </div>
              )}
              {basics.location && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-green-500" />
                  <span>{basics.location}</span>
                </div>
              )}
              {basics.url?.href && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 text-green-500" />
                  <Link href={basics.url.href}>{basics.url.label || basics.url.href}</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-8">
        {/* Summary Section */}
        {sections.summary?.visible && sections.summary.items?.length > 0 && (
          <Section title="Summary">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 leading-relaxed text-lg">{sections.summary.items[0].summary}</p>
            </div>
          </Section>
        )}

        {/* Experience Section */}
        {sections.experience?.visible && sections.experience.items?.length > 0 && (
          <Section title="Experience">
            <div className="space-y-8">
              {sections.experience.items.map((exp, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{exp.position}</h4>
                      <p className="text-lg text-green-600 font-medium">{exp.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 font-medium">{formatDateRange(exp.startDate, exp.endDate, exp.current)}</p>
                      {exp.location && <p className="text-sm text-gray-500">{exp.location}</p>}
                    </div>
                  </div>
                  {exp.summary && (
                    <p className="text-gray-700 leading-relaxed">{exp.summary}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Education Section */}
        {sections.education?.visible && sections.education.items?.length > 0 && (
          <Section title="Education">
            <div className="space-y-6">
              {sections.education.items.map((edu, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900">{edu.degree}</h4>
                    <p className="text-green-600 font-medium">{edu.institution}</p>
                    {edu.fieldOfStudy && <p className="text-gray-600">{edu.fieldOfStudy}</p>}
                    {edu.summary && <p className="text-gray-700 mt-2">{edu.summary}</p>}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-600 font-medium">{formatDateRange(edu.startDate, edu.endDate)}</p>
                    {edu.grade && <p className="text-sm text-gray-500">GPA: {edu.grade}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Skills Section */}
        {sections.skills?.visible && sections.skills.items?.length > 0 && (
          <Section title="Skills">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sections.skills.items.map((skill, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">{skill.name}</span>
                  </div>
                  <ProgressBar value={skill.level} />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Projects Section */}
        {sections.projects?.visible && sections.projects.items?.length > 0 && (
          <Section title="Projects">
            <div className="space-y-6">
              {sections.projects.items.map((proj, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-bold text-gray-900">{proj.name}</h4>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{formatDateRange(proj.startDate, proj.endDate)}</p>
                      {proj.url && <Link href={proj.url} className="text-sm">View Project</Link>}
                    </div>
                  </div>
                  {proj.summary && (
                    <p className="text-gray-700 leading-relaxed mb-3">{proj.summary}</p>
                  )}
                  {proj.keywords?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {proj.keywords.map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Certifications Section */}
        {sections.certifications?.visible && sections.certifications.items?.length > 0 && (
          <Section title="Certifications">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.certifications.items.map((cert, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                  <FontAwesomeIcon icon={faCertificate} className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="font-semibold text-gray-900">{cert.name}</p>
                    <p className="text-sm text-gray-600">{cert.issuer}</p>
                    {cert.date && <p className="text-xs text-gray-500">{formatDate(cert.date)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Languages Section */}
        {sections.languages?.visible && sections.languages.items?.length > 0 && (
          <Section title="Languages">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sections.languages.items.map((lang, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">{lang.name}</span>
                  </div>
                  <ProgressBar value={lang.level} />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Awards Section */}
        {sections.awards?.visible && sections.awards.items?.length > 0 && (
          <Section title="Awards & Honors">
            <div className="space-y-4">
              {sections.awards.items.map((award, index) => (
                <div key={index} className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faAward} className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{award.title}</h4>
                    <p className="text-green-600">{award.issuer}</p>
                    {award.date && <p className="text-sm text-gray-600">{formatDate(award.date)}</p>}
                    {award.summary && <p className="text-gray-700 mt-1">{award.summary}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Interests Section */}
        {sections.interests?.visible && sections.interests.items?.length > 0 && (
          <Section title="Interests">
            <div className="flex flex-wrap gap-3">
              {sections.interests.items.map((interest, index) => (
                <span key={index} className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {interest.name}
                </span>
              ))}
            </div>
          </Section>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t-2 border-green-500 p-6 text-center">
        <p className="text-gray-600 text-sm">Made with Key2Career</p>
      </footer>
    </div>
  );
}; 