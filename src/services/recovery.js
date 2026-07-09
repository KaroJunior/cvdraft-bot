const { generateCVPreview } = require('./preview');

/**
 * Parses a plain-text CV preview back into a CV data object
 * This parser is the exact inverse of generateCVPreview()
 * @param {string} previewText - The CV preview text from the user
 * @returns {Object} - Parsed CV data object
 */
function parseCVFromPreview(previewText) {
  const lines = previewText.split('\n').map(line => line.trimEnd());
  
  console.log('🔍 RECOVERY PARSER STARTED');
  console.log(`🔍 Input lines: ${lines.length}`);
  
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
  const cleanLines = lines.filter(line => {
    const trimmed = line.trim();
    return !trimmed.startsWith('```') && 
           !trimmed.startsWith('📄') &&
           !trimmed.startsWith('*') &&
           !trimmed.startsWith('✏️') &&
           !trimmed.startsWith('✅') &&
           !trimmed.startsWith('⚠️') &&
           trimmed.length > 0;
  });
  
  console.log(`🔍 Clean lines: ${cleanLines.length}`);
  
  // Phase 1: Parse header (Name, Target Role, Contact)
  let i = 0;
  
  // 1. Full name (first non-empty line)
  if (i < cleanLines.length) {
    cv.personal.fullName = cleanLines[i].trim();
    console.log(`🔍 Name: ${cv.personal.fullName}`);
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
      console.log(`🔍 Target Role: ${cv.targetRole}`);
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
      console.log(`🔍 Contact line parsed`);
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
  let summaryText = null;
  
  console.log('🔍 Starting section parsing...');
  
  // Helper function to save the current entry when leaving a section
  const saveCurrentEntry = () => {
    if (!currentEntry) return;
    
    console.log(`🔍 Saving current entry in section: ${currentSection}`);
    
    if (currentSection === 'education' && (currentEntry.school || currentEntry.degree)) {
      educationEntries.push(currentEntry);
      console.log(`🔍 Education entry saved, total: ${educationEntries.length}`);
    } else if (currentSection === 'experience' && (currentEntry.title || currentEntry.company)) {
      experienceEntries.push(currentEntry);
      console.log(`🔍 Experience entry saved, total: ${experienceEntries.length}`);
      console.log(`🔍 Experience entry: title="${currentEntry.title}", company="${currentEntry.company}", bullets=${currentEntry.bullets.length}`);
    } else if (currentSection === 'projects' && currentEntry.name) {
      projectEntries.push(currentEntry);
      console.log(`🔍 Project entry saved, total: ${projectEntries.length}`);
    } else if (currentSection === 'activities' && currentEntry.title) {
      activityEntries.push(currentEntry);
      console.log(`🔍 Activity entry saved, total: ${activityEntries.length}`);
    } else if (currentSection === 'certifications' && currentEntry.name) {
      certificationEntries.push(currentEntry);
      console.log(`🔍 Certification entry saved, total: ${certificationEntries.length}`);
    }
    
    currentEntry = null;
  };
  
  while (i < cleanLines.length) {
    const line = cleanLines[i];
    const trimmedLine = line.trim();
    const nextLine = i + 1 < cleanLines.length ? cleanLines[i + 1].trim() : '';
    
    // Check for section headers (case-sensitive exact match)
    if (trimmedLine === 'PROFESSIONAL SUMMARY') {
      // Save any pending entry before changing sections
      saveCurrentEntry();
      currentSection = 'summary';
      console.log(`🔍 Entering section: SUMMARY (line ${i})`);
      i++;
      continue;
    } else if (trimmedLine === 'EDUCATION') {
      // Save any pending entry before changing sections
      saveCurrentEntry();
      currentSection = 'education';
      currentEntry = null;
      console.log(`🔍 Entering section: EDUCATION (line ${i})`);
      i++;
      continue;
    } else if (trimmedLine === 'EXPERIENCE') {
      // Save any pending entry before changing sections
      saveCurrentEntry();
      currentSection = 'experience';
      currentEntry = null;
      console.log(`🔍 Entering section: EXPERIENCE (line ${i})`);
      console.log(`🔍 Experience array before parsing: ${experienceEntries.length} entries`);
      i++;
      continue;
    } else if (trimmedLine === 'SKILLS') {
      // Save any pending entry before changing sections
      saveCurrentEntry();
      currentSection = 'skills';
      console.log(`🔍 Entering section: SKILLS (line ${i})`);
      i++;
      continue;
    } else if (trimmedLine === 'PROJECTS') {
      // Save any pending entry before changing sections
      saveCurrentEntry();
      currentSection = 'projects';
      currentEntry = null;
      console.log(`🔍 Entering section: PROJECTS (line ${i})`);
      i++;
      continue;
    } else if (trimmedLine === 'ACTIVITIES / LEADERSHIP / VOLUNTEER') {
      // Save any pending entry before changing sections
      saveCurrentEntry();
      currentSection = 'activities';
      currentEntry = null;
      console.log(`🔍 Entering section: ACTIVITIES (line ${i})`);
      i++;
      continue;
    } else if (trimmedLine === 'CERTIFICATIONS / AWARDS') {
      // Save any pending entry before changing sections
      saveCurrentEntry();
      currentSection = 'certifications';
      currentEntry = null;
      console.log(`🔍 Entering section: CERTIFICATIONS (line ${i})`);
      i++;
      continue;
    } else if (trimmedLine === 'References available on request') {
      // Save any pending entry before handling references
      saveCurrentEntry();
      cv.referencesOnRequest = true;
      console.log(`🔍 References enabled`);
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
        // It should be a single paragraph
        if (trimmedLine && trimmedLine !== 'PROFESSIONAL SUMMARY') {
          summaryText = trimmedLine;
          currentSection = null;
          console.log(`🔍 Summary: ${summaryText.substring(0, 50)}...`);
        }
        i++;
        break;
        
      case 'education':
        // Education entries have multiple lines:
        // Line 1: School Name, Location (or just School Name)
        // Line 2: Degree in Field (or just Degree)
        // Line 3: Year – Year (or just Year)
        // Line 4: GPA: value (optional)
        
        // If we don't have a current entry and this line doesn't look like a date or GPA
        if (!currentEntry && trimmedLine && 
            !trimmedLine.startsWith('GPA:') && 
            !trimmedLine.includes(' – ') && 
            !trimmedLine.match(/^\d{4}/)) {
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
          console.log(`🔍 Education: New entry created`);
        }
        
        if (currentEntry) {
          // Check if this is the school line (contains comma for location, or is a name)
          if (!currentEntry.school && trimmedLine && 
              !trimmedLine.startsWith('GPA:') && 
              !trimmedLine.includes(' – ') && 
              !trimmedLine.match(/^\d{4}/)) {
            if (trimmedLine.includes(',')) {
              const parts = trimmedLine.split(',').map(p => p.trim());
              currentEntry.school = parts[0];
              if (parts.length > 1) {
                currentEntry.location = parts.slice(1).join(', ');
              }
            } else {
              currentEntry.school = trimmedLine;
            }
            console.log(`🔍 Education: school = ${currentEntry.school}`);
            i++;
            continue;
          }
          
          // Check if this is the degree line (contains ' in ')
          if (!currentEntry.degree && trimmedLine && 
              trimmedLine.includes(' in ') && 
              !trimmedLine.startsWith('GPA:') && 
              !trimmedLine.includes(' – ')) {
            const parts = trimmedLine.split(' in ');
            currentEntry.degree = parts[0].trim();
            currentEntry.field = parts[1].trim();
            console.log(`🔍 Education: degree = ${currentEntry.degree}, field = ${currentEntry.field}`);
            i++;
            continue;
          }
          
          // Check if this is a degree line without 'in' but looks like a degree
          if (!currentEntry.degree && trimmedLine && 
              !trimmedLine.startsWith('GPA:') && 
              !trimmedLine.includes(' – ') && 
              !trimmedLine.match(/^\d{4}/) &&
              !trimmedLine.includes(',')) {
            currentEntry.degree = trimmedLine;
            console.log(`🔍 Education: degree = ${currentEntry.degree}`);
            i++;
            continue;
          }
          
          // Check if this is a date line (contains ' – ')
          if (!currentEntry.startYear && trimmedLine && trimmedLine.includes(' – ')) {
            const parts = trimmedLine.split(' – ').map(p => p.trim());
            if (parts.length === 2) {
              currentEntry.startYear = parts[0];
              currentEntry.endYear = parts[1];
              if (parts[1].toLowerCase().includes('present') || 
                  parts[1].toLowerCase().includes('current')) {
                currentEntry.isInProgress = true;
              }
            }
            console.log(`🔍 Education: startYear = ${currentEntry.startYear}, endYear = ${currentEntry.endYear}`);
            i++;
            continue;
          }
          
          // Check if this is a date line without ' – ' (single year)
          if (!currentEntry.startYear && trimmedLine && trimmedLine.match(/^\d{4}$/)) {
            currentEntry.startYear = trimmedLine;
            console.log(`🔍 Education: startYear = ${currentEntry.startYear}`);
            i++;
            continue;
          }
          
          // Check if this is a GPA line
          if (!currentEntry.gpa && trimmedLine.startsWith('GPA:')) {
            currentEntry.gpa = trimmedLine.replace('GPA:', '').trim();
            // Save the entry
            if (currentEntry.school || currentEntry.degree) {
              educationEntries.push(currentEntry);
              console.log(`🔍 Education: SAVED entry, total: ${educationEntries.length}`);
              currentEntry = null;
            }
            i++;
            continue;
          }
          
          // If we have a school but no degree, and we hit a date line
          if (currentEntry.school && !currentEntry.degree && trimmedLine && trimmedLine.includes(' – ')) {
            const parts = trimmedLine.split(' – ').map(p => p.trim());
            if (parts.length === 2) {
              currentEntry.startYear = parts[0];
              currentEntry.endYear = parts[1];
              if (parts[1].toLowerCase().includes('present') || 
                  parts[1].toLowerCase().includes('current')) {
                currentEntry.isInProgress = true;
              }
            }
            // Save entry
            if (currentEntry.school) {
              educationEntries.push(currentEntry);
              console.log(`🔍 Education: SAVED entry (school only), total: ${educationEntries.length}`);
              currentEntry = null;
            }
            i++;
            continue;
          }
          
          // If we've collected all fields, save and move on
          if (currentEntry.school && currentEntry.degree && currentEntry.startYear) {
            educationEntries.push(currentEntry);
            console.log(`🔍 Education: SAVED entry (complete), total: ${educationEntries.length}`);
            currentEntry = null;
            continue;
          }
        }
        
        // If we have a completed entry and hit an empty line or new section header
        if (currentEntry && (trimmedLine === '' || 
            trimmedLine === 'EXPERIENCE' || 
            trimmedLine === 'SKILLS' ||
            trimmedLine === 'PROJECTS')) {
          if (currentEntry.school || currentEntry.degree) {
            educationEntries.push(currentEntry);
            console.log(`🔍 Education: SAVED entry (on exit), total: ${educationEntries.length}`);
          }
          currentEntry = null;
        }
        
        i++;
        break;
        
      case 'experience':
        // EXPERIENCE SECTION - ADDING DETAILED DEBUG LOGGING
        console.log(`🔍 EXPERIENCE: Processing line ${i}: "${trimmedLine}"`);
        console.log(`🔍 EXPERIENCE: currentEntry exists? ${!!currentEntry}`);
        if (currentEntry) {
          console.log(`🔍 EXPERIENCE: currentEntry has title? ${!!currentEntry.title}, bullets: ${currentEntry.bullets.length}`);
        }
        console.log(`🔍 EXPERIENCE: experienceEntries length: ${experienceEntries.length}`);
        
        // Experience entries:
        // Line 1: Title - Company, Location
        // Line 2: StartDate – EndDate (or StartDate – Present)
        // Line 3+: • Bullet points
        // Empty line or new section ends the entry
        
        // Check if this is a new entry (title line contains ' - ')
        if (trimmedLine && trimmedLine.includes(' - ')) {
          console.log(`🔍 EXPERIENCE: Detected new entry: "${trimmedLine}"`);
          
          // If we have a current entry with data, save it before creating a new one
          if (currentEntry && (currentEntry.title || currentEntry.company || currentEntry.bullets.length > 0)) {
            console.log(`🔍 EXPERIENCE: SAVING previous entry before creating new one`);
            console.log(`🔍 EXPERIENCE: Previous entry: title="${currentEntry.title}", company="${currentEntry.company}", bullets=${currentEntry.bullets.length}`);
            experienceEntries.push(currentEntry);
            console.log(`🔍 EXPERIENCE: experienceEntries now has ${experienceEntries.length} entries`);
            currentEntry = null;
          }
          
          // Now create the new entry
          console.log(`🔍 EXPERIENCE: Creating new entry`);
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
          if (parts.length >= 1) {
            currentEntry.title = parts[0];
          }
          if (parts.length > 1) {
            const companyPart = parts[1];
            if (companyPart.includes(',')) {
              const companyParts = companyPart.split(',').map(p => p.trim());
              currentEntry.company = companyParts[0];
              if (companyParts.length > 1) {
                currentEntry.location = companyParts.slice(1).join(', ');
              }
            } else {
              currentEntry.company = companyPart;
            }
          }
          console.log(`🔍 EXPERIENCE: New entry created: title="${currentEntry.title}", company="${currentEntry.company}"`);
          console.log(`🔍 EXPERIENCE: experienceEntries still has ${experienceEntries.length} entries`);
          i++;
          continue;
        }
        
        if (currentEntry) {
          // Check if this is a date line (contains ' – ')
          if (!currentEntry.startDate && trimmedLine && trimmedLine.includes(' – ')) {
            const parts = trimmedLine.split(' – ').map(p => p.trim());
            if (parts.length === 2) {
              currentEntry.startDate = parts[0];
              currentEntry.endDate = parts[1];
              if (parts[1].toLowerCase().includes('present') || 
                  parts[1].toLowerCase().includes('current')) {
                currentEntry.isCurrent = true;
              }
            }
            console.log(`🔍 EXPERIENCE: Date set: start="${currentEntry.startDate}", end="${currentEntry.endDate}"`);
            i++;
            continue;
          }
          
          // Check if this is a date line without ' – ' (single date or "Present")
          if (!currentEntry.startDate && trimmedLine && 
              (trimmedLine.match(/^\w+\s+\d{4}/) || 
               trimmedLine.match(/^\d{4}/) || 
               trimmedLine.toLowerCase().includes('present'))) {
            if (trimmedLine.toLowerCase().includes('present')) {
              currentEntry.startDate = trimmedLine;
            } else {
              currentEntry.startDate = trimmedLine;
            }
            console.log(`🔍 EXPERIENCE: Date set (single): "${currentEntry.startDate}"`);
            i++;
            continue;
          }
          
          // Check if this is a bullet point (starts with '•')
          if (trimmedLine.startsWith('•')) {
            const bullet = trimmedLine.replace(/^•\s*/, '').trim();
            if (bullet) {
              currentEntry.bullets.push(bullet);
              console.log(`🔍 EXPERIENCE: Bullet added: "${bullet}" (total: ${currentEntry.bullets.length})`);
            }
            i++;
            continue;
          }
          
          // If we hit a line that doesn't match any pattern, it might be a continuation
          // or a new section. Save the entry and handle the line in the next iteration.
          if (currentEntry.bullets.length > 0 || currentEntry.title) {
            console.log(`🔍 EXPERIENCE: Unmatched line "${trimmedLine}" - saving current entry`);
            if (currentEntry.title || currentEntry.company) {
              experienceEntries.push(currentEntry);
              console.log(`🔍 EXPERIENCE: SAVED entry (unmatched line), total: ${experienceEntries.length}`);
              currentEntry = null;
            }
            continue;
          }
        }
        
        // If we have a completed entry and hit a new section header
        // NOTE: The saveCurrentEntry() function called at the top of the loop
        // will handle saving the current entry when leaving the section.
        // This condition is kept for when we encounter a new section header
        // but the top-level check will also handle it.
        if (currentEntry && (trimmedLine === 'SKILLS' || 
            trimmedLine === 'PROJECTS' ||
            trimmedLine === 'ACTIVITIES' ||
            trimmedLine === 'CERTIFICATIONS')) {
          console.log(`🔍 EXPERIENCE: Hit new section "${trimmedLine}" - saving current entry`);
          if (currentEntry.title || currentEntry.company) {
            experienceEntries.push(currentEntry);
            console.log(`🔍 EXPERIENCE: SAVED entry (new section), total: ${experienceEntries.length}`);
          }
          currentEntry = null;
        }
        
        i++;
        break;
        
      case 'skills':
        if (trimmedLine.startsWith('Technical:')) {
          const tech = trimmedLine.replace('Technical:', '').trim();
          skillsTechnical = tech ? tech.split(',').map(s => s.trim()).filter(s => s) : [];
          console.log(`🔍 Skills: Technical: ${skillsTechnical.length} items`);
        } else if (trimmedLine.startsWith('Languages:')) {
          const langs = trimmedLine.replace('Languages:', '').trim();
          skillsLanguages = langs ? langs.split(',').map(s => s.trim()).filter(s => s) : [];
          console.log(`🔍 Skills: Languages: ${skillsLanguages.length} items`);
        } else if (trimmedLine.startsWith('Other:')) {
          const other = trimmedLine.replace('Other:', '').trim();
          skillsOther = other ? other.split(',').map(s => s.trim()).filter(s => s) : [];
          console.log(`🔍 Skills: Other: ${skillsOther.length} items`);
        }
        i++;
        break;
        
      case 'projects':
        // Projects entries:
        // Line 1: Project Name - Role
        // Line 2: Technologies: tech1, tech2 (optional)
        // Line 3+: Description (may span multiple lines)
        // Empty line or new section ends the entry
        
        // Check if this is a new entry (contains ' - ')
        if (trimmedLine && trimmedLine.includes(' - ')) {
          // If we have a current entry with data, save it before creating a new one
          if (currentEntry && currentEntry.name) {
            projectEntries.push(currentEntry);
            console.log(`🔍 Projects: SAVED entry, total: ${projectEntries.length}`);
            currentEntry = null;
          }
          
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
          console.log(`🔍 Projects: New entry: "${currentEntry.name}"`);
          i++;
          continue;
        }
        
        if (currentEntry) {
          // Check if this is a technologies line
          if (trimmedLine.startsWith('Technologies:')) {
            const tech = trimmedLine.replace('Technologies:', '').trim();
            currentEntry.tech = tech ? tech.split(',').map(s => s.trim()).filter(s => s) : [];
            console.log(`🔍 Projects: Technologies: ${currentEntry.tech.length} items`);
            i++;
            continue;
          }
          
          // Check if this is a description line (not a header, not a new entry)
          if (!currentEntry.description && trimmedLine && 
              !trimmedLine.startsWith('Technologies:') && 
              !trimmedLine.includes(' - ')) {
            currentEntry.description = trimmedLine;
            // Save the entry
            if (currentEntry.name) {
              projectEntries.push(currentEntry);
              console.log(`🔍 Projects: SAVED entry with description, total: ${projectEntries.length}`);
              currentEntry = null;
            }
            i++;
            continue;
          }
          
          // If we already have a description and hit a new section, save
          if (currentEntry.description && 
              (trimmedLine === 'ACTIVITIES' || 
               trimmedLine === 'CERTIFICATIONS' ||
               trimmedLine === 'References available on request')) {
            if (currentEntry.name) {
              projectEntries.push(currentEntry);
              console.log(`🔍 Projects: SAVED entry (new section), total: ${projectEntries.length}`);
              currentEntry = null;
            }
          }
        }
        
        // If we have a completed entry and hit an empty line or new section
        if (currentEntry && currentEntry.name && 
            (trimmedLine === '' || 
             trimmedLine === 'ACTIVITIES' || 
             trimmedLine === 'CERTIFICATIONS')) {
          projectEntries.push(currentEntry);
          console.log(`🔍 Projects: SAVED entry (empty line), total: ${projectEntries.length}`);
          currentEntry = null;
        }
        
        i++;
        break;
        
      case 'activities':
        // Activities entries:
        // Line 1: Title - Organization
        // Line 2+: Description (may span multiple lines)
        // Empty line or new section ends the entry
        
        // Check if this is a new entry (contains ' - ')
        if (trimmedLine && trimmedLine.includes(' - ')) {
          // If we have a current entry with data, save it before creating a new one
          if (currentEntry && currentEntry.title) {
            activityEntries.push(currentEntry);
            console.log(`🔍 Activities: SAVED entry, total: ${activityEntries.length}`);
            currentEntry = null;
          }
          
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
          console.log(`🔍 Activities: New entry: "${currentEntry.title}"`);
          i++;
          continue;
        }
        
        if (currentEntry) {
          // Check if this is a description line
          if (!currentEntry.description && trimmedLine && 
              !trimmedLine.includes(' - ') &&
              trimmedLine !== 'CERTIFICATIONS' &&
              trimmedLine !== 'References available on request') {
            currentEntry.description = trimmedLine;
            // Save the entry
            if (currentEntry.title) {
              activityEntries.push(currentEntry);
              console.log(`🔍 Activities: SAVED entry with description, total: ${activityEntries.length}`);
              currentEntry = null;
            }
            i++;
            continue;
          }
          
          // If we hit a new section, save and continue
          if (currentEntry.title && 
              (trimmedLine === 'CERTIFICATIONS' || 
               trimmedLine === 'References available on request')) {
            activityEntries.push(currentEntry);
            console.log(`🔍 Activities: SAVED entry (new section), total: ${activityEntries.length}`);
            currentEntry = null;
          }
        }
        
        // If we have a completed entry and hit an empty line or new section
        if (currentEntry && currentEntry.title && 
            (trimmedLine === '' || 
             trimmedLine === 'CERTIFICATIONS' || 
             trimmedLine === 'References available on request')) {
          activityEntries.push(currentEntry);
          console.log(`🔍 Activities: SAVED entry (empty line), total: ${activityEntries.length}`);
          currentEntry = null;
        }
        
        i++;
        break;
        
      case 'certifications':
        // Certifications entries are single lines:
        // Name - Issuer (Year)
        if (trimmedLine && trimmedLine.includes(' - ')) {
          const entry = {
            name: null,
            issuer: null,
            year: null,
          };
          
          const parts = trimmedLine.split(' - ').map(p => p.trim());
          entry.name = parts[0];
          if (parts.length > 1) {
            const issuerPart = parts[1];
            const yearMatch = issuerPart.match(/\((\d{4})\)/);
            if (yearMatch) {
              entry.year = yearMatch[1];
              entry.issuer = issuerPart.replace(/\(.*\)/, '').trim();
            } else {
              entry.issuer = issuerPart;
            }
          }
          if (entry.name) {
            certificationEntries.push(entry);
            console.log(`🔍 Certifications: Added "${entry.name}"`);
          }
        }
        i++;
        break;
        
      default:
        i++;
        break;
    }
  }
  
  console.log('🔍 Section parsing completed');
  
  // Save any remaining entries (end of file reached)
  // The saveCurrentEntry() helper will handle this
  console.log(`🔍 Saving final entry before returning (currentSection: ${currentSection})`);
  saveCurrentEntry();
  
  console.log('🔍 FINAL EXPERIENCE ENTRIES:', experienceEntries.length);
  experienceEntries.forEach((exp, idx) => {
    console.log(`🔍 Experience ${idx + 1}: title="${exp.title}", company="${exp.company}", bullets=${exp.bullets.length}`);
  });
  
  // Assign parsed data to CV object
  cv.summary = summaryText;
  cv.education = educationEntries;
  cv.experience = experienceEntries;
  cv.projects = projectEntries;
  cv.activities = activityEntries;
  cv.certifications = certificationEntries;
  cv.skills.technical = skillsTechnical;
  cv.skills.languages = skillsLanguages;
  cv.skills.other = skillsOther;
  
  console.log('🔍 CV object assembled with experience:', cv.experience.length);
  
  // Validate required sections
  const errors = [];
  if (!cv.personal.fullName) errors.push('Full name is required');
  if (!cv.targetRole) errors.push('Professional title is required');
  if (!cv.summary) errors.push('Professional summary is required');
  if (cv.education.length === 0) errors.push('At least one education entry is required');
  
  if (errors.length > 0) {
    console.error('🔍 Validation errors:', errors);
    throw new Error(`Missing required sections: ${errors.join(', ')}`);
  }
  
  console.log('🔍 Recovery parsing complete - experience count:', cv.experience.length);
  console.log('🔍 EXPERIENCE DATA:', JSON.stringify(cv.experience, null, 2));
  
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