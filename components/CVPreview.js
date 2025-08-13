import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faEnvelope, faPhone, faMapMarkerAlt, faGlobe, faLink, faCogs, faCertificate, faLanguage, faUsers, faBriefcase, faGraduationCap, faProjectDiagram, faAward, faBook, faHandsHelping, faUserFriends, faFileAlt, faStar, faPaperclip, faCar
} from '@fortawesome/free-solid-svg-icons';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';

export default function CVPreview({ cvData }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };
  const formatDateRange = (startDate, endDate, current = false) => {
    const start = formatDate(startDate);
    const end = current ? 'Present' : formatDate(endDate);
    return `${start} - ${end}`;
  };
  return (
    <div className="w-full h-full flex bg-gray-100 print:bg-white text-xs font-sans relative">
      {/* Left Sidebar */}
      <aside className="w-1/3 min-w-[250px] bg-emerald-900 text-white flex flex-col p-5 print:bg-emerald-900 rounded-l-2xl shadow-lg">
        {/* Profile */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-white overflow-hidden mb-3 border-4 border-emerald-700 shadow">
            {cvData.personalInfo?.imageUrl ? (
              <img src={cvData.personalInfo.imageUrl} alt="Profile" className="w-full h-full object-cover" crossOrigin="anonymous" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-emerald-900 font-bold text-2xl bg-emerald-100">
                {cvData.personalInfo?.firstName?.[0] || ''}{cvData.personalInfo?.lastName?.[0] || ''}
              </div>
            )}
          </div>
          <div className="text-lg font-bold text-white text-center leading-tight tracking-tight">
            {cvData.personalInfo?.firstName} {cvData.personalInfo?.lastName}
          </div>
          <div className="text-xs text-emerald-200 text-center mb-1 font-medium">
            {cvData.jobApplied}
          </div>
        </div>
        {/* Contact Info */}
        <div className="mb-5 space-y-2.5">
          <div className="flex items-start gap-2 text-xs">
            <FontAwesomeIcon icon={faUser} className="w-3 h-3 text-emerald-200" />
            <span className='break-all whitespace-normal'>{cvData.personalInfo?.firstName} {cvData.personalInfo?.lastName}</span>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 text-emerald-200" />
            <span className='break-all whitespace-normal'>{cvData.personalInfo?.email}</span>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-emerald-200" />
            <span className='break-all whitespace-normal'>{cvData.personalInfo?.phone}</span>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3 text-emerald-200" />
            <span className='break-all whitespace-normal'>{cvData.personalInfo?.address}</span>
          </div>
          {cvData.personalInfo?.dateOfBirth && (
            <div className="flex items-start gap-2 text-xs">
              <FontAwesomeIcon icon={faUser} className="w-3 h-3 text-emerald-200" />
              <span className='break-all whitespace-normal'>Date of Birth: {cvData.personalInfo.dateOfBirth}</span>
            </div>
          )}
          {cvData.personalInfo?.nationality && (
            <div className="flex items-start gap-2 text-xs">
              <FontAwesomeIcon icon={faGlobe} className="w-3 h-3 text-emerald-200" />
              <span>Nationality: {cvData.personalInfo.nationality}</span>
            </div>
          )}
          {cvData.personalInfo?.drivingLicense && (
            <div className="flex items-start gap-2 text-xs">
              <FontAwesomeIcon icon={faCar} className="w-3 h-3 text-emerald-200" />
              <span>Driving License: {cvData.personalInfo.drivingLicense}</span>
            </div>
          )}
          {cvData.personalInfo?.website && (
            <div className="flex items-start gap-2 text-xs">
              <FontAwesomeIcon icon={faGlobe} className="w-3 h-3 text-emerald-200" />
              <span>{cvData.personalInfo.website}</span>
            </div>
          )}
          {cvData.personalInfo?.linkedin && (
            <div className="flex items-start gap-2 text-xs">
              <FontAwesomeIcon icon={faLinkedin} className="w-3 h-3 text-emerald-200" />
              <span className='break-all whitespace-normal'>{cvData.personalInfo.linkedin}</span>
            </div>
          )}
        </div>
        {/* Sidebar Sections */}
        <div className="mb-5">
          <h3 className="uppercase font-bold text-emerald-100 text-[11px] mb-2 tracking-widest flex items-center gap-2">
            <FontAwesomeIcon icon={faCogs} className="w-3 h-3" /> Skills
          </h3>
          <div>
            {cvData.skills && cvData.skills.technical && Array.isArray(cvData.skills.technical) && cvData.skills.technical.length > 0 && (
              <>
                <div className="font-semibold text-[11px] text-emerald-100 mb-1">Technical</div>
                <ul>
                  {cvData.skills.technical.map((skill, i) => (
                    <li key={i} className="mb-2">
                      <div className="flex justify-between items-center">
                        <span>{skill.name}</span>
                        <span className="text-emerald-200 text-[10px] ml-2">{skill.proficiency || skill.level}/5</span>
                      </div>
                      <div className="w-full h-2 bg-emerald-100 rounded-full mt-1">
                        <div className="h-2 rounded-full bg-emerald-400 transition-all" style={{ width: `${((skill.proficiency || skill.level || 0) / 5) * 100}%` }}></div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {cvData.skills && cvData.skills.soft && Array.isArray(cvData.skills.soft) && cvData.skills.soft.length > 0 && (
              <>
                <div className="font-semibold text-[11px] text-emerald-100 mb-1 mt-2">Soft</div>
                <ul>
                  {cvData.skills.soft.map((skill, i) => (
                    <li key={i} className="mb-2">
                      <div className="flex justify-between items-center">
                        <span>{skill.name}</span>
                        <span className="text-emerald-200 text-[10px] ml-2">{skill.proficiency || skill.level}/5</span>
                      </div>
                      <div className="w-full h-2 bg-emerald-100 rounded-full mt-1">
                        <div className="h-2 rounded-full bg-emerald-400 transition-all" style={{ width: `${((skill.proficiency || skill.level || 0) / 5) * 100}%` }}></div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
        {cvData.certifications && cvData.certifications.length > 0 && (
          <div className="mb-5">
            <h3 className="uppercase font-bold text-emerald-100 text-[11px] mb-2 tracking-widest flex items-center gap-2">
              <FontAwesomeIcon icon={faCertificate} className="w-3 h-3" /> Licenses & Certifications
            </h3>
            <div className="space-y-2">
              {cvData.certifications.map((cert, i) => (
                <div key={i} className="bg-emerald-900/20 rounded-lg p-2 border-l-2 border-emerald-400">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-semibold text-xs text-emerald-100">{cert.title || cert.name}</div>
                    {cert.credential_id && (
                      <span className="text-[8px] text-emerald-300 bg-emerald-800/50 px-1 py-0.5 rounded">
                        ID: {cert.credential_id}
                      </span>
                    )}
                  </div>
                  <div className="text-emerald-200 text-[10px] mb-1">
                    {cert.subtitle || cert.issuer || cert.issuingOrganization}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[9px] text-emerald-300">
                    {cert.date && (
                      <span className="bg-emerald-800/30 px-1 py-0.5 rounded">
                        📅 {formatDate(cert.date)}
                      </span>
                    )}
                    {cert.expiryDate && (
                      <span className="bg-emerald-800/30 px-1 py-0.5 rounded">
                        ⏰ Expires: {formatDate(cert.expiryDate)}
                      </span>
                    )}
                    {cert.credential_url && (
                      <a 
                        href={cert.credential_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-emerald-700/50 px-1 py-0.5 rounded hover:bg-emerald-600/50 transition-colors"
                      >
                        🔗 View Credential
                      </a>
                    )}
                  </div>
                  {cert.meta && (
                    <div className="text-[9px] text-emerald-300 mt-1 italic">
                      {cert.meta}
                    </div>
                  )}
                  {cert.description && (
                    <div className="text-[9px] text-emerald-200 mt-1">
                      {cert.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {cvData.languages && cvData.languages.length > 0 && (
          <div className="mb-5">
            <h3 className="uppercase font-bold text-emerald-100 text-[11px] mb-2 tracking-widest flex items-center gap-2">
              <FontAwesomeIcon icon={faLanguage} className="w-3 h-3" /> Languages
            </h3>
            {cvData.languages.map((lang, i) => (
              <div key={i} className="mb-2 flex flex-col gap-0.5">
                <div className="flex justify-between items-center">
                  <span>{lang.language || lang.name}</span>
                  <span className="text-[10px] text-gray-200">{lang.proficiency}/5</span>
                </div>
                <div className="w-full h-2 bg-emerald-100 rounded-full mt-1">
                  <div className="h-2 rounded-full bg-emerald-400 transition-all" style={{ width: `${((lang.proficiency || 0) / 5) * 100}%` }}></div>
                </div>
                {lang.cefr && <div className="text-[10px] text-emerald-200">CEFR: {lang.cefr}</div>}
                {lang.certificate && <div className="text-[10px] text-emerald-200">Cert: {lang.certificate}</div>}
              </div>
            ))}
          </div>
        )}
        {cvData.references && cvData.references.length > 0 && (
          <div className="mb-5">
            <h3 className="uppercase font-bold text-emerald-100 text-[11px] mb-2 tracking-widest flex items-center gap-2">
              <FontAwesomeIcon icon={faUsers} className="w-3 h-3" /> References
            </h3>
            {cvData.references.map((ref, i) => (
              <div key={i} className="mb-1">
                <div className="font-bold text-emerald-100 text-xs">{ref.name}</div>
                <div className="text-[10px] text-gray-200">{ref.position} {ref.company && `| ${ref.company}`}</div>
                <div className="text-[10px] text-gray-200">{ref.email} {ref.phone && `| ${ref.phone}`}</div>
              </div>
            ))}
          </div>
        )}
      </aside>
      {/* Main Content */}
      <main className="flex-1 bg-white p-8 print:p-4 text-xs rounded-r-2xl shadow-lg">
        {cvData.personalInfo?.bio && (
          <div className="mb-5">
            <h2 className="font-bold text-base mb-2 flex items-center gap-2 text-emerald-900">
              <FontAwesomeIcon icon={faUser} className="w-4 h-4" /> Bio
            </h2>
            <p className="text-gray-800 leading-snug text-sm font-medium">{cvData.personalInfo.bio}</p>
          </div>
        )}
        {cvData.personalInfo?.description && (
          <div className="mb-5">
            <h2 className="font-bold text-base mb-2 flex items-center gap-2 text-emerald-900">
              <FontAwesomeIcon icon={faUser} className="w-4 h-4" /> Description
            </h2>
            <p className="text-gray-800 leading-snug text-sm font-medium">{cvData.personalInfo.description}</p>
          </div>
        )}
        {cvData.workExperience && cvData.workExperience.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-base mb-2 flex items-center gap-2 text-emerald-900">
              <FontAwesomeIcon icon={faBriefcase} className="w-4 h-4" /> Experience
            </h2>
            {cvData.workExperience.map((exp, i) => (
              <div key={i} className="mb-3 pb-2 border-b border-gray-100 last:border-b-0">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-emerald-800 text-sm">{exp.company}</div>
                  <div className="text-[11px] text-gray-500 font-semibold">
                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="italic text-gray-700 text-xs">{exp.role}</div>
                  <div className="text-[11px] text-gray-500">{exp.location}</div>
                </div>
                {exp.website && (
                  <div className="text-[11px] text-emerald-700 mb-1">{exp.website}</div>
                )}
                {exp.achievements && Array.isArray(exp.achievements) && exp.achievements.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-700 text-xs ml-2">
                    {exp.achievements.map((ach, j) => (
                      <li key={j}>{ach}</li>
                    ))}
                  </ul>
                ) : exp.description && (
                  <div className="text-gray-700 text-xs ml-2">{exp.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
        {cvData.education && cvData.education.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-base mb-2 flex items-center gap-2 text-emerald-900">
              <FontAwesomeIcon icon={faGraduationCap} className="w-4 h-4" /> Education
            </h2>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-3 pb-2 border-b border-gray-100 last:border-b-0">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-emerald-800 text-sm">{edu.degree}</div>
                  <div className="text-[11px] text-gray-500 font-semibold">
                    {formatDateRange(edu.startDate, edu.endDate)}
                  </div>
                </div>
                <div className="italic text-gray-700 text-xs">{edu.institution}</div>
                <div className="text-[11px] text-gray-500">{edu.location}</div>
                {edu.fieldOfStudy && (
                  <div className="text-gray-700 text-xs ml-2">Field: {edu.fieldOfStudy}</div>
                )}
                {edu.grade && (
                  <div className="text-gray-700 text-xs ml-2">GPA: {edu.grade}</div>
                )}
                {edu.description && (
                  <div className="text-gray-700 text-xs ml-2">{edu.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
        {cvData.projects && cvData.projects.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-base mb-2 flex items-center gap-2 text-emerald-900">
              <FontAwesomeIcon icon={faProjectDiagram} className="w-4 h-4" /> Projects
            </h2>
            {cvData.projects.map((proj, i) => (
              <div key={i} className="mb-2">
                <div className="font-bold text-emerald-800 text-sm">{proj.title}</div>
                <div className="text-[11px] text-gray-500">{proj.role} {proj.duration && `| ${proj.duration}`}</div>
                {proj.technologies && <div className="text-[11px] text-emerald-700">Tech: {proj.technologies}</div>}
                {proj.github && <div className="text-[11px] text-emerald-700">GitHub: {proj.github}</div>}
                {proj.demo && <div className="text-[11px] text-emerald-700">Demo: {proj.demo}</div>}
                <div className="text-gray-700 text-xs ml-2">{proj.description}</div>
              </div>
            ))}
          </div>
        )}
        {cvData.awards && cvData.awards.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-base mb-2 flex items-center gap-2 text-emerald-900">
              <FontAwesomeIcon icon={faAward} className="w-4 h-4" /> Awards & Honors
            </h2>
            {cvData.awards.map((award, i) => (
              <div key={i} className="mb-2">
                <div className="font-bold text-emerald-800 text-sm">{award.title}</div>
                <div className="text-[11px] text-gray-500">{award.issuer} {award.year && `(${award.year})`}</div>
                {award.description && <div className="text-gray-700 text-xs ml-2">{award.description}</div>}
              </div>
            ))}
          </div>
        )}
        {cvData.courses && cvData.courses.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-base mb-2 flex items-center gap-2 text-emerald-900">
              <FontAwesomeIcon icon={faBook} className="w-4 h-4" /> Courses & Training
            </h2>
            {cvData.courses.map((course, i) => (
              <div key={i} className="mb-2">
                <div className="font-bold text-emerald-800 text-sm">{course.title}</div>
                <div className="text-[11px] text-gray-500">{course.institution} {course.year && `(${course.year})`}</div>
              </div>
            ))}
          </div>
        )}
        {cvData.volunteer && cvData.volunteer.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-base mb-2 flex items-center gap-2 text-emerald-900">
              <FontAwesomeIcon icon={faHandsHelping} className="w-4 h-4" /> Volunteer Experience
            </h2>
            {cvData.volunteer.map((vol, i) => (
              <div key={i} className="mb-2">
                <div className="font-bold text-emerald-800 text-sm">{vol.organization}</div>
                <div className="text-[11px] text-gray-500">{vol.role} {vol.year && `(${vol.year})`}</div>
                {vol.description && <div className="text-gray-700 text-xs ml-2">{vol.description}</div>}
              </div>
            ))}
          </div>
        )}
        {cvData.memberships && cvData.memberships.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-base mb-2 flex items-center gap-2 text-emerald-900">
              <FontAwesomeIcon icon={faUserFriends} className="w-4 h-4" /> Memberships
            </h2>
            {cvData.memberships.map((mem, i) => (
              <div key={i} className="mb-2">
                <div className="font-bold text-emerald-800 text-sm">{mem.organization}</div>
                <div className="text-[11px] text-gray-500">{mem.role} {mem.year && `(${mem.year})`}</div>
              </div>
            ))}
          </div>
        )}
        {cvData.publications && cvData.publications.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-base mb-2 flex items-center gap-2 text-emerald-900">
              <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4" /> Publications
            </h2>
            {cvData.publications.map((pub, i) => (
              <div key={i} className="mb-2">
                <div className="font-bold text-emerald-800 text-sm">{pub.title}</div>
                <div className="text-[11px] text-gray-500">{pub.publisher} {pub.year && `(${pub.year})`}</div>
                {pub.url && <div className="text-[11px] text-emerald-700">{pub.url}</div>}
                {pub.description && <div className="text-gray-700 text-xs ml-2">{pub.description}</div>}
              </div>
            ))}
          </div>
        )}
        {cvData.interests && cvData.interests.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-base mb-2 flex items-center gap-2 text-emerald-900">
              <FontAwesomeIcon icon={faStar} className="w-4 h-4" /> Interests
            </h2>
            <ul className="flex flex-wrap gap-2 ml-1">
              {cvData.interests.map((interest, i) => (
                <li key={i} className="bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5 text-[12px] font-semibold">{interest.value || interest}</li>
              ))}
            </ul>
          </div>
        )}
        {cvData.attachments && cvData.attachments.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-base mb-2 flex items-center gap-2 text-emerald-900">
              <FontAwesomeIcon icon={faPaperclip} className="w-4 h-4" /> Attachments
            </h2>
            <ul className="ml-1">
              {cvData.attachments.map((att, i) => (
                <li key={i} className="mb-0.5 flex items-center gap-2">
                  <span className="font-semibold text-xs">{att.name}</span>
                  {att.url && <a href={att.url} className="text-emerald-700 underline text-[11px]" target="_blank" rel="noopener noreferrer">[link]</a>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {cvData.references && cvData.references.length > 0 && (
          <div className="mb-5">
            <h2 className="font-bold text-base mb-2 flex items-center gap-2 text-emerald-900">
              <FontAwesomeIcon icon={faUsers} className="w-4 h-4" /> References
            </h2>
            {cvData.references.map((ref, i) => (
              <div key={i} className="mb-2">
                <div className="font-bold text-emerald-800 text-sm">{ref.name}</div>
                <div className="text-[11px] text-gray-500">{ref.position} {ref.company && `| ${ref.company}`}</div>
                <div className="text-[11px] text-gray-500">{ref.email} {ref.phone && `| ${ref.phone}`}</div>
              </div>
            ))}
          </div>
        )}
      </main>
      {/* Key2Career Signature */}
      <div className="absolute bottom-2 right-4 flex items-center gap-1 text-[10px] text-emerald-300 opacity-80 select-none pointer-events-none z-50 print:hidden">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle"><circle cx="10" cy="10" r="9" stroke="#10B981" strokeWidth="2" fill="none"/><path d="M6 10l2.5 2.5L14 7" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span>Made with Key2Career</span>
      </div>
    </div>
  );
} 