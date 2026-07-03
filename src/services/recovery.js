const { generateCVPreview } = require('./preview');

/**
 * Parses a plain-text CV preview back into a CV data object
 * This parser is the exact inverse of generateCVPreview()
 * @param {string} previewText - The CV preview text from the user
 * @returns {Object} - Parsed CV data object
 */
function parseCVFromPreview(previewText) {
  const lines = previewText.split('\n').map(line => line.trimEnd());
  
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
  
  // Remove markdown code block markers and decorative headers
  const cleanLines = lines.filter(line => 
    !line.startsWith('```') && 
    !line.startsWith('📄') &&
    !line.startsWith('*') &&
    !line.startsWith('✏️') &&
    !line.startsWith('✅') &&
    !line.startsWith('⚠️') &&
    line.length > 0
  );
  
  // Phase 1: Parse header (Name, Target Role, Contact)
  let i = 0;
  
  // Skip any leading empty lines or decorative text
  while (i < cleanLines.length && cleanLines[i].trim() === '') {
    i++;
  }
  
  // 1. Full name (first non-empty line, usually uppercase)
  if (i < cleanLines.length) {
    cv.personal.fullName = cleanLines[i].trim();
    i++;
  }
  
  // Skip empty line after name
  if (i < cleanLines.length && cleanLines[i].trim() === '') {
    i++;
  }
  
  // 2. Target role (second line, not containing | or @)
  if (i < cleanLines.length) {
    const line = cleanLines[i].trim();
    if (line && !line.includes('|') && !line.includes('@') && !line.includes('.')) {
      cv.targetRole = line;
      i++;
    }
  }
  
  // Skip empty line after target role
  if (i < cleanLines.length && cleanLines[i].trim() === '') {
    i++;
  }
  
  // 3. Contact line (contains | separators)
  if (i < cleanLines.length) {
    const line = cleanLines[i].trim();
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());
      parts.forEach(part => {
        if (part.includes('@')) {
          cv.personal.email = part;
        } else if (part.includes('+') || /^\d[\d\s\-()]+$/.test(part.replace(/\s/g, ''))) {
          cv.personal.phone = part;
        } else if (part.toLowerCase().includes('linkedin')) {
          cv.personal.linkedin = part;
        } else if (part.startsWith('http://') || part.startsWith('https://')) {
          cv.personal.website = part;
        } else if (!cv.personal.location) {
          cv.personal.location = part;
        }
      });
      i++;
    }
  }
  
  // Skip empty line after contact
  if (i < cleanLines.length && cleanLines[i].trim() === '') {
    i++;
  }
  
  // Phase 2: Parse sections
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
  
  while (i < cleanLines.length) {
    const line = cleanLines[i];
    const trimmedLine = line.trim();
    
    // Check for section headers (exact match)
    if (trimmedLine === 'PROFESSIONAL SUMMARY') {
      currentSection = 'summary';
      i++;
      continue;
    } else if (trimmedLine === 'EDUCATION') {
      currentSection = 'education';
      currentEntry = null;
      i++;
      continue;
    } else if (trimmedLine === 'EXPERIENCE') {
      currentSection = 'experience';
      currentEntry = null;
      i++;
      continue;
    } else if (trimmedLine === 'SKILLS') {
      currentSection = 'skills';
      i++;
      continue;
    } else if (trimmedLine === 'PROJECTS') {
      currentSection = 'projects';
      currentEntry = null;
      i++;
      continue;
    } else if (trimmedLine === 'ACTIVITIES / LEADERSHIP / VOLUNTEER') {
      currentSection = 'activities';
      currentEntry = null;
      i++;
      continue;
    } else if (trimmedLine === 'CERTIFICATIONS / AWARDS') {
      currentSection = 'certifications';
      currentEntry = null;
      i++;
      continue;
    } else if (trimmedLine === 'References available on request') {
      cv.referencesOnRequest = true;
      i++;
      continue;
    }
    
    // Skip empty lines
    if (trimmedLine === '') {
      i++;
      continue;
    }
    
    // Parse based on current section
    switch (currentSection) {
      case 'summary':
        // Summary is the next non-empty line after the header
        if (trimmedLine && trimmedLine !== 'PROFESSIONAL SUMMARY') {
          cv.summary = trimmedLine;
          currentSection = null; // Don't process more lines as summary
        }
        i++;
        break;
        
      case 'education':
        // Check if this is a new entry
        // A new entry starts with a school name (not containing ' – ' and not starting with 'GPA:')
        if (!currentEntry && trimmedLine && !trimmedLine.startsWith('GPA:') && !trimmedLine.includes(' – ')) {
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
        
        if (currentEntry) {
          // School line (may contain comma for location)
          if (!currentEntry.school && trimmedLine && !trimmedLine.startsWith('GPA:') && !trimmedLine.includes(' – ')) {
            if (trimmedLine.includes(',')) {
              const parts = trimmedLine.split(',').map(p => p.trim());
              currentEntry.school = parts[0];
              if (parts.length > 1) {
                currentEntry.location = parts.slice(1).join(', ');
              }
            } else {
              currentEntry.school = trimmedLine;
            }
            i++;
            continue;
          }
          
          // Degree line (contains ' in ')
          if (!currentEntry.degree && trimmedLine && trimmedLine.includes(' in ')) {
            const parts = trimmedLine.split(' in ');
            currentEntry.degree = parts[0].trim();
            currentEntry.field = parts[1].trim();
            i++;
            continue;
          }
          
          // Date line (contains ' – ')
          if (!currentEntry.startYear && trimmedLine && trimmedLine.includes(' – ')) {
            const parts = trimmedLine.split(' – ').map(p => p.trim());
            if (parts.length === 2) {
              currentEntry.startYear = parts[0];
              currentEntry.endYear = parts[1];
              if (parts[1].toLowerCase().includes('present')) {
                currentEntry.isInProgress = true;
              }
            }
            i++;
            continue;
          }
          
          // GPA line
          if (!currentEntry.gpa && trimmedLine.startsWith('GPA:')) {
            currentEntry.gpa = trimmedLine.replace('GPA:', '').trim();
            // Save the entry and move to next
            if (currentEntry.school || currentEntry.degree) {
              educationEntries.push(currentEntry);
              currentEntry = null;
            }
            i++;
            continue;
          }
          
          // If we have a school but no degree, and we hit a line that looks like a date
          if (currentEntry.school && !currentEntry.degree && trimmedLine && trimmedLine.match(/^\d{4}/)) {
            // This might be a date line for a school with no degree
            // Check if it's a date range
            if (trimmedLine.includes(' – ')) {
              const parts = trimmedLine.split(' – ').map(p => p.trim());
              if (parts.length === 2) {
                currentEntry.startYear = parts[0];
                currentEntry.endYear = parts[1];
                if (parts[1].toLowerCase().includes('present')) {
                  currentEntry.isInProgress = true;
                }
              }
              // Save entry
              educationEntries.push(currentEntry);
              currentEntry = null;
              i++;
              continue;
            }
          }
        }
        
        // If we have a completed entry and hit an empty line or new section
        if (currentEntry && (trimmedLine === '' || trimmedLine === 'EXPERIENCE' || trimmedLine === 'SKILLS')) {
          if (currentEntry.school || currentEntry.degree) {
            educationEntries.push(currentEntry);
          }
          currentEntry = null;
        }
        
        i++;
        break;
        
      case 'experience':
        // Check if this is a new entry
        // A new entry starts with a title line (contains ' - ')
        if (!currentEntry && trimmedLine && trimmedLine.includes(' - ')) {
          currentEntry = {
            title: null,
            company: null,
            location: null,
            startDate: null,
            endDate: null,
            isCurrent: false,
            bullets: [],
          };
          
          // Parse title line
          const parts = trimmedLine.split(' - ').map(p => p.trim());
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
          i++;
          continue;
        }
        
        if (currentEntry) {
          // Date line (contains ' – ')
          if (!currentEntry.startDate && trimmedLine && trimmedLine.includes(' – ')) {
            const parts = trimmedLine.split(' – ').map(p => p.trim());
            if (parts.length === 2) {
              currentEntry.startDate = parts[0];
              currentEntry.endDate = parts[1];
              if (parts[1].toLowerCase().includes('present')) {
                currentEntry.isCurrent = true;
              }
            }
            i++;
            continue;
          }
          
          // Bullet point (starts with '•')
          if (trimmedLine.startsWith('•')) {
            const bullet = trimmedLine.replace(/^•\s*/, '').trim();
            if (bullet) {
              currentEntry.bullets.push(bullet);
            }
            i++;
            continue;
          }
          
          // If we hit a line that doesn't match any pattern, it might be a company line without title
          if (!currentEntry.company && trimmedLine && !trimmedLine.startsWith('•') && !trimmedLine.includes(' – ') && !trimmedLine.includes(' – ')) {
            // Check if it's a date
            if (!trimmedLine.match(/^\d{4}/)) {
              currentEntry.company = trimmedLine;
            }
            i++;
            continue;
          }
          
          // Save entry when we hit an empty line or new section
          if (trimmedLine === '' || trimmedLine === 'SKILLS' || trimmedLine === 'PROJECTS') {
            if (currentEntry.title || currentEntry.company) {
              experienceEntries.push(currentEntry);
            }
            currentEntry = null;
          }
        }
        
        i++;
        break;
        
      case 'skills':
        if (trimmedLine.startsWith('Technical:')) {
          const tech = trimmedLine.replace('Technical:', '').trim();
          skillsTechnical = tech ? tech.split(',').map(s => s.trim()).filter(s => s) : [];
        } else if (trimmedLine.startsWith('Languages:')) {
          const langs = trimmedLine.replace('Languages:', '').trim();
          skillsLanguages = langs ? langs.split(',').map(s => s.trim()).filter(s => s) : [];
        } else if (trimmedLine.startsWith('Other:')) {
          const other = trimmedLine.replace('Other:', '').trim();
          skillsOther = other ? other.split(',').map(s => s.trim()).filter(s => s) : [];
        }
        i++;
        break;
        
      case 'projects':
        // Check if this is a new entry
        if (!currentEntry && trimmedLine && trimmedLine.includes(' - ')) {
          currentEntry = {
            name: null,
            role: null,
            tech: [],
            description: null,
          };
          
          const parts = trimmedLine.split(' - ').map(p => p.trim());
          currentEntry.name = parts[0];
          if (parts.length > 1) {
            currentEntry.role = parts[1];
          }
          i++;
          continue;
        }
        
        if (currentEntry) {
          // Technologies line
          if (trimmedLine.startsWith('Technologies:')) {
            const tech = trimmedLine.replace('Technologies:', '').trim();
            currentEntry.tech = tech ? tech.split(',').map(s => s.trim()).filter(s => s) : [];
            i++;
            continue;
          }
          
          // Description (any line that's not empty and not a header)
          if (!currentEntry.description && trimmedLine && !trimmedLine.startsWith('Technologies:') && !trimmedLine.includes(' - ')) {
            currentEntry.description = trimmedLine;
            // Description is the last field, so save the entry
            if (currentEntry.name) {
              projectEntries.push(currentEntry);
              currentEntry = null;
            }
            i++;
            continue;
          }
        }
        
        // If we have a name but no description and hit empty line or new section
        if (currentEntry && currentEntry.name && (trimmedLine === '' || trimmedLine === 'ACTIVITIES' || trimmedLine === 'CERTIFICATIONS')) {
          projectEntries.push(currentEntry);
          currentEntry = null;
        }
        
        i++;
        break;
        
      case 'activities':
        // Check if this is a new entry
        if (!currentEntry && trimmedLine && trimmedLine.includes(' - ')) {
          currentEntry = {
            title: null,
            organization: null,
            description: null,
          };
          
          const parts = trimmedLine.split(' - ').map(p => p.trim());
          currentEntry.title = parts[0];
          if (parts.length > 1) {
            currentEntry.organization = parts[1];
          }
          i++;
          continue;
        }
        
        if (currentEntry) {
          // Description (any line that's not empty)
          if (!currentEntry.description && trimmedLine && !trimmedLine.includes(' - ')) {
            currentEntry.description = trimmedLine;
            // Save the entry
            if (currentEntry.title) {
              activityEntries.push(currentEntry);
              currentEntry = null;
            }
            i++;
            continue;
          }
        }
        
        // If we have a title but no description and hit empty line or new section
        if (currentEntry && currentEntry.title && (trimmedLine === '' || trimmedLine === 'CERTIFICATIONS' || trimmedLine === 'References')) {
          activityEntries.push(currentEntry);
          currentEntry = null;
        }
        
        i++;
        break;
        
      case 'certifications':
        // Check if this is a new entry
        if (!currentEntry && trimmedLine && trimmedLine.includes(' - ')) {
          currentEntry = {
            name: null,
            issuer: null,
            year: null,
          };
          
          const parts = trimmedLine.split(' - ').map(p => p.trim());
          currentEntry.name = parts[0];
          if (parts.length > 1) {
            const issuerPart = parts[1];
            const yearMatch = issuerPart.match(/\((\d{4})\)/);
            if (yearMatch) {
              currentEntry.year = yearMatch[1];
              currentEntry.issuer = issuerPart.replace(/\(.*\)/, '').trim();
            } else {
              currentEntry.issuer = issuerPart;
            }
          }
          // Save immediately (certifications are single line)
          if (currentEntry.name) {
            certificationEntries.push(currentEntry);
            currentEntry = null;
          }
        }
        i++;
        break;
        
      default:
        i++;
        break;
    }
  }
  
  // Save any remaining entries
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