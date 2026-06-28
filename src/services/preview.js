/**
 * Generates a plain-text CV preview from session data
 */
function generateCVPreview(session) {
  const { cv } = session;
  const { personal, targetRole, summary, education, experience, skills, projects, activities, certifications, referencesOnRequest } = cv;
  
  let preview = [];
  
  // 1. Full name
  if (personal.fullName) {
    preview.push(personal.fullName.toUpperCase());
  }
  
  // 2. Target role as subtitle - ONLY if it exists and is not empty
  if (targetRole && targetRole.trim().length > 0) {
    preview.push(targetRole);
    preview.push(''); // Empty line after subtitle
  } else {
    // If no target role, add empty line after name
    preview.push('');
  }
  
  // 3. Contact line
  const contactItems = [];
  if (personal.phone) contactItems.push(personal.phone);
  if (personal.email) contactItems.push(personal.email);
  if (personal.location) contactItems.push(personal.location);
  if (personal.linkedin) contactItems.push(personal.linkedin);
  if (personal.website) contactItems.push(personal.website);
  
  if (contactItems.length > 0) {
    preview.push(contactItems.join(' | '));
    preview.push(''); // Empty line after contact
  }
  
  // 4. Professional Summary
  if (summary) {
    preview.push('PROFESSIONAL SUMMARY');
    preview.push(summary);
    preview.push(''); // Empty line after summary
  }
  
  // 5. Education
  if (education && education.length > 0) {
    preview.push('EDUCATION');
    education.forEach((edu, index) => {
      let lines = [];
      if (edu.school) {
        let schoolLine = edu.school;
        if (edu.location) schoolLine += `, ${edu.location}`;
        lines.push(schoolLine);
      }
      
      let degreeLine = '';
      if (edu.degree) {
        degreeLine += edu.degree;
        if (edu.field) degreeLine += ` in ${edu.field}`;
        lines.push(degreeLine);
      } else if (edu.field) {
        lines.push(edu.field);
      }
      
      // Date range
      let dateRange = '';
      if (edu.startYear || edu.endYear) {
        if (edu.startYear) dateRange += edu.startYear;
        if (edu.endYear) {
          if (dateRange) dateRange += ' – ';
          dateRange += edu.endYear;
        }
        if (dateRange) lines.push(dateRange);
      }
      
      // GPA
      if (edu.gpa) {
        lines.push(`GPA: ${edu.gpa}`);
      }
      
      preview.push(lines.join('\n'));
      if (index < education.length - 1) preview.push(''); // Empty line between entries
    });
    preview.push(''); // Empty line after education section
  }
  
  // 6. Experience - FIXED: Single bullet symbol
  if (experience && experience.length > 0) {
    preview.push('EXPERIENCE');
    experience.forEach((exp, index) => {
      let lines = [];
      
      if (exp.title) {
        let titleLine = exp.title;
        if (exp.company) titleLine += ` - ${exp.company}`;
        if (exp.location) titleLine += `, ${exp.location}`;
        lines.push(titleLine);
      } else if (exp.company) {
        let companyLine = exp.company;
        if (exp.location) companyLine += `, ${exp.location}`;
        lines.push(companyLine);
      }
      
      // Date range
      let dateRange = '';
      if (exp.startDate || exp.endDate) {
        if (exp.startDate) dateRange += exp.startDate;
        if (exp.endDate) {
          if (dateRange) dateRange += ' – ';
          dateRange += exp.endDate;
        } else if (exp.isCurrent) {
          if (dateRange) dateRange += ' – ';
          dateRange += 'Present';
        }
        if (dateRange) lines.push(dateRange);
      }
      
      // Bullets - FIXED: Ensure single bullet symbol
      if (exp.bullets && exp.bullets.length > 0) {
        exp.bullets.forEach(bullet => {
          // Clean bullet: remove any existing bullet symbols
          let cleanBullet = bullet.trim();
          // Remove common bullet prefixes if they exist
          cleanBullet = cleanBullet.replace(/^[•·●◦▪▫◆◇►▶]+\s*/, '');
          // Add a single bullet symbol
          lines.push(`• ${cleanBullet}`);
        });
      }
      
      preview.push(lines.join('\n'));
      if (index < experience.length - 1) preview.push(''); // Empty line between entries
    });
    preview.push(''); // Empty line after experience section
  }
  
  // 7. Skills
  const hasSkills = (skills.technical && skills.technical.length > 0) ||
                   (skills.languages && skills.languages.length > 0) ||
                   (skills.other && skills.other.length > 0);
  
  if (hasSkills) {
    preview.push('SKILLS');
    const skillLines = [];
    
    if (skills.technical && skills.technical.length > 0) {
      skillLines.push(`Technical: ${skills.technical.join(', ')}`);
    }
    if (skills.languages && skills.languages.length > 0) {
      skillLines.push(`Languages: ${skills.languages.join(', ')}`);
    }
    if (skills.other && skills.other.length > 0) {
      skillLines.push(`Other: ${skills.other.join(', ')}`);
    }
    
    preview.push(skillLines.join('\n'));
    preview.push(''); // Empty line after skills section
  }
  
  // 8. Projects
  if (projects && projects.length > 0) {
    preview.push('PROJECTS');
    projects.forEach((project, index) => {
      let lines = [];
      
      if (project.name) {
        let nameLine = project.name;
        if (project.role) nameLine += ` - ${project.role}`;
        lines.push(nameLine);
      } else if (project.role) {
        lines.push(project.role);
      }
      
      if (project.tech && project.tech.length > 0) {
        lines.push(`Technologies: ${project.tech.join(', ')}`);
      }
      
      if (project.description) {
        lines.push(project.description);
      }
      
      preview.push(lines.join('\n'));
      if (index < projects.length - 1) preview.push(''); // Empty line between entries
    });
    preview.push(''); // Empty line after projects section
  }
  
  // 9. Activities
  if (activities && activities.length > 0) {
    preview.push('ACTIVITIES / LEADERSHIP / VOLUNTEER');
    activities.forEach((activity, index) => {
      let lines = [];
      
      if (activity.title) {
        let titleLine = activity.title;
        if (activity.organization) titleLine += ` - ${activity.organization}`;
        lines.push(titleLine);
      } else if (activity.organization) {
        lines.push(activity.organization);
      }
      
      if (activity.description) {
        lines.push(activity.description);
      }
      
      preview.push(lines.join('\n'));
      if (index < activities.length - 1) preview.push(''); // Empty line between entries
    });
    preview.push(''); // Empty line after activities section
  }
  
  // 10. Certifications
  if (certifications && certifications.length > 0) {
    preview.push('CERTIFICATIONS / AWARDS');
    certifications.forEach((cert, index) => {
      let lines = [];
      
      if (cert.name) {
        let nameLine = cert.name;
        if (cert.issuer) nameLine += ` - ${cert.issuer}`;
        if (cert.year) nameLine += ` (${cert.year})`;
        lines.push(nameLine);
      } else if (cert.issuer) {
        let issuerLine = cert.issuer;
        if (cert.year) issuerLine += ` (${cert.year})`;
        lines.push(issuerLine);
      } else if (cert.year) {
        lines.push(cert.year);
      }
      
      preview.push(lines.join('\n'));
      if (index < certifications.length - 1) preview.push(''); // Empty line between entries
    });
    preview.push(''); // Empty line after certifications section
  }
  
  // 11. References
  if (referencesOnRequest) {
    preview.push('References available on request');
  }
  
  // Clean up trailing whitespace and join
  return preview.join('\n').trim();
}

module.exports = {
  generateCVPreview,
};