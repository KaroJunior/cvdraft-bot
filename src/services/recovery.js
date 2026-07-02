const { generateCVPreview } = require('./preview');

/**
 * Parses a plain-text CV preview back into a CV data object
 * @param {string} previewText - The CV preview text from the user
 * @returns {Object} - Parsed CV data object
 */
function parseCVFromPreview(previewText) {
  const lines = previewText.split('\n').map(line => line.trim());
  const cv = {
    personal: {
      fullName: null,
      phone: null,
      email: null,
      location: null,
      linkedin: null,
      website: null,
    },
    targetRole: null,
    summary: null,
    summaryMeta: {
      useGeneratedSummary: false,
      background: null,
      strengths: null,
      careerGoal: null,
      highlight: null,
    },
    education: [],
    experience: [],
    projects: [],
    activities: [],
    skills: {
      technical: [],
      languages: [],
      other: [],
    },
    certifications: [],
    referencesOnRequest: false,
  };
  
  let currentSection = null;
  let currentEntry = null;
  let educationEntries = [];
  let experienceEntries = [];
  let projectEntries = [];
  let activityEntries = [];
  let certificationEntries = [];
  let skillsTechnical = [];
  let skillsLanguages = [];
  let skillsOther = [];
  let foundName = false;
  let foundSummary = false;
  let foundEducation = false;
  
  // Remove markdown code block markers if present
  const cleanLines = lines.filter(line => 
    !line.startsWith('```') && 
    !line.startsWith('📄 *Your CV Preview*') &&
    !line.startsWith('*') &&
    line.length > 0
  );
  
  for (let i = 0; i < cleanLines.length; i++) {
    const line = cleanLines[i];
    const nextLine = i + 1 < cleanLines.length ? cleanLines[i + 1] : '';
    
    // Skip empty lines
    if (!line) continue;
    
    // Check for section headers
    if (line === 'PROFESSIONAL SUMMARY') {
      currentSection = 'summary';
      continue;
    }
    if (line === 'EDUCATION') {
      currentSection = 'education';
      educationEntries = [];
      currentEntry = null;
      continue;
    }
    if (line === 'EXPERIENCE') {
      currentSection = 'experience';
      experienceEntries = [];
      currentEntry = null;
      continue;
    }
    if (line === 'SKILLS') {
      currentSection = 'skills';
      continue;
    }
    if (line === 'PROJECTS') {
      currentSection = 'projects';
      projectEntries = [];
      currentEntry = null;
      continue;
    }
    if (line === 'ACTIVITIES / LEADERSHIP / VOLUNTEER') {
      currentSection = 'activities';
      activityEntries = [];
      currentEntry = null;
      continue;
    }
    if (line === 'CERTIFICATIONS / AWARDS') {
      currentSection = 'certifications';
      certificationEntries = [];
      currentEntry = null;
      continue;
    }
    if (line === 'References available on request') {
      cv.referencesOnRequest = true;
      continue;
    }
    
    // Parse based on current section
    switch (currentSection) {
      case null:
        // This is the name section (before any section headers)
        if (!foundName && line && !line.includes('|') && !line.includes('@')) {
          // Could be name or target role
          if (!cv.personal.fullName) {
            cv.personal.fullName = line;
            foundName = true;
          } else if (!cv.targetRole) {
            // Check if this looks like a target role (not a contact line)
            if (!line.includes('|') && !line.includes('@') && !line.includes('.')) {
              cv.targetRole = line;
            }
          }
        } else if (line.includes('|') || line.includes('@') || line.includes('+')) {
          // Contact line
          const parts = line.split('|').map(p => p.trim());
          parts.forEach(part => {
            if (part.includes('@')) {
              cv.personal.email = part;
            } else if (part.includes('+') || /^\d[\d\s\-()]+$/.test(part)) {
              cv.personal.phone = part;
            } else if (part.includes('linkedin') || part.includes('linkedin.com')) {
              cv.personal.linkedin = part;
            } else if (part.startsWith('http://') || part.startsWith('https://')) {
              cv.personal.website = part;
            } else if (!cv.personal.location) {
              cv.personal.location = part;
            }
          });
        }
        break;
        
      case 'summary':
        if (line && line !== 'PROFESSIONAL SUMMARY') {
          cv.summary = line;
          foundSummary = true;
          currentSection = null;
        }
        break;
        
      case 'education':
        if (line === 'EDUCATION') break;
        if (line === '' || line === 'GPA:') break;
        
        // Check if this is a new entry (school name or degree line)
        if (!currentEntry || (line.includes(' in ') && !line.includes('GPA'))) {
          if (currentEntry && (currentEntry.school || currentEntry.degree)) {
            educationEntries.push(currentEntry);
          }
          currentEntry = {
            school: null,
            degree: null,
            field: null,
            location: null,
            startYear: null,
            endYear: null,
            isInProgress: false,
            gpa: null,
          };
        }
        
        // Parse the line based on content
        if (line.startsWith('GPA:')) {
          currentEntry.gpa = line.replace('GPA:', '').trim();
        } else if (line.match(/^\d{4}\s*[–-]\s*/) || line.match(/^\d{4}$/)) {
          // Date range
          const parts = line.split(/[–-]/).map(p => p.trim());
          if (parts.length === 2) {
            currentEntry.startYear = parts[0];
            currentEntry.endYear = parts[1];
            if (parts[1].toLowerCase().includes('present')) {
              currentEntry.isInProgress = true;
            }
          } else if (parts.length === 1) {
            currentEntry.startYear = parts[0];
          }
        } else if (line.includes(' in ')) {
          // Degree line
          const parts = line.split(' in ');
          currentEntry.degree = parts[0].trim();
          currentEntry.field = parts[1].trim();
        } else if (line.includes(',')) {
          // School with location
          const parts = line.split(',').map(p => p.trim());
          currentEntry.school = parts[0];
          if (parts.length > 1) {
            currentEntry.location = parts.slice(1).join(', ');
          }
        } else if (line && !line.startsWith('GPA:')) {
          // Could be school name, degree, or field
          if (!currentEntry.school) {
            currentEntry.school = line;
          } else if (!currentEntry.degree) {
            currentEntry.degree = line;
          } else if (!currentEntry.field) {
            currentEntry.field = line;
          }
        }
        break;
        
      case 'experience':
        if (line === 'EXPERIENCE') break;
        if (line === '' || line.startsWith('•')) break;
        
        // Check if this is a new entry (title line)
        if (!currentEntry || (line.includes(' - ') && !line.startsWith('•'))) {
          if (currentEntry && (currentEntry.title || currentEntry.company)) {
            experienceEntries.push(currentEntry);
          }
          currentEntry = {
            title: null,
            company: null,
            location: null,
            startDate: null,
            endDate: null,
            isCurrent: false,
            bullets: [],
          };
        }
        
        // Parse the line
        if (line.includes(' - ') && !line.startsWith('•')) {
          const parts = line.split(' - ').map(p => p.trim());
          currentEntry.title = parts[0];
          if (parts.length > 1) {
            const companyPart = parts[1];
            if (companyPart.includes(',')) {
              const companyParts = companyPart.split(',').map(p => p.trim());
              currentEntry.company = companyParts[0];
              currentEntry.location = companyParts.slice(1).join(', ');
            } else {
              currentEntry.company = companyPart;
            }
          }
        } else if (line.match(/^\w+\s+\d{4}/) || line.match(/^\d{4}/) || line.includes('Present')) {
          // Date range
          const parts = line.split(/[–-]/).map(p => p.trim());
          if (parts.length === 2) {
            currentEntry.startDate = parts[0];
            currentEntry.endDate = parts[1];
            if (parts[1].toLowerCase().includes('present')) {
              currentEntry.isCurrent = true;
            }
          } else if (parts.length === 1) {
            currentEntry.startDate = parts[0];
          }
        } else if (line.startsWith('•')) {
          // Bullet point
          const bullet = line.replace(/^•\s*/, '').trim();
          if (bullet) {
            currentEntry.bullets.push(bullet);
          }
        } else if (line && !line.startsWith('•')) {
          // Could be company/location or additional info
          if (!currentEntry.company) {
            currentEntry.company = line;
          } else if (!currentEntry.location) {
            currentEntry.location = line;
          }
        }
        break;
        
      case 'skills':
        if (line === 'SKILLS') break;
        if (line.startsWith('Technical:')) {
          const tech = line.replace('Technical:', '').trim();
          skillsTechnical = tech.split(',').map(s => s.trim()).filter(s => s);
        } else if (line.startsWith('Languages:')) {
          const langs = line.replace('Languages:', '').trim();
          skillsLanguages = langs.split(',').map(s => s.trim()).filter(s => s);
        } else if (line.startsWith('Other:')) {
          const other = line.replace('Other:', '').trim();
          skillsOther = other.split(',').map(s => s.trim()).filter(s => s);
        }
        break;
        
      case 'projects':
        if (line === 'PROJECTS') break;
        if (line === '' || line.startsWith('Technologies:') || line.startsWith(' ')) break;
        
        if (!currentEntry || (line && !line.startsWith('Technologies:') && !currentEntry.name)) {
          if (currentEntry && currentEntry.name) {
            projectEntries.push(currentEntry);
          }
          currentEntry = {
            name: null,
            role: null,
            tech: [],
            description: null,
          };
        }
        
        if (line.startsWith('Technologies:')) {
          const tech = line.replace('Technologies:', '').trim();
          currentEntry.tech = tech.split(',').map(s => s.trim()).filter(s => s);
        } else if (line.includes(' - ')) {
          const parts = line.split(' - ').map(p => p.trim());
          currentEntry.name = parts[0];
          if (parts.length > 1) {
            currentEntry.role = parts[1];
          }
        } else if (line && !currentEntry.name) {
          currentEntry.name = line;
        } else if (line && !currentEntry.description) {
          currentEntry.description = line;
        }
        break;
        
      case 'activities':
        if (line === 'ACTIVITIES / LEADERSHIP / VOLUNTEER') break;
        if (line === '') break;
        
        if (!currentEntry || (line && !currentEntry.title)) {
          if (currentEntry && currentEntry.title) {
            activityEntries.push(currentEntry);
          }
          currentEntry = {
            title: null,
            organization: null,
            description: null,
          };
        }
        
        if (line.includes(' - ')) {
          const parts = line.split(' - ').map(p => p.trim());
          currentEntry.title = parts[0];
          if (parts.length > 1) {
            currentEntry.organization = parts[1];
          }
        } else if (line && !currentEntry.title) {
          currentEntry.title = line;
        } else if (line && !currentEntry.description) {
          currentEntry.description = line;
        }
        break;
        
      case 'certifications':
        if (line === 'CERTIFICATIONS / AWARDS') break;
        if (line === '') break;
        
        if (!currentEntry || (line && !currentEntry.name)) {
          if (currentEntry && currentEntry.name) {
            certificationEntries.push(currentEntry);
          }
          currentEntry = {
            name: null,
            issuer: null,
            year: null,
          };
        }
        
        if (line.includes(' - ')) {
          const parts = line.split(' - ').map(p => p.trim());
          currentEntry.name = parts[0];
          if (parts.length > 1) {
            // Check if there's a year in parentheses
            const issuerPart = parts[1];
            const yearMatch = issuerPart.match(/\((\d{4})\)/);
            if (yearMatch) {
              currentEntry.year = yearMatch[1];
              currentEntry.issuer = issuerPart.replace(/\(.*\)/, '').trim();
            } else {
              currentEntry.issuer = issuerPart;
            }
          }
        } else if (line.match(/\(\d{4}\)/)) {
          // Year only
          const yearMatch = line.match(/\((\d{4})\)/);
          if (yearMatch) {
            currentEntry.year = yearMatch[1];
          }
          currentEntry.name = line.replace(/\(.*\)/, '').trim();
        } else if (line && !currentEntry.name) {
          currentEntry.name = line;
        } else if (line && !currentEntry.issuer) {
          currentEntry.issuer = line;
        } else if (line && !currentEntry.year) {
          currentEntry.year = line;
        }
        break;
    }
  }
  
  // Push any remaining entries
  if (currentEntry) {
    if (currentSection === 'education' && (currentEntry.school || currentEntry.degree)) {
      educationEntries.push(currentEntry);
    } else if (currentSection === 'experience' && (currentEntry.title || currentEntry.company)) {
      experienceEntries.push(currentEntry);
    } else if (currentSection === 'projects' && currentEntry.name) {
      projectEntries.push(currentEntry);
    } else if (currentSection === 'activities' && currentEntry.title) {
      activityEntries.push(currentEntry);
    } else if (currentSection === 'certifications' && currentEntry.name) {
      certificationEntries.push(currentEntry);
    }
  }
  
  // Assign parsed data to CV object
  cv.education = educationEntries;
  cv.experience = experienceEntries;
  cv.projects = projectEntries;
  cv.activities = activityEntries;
  cv.certifications = certificationEntries;
  cv.skills.technical = skillsTechnical;
  cv.skills.languages = skillsLanguages;
  cv.skills.other = skillsOther;
  
  // Validate required sections
  const errors = [];
  if (!cv.personal.fullName) errors.push('Full name is required');
  if (!cv.targetRole) errors.push('Professional title is required');
  if (!cv.summary) errors.push('Professional summary is required');
  if (cv.education.length === 0) errors.push('At least one education entry is required');
  
  if (errors.length > 0) {
    throw new Error(`Missing required sections: ${errors.join(', ')}`);
  }
  
  return cv;
}

/**
 * Validates if a recovery session has all required data
 */
function validateRecoveryData(cvData) {
  if (!cvData.personal.fullName) return false;
  if (!cvData.targetRole) return false;
  if (!cvData.summary) return false;
  if (cvData.education.length === 0) return false;
  return true;
}

module.exports = {
  parseCVFromPreview,
  validateRecoveryData,
};