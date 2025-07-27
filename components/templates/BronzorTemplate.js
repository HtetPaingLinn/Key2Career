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

const Rating = ({ value, max = 5 }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
      <span className="text-xs text-gray-600">{value}/{max}</span>
    </div>
  );
};

const Link = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
    {children}
  </a>
);

const Section = ({ title, children, className = "" }) => (
  <div className={`mb-6 ${className}`}>
    <h3 className="text-lg font-bold text-gray-800 mb-3 border-b-2 border-blue-600 pb-1">{title}</h3>
    {children}
  </div>
);

export const BronzorTemplate = ({ cvData, columns = 1, isFirstPage = false }) => {
  const reactiveResumeData = transformToReactiveResumeFormat(cvData);
  const { basics, sections } = reactiveResumeData;

  return (
    <div className="w-full h-full bg-gray-50 print:bg-white text-sm font-sans relative">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 print:bg-blue-600">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-6">
            {/* Profile Image */}
            <div className="w-24 h-24 rounded-full bg-white overflow-hidden border-4 border-blue-300 shadow-lg">
              {basics.picture?.url ? (
                <img src={basics.picture.url} alt="Profile" className="w-full h-full object-cover" crossOrigin="anonymous" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-2xl bg-blue-100">
                  {basics.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Header Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{basics.name}</h1>
              <p className="text-xl text-blue-100 mb-4">{basics.headline}</p>
              
              {/* Contact Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {basics.email && (
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-blue-200" />
                    <span>{basics.email}</span>
                  </div>
                )}
                {basics.phone && (
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faPhone} className="w-4 h-4 text-blue-200" />
                    <span>{basics.phone}</span>
                  </div>
                )}
                {basics.location && (
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-blue-200" />
                    <span>{basics.location}</span>
                  </div>
                )}
                {basics.url?.href && (
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 text-blue-200" />
                    <Link href={basics.url.href}>{basics.url.label || basics.url.href}</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-8">
        {/* Summary Section */}
        {sections.summary?.visible && sections.summary.items?.length > 0 && (
          <Section title="Professional Summary">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-700 leading-relaxed">{sections.summary.items[0].summary}</p>
            </div>
          </Section>
        )}

        {/* Experience Section */}
        {sections.experience?.visible && sections.experience.items?.length > 0 && (
          <Section title="Professional Experience">
            <div className="space-y-6">
              {sections.experience.items.map((exp, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{exp.company}</h4>
                      <p className="text-blue-600 font-medium">{exp.position}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{formatDateRange(exp.startDate, exp.endDate, exp.current)}</p>
                      <p className="text-sm text-gray-500">{exp.location}</p>
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
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{edu.institution}</h4>
                      <p className="text-blue-600 font-medium">{edu.degree}</p>
                      {edu.fieldOfStudy && <p className="text-gray-600">{edu.fieldOfStudy}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{formatDateRange(edu.startDate, edu.endDate)}</p>
                      {edu.grade && <p className="text-sm text-gray-500">GPA: {edu.grade}</p>}
                    </div>
                  </div>
                  {edu.summary && (
                    <p className="text-gray-700 leading-relaxed">{edu.summary}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Skills Section */}
        {sections.skills?.visible && sections.skills.items?.length > 0 && (
          <Section title="Skills">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-2 gap-6">
                {sections.skills.items.map((skill, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{skill.name}</span>
                    <Rating value={skill.level} />
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* Projects Section */}
        {sections.projects?.visible && sections.projects.items?.length > 0 && (
          <Section title="Projects">
            <div className="space-y-6">
              {sections.projects.items.map((proj, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">{proj.name}</h4>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{formatDateRange(proj.startDate, proj.endDate)}</p>
                      {proj.url && <Link href={proj.url} className="text-sm text-blue-600">View Project</Link>}
                    </div>
                  </div>
                  {proj.summary && (
                    <p className="text-gray-700 leading-relaxed mb-3">{proj.summary}</p>
                  )}
                  {proj.keywords?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {proj.keywords.map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
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
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                {sections.certifications.items.map((cert, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faCertificate} className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{cert.name}</p>
                      <p className="text-sm text-gray-600">{cert.issuer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* Languages Section */}
        {sections.languages?.visible && sections.languages.items?.length > 0 && (
          <Section title="Languages">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                {sections.languages.items.map((lang, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{lang.name}</span>
                    <Rating value={lang.level} />
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* Awards Section */}
        {sections.awards?.visible && sections.awards.items?.length > 0 && (
          <Section title="Awards & Honors">
            <div className="space-y-4">
              {sections.awards.items.map((award, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-semibold text-gray-900">{award.title}</h4>
                  <p className="text-blue-600">{award.issuer}</p>
                  {award.date && <p className="text-sm text-gray-600">{formatDate(award.date)}</p>}
                  {award.summary && <p className="text-gray-700 mt-2">{award.summary}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Interests Section */}
        {sections.interests?.visible && sections.interests.items?.length > 0 && (
          <Section title="Interests">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-wrap gap-2">
                {sections.interests.items.map((interest, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {interest.name}
                  </span>
                ))}
              </div>
            </div>
          </Section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 print:bg-gray-100 p-4 text-center">
        <p className="text-gray-600 text-sm">Made with Key2Career</p>
      </footer>
    </div>
  );
}; 