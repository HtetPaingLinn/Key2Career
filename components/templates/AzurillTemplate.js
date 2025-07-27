import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt, faPhone, faEnvelope, faGlobe, faLink, faUser, faCogs, faProjectDiagram, faBriefcase, faGraduationCap, faUsers
} from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';

// --- Helper Functions ---
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
};

const formatDateRange = (startDate, endDate, current = false) => {
  const start = formatDate(startDate);
  const end = current ? 'Present' : formatDate(endDate);
  if (!start && !end) return '';
  if (start && !end) return start;
  return `${start} to ${end}`;
};

// --- Reusable Section Components ---
const Section = ({ title, icon, children, isLeft = false }) => (
  <div>
    <div className="flex items-center gap-2 mb-4">
      <FontAwesomeIcon icon={icon} className="w-4 h-4 text-amber-600" />
      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">{title}</h2>
    </div>
    <div className={isLeft ? "space-y-4" : "space-y-6"}>
      {children}
    </div>
  </div>
);

const TimelineSection = ({ title, icon, items, renderItem }) => (
  <Section title={title} icon={icon}>
    <div className="relative border-l-2 border-gray-200 pl-6 space-y-8">
      {items.map((item, index) => (
        <div key={index} className="relative">
          <div className="absolute -left-[35px] top-1 w-4 h-4 rounded-full bg-amber-500 border-4 border-white"></div>
          {renderItem(item)}
        </div>
      ))}
    </div>
  </Section>
);


// --- Main Template ---
export const AzurillTemplate = ({ cvData }) => {
  const {
    personalInfo = {},
    workExperience = [],
    education = [],
    skills = {},
    projects = [],
    certifications = [],
    references = [],
    summary: summaryText,
  } = cvData || {};

  const {
    firstName, lastName, jobApplied, imageUrl, address, phone, email, website, linkedin, github, bio, description
  } = personalInfo;

  const summary = summaryText || bio || description;
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  
  return (
    <div className="w-full h-full bg-white text-gray-800 font-sans leading-relaxed">
       {/* Header */}
      <header className="text-center py-10 px-6 bg-gray-50">
        {imageUrl && (
          <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden ring-4 ring-white shadow-lg">
            <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" crossOrigin="anonymous" />
          </div>
        )}
        <h1 className="text-4xl font-bold text-gray-900">{fullName || 'Htet Paing Linn'}</h1>
        <h2 className="text-xl text-gray-600 mt-2">{jobApplied || 'Creative and Innovative Web Developer'}</h2>
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-5">
          {address && <span className="flex items-center gap-2"><FontAwesomeIcon icon={faMapMarkerAlt} className="text-amber-600" /> {address}</span>}
          {phone && <span className="flex items-center gap-2"><FontAwesomeIcon icon={faPhone} className="text-amber-600" /> {phone}</span>}
          {email && <span className="flex items-center gap-2"><FontAwesomeIcon icon={faEnvelope} className="text-amber-600" /> {email}</span>}
          {website && <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-amber-700"><FontAwesomeIcon icon={faGlobe} className="text-amber-600" /> {website}</a>}
        </div>
      </header>

      <hr />
      
      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-10 p-10">
        {/* Left Column */}
        <aside className="w-full md:w-1/3 space-y-8">
          {/* Profiles */}
          <Section title="Profiles" icon={faUser} isLeft>
             {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" className="block hover:text-amber-700">
                   <div className="flex items-center gap-2 text-sm font-medium">
                      <FontAwesomeIcon icon={faLinkedin} className="w-4 h-4 text-gray-500" />
                      <span className="break-all">{linkedin}</span>
                   </div>
                </a>
             )}
             {github && (
                <a href={github} target="_blank" rel="noopener noreferrer" className="block hover:text-amber-700">
                   <div className="flex items-center gap-2 text-sm font-medium">
                      <FontAwesomeIcon icon={faGithub} className="w-4 h-4 text-gray-500" />
                      <span className="break-all">{github.replace('https://github.com/', '')}</span>
                   </div>
                </a>
             )}
          </Section>

          {/* Skills */}
          <Section title="Skills" icon={faCogs} isLeft>
            <div className="flex flex-wrap gap-2">
              {[...(skills.technical || []), ...(skills.soft || [])].map((skill, i) => (
                <span key={i} className="bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">{skill.name}</span>
              ))}
            </div>
          </Section>
          
          {/* Projects */}
          <Section title="Projects" icon={faProjectDiagram} isLeft>
            {projects.map((proj, i) => (
              <div key={i}>
                <h3 className="font-semibold text-gray-800">{proj.title}</h3>
                <p className="text-sm text-gray-600">{proj.role}</p>
                <p className="text-xs text-gray-500 mt-1">{proj.description}</p>
              </div>
            ))}
          </Section>

        </aside>

        {/* Right Column */}
        <main className="w-full md:w-2/3 space-y-8">
          {/* Summary */}
          {summary && <Section title="Summary" icon={faUser}>{summary}</Section>}

          {/* Experience */}
          <TimelineSection title="Experience" icon={faBriefcase} items={workExperience} renderItem={(exp) => (
            <>
              <h3 className="text-lg font-semibold text-gray-800">{exp.company}</h3>
              <p className="text-md text-gray-600">{exp.role} — {exp.location}</p>
              <p className="text-sm text-gray-400 mb-2">{formatDateRange(exp.startDate, exp.endDate, exp.current)}</p>
              {exp.achievements?.length ? (
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                  {exp.achievements.map((ach, j) => <li key={j}>{ach}</li>)}
                </ul>
              ) : <p className="text-sm text-gray-700">{exp.description}</p>}
            </>
          )} />
          
          {/* Education */}
          <TimelineSection title="Education" icon={faGraduationCap} items={education} renderItem={(edu) => (
            <>
              <h3 className="text-lg font-semibold text-gray-800">{edu.institution}</h3>
              <p className="text-md text-gray-600">{edu.degree} — {edu.location}</p>
              <p className="text-sm text-gray-400">{formatDateRange(edu.startDate, edu.endDate)}</p>
            </>
          )} />
          
          {/* References */}
          {references && references.length > 0 && (
             <Section title="References" icon={faUsers}>
               {references.map((ref, i) => (
                 <div key={i}>
                   <p className="font-semibold">{ref.name}</p>
                   <p>{ref.position}, {ref.company}</p>
                   <p>{ref.email} | {ref.phone}</p>
                 </div>
               ))}
             </Section>
          )}
        </main>
      </div>
    </div>
  );
};
