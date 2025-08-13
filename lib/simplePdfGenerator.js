// Simple PDF Generator with improved error handling and compatibility
import { transformCVDataForTemplates } from './cvDataTransformer';
import { debugCVData } from './debugPdfData';

// Dynamic imports for better performance
let pdf, Document, Page, Text, View, StyleSheet, Image;

// Initialize react-pdf libraries
const initializeReactPDF = async () => {
  if (!pdf) {
    try {
      const reactPdf = await import('@react-pdf/renderer');
      pdf = reactPdf.pdf;
      Document = reactPdf.Document;
      Page = reactPdf.Page;
      Text = reactPdf.Text;
      View = reactPdf.View;
      StyleSheet = reactPdf.StyleSheet;
      Image = reactPdf.Image;
      console.log('React-PDF initialized successfully');
    } catch (error) {
      console.error('Failed to initialize React-PDF:', error);
      throw new Error('PDF library initialization failed');
    }
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

// Enhanced template PDF generator with accurate layouts
const EnhancedTemplatePDF = ({ data, templateType = 'default' }) => {
  // Debug: Log the actual data structure
  console.log('PDF Generator - Received data:', JSON.stringify(data, null, 2));
  console.log('PDF Generator - Template type:', templateType);
  console.log('PDF Generator - Personal info:', data?.personalInfo);
  console.log('PDF Generator - Image URL:', data?.personalInfo?.imageUrl);
  const getColors = (type) => {
    const colorSchemes = {
      'modern-template-1': { primary: '#14b8a6', secondary: '#1e293b', accent: '#14b8a6' },
      'modern-template-4': { primary: '#6b46c1', secondary: '#7c3aed', accent: '#8b5cf6' },
      'modern-template-7': { primary: '#dc2626', secondary: '#b91c1c', accent: '#dc2626' },
      'modern-template-10': { primary: '#1d4ed8', secondary: '#fb923c', accent: '#1d4ed8' },
      default: { primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6' }
    };
    return colorSchemes[type] || colorSchemes.default;
  };

  const colors = getColors(templateType);

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      fontFamily: 'Helvetica',
      padding: 40,
    },
    header: {
      backgroundColor: colors.primary,
      color: '#ffffff',
      padding: 20,
      marginBottom: 20,
      borderRadius: 8,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    title: {
      fontSize: 16,
      marginBottom: 10,
    },
    contactInfo: {
      fontSize: 10,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    contactItem: {
      marginRight: 20,
      marginBottom: 3,
    },
    content: {
      flexDirection: 'row',
    },
    sidebar: {
      width: '30%',
      marginRight: 20,
    },
    mainContent: {
      width: '70%',
    },
    sectionHeader: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 10,
      marginTop: 15,
      paddingBottom: 3,
      borderBottomWidth: 1,
      borderBottomColor: colors.primary,
    },
    text: {
      fontSize: 10,
      lineHeight: 1.4,
      marginBottom: 8,
      color: '#374151',
    },
    skillItem: {
      fontSize: 9,
      marginBottom: 4,
      paddingLeft: 8,
      borderLeftWidth: 2,
      borderLeftColor: colors.accent,
    },
    jobTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 2,
    },
    company: {
      fontSize: 10,
      color: colors.primary,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    period: {
      fontSize: 9,
      color: '#6b7280',
      marginBottom: 5,
    },
    description: {
      fontSize: 9,
      lineHeight: 1.3,
      color: '#4b5563',
      marginBottom: 8,
    },
    bullet: {
      fontSize: 9,
      color: '#4b5563',
      marginBottom: 2,
      paddingLeft: 8,
    },
  });

  // Template-specific layout renderer
  const renderTemplate = () => {
    switch (templateType) {
      case 'modern-template-1':
        return renderModernTemplate1();
      case 'modern-template-7':
        return renderModernTemplate7();
      case 'modern-template-10':
        return renderModernTemplate10();
      default:
        return renderDefaultTemplate();
    }
  };

  // Modern Template 1 - Sidebar Layout
  const renderModernTemplate1 = () => (
    <Page size="A4" style={{ flexDirection: 'row', fontFamily: 'Helvetica' }}>
      {/* Left Sidebar */}
      <View style={{ width: '35%', backgroundColor: colors.secondary, color: '#ffffff', padding: 20 }}>
        {/* Profile Section */}
        <View style={{ textAlign: 'center', marginBottom: 20 }}>
          {/* Profile Image or Initials */}
          {data.personalInfo.imageUrl ? (
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              marginBottom: 10,
              alignSelf: 'center',
              border: `4px solid ${colors.accent}`,
              overflow: 'hidden'
            }}>
              <Image
                src={data.personalInfo.imageUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={() => {
                  console.warn('Failed to load profile image, falling back to initials');
                }}
              />
            </View>
          ) : (
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.accent,
              marginBottom: 10,
              alignSelf: 'center',
              border: `4px solid ${colors.accent}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }}>
                {data.personalInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>{data.personalInfo.name}</Text>
          <Text style={{ fontSize: 14, color: colors.accent }}>{data.personalInfo.title}</Text>
        </View>

        {/* Bio */}
        {data.personalInfo.bio && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.accent, marginBottom: 8, textTransform: 'uppercase' }}>Bio</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.4, color: '#e2e8f0' }}>{data.personalInfo.bio}</Text>
          </View>
        )}

        {/* Contact Info */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.accent, marginBottom: 8, textTransform: 'uppercase' }}>Contact</Text>
          {data.personalInfo.email && <Text style={{ fontSize: 8, color: '#cbd5e1', marginBottom: 3 }}>📧 {data.personalInfo.email}</Text>}
          {data.personalInfo.phone && <Text style={{ fontSize: 8, color: '#cbd5e1', marginBottom: 3 }}>📞 {data.personalInfo.phone}</Text>}
          {data.personalInfo.location && <Text style={{ fontSize: 8, color: '#cbd5e1', marginBottom: 3 }}>📍 {data.personalInfo.location}</Text>}
          {data.personalInfo.website && <Text style={{ fontSize: 8, color: '#cbd5e1', marginBottom: 3 }}>🌐 {data.personalInfo.website}</Text>}
        </View>

        {/* Technical Skills */}
        {data.technicalSkills.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.accent, marginBottom: 8, textTransform: 'uppercase' }}>Technical Skills</Text>
            {data.technicalSkills.map((skill, index) => (
              <Text key={index} style={{ fontSize: 8, color: '#e2e8f0', marginBottom: 3, paddingLeft: 8 }}>• {skill}</Text>
            ))}
          </View>
        )}

        {/* Soft Skills */}
        {data.softSkills.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.accent, marginBottom: 8, textTransform: 'uppercase' }}>Core Competencies</Text>
            {data.softSkills.map((skill, index) => (
              <Text key={index} style={{ fontSize: 8, color: '#e2e8f0', marginBottom: 3, paddingLeft: 8 }}>• {skill}</Text>
            ))}
          </View>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <View>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.accent, marginBottom: 8, textTransform: 'uppercase' }}>Languages</Text>
            {data.languages.map((lang, index) => (
              <Text key={index} style={{ fontSize: 8, color: '#e2e8f0', marginBottom: 3, paddingLeft: 8 }}>
                {lang.name} - {lang.proficiency === 5 ? 'Native' : lang.proficiency === 4 ? 'Fluent' : lang.proficiency === 3 ? 'Intermediate' : lang.proficiency === 2 ? 'Basic' : 'Beginner'}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={{ width: '65%', padding: 20 }}>
        {/* Professional Summary */}
        {data.profileSummary && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.secondary, marginBottom: 10 }}>Professional Summary</Text>
            <Text style={{ fontSize: 10, lineHeight: 1.5, color: '#374151' }}>{data.profileSummary}</Text>
          </View>
        )}

        {/* Work Experience */}
        {data.workExperience.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.secondary, marginBottom: 10 }}>Professional Experience</Text>
            {data.workExperience.map((job, index) => (
              <View key={index} style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1f2937' }}>{job.position}</Text>
                <Text style={{ fontSize: 10, color: colors.primary, fontWeight: 'bold' }}>{job.company}</Text>
                <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 5 }}>{job.period} {job.location && `| ${job.location}`}</Text>
                {job.description && <Text style={{ fontSize: 9, lineHeight: 1.4, color: '#374151', marginBottom: 4 }}>{job.description}</Text>}
                {job.achievements && job.achievements.map((achievement, idx) => (
                  <Text key={idx} style={{ fontSize: 9, color: '#374151', marginBottom: 2, paddingLeft: 10 }}>• {achievement}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.secondary, marginBottom: 10 }}>Education</Text>
            {data.education.map((edu, index) => (
              <View key={index} style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1f2937' }}>{edu.degree}</Text>
                <Text style={{ fontSize: 10, color: colors.primary, fontWeight: 'bold' }}>{edu.school}</Text>
                <Text style={{ fontSize: 9, color: '#6b7280' }}>{edu.period}</Text>
                {edu.field && <Text style={{ fontSize: 9, color: '#374151' }}>Field of Study: {edu.field}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <View>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.secondary, marginBottom: 10 }}>Key Projects</Text>
            {data.projects.map((project, index) => (
              <View key={index} style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1f2937' }}>{project.name}</Text>
                {project.tech && <Text style={{ fontSize: 10, color: colors.primary }}>Technologies: {project.tech}</Text>}
                {project.description && <Text style={{ fontSize: 9, lineHeight: 1.4, color: '#374151' }}>{project.description}</Text>}
              </View>
            ))}
          </View>
        )}
      </View>
    </Page>
  );

  // Modern Template 7 - Clean with Red Accent
  const renderModernTemplate7 = () => (
    <Page size="A4" style={{ flexDirection: 'column', fontFamily: 'Helvetica', padding: 0 }}>
      {/* Header with Red Border */}
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 4, borderBottomColor: colors.primary, padding: 30, flexDirection: 'row', alignItems: 'center' }}>
        {/* Profile Image */}
        {data.personalInfo.imageUrl ? (
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            marginRight: 20,
            overflow: 'hidden'
          }}>
            <Image
              src={data.personalInfo.imageUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </View>
        ) : (
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#f3f4f6',
            marginRight: 20,
            border: '2px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#6b7280' }}>
              {data.personalInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
        )}
        
        {/* Header Content */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: 'normal', color: '#111827', marginBottom: 5 }}>{data.personalInfo.name}</Text>
          <Text style={{ fontSize: 16, color: colors.primary }}>{data.personalInfo.title}</Text>
        </View>
        
        {/* Contact Info */}
        <View style={{ textAlign: 'right', fontSize: 10, color: '#4b5563' }}>
          {data.personalInfo.email && <Text>{data.personalInfo.email}</Text>}
          {data.personalInfo.phone && <Text>{data.personalInfo.phone}</Text>}
          {data.personalInfo.location && <Text>{data.personalInfo.location}</Text>}
          {data.personalInfo.website && <Text>{data.personalInfo.website}</Text>}
        </View>
      </View>

      {/* Content */}
      <View style={{ padding: 30, flexDirection: 'row' }}>
        {/* Sidebar */}
        <View style={{ width: '25%', marginRight: 30 }}>
          {/* Technical Skills */}
          {data.technicalSkills.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 15 }}>Technical Skills</Text>
              {data.technicalSkills.map((skill, index) => (
                <Text key={index} style={{ fontSize: 10, color: '#374151', paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: colors.primary, marginBottom: 6 }}>{skill}</Text>
              ))}
            </View>
          )}

          {/* Soft Skills */}
          {data.softSkills.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 15 }}>Core Competencies</Text>
              {data.softSkills.map((skill, index) => (
                <Text key={index} style={{ fontSize: 10, color: '#374151', marginBottom: 4, paddingLeft: 12 }}>• {skill}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={{ width: '75%' }}>
          {/* Bio/Summary */}
          {data.personalInfo.bio && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 15, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>Bio</Text>
              <Text style={{ fontSize: 11, lineHeight: 1.5, color: '#374151' }}>{data.personalInfo.bio}</Text>
            </View>
          )}

          {/* Work Experience */}
          {data.workExperience.length > 0 && (
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 15, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>Professional Experience</Text>
              {data.workExperience.map((job, index) => (
                <View key={index} style={{ marginBottom: 15 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#111827' }}>{job.position}</Text>
                  <Text style={{ fontSize: 11, color: colors.primary, fontWeight: 'bold' }}>{job.company}</Text>
                  <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 5 }}>{job.period}</Text>
                  {job.description && <Text style={{ fontSize: 10, lineHeight: 1.4, color: '#374151', marginBottom: 4 }}>{job.description}</Text>}
                  {job.achievements && job.achievements.map((achievement, idx) => (
                    <Text key={idx} style={{ fontSize: 10, color: '#374151', marginBottom: 3, paddingLeft: 10 }}>• {achievement}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Page>
  );

  // Modern Template 10 - Blue and Orange Accent
  const renderModernTemplate10 = () => (
    <Page size="A4" style={{ flexDirection: 'column', fontFamily: 'Helvetica', padding: 0 }}>
      {/* Header */}
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 2, borderBottomColor: colors.primary, padding: 30, flexDirection: 'row', alignItems: 'center' }}>
        {/* Profile Image */}
        {data.personalInfo.imageUrl ? (
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            marginRight: 20,
            borderWidth: 2,
            borderColor: colors.secondary,
            overflow: 'hidden'
          }}>
            <Image
              src={data.personalInfo.imageUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </View>
        ) : (
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#f3f4f6',
            marginRight: 20,
            borderWidth: 2,
            borderColor: colors.secondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#4b5563' }}>
              {data.personalInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
        )}
        
        {/* Header Content */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: 'normal', color: '#111827', marginBottom: 5 }}>{data.personalInfo.name}</Text>
          <Text style={{ fontSize: 16, color: colors.primary }}>{data.personalInfo.title}</Text>
        </View>
      </View>

      {/* Contact Strip */}
      <View style={{ backgroundColor: '#fff7ed', paddingHorizontal: 30, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
        {data.personalInfo.email && <Text style={{ fontSize: 10, color: '#4b5563', marginHorizontal: 15, marginVertical: 2 }}>{data.personalInfo.email}</Text>}
        {data.personalInfo.phone && <Text style={{ fontSize: 10, color: '#4b5563', marginHorizontal: 15, marginVertical: 2 }}>{data.personalInfo.phone}</Text>}
        {data.personalInfo.location && <Text style={{ fontSize: 10, color: '#4b5563', marginHorizontal: 15, marginVertical: 2 }}>{data.personalInfo.location}</Text>}
        {data.personalInfo.website && <Text style={{ fontSize: 10, color: '#4b5563', marginHorizontal: 15, marginVertical: 2 }}>{data.personalInfo.website}</Text>}
      </View>

      {/* Content */}
      <View style={{ padding: 30, flexDirection: 'row' }}>
        {/* Skills Sidebar */}
        <View style={{ width: '33%', marginRight: 25 }}>
          {/* Bio */}
          {data.personalInfo.bio && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 15, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>Bio</Text>
              <Text style={{ fontSize: 11, lineHeight: 1.5, color: '#374151' }}>{data.personalInfo.bio}</Text>
            </View>
          )}

          {/* Technical Skills */}
          {data.technicalSkills.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 15 }}>Technical Skills</Text>
              {data.technicalSkills.slice(0, 8).map((skill, index) => (
                <Text key={index} style={{ fontSize: 10, color: '#374151', paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: colors.primary, marginBottom: 6 }}>{skill}</Text>
              ))}
            </View>
          )}

          {/* Core Competencies */}
          {data.softSkills.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 15 }}>Core Competencies</Text>
              {data.softSkills.map((skill, index) => (
                <Text key={index} style={{ fontSize: 10, color: '#374151', marginBottom: 4, paddingLeft: 12 }}>• {skill}</Text>
              ))}
            </View>
          )}

          {/* Languages */}
          {data.languages.length > 0 && (
            <View>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 15 }}>Languages</Text>
              {data.languages.map((lang, index) => (
                <Text key={index} style={{ fontSize: 10, color: '#374151', marginBottom: 4, paddingLeft: 12 }}>
                  {lang.name} - {lang.proficiency === 5 ? 'Native' : lang.proficiency === 4 ? 'Fluent' : lang.proficiency === 3 ? 'Intermediate' : lang.proficiency === 2 ? 'Basic' : 'Beginner'}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={{ width: '67%' }}>
          {/* Work Experience */}
          {data.workExperience.length > 0 && (
            <View style={{ marginBottom: 25 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 15, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>Professional Experience</Text>
              {data.workExperience.map((job, index) => (
                <View key={index} style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#111827' }}>{job.position}</Text>
                  <Text style={{ fontSize: 11, color: colors.primary, fontWeight: 'bold' }}>{job.company}</Text>
                  <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 5 }}>{job.period} {job.location && `| ${job.location}`}</Text>
                  {job.description && (
                    <Text style={{ fontSize: 10, lineHeight: 1.4, color: '#374151', marginBottom: 4 }}>{job.description}</Text>
                  )}
                  {job.achievements && job.achievements.map((achievement, idx) => (
                    <Text key={idx} style={{ fontSize: 10, color: '#374151', marginBottom: 3, paddingLeft: 10 }}>• {achievement}</Text>
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
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 15 }}>Education</Text>
                {data.education.map((edu, index) => (
                  <View key={index} style={{ marginBottom: 15 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#111827' }}>{edu.degree}</Text>
                    <Text style={{ fontSize: 11, color: colors.primary }}>{edu.school}</Text>
                    {edu.field && (
                      <Text style={{ fontSize: 10, color: '#4b5563', marginBottom: 2 }}>{edu.field}</Text>
                    )}
                    <Text style={{ fontSize: 9, color: '#6b7280' }}>{edu.period}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Projects */}
            {data.projects.length > 0 && (
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 15 }}>Key Projects</Text>
                {data.projects.map((project, index) => (
                  <View key={index} style={{ marginBottom: 15 }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#111827' }}>{project.name}</Text>
                    {project.tech && (
                      <Text style={{ fontSize: 9, color: colors.primary, marginBottom: 3 }}>{project.tech}</Text>
                    )}
                    {project.description && (
                      <Text style={{ fontSize: 9, lineHeight: 1.3, color: '#374151', marginBottom: 8 }}>{project.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </Page>
  );

  // Default template fallback
  const renderDefaultTemplate = () => (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.personalInfo.name}</Text>
        <Text style={styles.title}>{data.personalInfo.title}</Text>
        <View style={styles.contactInfo}>
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

      {/* Bio */}
      {data.personalInfo.bio && (
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.sectionHeader}>Professional Summary</Text>
          <Text style={styles.text}>{data.personalInfo.bio}</Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          {/* Technical Skills */}
          {data.technicalSkills.length > 0 && (
            <View style={{ marginBottom: 15 }}>
              <Text style={styles.sectionHeader}>Technical Skills</Text>
              {data.technicalSkills.slice(0, 10).map((skill, index) => (
                <Text key={index} style={styles.skillItem}>{skill}</Text>
              ))}
            </View>
          )}

          {/* Soft Skills */}
          {data.softSkills.length > 0 && (
            <View style={{ marginBottom: 15 }}>
              <Text style={styles.sectionHeader}>Core Competencies</Text>
              {data.softSkills.map((skill, index) => (
                <Text key={index} style={styles.skillItem}>{skill}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Work Experience */}
          {data.workExperience.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionHeader}>Professional Experience</Text>
              {data.workExperience.map((job, index) => (
                <View key={index} style={{ marginBottom: 15 }}>
                  <Text style={styles.jobTitle}>{job.position}</Text>
                  <Text style={styles.company}>{job.company}</Text>
                  <Text style={styles.period}>{job.period} {job.location && `| ${job.location}`}</Text>
                  {job.description && (
                    <Text style={styles.description}>{job.description}</Text>
                  )}
                  {job.achievements && job.achievements.slice(0, 3).map((achievement, idx) => (
                    <Text key={idx} style={styles.bullet}>• {achievement}</Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionHeader}>Education</Text>
              {data.education.map((edu, index) => (
                <View key={index} style={{ marginBottom: 12 }}>
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
              <Text style={styles.sectionHeader}>Key Projects</Text>
              {data.projects.slice(0, 4).map((project, index) => (
                <View key={index} style={{ marginBottom: 12 }}>
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
    </Page>
  );

  return (
    <Document>
      {renderTemplate()}
    </Document>
  );
};

// Main export function with robust error handling
export const generateSimplePDF = async (cvData, templateId, filename = 'resume.pdf') => {
  try {
    console.log('Generating simple PDF for template:', templateId);
    
    // Initialize libraries
    await initializeReactPDF();
    
    // Transform CV data
    const transformedData = transformCVDataForTemplates(cvData);
    if (!transformedData) {
      throw new Error('Failed to transform CV data');
    }
    
    // Debug the data transformation
    debugCVData(cvData, transformedData, templateId);
    
    // Pre-resolve profile image to data URL for reliable rendering
    if (transformedData.personalInfo?.imageUrl) {
      console.log('Resolving profile image:', transformedData.personalInfo.imageUrl);
      const resolvedImageUrl = await resolveImageToDataUrl(transformedData.personalInfo.imageUrl);
      if (resolvedImageUrl) {
        transformedData.personalInfo.imageUrl = resolvedImageUrl;
        console.log('Profile image resolved successfully');
      } else {
        console.warn('Failed to resolve profile image, will use initials fallback');
        transformedData.personalInfo.imageUrl = '';
      }
    }
    
    console.log('Creating PDF document...');
    
    // Create PDF document
    const pdfDocument = <EnhancedTemplatePDF data={transformedData} templateType={templateId} />;
    
    console.log('Generating PDF blob...');
    
    // Generate PDF blob with timeout
    const blob = await Promise.race([
      pdf(pdfDocument).toBlob(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PDF generation timeout')), 20000)
      )
    ]);
    
    if (!blob) {
      throw new Error('Failed to generate PDF blob');
    }
    
    console.log('Downloading PDF...');
    
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
    
    console.log('Simple PDF generated and downloaded successfully');
    return true;
  } catch (error) {
    console.error('Error generating simple PDF:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

export default { generateSimplePDF };
