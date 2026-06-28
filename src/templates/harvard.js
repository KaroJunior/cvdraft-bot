/**
 * Generates Harvard-style HTML template for CV
 * ATS-friendly with clean formatting
 */
function generateHTML(cvData) {
  const { personal, targetRole, summary, education, experience, skills, projects, activities, certifications, referencesOnRequest } = cvData;
  
  // Escape HTML to prevent injection
  const escape = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  // Build sections
  let sections = [];
  
  // 1. Personal details header
  let header = [];
  if (personal.fullName) {
    header.push(`<h1>${escape(personal.fullName)}</h1>`);
  }
  if (targetRole) {
    header.push(`<h2>${escape(targetRole)}</h2>`);
  }
  
  let contactLine = [];
  if (personal.phone) contactLine.push(escape(personal.phone));
  if (personal.email) contactLine.push(escape(personal.email));
  if (personal.location) contactLine.push(escape(personal.location));
  if (personal.linkedin) contactLine.push(escape(personal.linkedin));
  if (personal.website) contactLine.push(escape(personal.website));
  if (contactLine.length > 0) {
    header.push(`<p class="contact">${contactLine.join(' | ')}</p>`);
  }
  
  if (header.length > 0) {
    sections.push(header.join('\n'));
  }
  
  // 2. Professional Summary
  if (summary) {
    let summaryHTML = [];
    summaryHTML.push(`<h3>Professional Summary</h3>`);
    summaryHTML.push(`<p>${escape(summary)}</p>`);
    sections.push(summaryHTML.join('\n'));
  }
  
  // 3. Education
  if (education && education.length > 0) {
    let eduHTML = [];
    eduHTML.push(`<h3>Education</h3>`);
    education.forEach((edu, index) => {
      let lines = [];
      
      if (edu.school) {
        let schoolLine = escape(edu.school);
        if (edu.location) schoolLine += `, ${escape(edu.location)}`;
        lines.push(`<p class="edu-school">${schoolLine}</p>`);
      }
      
      let degreeLine = '';
      if (edu.degree) {
        degreeLine += escape(edu.degree);
        if (edu.field) degreeLine += ` in ${escape(edu.field)}`;
        lines.push(`<p class="edu-degree">${degreeLine}</p>`);
      } else if (edu.field) {
        lines.push(`<p class="edu-degree">${escape(edu.field)}</p>`);
      }
      
      let dateRange = '';
      if (edu.startYear || edu.endYear) {
        if (edu.startYear) dateRange += escape(edu.startYear);
        if (edu.endYear) {
          if (dateRange) dateRange += ' – ';
          dateRange += escape(edu.endYear);
        }
        if (dateRange) lines.push(`<p class="edu-date">${dateRange}</p>`);
      }
      
      if (edu.gpa) {
        lines.push(`<p class="edu-gpa">GPA: ${escape(edu.gpa)}</p>`);
      }
      
      // Add spacing between entries
      if (index < education.length - 1) {
        lines.push(`<hr class="section-divider">`);
      }
      
      eduHTML.push(`<div class="education-entry">${lines.join('\n')}</div>`);
    });
    sections.push(eduHTML.join('\n'));
  }
  
  // 4. Experience
  if (experience && experience.length > 0) {
    let expHTML = [];
    expHTML.push(`<h3>Experience</h3>`);
    experience.forEach((exp, index) => {
      let lines = [];
      
      let titleLine = '';
      if (exp.title) {
        titleLine += escape(exp.title);
        if (exp.company) titleLine += ` - ${escape(exp.company)}`;
        if (exp.location) titleLine += `, ${escape(exp.location)}`;
        lines.push(`<p class="exp-title">${titleLine}</p>`);
      } else if (exp.company) {
        let companyLine = escape(exp.company);
        if (exp.location) companyLine += `, ${escape(exp.location)}`;
        lines.push(`<p class="exp-title">${companyLine}</p>`);
      }
      
      let dateRange = '';
      if (exp.startDate || exp.endDate) {
        if (exp.startDate) dateRange += escape(exp.startDate);
        if (exp.endDate) {
          if (dateRange) dateRange += ' – ';
          dateRange += escape(exp.endDate);
        } else if (exp.isCurrent) {
          if (dateRange) dateRange += ' – ';
          dateRange += 'Present';
        }
        if (dateRange) lines.push(`<p class="exp-date">${dateRange}</p>`);
      }
      
      if (exp.bullets && exp.bullets.length > 0) {
        let bulletList = [];
        exp.bullets.forEach(bullet => {
          let cleanBullet = bullet.trim();
          cleanBullet = cleanBullet.replace(/^[•·●◦▪▫◆◇►▶]+\s*/, '');
          bulletList.push(`<li>${escape(cleanBullet)}</li>`);
        });
        lines.push(`<ul class="exp-bullets">${bulletList.join('\n')}</ul>`);
      }
      
      if (index < experience.length - 1) {
        lines.push(`<hr class="section-divider">`);
      }
      
      expHTML.push(`<div class="experience-entry">${lines.join('\n')}</div>`);
    });
    sections.push(expHTML.join('\n'));
  }
  
  // 5. Skills
  const hasSkills = (skills.technical && skills.technical.length > 0) ||
                   (skills.languages && skills.languages.length > 0) ||
                   (skills.other && skills.other.length > 0);
  
  if (hasSkills) {
    let skillLines = [];
    skillLines.push(`<h3>Skills</h3>`);
    
    if (skills.technical && skills.technical.length > 0) {
      skillLines.push(`<p><span class="skill-label">Technical:</span> ${escape(skills.technical.join(', '))}</p>`);
    }
    if (skills.languages && skills.languages.length > 0) {
      skillLines.push(`<p><span class="skill-label">Languages:</span> ${escape(skills.languages.join(', '))}</p>`);
    }
    if (skills.other && skills.other.length > 0) {
      skillLines.push(`<p><span class="skill-label">Other:</span> ${escape(skills.other.join(', '))}</p>`);
    }
    
    sections.push(skillLines.join('\n'));
  }
  
  // 6. Projects
  if (projects && projects.length > 0) {
    let projHTML = [];
    projHTML.push(`<h3>Projects</h3>`);
    projects.forEach((project, index) => {
      let lines = [];
      
      if (project.name) {
        let nameLine = escape(project.name);
        if (project.role) nameLine += ` - ${escape(project.role)}`;
        lines.push(`<p class="project-name">${nameLine}</p>`);
      } else if (project.role) {
        lines.push(`<p class="project-name">${escape(project.role)}</p>`);
      }
      
      if (project.tech && project.tech.length > 0) {
        lines.push(`<p class="project-tech">Technologies: ${escape(project.tech.join(', '))}</p>`);
      }
      
      if (project.description) {
        lines.push(`<p class="project-desc">${escape(project.description)}</p>`);
      }
      
      if (index < projects.length - 1) {
        lines.push(`<hr class="section-divider">`);
      }
      
      projHTML.push(`<div class="project-entry">${lines.join('\n')}</div>`);
    });
    sections.push(projHTML.join('\n'));
  }
  
  // 7. Activities
  if (activities && activities.length > 0) {
    let actHTML = [];
    actHTML.push(`<h3>Activities / Leadership / Volunteer</h3>`);
    activities.forEach((activity, index) => {
      let lines = [];
      
      if (activity.title) {
        let titleLine = escape(activity.title);
        if (activity.organization) titleLine += ` - ${escape(activity.organization)}`;
        lines.push(`<p class="activity-title">${titleLine}</p>`);
      } else if (activity.organization) {
        lines.push(`<p class="activity-title">${escape(activity.organization)}</p>`);
      }
      
      if (activity.description) {
        lines.push(`<p class="activity-desc">${escape(activity.description)}</p>`);
      }
      
      if (index < activities.length - 1) {
        lines.push(`<hr class="section-divider">`);
      }
      
      actHTML.push(`<div class="activity-entry">${lines.join('\n')}</div>`);
    });
    sections.push(actHTML.join('\n'));
  }
  
  // 8. Certifications
  if (certifications && certifications.length > 0) {
    let certHTML = [];
    certHTML.push(`<h3>Certifications / Awards</h3>`);
    certifications.forEach((cert, index) => {
      let lines = [];
      
      if (cert.name) {
        let nameLine = escape(cert.name);
        if (cert.issuer) nameLine += ` - ${escape(cert.issuer)}`;
        if (cert.year) nameLine += ` (${escape(cert.year)})`;
        lines.push(`<p class="cert-name">${nameLine}</p>`);
      } else if (cert.issuer) {
        let issuerLine = escape(cert.issuer);
        if (cert.year) issuerLine += ` (${escape(cert.year)})`;
        lines.push(`<p class="cert-name">${issuerLine}</p>`);
      } else if (cert.year) {
        lines.push(`<p class="cert-name">${escape(cert.year)}</p>`);
      }
      
      if (index < certifications.length - 1) {
        lines.push(`<hr class="section-divider">`);
      }
      
      certHTML.push(`<div class="cert-entry">${lines.join('\n')}</div>`);
    });
    sections.push(certHTML.join('\n'));
  }
  
  // 9. References
  if (referencesOnRequest) {
    sections.push(`<p class="references">References available on request</p>`);
  }
  
  // Build full HTML document
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - ${escape(personal.fullName || '')}</title>
  <style>
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica', 'Arial', 'Calibri', sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000000;
      background: #ffffff;
      padding: 60px 60px;
      max-width: 1000px;
      margin: 0 auto;
    }
    
    /* Header styles */
    h1 {
      font-size: 20pt;
      font-weight: bold;
      letter-spacing: 1px;
      margin-bottom: 4px;
      text-transform: uppercase;
      color: #000000;
    }
    
    h2 {
      font-size: 13pt;
      font-weight: normal;
      margin-bottom: 4px;
      color: #000000;
    }
    
    .contact {
      font-size: 10.5pt;
      margin-top: 2px;
      margin-bottom: 12px;
      color: #000000;
    }
    
    /* Section heading styles */
    h3 {
      font-size: 13pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #000000;
      padding-bottom: 3px;
      margin-top: 14px;
      margin-bottom: 8px;
      color: #000000;
    }
    
    /* Education styles */
    .education-entry {
      margin-bottom: 6px;
    }
    
    .edu-school {
      font-weight: bold;
      font-size: 11.5pt;
      margin-bottom: 1px;
    }
    
    .edu-degree {
      font-size: 11pt;
      margin-bottom: 1px;
    }
    
    .edu-date {
      font-size: 10.5pt;
      color: #333333;
      margin-bottom: 1px;
    }
    
    .edu-gpa {
      font-size: 10.5pt;
      margin-bottom: 1px;
    }
    
    /* Experience styles */
    .experience-entry {
      margin-bottom: 6px;
    }
    
    .exp-title {
      font-weight: bold;
      font-size: 11.5pt;
      margin-bottom: 1px;
    }
    
    .exp-date {
      font-size: 10.5pt;
      color: #333333;
      margin-bottom: 2px;
    }
    
    .exp-bullets {
      list-style-type: none;
      padding-left: 2px;
      margin-top: 2px;
      margin-bottom: 2px;
    }
    
    .exp-bullets li {
      font-size: 10.5pt;
      padding-left: 12px;
      position: relative;
      margin-bottom: 1px;
      line-height: 1.3;
    }
    
    .exp-bullets li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #000000;
    }
    
    /* Skills styles */
    .skill-label {
      font-weight: bold;
    }
    
    /* Project styles */
    .project-entry {
      margin-bottom: 6px;
    }
    
    .project-name {
      font-weight: bold;
      font-size: 11.5pt;
      margin-bottom: 1px;
    }
    
    .project-tech {
      font-size: 10.5pt;
      color: #333333;
      margin-bottom: 1px;
    }
    
    .project-desc {
      font-size: 10.5pt;
      margin-top: 1px;
    }
    
    /* Activity styles */
    .activity-entry {
      margin-bottom: 6px;
    }
    
    .activity-title {
      font-weight: bold;
      font-size: 11.5pt;
      margin-bottom: 1px;
    }
    
    .activity-desc {
      font-size: 10.5pt;
      margin-top: 1px;
    }
    
    /* Certification styles */
    .cert-entry {
      margin-bottom: 6px;
    }
    
    .cert-name {
      font-size: 11pt;
      margin-bottom: 1px;
    }
    
    /* References */
    .references {
      font-size: 11pt;
      margin-top: 14px;
      font-weight: normal;
    }
    
    /* Divider between entries */
    .section-divider {
      border: none;
      border-top: 1px solid #e0e0e0;
      margin: 4px 0;
    }
    
    /* Print optimization */
    @media print {
      body {
        padding: 40px 50px;
      }
      
      .section-divider {
        border-top: 1px solid #cccccc;
      }
      
      h3 {
        border-bottom: 1px solid #000000;
      }
    }
    
    /* Ensure consistent spacing */
    p {
      margin-bottom: 1px;
    }
  </style>
</head>
<body>
  ${sections.join('\n\n')}
</body>
</html>`;
}

module.exports = {
  generateHTML,
};