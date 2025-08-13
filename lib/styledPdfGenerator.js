// Styled PDF Generator using react-pdf that maintains template visual fidelity
import { transformCVDataForTemplates } from './cvDataTransformer';
import { debugCVData } from './debugPdfData';

// Dynamic imports for better performance
let pdf, Document, Page, Text, View, StyleSheet, Font, Image, Link;

// Initialize react-pdf libraries
const initializeReactPDF = async () => {
  if (!pdf) {
    const reactPdf = await import('@react-pdf/renderer');
    pdf = reactPdf.pdf;
    Document = reactPdf.Document;
    Page = reactPdf.Page;
    Text = reactPdf.Text;
    View = reactPdf.View;
    StyleSheet = reactPdf.StyleSheet;
    Font = reactPdf.Font;
    Image = reactPdf.Image;
    Link = reactPdf.Link;
  }
};

// Register fonts for better typography with fallback
const registerFonts = () => {
  try {
    // Skip font registration to avoid DataView errors
    // Use system fonts instead for better compatibility
    console.log('Using system fonts for PDF generation');
  } catch (error) {
    console.warn('Font registration failed, using system fonts:', error);
  }
};

// Resolve an image URL to a data URL for reliable rendering
const resolveImageToDataUrl = async (url) => {
  if (!url || typeof url !== 'string') return '';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, { signal: controller.signal, mode: 'cors' });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const reader = new FileReader();
    const dataUrl = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return typeof dataUrl === 'string' ? dataUrl : '';
  } catch (e) {
    console.warn('Failed to resolve image to data URL:', e);
    return '';
  }
};

// Template 1 - Modern with Sidebar
const ModernTemplate1PDF = ({ data }) => {
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'row',
      backgroundColor: '#ffffff',
      fontFamily: 'Helvetica',
    },
    sidebar: {
      width: '35%',
      backgroundColor: '#1e293b',
      color: '#ffffff',
      padding: 20,
    },
    main: {
      width: '65%',
      padding: 20,
      backgroundColor: '#ffffff',
    },
    header: {
      textAlign: 'center',
      marginBottom: 20,
    },
    name: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 5,
    },
    title: {
      fontSize: 14,
      color: '#14b8a6',
      marginBottom: 15,
    },
    sectionHeader: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#14b8a6',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 1,
      borderBottomWidth: 1,
      borderBottomColor: '#0f766e',
      paddingBottom: 4,
    },
    sectionHeaderMain: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: 10,
      marginTop: 15,
    },
    text: {
      fontSize: 10,
      lineHeight: 1.4,
      color: '#e2e8f0',
      marginBottom: 8,
    },
    textMain: {
      fontSize: 11,
      lineHeight: 1.5,
      color: '#374151',
      marginBottom: 8,
    },
    contactItem: {
      fontSize: 9,
      color: '#cbd5e1',
      marginBottom: 4,
      flexDirection: 'row',
      alignItems: 'center',
    },
    skillItem: {
      fontSize: 9,
      color: '#e2e8f0',
      marginBottom: 3,
      paddingLeft: 8,
    },
    jobTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: 2,
    },
    company: {
      fontSize: 11,
      color: '#14b8a6',
      fontWeight: 'bold',
      marginBottom: 2,
    },
    period: {
      fontSize: 9,
      color: '#6b7280',
      marginBottom: 4,
    },
    bullet: {
      fontSize: 10,
      color: '#14b8a6',
      marginBottom: 3,
      paddingLeft: 10,
    },
    bio: {
      fontSize: 10,
      lineHeight: 1.4,
      color: '#cbd5e1',
      marginBottom: 15,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.name}>{data.personalInfo.name}</Text>
            <Text style={styles.title}>{data.personalInfo.title}</Text>
          </View>

          {/* Bio */}
          {data.personalInfo.bio && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionHeader}>Bio</Text>
              <Text style={styles.bio}>{data.personalInfo.bio}</Text>
            </View>
          )}

          {/* Contact Info */}
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionHeader}>Contact</Text>
            {data.personalInfo.email && (
              <Text style={styles.contactItem}>📧 {data.personalInfo.email}</Text>
            )}
            {data.personalInfo.phone && (
              <Text style={styles.contactItem}>📞 {data.personalInfo.phone}</Text>
            )}
            {data.personalInfo.location && (
              <Text style={styles.contactItem}>📍 {data.personalInfo.location}</Text>
            )}
            {data.personalInfo.website && (
              <Text style={styles.contactItem}>🌐 {data.personalInfo.website}</Text>
            )}
          </View>

          {/* Technical Skills */}
          {data.technicalSkills.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionHeader}>Technical Skills</Text>
              {data.technicalSkills.map((skill, index) => (
                <Text key={index} style={styles.skillItem}>• {skill}</Text>
              ))}
            </View>
          )}

          {/* Soft Skills */}
          {data.softSkills.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionHeader}>Core Competencies</Text>
              {data.softSkills.map((skill, index) => (
                <Text key={index} style={styles.skillItem}>• {skill}</Text>
              ))}
            </View>
          )}

          {/* Languages */}
          {data.languages.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionHeader}>Languages</Text>
              {data.languages.map((lang, index) => (
                <Text key={index} style={styles.skillItem}>
                  {lang.name} - {lang.proficiency === 5 ? 'Native' : 
                   lang.proficiency === 4 ? 'Fluent' :
                   lang.proficiency === 3 ? 'Intermediate' :
                   lang.proficiency === 2 ? 'Basic' : 'Beginner'}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {/* Professional Summary */}
          {data.profileSummary && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionHeaderMain}>Professional Summary</Text>
              <Text style={styles.textMain}>{data.profileSummary}</Text>
            </View>
          )}

          {/* Work Experience */}
          {data.workExperience.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionHeaderMain}>Professional Experience</Text>
              {data.workExperience.map((job, index) => (
                <View key={index} style={{ marginBottom: 15 }}>
                  <Text style={styles.jobTitle}>{job.position}</Text>
                  <Text style={styles.company}>{job.company}</Text>
                  <Text style={styles.period}>{job.period} {job.location && `| ${job.location}`}</Text>
                  {job.description && (
                    <Text style={styles.textMain}>{job.description}</Text>
                  )}
                  {job.achievements && job.achievements.map((achievement, idx) => (
                    <Text key={idx} style={styles.bullet}>• {achievement}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionHeaderMain}>Education</Text>
              {data.education.map((edu, index) => (
                <View key={index} style={{ marginBottom: 10 }}>
                  <Text style={styles.jobTitle}>{edu.degree}</Text>
                  <Text style={styles.company}>{edu.school}</Text>
                  <Text style={styles.period}>{edu.period}</Text>
                  {edu.field && (
                    <Text style={styles.textMain}>Field of Study: {edu.field}</Text>
                  )}
                  {edu.description && (
                    <Text style={styles.textMain}>{edu.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Projects */}
          {data.projects.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionHeaderMain}>Key Projects</Text>
              {data.projects.map((project, index) => (
                <View key={index} style={{ marginBottom: 10 }}>
                  <Text style={styles.jobTitle}>{project.name}</Text>
                  {project.tech && (
                    <Text style={styles.company}>Technologies: {project.tech}</Text>
                  )}
                  {project.description && (
                    <Text style={styles.textMain}>{project.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Awards */}
          {data.awardsAndHonors.length > 0 && (
            <View>
              <Text style={styles.sectionHeaderMain}>Awards & Honors</Text>
              {data.awardsAndHonors.map((award, index) => (
                <View key={index} style={{ marginBottom: 8 }}>
                  <Text style={styles.jobTitle}>{award.title}</Text>
                  <Text style={styles.company}>{award.issuer}</Text>
                  {award.year && (
                    <Text style={styles.period}>{award.year}</Text>
                  )}
                  {award.description && (
                    <Text style={styles.textMain}>{award.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

// Template 4 - Executive with Purple Gradient
const ModernTemplate4PDF = ({ data }) => {
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      fontFamily: 'Helvetica',
      padding: 0,
    },
    header: {
      backgroundColor: '#6b46c1',
      background: 'linear-gradient(to right, #6b46c1, #7c3aed, #3730a3)',
      color: '#ffffff',
      padding: 30,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerText: {
      flex: 1,
    },
    name: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 8,
    },
    titleBadge: {
      backgroundColor: '#8b5cf6',
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 8,
      marginBottom: 15,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
      textAlign: 'center',
    },
    contactGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    contactItem: {
      fontSize: 10,
      color: '#c4b5fd',
      marginBottom: 4,
      marginRight: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    content: {
      padding: 30,
      flex: 1,
    },
    sectionHeader: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: '#6b46c1',
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 8,
      textAlign: 'center',
      marginBottom: 15,
      marginTop: 20,
    },
    text: {
      fontSize: 11,
      lineHeight: 1.5,
      color: '#374151',
      marginBottom: 8,
      textAlign: 'center',
    },
    contentGrid: {
      flexDirection: 'row',
    },
    sidebar: {
      width: '30%',
      marginRight: 20,
    },
    mainContent: {
      width: '70%',
    },
    skillsSection: {
      marginBottom: 20,
    },
    skillItem: {
      fontSize: 10,
      color: '#374151',
      backgroundColor: '#f3f4f6',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      marginBottom: 6,
      textAlign: 'center',
    },
    jobTitle: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: 3,
    },
    company: {
      fontSize: 12,
      color: '#6b46c1',
      fontWeight: 'bold',
      marginBottom: 3,
    },
    period: {
      fontSize: 10,
      color: '#6b7280',
      marginBottom: 6,
    },
    description: {
      fontSize: 10,
      lineHeight: 1.4,
      color: '#4b5563',
      marginBottom: 4,
    },
    bullet: {
      fontSize: 10,
      color: '#4b5563',
      marginBottom: 3,
      paddingLeft: 10,
    },
    awardBadge: {
      backgroundColor: '#ede9fe',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginBottom: 8,
    },
    awardTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#6b46c1',
      marginBottom: 2,
    },
    awardDetails: {
      fontSize: 9,
      color: '#6b7280',
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Executive Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={styles.name}>{data.personalInfo.name}</Text>
              <View style={styles.titleBadge}>
                <Text style={styles.title}>{data.personalInfo.title}</Text>
              </View>
              <View style={styles.contactGrid}>
                {data.personalInfo.email && (
                  <Text style={styles.contactItem}>📧 {data.personalInfo.email}</Text>
                )}
                {data.personalInfo.phone && (
                  <Text style={styles.contactItem}>📞 {data.personalInfo.phone}</Text>
                )}
                {data.personalInfo.location && (
                  <Text style={styles.contactItem}>📍 {data.personalInfo.location}</Text>
                )}
                {data.personalInfo.website && (
                  <Text style={styles.contactItem}>🌐 {data.personalInfo.website}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Bio */}
          {data.personalInfo.bio && (
            <View style={{ marginBottom: 25 }}>
              <Text style={styles.sectionHeader}>Bio</Text>
              <Text style={styles.text}>{data.personalInfo.bio}</Text>
            </View>
          )}

          {/* Executive Summary */}
          {data.profileSummary && (
            <View style={{ marginBottom: 25 }}>
              <Text style={styles.sectionHeader}>Executive Summary</Text>
              <Text style={styles.text}>{data.profileSummary}</Text>
            </View>
          )}

          <View style={styles.contentGrid}>
            {/* Skills Sidebar */}
            <View style={styles.sidebar}>
              {/* Technical Skills */}
              {data.technicalSkills.length > 0 && (
                <View style={styles.skillsSection}>
                  <Text style={[styles.sectionHeader, { fontSize: 12, marginTop: 0 }]}>Technical Skills</Text>
                  {data.technicalSkills.map((skill, index) => (
                    <Text key={index} style={styles.skillItem}>{skill}</Text>
                  ))}
                </View>
              )}

              {/* Soft Skills */}
              {data.softSkills.length > 0 && (
                <View style={styles.skillsSection}>
                  <Text style={[styles.sectionHeader, { fontSize: 12, marginTop: 0 }]}>Core Competencies</Text>
                  {data.softSkills.map((skill, index) => (
                    <Text key={index} style={styles.skillItem}>{skill}</Text>
                  ))}
                </View>
              )}

              {/* Awards */}
              {data.awardsAndHonors.length > 0 && (
                <View style={styles.skillsSection}>
                  <Text style={[styles.sectionHeader, { fontSize: 12, marginTop: 0 }]}>Awards & Honors</Text>
                  {data.awardsAndHonors.map((award, index) => (
                    <View key={index} style={styles.awardBadge}>
                      <Text style={styles.awardTitle}>{award.title}</Text>
                      <Text style={styles.awardDetails}>{award.issuer}</Text>
                      {award.year && (
                        <Text style={styles.awardDetails}>{award.year}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
              {/* Work Experience */}
              {data.workExperience.length > 0 && (
                <View style={{ marginBottom: 25 }}>
                  <Text style={[styles.sectionHeader, { marginTop: 0 }]}>Professional Experience</Text>
                  {data.workExperience.map((job, index) => (
                    <View key={index} style={{ marginBottom: 20 }}>
                      <Text style={styles.jobTitle}>{job.position}</Text>
                      <Text style={styles.company}>{job.company}</Text>
                      <Text style={styles.period}>{job.period} {job.location && `| ${job.location}`}</Text>
                      {job.description && (
                        <Text style={styles.description}>{job.description}</Text>
                      )}
                      {job.achievements && job.achievements.map((achievement, idx) => (
                        <Text key={idx} style={styles.bullet}>• {achievement}</Text>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              {/* Education */}
              {data.education.length > 0 && (
                <View style={{ marginBottom: 25 }}>
                  <Text style={[styles.sectionHeader, { marginTop: 0 }]}>Education</Text>
                  {data.education.map((edu, index) => (
                    <View key={index} style={{ marginBottom: 15 }}>
                      <Text style={styles.jobTitle}>{edu.degree}</Text>
                      <Text style={styles.company}>{edu.school}</Text>
                      <Text style={styles.period}>{edu.period}</Text>
                      {edu.field && (
                        <Text style={styles.description}>Field of Study: {edu.field}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Projects */}
              {data.projects.length > 0 && (
                <View>
                  <Text style={[styles.sectionHeader, { marginTop: 0 }]}>Key Projects</Text>
                  {data.projects.map((project, index) => (
                    <View key={index} style={{ marginBottom: 15 }}>
                      <Text style={styles.jobTitle}>{project.name}</Text>
                      {project.tech && (
                        <Text style={styles.company}>Technologies: {project.tech}</Text>
                      )}
                      {project.description && (
                        <Text style={styles.description}>{project.description}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Template 10 - Blue and Orange Accent
const ModernTemplate10PDF = ({ data }) => {
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      fontFamily: 'Helvetica',
      padding: 0,
    },
    header: {
      backgroundColor: '#ffffff',
      borderBottomWidth: 2,
      borderBottomColor: '#1d4ed8',
      padding: 30,
      flexDirection: 'row',
      alignItems: 'center',
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#f3f4f6',
      marginRight: 20,
      borderWidth: 2,
      borderColor: '#fb923c',
    },
    headerContent: {
      flex: 1,
    },
    name: {
      fontSize: 24,
      fontWeight: 'normal',
      color: '#111827',
      marginBottom: 5,
    },
    title: {
      fontSize: 16,
      color: '#1d4ed8',
    },
    contactStrip: {
      backgroundColor: '#fff7ed',
      paddingHorizontal: 30,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    contactItem: {
      fontSize: 10,
      color: '#4b5563',
      marginHorizontal: 15,
      marginVertical: 2,
    },
    content: {
      padding: 30,
      flex: 1,
    },
    sectionHeader: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 15,
      paddingBottom: 5,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
    },
    contentGrid: {
      flexDirection: 'row',
    },
    sidebar: {
      width: '33%',
      marginRight: 25,
    },
    mainContent: {
      width: '67%',
    },
    sidebarSectionHeader: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 15,
      marginTop: 25,
    },
    text: {
      fontSize: 11,
      lineHeight: 1.5,
      color: '#374151',
      marginBottom: 8,
    },
    skillItem: {
      fontSize: 10,
      color: '#374151',
      paddingLeft: 10,
      borderLeftWidth: 2,
      borderLeftColor: '#1d4ed8',
      marginBottom: 6,
    },
    competencyItem: {
      fontSize: 10,
      color: '#374151',
      marginBottom: 4,
      paddingLeft: 12,
    },
    jobTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 2,
    },
    company: {
      fontSize: 11,
      color: '#1d4ed8',
      fontWeight: 'bold',
      marginBottom: 2,
    },
    period: {
      fontSize: 9,
      color: '#6b7280',
      marginBottom: 6,
    },
    jobDescription: {
      fontSize: 10,
      lineHeight: 1.4,
      color: '#374151',
      marginBottom: 4,
    },
    bullet: {
      fontSize: 10,
      color: '#374151',
      marginBottom: 3,
      paddingLeft: 10,
    },
    eduDegree: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 2,
    },
    eduSchool: {
      fontSize: 11,
      color: '#1d4ed8',
      marginBottom: 2,
    },
    eduField: {
      fontSize: 10,
      color: '#4b5563',
      marginBottom: 2,
    },
    projTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 2,
    },
    projTech: {
      fontSize: 9,
      color: '#1d4ed8',
      marginBottom: 3,
    },
    projDescription: {
      fontSize: 9,
      lineHeight: 1.3,
      color: '#374151',
      marginBottom: 8,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileImage}>
            {/* Profile image placeholder */}
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.name}>{data.personalInfo.name}</Text>
            <Text style={styles.title}>{data.personalInfo.title}</Text>
          </View>
        </View>

        {/* Contact Strip */}
        <View style={styles.contactStrip}>
          {data.personalInfo.email && (
            <Text style={styles.contactItem}>{data.personalInfo.email}</Text>
          )}
          {data.personalInfo.phone && (
            <Text style={styles.contactItem}>{data.personalInfo.phone}</Text>
          )}
          {data.personalInfo.location && (
            <Text style={styles.contactItem}>{data.personalInfo.location}</Text>
          )}
          {data.personalInfo.website && (
            <Text style={styles.contactItem}>{data.personalInfo.website}</Text>
          )}
        </View>

        <View style={styles.content}>
          {/* Bio */}
          {data.personalInfo.bio && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionHeader}>Bio</Text>
              <Text style={styles.text}>{data.personalInfo.bio}</Text>
            </View>
          )}

          {/* Professional Summary */}
          {data.profileSummary && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionHeader}>Professional Summary</Text>
              <Text style={styles.text}>{data.profileSummary}</Text>
            </View>
          )}

          <View style={styles.contentGrid}>
            {/* Skills Sidebar */}
            <View style={styles.sidebar}>
              {/* Technical Skills */}
              {data.technicalSkills.length > 0 && (
                <View>
                  <Text style={styles.sidebarSectionHeader}>Technical Skills</Text>
                  {data.technicalSkills.slice(0, 8).map((skill, index) => (
                    <Text key={index} style={styles.skillItem}>{skill}</Text>
                  ))}
                </View>
              )}

              {/* Core Competencies */}
              {data.softSkills.length > 0 && (
                <View>
                  <Text style={styles.sidebarSectionHeader}>Core Competencies</Text>
                  {data.softSkills.map((skill, index) => (
                    <Text key={index} style={styles.competencyItem}>• {skill}</Text>
                  ))}
                </View>
              )}

              {/* Languages */}
              {data.languages.length > 0 && (
                <View>
                  <Text style={styles.sidebarSectionHeader}>Languages</Text>
                  {data.languages.map((lang, index) => (
                    <Text key={index} style={styles.competencyItem}>
                      {lang.name} - {lang.proficiency === 5 ? 'Native' : 
                       lang.proficiency === 4 ? 'Fluent' :
                       lang.proficiency === 3 ? 'Intermediate' :
                       lang.proficiency === 2 ? 'Basic' : 'Beginner'}
                    </Text>
                  ))}
                </View>
              )}
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
              {/* Work Experience */}
              {data.workExperience.length > 0 && (
                <View style={{ marginBottom: 25 }}>
                  <Text style={[styles.sectionHeader, { marginTop: 0 }]}>Professional Experience</Text>
                  {data.workExperience.map((job, index) => (
                    <View key={index} style={{ marginBottom: 20 }}>
                      <Text style={styles.jobTitle}>{job.position}</Text>
                      <Text style={styles.company}>{job.company}</Text>
                      <Text style={styles.period}>{job.period} {job.location && `| ${job.location}`}</Text>
                      {job.description && (
                        <Text style={styles.jobDescription}>{job.description}</Text>
                      )}
                      {job.achievements && job.achievements.map((achievement, idx) => (
                        <Text key={idx} style={styles.bullet}>• {achievement}</Text>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              {/* Education and Projects Grid */}
              <View style={{ flexDirection: 'row' }}>
                {/* Education */}
                {data.education.length > 0 && (
                  <View style={{ flex: 1, marginRight: 15 }}>
                    <Text style={[styles.sidebarSectionHeader, { marginTop: 0 }]}>Education</Text>
                    {data.education.map((edu, index) => (
                      <View key={index} style={{ marginBottom: 15 }}>
                        <Text style={styles.eduDegree}>{edu.degree}</Text>
                        <Text style={styles.eduSchool}>{edu.school}</Text>
                        {edu.field && (
                          <Text style={styles.eduField}>{edu.field}</Text>
                        )}
                        <Text style={styles.period}>{edu.period}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Projects */}
                {data.projects.length > 0 && (
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sidebarSectionHeader, { marginTop: 0 }]}>Key Projects</Text>
                    {data.projects.map((project, index) => (
                      <View key={index} style={{ marginBottom: 15 }}>
                        <Text style={styles.projTitle}>{project.name}</Text>
                        {project.tech && (
                          <Text style={styles.projTech}>{project.tech}</Text>
                        )}
                        {project.description && (
                          <Text style={styles.projDescription}>{project.description}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Template 7 - Clean with Red Accent
const ModernTemplate7PDF = ({ data }) => {
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      fontFamily: 'Helvetica',
      padding: 0,
    },
    header: {
      backgroundColor: '#ffffff',
      borderBottomWidth: 4,
      borderBottomColor: '#dc2626',
      padding: 30,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerContent: {
      flex: 1,
    },
    name: {
      fontSize: 24,
      fontWeight: 'normal',
      color: '#111827',
      marginBottom: 5,
    },
    title: {
      fontSize: 16,
      color: '#b91c1c',
    },
    contactInfo: {
      textAlign: 'right',
      fontSize: 10,
      color: '#4b5563',
    },
    content: {
      padding: 30,
      flex: 1,
    },
    contentGrid: {
      flexDirection: 'row',
    },
    sidebar: {
      width: '25%',
      marginRight: 30,
    },
    mainContent: {
      width: '75%',
    },
    sectionHeader: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 15,
      paddingBottom: 5,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
    },
    sidebarSectionHeader: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 15,
      marginTop: 20,
    },
    text: {
      fontSize: 11,
      lineHeight: 1.5,
      color: '#374151',
      marginBottom: 8,
    },
    skillItem: {
      fontSize: 10,
      color: '#374151',
      paddingLeft: 10,
      borderLeftWidth: 2,
      borderLeftColor: '#dc2626',
      marginBottom: 6,
    },
    competencyItem: {
      fontSize: 10,
      color: '#374151',
      marginBottom: 4,
      paddingLeft: 12,
    },
    jobTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 2,
    },
    company: {
      fontSize: 11,
      color: '#b91c1c',
      fontWeight: 'bold',
      marginBottom: 2,
    },
    period: {
      fontSize: 9,
      color: '#6b7280',
      marginBottom: 6,
    },
    jobDescription: {
      fontSize: 10,
      lineHeight: 1.4,
      color: '#374151',
      marginBottom: 4,
    },
    bullet: {
      fontSize: 10,
      color: '#374151',
      marginBottom: 3,
      paddingLeft: 10,
    },
    projectTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 2,
    },
    projectTech: {
      fontSize: 9,
      color: '#b91c1c',
      marginBottom: 3,
    },
    projectDescription: {
      fontSize: 9,
      lineHeight: 1.3,
      color: '#374151',
      marginBottom: 8,
    },
    langRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    langName: {
      fontSize: 10,
      color: '#374151',
    },
    langLevel: {
      fontSize: 9,
      color: '#dc2626',
    },
    awardTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 2,
    },
    awardIssuer: {
      fontSize: 9,
      color: '#b91c1c',
      marginBottom: 2,
    },
    awardYear: {
      fontSize: 9,
      color: '#6b7280',
      marginBottom: 2,
    },
    awardDescription: {
      fontSize: 9,
      color: '#4b5563',
      lineHeight: 1.3,
      marginBottom: 8,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.name}>{data.personalInfo.name}</Text>
            <Text style={styles.title}>{data.personalInfo.title}</Text>
          </View>
          <View style={styles.contactInfo}>
            {data.personalInfo.email && (
              <Text>{data.personalInfo.email}</Text>
            )}
            {data.personalInfo.phone && (
              <Text>{data.personalInfo.phone}</Text>
            )}
            {data.personalInfo.location && (
              <Text>{data.personalInfo.location}</Text>
            )}
            {data.personalInfo.website && (
              <Text>{data.personalInfo.website}</Text>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Bio */}
          {data.personalInfo.bio && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionHeader}>Bio</Text>
              <Text style={styles.text}>{data.personalInfo.bio}</Text>
            </View>
          )}

          {/* Professional Summary */}
          {data.profileSummary && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionHeader}>Professional Summary</Text>
              <Text style={styles.text}>{data.profileSummary}</Text>
            </View>
          )}

          <View style={styles.contentGrid}>
            {/* Sidebar */}
            <View style={styles.sidebar}>
              {/* Technical Skills */}
              {data.technicalSkills.length > 0 && (
                <View>
                  <Text style={styles.sidebarSectionHeader}>Technical Skills</Text>
                  {data.technicalSkills.map((skill, index) => (
                    <Text key={index} style={styles.skillItem}>{skill}</Text>
                  ))}
                </View>
              )}

              {/* Soft Skills */}
              {data.softSkills.length > 0 && (
                <View>
                  <Text style={styles.sidebarSectionHeader}>Core Competencies</Text>
                  {data.softSkills.map((skill, index) => (
                    <Text key={index} style={styles.competencyItem}>• {skill}</Text>
                  ))}
                </View>
              )}

              {/* Languages */}
              {data.languages.length > 0 && (
                <View>
                  <Text style={styles.sidebarSectionHeader}>Languages</Text>
                  {data.languages.map((lang, index) => (
                    <View key={index} style={styles.langRow}>
                      <Text style={styles.langName}>{lang.name}</Text>
                      <Text style={styles.langLevel}>
                        {lang.proficiency === 5 ? 'Native' : 
                         lang.proficiency === 4 ? 'Fluent' :
                         lang.proficiency === 3 ? 'Intermediate' :
                         lang.proficiency === 2 ? 'Basic' : 'Beginner'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Awards */}
              {data.awardsAndHonors.length > 0 && (
                <View>
                  <Text style={styles.sidebarSectionHeader}>Awards & Honors</Text>
                  {data.awardsAndHonors.map((award, index) => (
                    <View key={index} style={{ marginBottom: 10 }}>
                      <Text style={styles.awardTitle}>{award.title}</Text>
                      <Text style={styles.awardIssuer}>{award.issuer}</Text>
                      {award.year && (
                        <Text style={styles.awardYear}>{award.year}</Text>
                      )}
                      {award.description && (
                        <Text style={styles.awardDescription}>{award.description}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
              {/* Work Experience */}
              {data.workExperience.length > 0 && (
                <View style={{ marginBottom: 25 }}>
                  <Text style={styles.sectionHeader}>Professional Experience</Text>
                  {data.workExperience.map((job, index) => (
                    <View key={index} style={{ marginBottom: 20 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.jobTitle}>{job.position}</Text>
                          <Text style={styles.company}>{job.company}</Text>
                          {job.location && (
                            <Text style={styles.period}>{job.location}</Text>
                          )}
                        </View>
                        <Text style={[styles.period, { marginLeft: 15 }]}>{job.period}</Text>
                      </View>
                      {job.description && (
                        <Text style={styles.jobDescription}>{job.description}</Text>
                      )}
                      {job.achievements && job.achievements.map((achievement, idx) => (
                        <Text key={idx} style={styles.bullet}>• {achievement}</Text>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              {/* Education and Projects Grid */}
              <View style={{ flexDirection: 'row' }}>
                {/* Education */}
                {data.education.length > 0 && (
                  <View style={{ flex: 1, marginRight: 15 }}>
                    <Text style={styles.sidebarSectionHeader}>Education</Text>
                    {data.education.map((edu, index) => (
                      <View key={index} style={{ marginBottom: 15 }}>
                        <Text style={styles.jobTitle}>{edu.degree}</Text>
                        <Text style={styles.company}>{edu.school}</Text>
                        {edu.field && (
                          <Text style={[styles.period, { color: '#4b5563' }]}>{edu.field}</Text>
                        )}
                        <Text style={styles.period}>{edu.period}</Text>
                        {edu.description && (
                          <Text style={[styles.jobDescription, { fontSize: 9 }]}>{edu.description}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Projects */}
                {data.projects.length > 0 && (
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sidebarSectionHeader}>Key Projects</Text>
                    {data.projects.map((project, index) => (
                      <View key={index} style={{ marginBottom: 15 }}>
                        <Text style={styles.projectTitle}>{project.name}</Text>
                        {project.tech && (
                          <Text style={styles.projectTech}>{project.tech}</Text>
                        )}
                        {project.description && (
                          <Text style={styles.projectDescription}>{project.description}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Template selector function
const getTemplateComponent = (templateId) => {
  const templateMap = {
    'modern-template-1': ModernTemplate1PDF,
    'modern-template-4': ModernTemplate4PDF,
    'modern-template-7': ModernTemplate7PDF,
    'modern-template-10': ModernTemplate10PDF,
    // Add more templates as needed
  };
  
  return templateMap[templateId] || ModernTemplate1PDF; // Default fallback
};

// Main export function with improved error handling
export const generateStyledPDF = async (cvData, templateId, filename = 'resume.pdf') => {
  try {
    console.log('Generating styled PDF for template:', templateId);
    
    // Initialize libraries with timeout
    await Promise.race([
      initializeReactPDF(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Library initialization timeout')), 10000))
    ]);
    
    // Register fonts with error handling
    try {
      registerFonts();
    } catch (fontError) {
      console.warn('Font registration failed, continuing with default fonts:', fontError);
    }
    
    // Transform CV data to the format expected by templates
    const transformedData = transformCVDataForTemplates(cvData);
    if (!transformedData) {
      throw new Error('Failed to transform CV data');
    }
    
    // Debug the data transformation
    debugCVData(cvData, transformedData, templateId);
    
    // Pre-resolve profile image to data URL for reliable rendering
    if (transformedData.personalInfo?.imageUrl) {
      console.log('Resolving profile image for styled PDF:', transformedData.personalInfo.imageUrl);
      const resolvedImageUrl = await resolveImageToDataUrl(transformedData.personalInfo.imageUrl);
      if (resolvedImageUrl) {
        transformedData.personalInfo.imageUrl = resolvedImageUrl;
        console.log('Profile image resolved successfully for styled PDF');
      } else {
        console.warn('Failed to resolve profile image for styled PDF, will use initials fallback');
        transformedData.personalInfo.imageUrl = '';
      }
    }
    
    // Get the appropriate template component
    const TemplateComponent = getTemplateComponent(templateId);
    
    console.log('Creating PDF document...');
    
    // Create PDF document with error boundary
    let pdfDocument;
    try {
      pdfDocument = <TemplateComponent data={transformedData} />;
    } catch (templateError) {
      console.error('Template component error:', templateError);
      throw new Error(`Template rendering failed: ${templateError.message}`);
    }
    
    console.log('Generating PDF blob...');
    
    // Generate PDF blob with timeout and error handling
    const blob = await Promise.race([
      pdf(pdfDocument).toBlob(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('PDF generation timeout')), 30000))
    ]);
    
    if (!blob) {
      throw new Error('Failed to generate PDF blob');
    }
    
    console.log('PDF blob generated, initiating download...');
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Styled PDF generated and downloaded successfully');
    return true;
  } catch (error) {
    console.error('Error generating styled PDF:', error);
    
    // Provide more specific error messages
    if (error.message.includes('DataView')) {
      throw new Error('PDF generation failed due to data formatting issue. Please check your CV data and try again.');
    } else if (error.message.includes('timeout')) {
      throw new Error('PDF generation timed out. Please try again with a simpler template or smaller data.');
    } else if (error.message.includes('Font')) {
      throw new Error('Font loading failed. Please check your internet connection and try again.');
    } else {
      throw new Error(`Failed to generate styled PDF: ${error.message}`);
    }
  }
};

// Export individual template generators for testing
export const templateGenerators = {
  ModernTemplate1PDF,
  ModernTemplate4PDF,
  ModernTemplate7PDF,
  ModernTemplate10PDF,
};

export default { generateStyledPDF, templateGenerators };
