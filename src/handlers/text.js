const {
  PERSONAL_FULL_NAME,
  PERSONAL_PHONE,
  PERSONAL_EMAIL,
  PERSONAL_LOCATION,
  PERSONAL_LINKEDIN,
  PERSONAL_WEBSITE,
  TARGET_ROLE,
  SUMMARY_MODE,
  SUMMARY_MANUAL,
  SUMMARY_BG,
  SUMMARY_STRENGTHS,
  SUMMARY_GOAL,
  SUMMARY_HIGHLIGHT,
  EDUCATION_INTRO,
  EDUCATION_SCHOOL,
  EDUCATION_DEGREE,
  EDUCATION_FIELD,
  EDUCATION_LOCATION,
  EDUCATION_START_YEAR,
  EDUCATION_END_YEAR,
  EDUCATION_GPA,
  EDUCATION_COMPLETE,
  EXPERIENCE_INTRO,
  EXPERIENCE_TITLE,
  EXPERIENCE_COMPANY,
  EXPERIENCE_LOCATION,
  EXPERIENCE_START_DATE,
  EXPERIENCE_END_DATE,
  EXPERIENCE_BULLET,
  EXPERIENCE_BULLET_ACTION,
  EXPERIENCE_COMPLETE,
  SKILLS_INTRO,
  SKILLS_TECHNICAL,
  SKILLS_LANGUAGES,
  SKILLS_OTHER,
  PROJECTS_INTRO,
  PROJECTS_NAME,
  PROJECTS_ROLE,
  PROJECTS_TECH,
  PROJECTS_DESCRIPTION,
  PROJECTS_COMPLETE,
  ACTIVITIES_INTRO,
  ACTIVITIES_TITLE,
  ACTIVITIES_ORGANIZATION,
  ACTIVITIES_DESCRIPTION,
  ACTIVITIES_COMPLETE,
  CERTIFICATIONS_INTRO,
  CERTIFICATIONS_NAME,
  CERTIFICATIONS_ISSUER,
  CERTIFICATIONS_YEAR,
  CERTIFICATIONS_COMPLETE,
  REFERENCES_INTRO,
  PREVIEW,
  EDIT_MENU,
  EDIT_PERSONAL,
  EDIT_SUMMARY,
  EDIT_EDUCATION,
  EDIT_EXPERIENCE,
  EDIT_SKILLS,
  EDIT_PROJECTS,
  EDIT_ACTIVITIES,
  EDIT_CERTIFICATIONS,
  EDIT_REFERENCES,
  EDIT_FINISH,
  COMPLETED,
} = require('../constants/steps');

const { 
  isNotEmpty, 
  isValidEmail, 
  isValidPhone, 
  isSkip, 
  isValidLinkedIn, 
  isValidUrl,
  parseCommaSeparated,
  isValidYear
} = require('../utils/validation');

const { generateSummary } = require('../services/summary');
const { generateCVPreview } = require('../services/preview');
const { Markup } = require('telegraf');

/**
 * Handle text messages during the interview flow
 */
function handleText(ctx) {
  const session = ctx.session;
  const currentStep = session.flow.currentStep;
  const text = ctx.message.text.trim();
  
  if (!currentStep) {
    return ctx.reply('Please use /start to begin the CV creation process.');
  }
  
  switch (currentStep) {
    // Phase 1 steps
    case PERSONAL_FULL_NAME:
      return handleFullName(ctx, text);
    case PERSONAL_PHONE:
      return handlePhone(ctx, text);
    case PERSONAL_EMAIL:
      return handleEmail(ctx, text);
    case PERSONAL_LOCATION:
      return handleLocation(ctx, text);
    case PERSONAL_LINKEDIN:
      return handleLinkedIn(ctx, text);
    case PERSONAL_WEBSITE:
      return handleWebsite(ctx, text);
    case TARGET_ROLE:
      return handleTargetRole(ctx, text);
    case SUMMARY_MANUAL:
      return handleManualSummary(ctx, text);
    case SUMMARY_BG:
      return handleSummaryBackground(ctx, text);
    case SUMMARY_STRENGTHS:
      return handleSummaryStrengths(ctx, text);
    case SUMMARY_GOAL:
      return handleSummaryGoal(ctx, text);
    case SUMMARY_HIGHLIGHT:
      return handleSummaryHighlight(ctx, text);
    
    // Phase 2 - Education
    case EDUCATION_SCHOOL:
      return handleEducationSchool(ctx, text);
    case EDUCATION_DEGREE:
      return handleEducationDegree(ctx, text);
    case EDUCATION_FIELD:
      return handleEducationField(ctx, text);
    case EDUCATION_LOCATION:
      return handleEducationLocation(ctx, text);
    case EDUCATION_START_YEAR:
      return handleEducationStartYear(ctx, text);
    case EDUCATION_END_YEAR:
      return handleEducationEndYear(ctx, text);
    case EDUCATION_GPA:
      return handleEducationGPA(ctx, text);
    
    // Phase 2 - Experience
    case EXPERIENCE_TITLE:
      return handleExperienceTitle(ctx, text);
    case EXPERIENCE_COMPANY:
      return handleExperienceCompany(ctx, text);
    case EXPERIENCE_LOCATION:
      return handleExperienceLocation(ctx, text);
    case EXPERIENCE_START_DATE:
      return handleExperienceStartDate(ctx, text);
    case EXPERIENCE_END_DATE:
      return handleExperienceEndDate(ctx, text);
    case EXPERIENCE_BULLET:
      return handleExperienceBullet(ctx, text);
    
    // Phase 2 - Skills
    case SKILLS_TECHNICAL:
      return handleSkillsTechnical(ctx, text);
    case SKILLS_LANGUAGES:
      return handleSkillsLanguages(ctx, text);
    case SKILLS_OTHER:
      return handleSkillsOther(ctx, text);
    
    // Phase 3 - Projects
    case PROJECTS_NAME:
      return handleProjectsName(ctx, text);
    case PROJECTS_ROLE:
      return handleProjectsRole(ctx, text);
    case PROJECTS_TECH:
      return handleProjectsTech(ctx, text);
    case PROJECTS_DESCRIPTION:
      return handleProjectsDescription(ctx, text);
    
    // Phase 3 - Activities
    case ACTIVITIES_TITLE:
      return handleActivitiesTitle(ctx, text);
    case ACTIVITIES_ORGANIZATION:
      return handleActivitiesOrganization(ctx, text);
    case ACTIVITIES_DESCRIPTION:
      return handleActivitiesDescription(ctx, text);
    
    // Phase 3 - Certifications
    case CERTIFICATIONS_NAME:
      return handleCertificationsName(ctx, text);
    case CERTIFICATIONS_ISSUER:
      return handleCertificationsIssuer(ctx, text);
    case CERTIFICATIONS_YEAR:
      return handleCertificationsYear(ctx, text);
    
    // Phase 4 - Edit flow (reuses existing handlers)
    case EDIT_PERSONAL:
      return handleEditPersonal(ctx, text);
    case EDIT_SUMMARY:
      return handleEditSummary(ctx, text);
    
    default:
      return ctx.reply('I\'m not sure what to do with that. Please follow the prompts.');
  }
}

// Phase 1 handlers
function handleFullName(ctx, text) {
  if (!isNotEmpty(text)) {
    return ctx.reply('Please enter your full name. It cannot be empty.');
  }
  ctx.session.cv.personal.fullName = text;
  ctx.session.flow.currentStep = PERSONAL_PHONE;
  ctx.reply('Great! Now, what is your phone number?');
}

function handlePhone(ctx, text) {
  if (!isValidPhone(text)) {
    return ctx.reply('Please enter a valid phone number (at least 10 digits).');
  }
  ctx.session.cv.personal.phone = text;
  ctx.session.flow.currentStep = PERSONAL_EMAIL;
  ctx.reply('Got it! What\'s your email address?');
}

function handleEmail(ctx, text) {
  if (!isValidEmail(text)) {
    return ctx.reply('Please enter a valid email address (e.g., name@example.com).');
  }
  ctx.session.cv.personal.email = text;
  ctx.session.flow.currentStep = PERSONAL_LOCATION;
  ctx.reply('Thanks! Where are you located? (City, Country)');
}

function handleLocation(ctx, text) {
  if (!isNotEmpty(text)) {
    return ctx.reply('Please enter your location.');
  }
  ctx.session.cv.personal.location = text;
  ctx.session.flow.currentStep = PERSONAL_LINKEDIN;
  ctx.reply(
    'Do you have a LinkedIn profile? (Optional)\n' +
    'Type your LinkedIn URL or type *skip* to skip this step.'
  );
}

function handleLinkedIn(ctx, text) {
  if (isSkip(text)) {
    ctx.session.cv.personal.linkedin = null;
  } else if (isValidLinkedIn(text)) {
    ctx.session.cv.personal.linkedin = text;
  } else {
    return ctx.reply('Please enter a valid LinkedIn URL or type *skip* to skip.');
  }
  ctx.session.flow.currentStep = PERSONAL_WEBSITE;
  ctx.reply(
    'Do you have a personal website or portfolio? (Optional)\n' +
    'Type your URL or type *skip* to skip this step.'
  );
}

function handleWebsite(ctx, text) {
  if (isSkip(text)) {
    ctx.session.cv.personal.website = null;
  } else if (isValidUrl(text)) {
    ctx.session.cv.personal.website = text;
  } else {
    return ctx.reply('Please enter a valid URL (starting with http:// or https://) or type *skip* to skip.');
  }
  ctx.session.flow.currentStep = TARGET_ROLE;
  ctx.reply(
    'What professional title would you like to appear beneath your name on your CV?\n' +
    'Type *skip* to skip this step.'
  );
}

function handleTargetRole(ctx, text) {
  // Allow skip for target role
  if (isSkip(text)) {
    ctx.session.cv.targetRole = null;
  } else if (!isNotEmpty(text)) {
    return ctx.reply('Please enter the role you\'re applying for or type *skip*.');
  } else {
    ctx.session.cv.targetRole = text;
  }
  
  ctx.session.flow.currentStep = SUMMARY_MODE;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('✍️ Write it myself', 'summary_manual')],
    [Markup.button.callback('🛠️ Help me build one', 'summary_auto')]
  ]);
  
  ctx.replyWithMarkdown(
    'Great! Now let\'s work on your professional summary.\n\n' +
    'How would you like to proceed?',
    keyboard
  );
}

function handleManualSummary(ctx, text) {
  if (!isNotEmpty(text)) {
    return ctx.reply('Please write a 2-4 sentence professional summary.');
  }
  if (text.split('.').length < 2 && text.length < 30) {
    return ctx.reply('Please provide a more detailed summary (at least 2-4 sentences).');
  }
  
  ctx.session.cv.summary = text;
  ctx.session.cv.summaryMeta.useGeneratedSummary = false;
  ctx.session.flow.currentStep = EDUCATION_INTRO;
  startEducationSection(ctx);
}

function handleSummaryBackground(ctx, text) {
  if (!isNotEmpty(text)) {
    return ctx.reply('Please provide a brief background about yourself.');
  }
  ctx.session.cv.summaryMeta.background = text;
  ctx.session.flow.currentStep = SUMMARY_STRENGTHS;
  ctx.replyWithMarkdown(
    '👉 *Question 2:* What are your top 2-4 relevant strengths, skills, or tools?\n\n' +
    '_Examples: communication, Microsoft Excel, customer service, problem-solving, Python, project management_\n\n' +
    'List them separated by commas.'
  );
}

function handleSummaryStrengths(ctx, text) {
  if (!isNotEmpty(text)) {
    return ctx.reply('Please list your strengths or key skills.');
  }
  ctx.session.cv.summaryMeta.strengths = text;
  ctx.session.flow.currentStep = SUMMARY_GOAL;
  ctx.replyWithMarkdown(
    '👉 *Question 3:* What role(s) are you targeting?\n\n' +
    '_Examples: customer support, frontend developer, operations assistant, marketing positions_\n\n' +
    'Be specific about the type of role you\'re seeking.'
  );
}

function handleSummaryGoal(ctx, text) {
  if (!isNotEmpty(text)) {
    return ctx.reply('Please describe what kind of role(s) you\'re targeting.');
  }
  ctx.session.cv.summaryMeta.careerGoal = text;
  ctx.session.flow.currentStep = SUMMARY_HIGHLIGHT;
  ctx.replyWithMarkdown(
    '👉 *Question 4 (Optional):* Tell me about one achievement, experience highlight, or project you\'re proud of.\n\n' +
    '_Examples: completed a customer service internship, built academic projects, handled record-keeping tasks, supported customers and resolved issues_\n\n' +
    'Type *skip* if you don\'t want to include one.'
  );
}

function handleSummaryHighlight(ctx, text) {
  if (isSkip(text)) {
    ctx.session.cv.summaryMeta.highlight = null;
  } else {
    ctx.session.cv.summaryMeta.highlight = text;
  }
  
  const summary = generateSummary(
    ctx.session.cv.summaryMeta.background,
    ctx.session.cv.summaryMeta.strengths,
    ctx.session.cv.summaryMeta.careerGoal,
    ctx.session.cv.summaryMeta.highlight
  );
  
  ctx.session.cv.summary = summary;
  ctx.session.cv.summaryMeta.useGeneratedSummary = true;
  ctx.session.flow.currentStep = EDUCATION_INTRO;
  
  ctx.replyWithMarkdown(
    '✅ *Summary generated!*\n\n' +
    `*"${summary}"*\n\n` +
    'Now let\'s move on to your education details.',
    Markup.inlineKeyboard([
      [Markup.button.callback('📚 Continue to Education', 'education_start')]
    ])
  );
}

// Phase 2 - Education handlers
function startEducationSection(ctx) {
  ctx.session.flow.tempEntry = {
    school: null,
    degree: null,
    field: null,
    location: null,
    startYear: null,
    endYear: null,
    isInProgress: false,
    gpa: null,
  };
  ctx.session.flow.currentStep = EDUCATION_SCHOOL;
  ctx.replyWithMarkdown(
    '📚 *Let\'s add your education details.*\n\n' +
    'We\'ll start with your highest level of education first.\n\n' +
    '👉 *What is the name of your school/institution?*'
  );
}

function handleEducationSchool(ctx, text) {
  if (!isNotEmpty(text)) {
    return ctx.reply('Please enter the name of your school or institution.');
  }
  ctx.session.flow.tempEntry.school = text;
  ctx.session.flow.currentStep = EDUCATION_DEGREE;
  ctx.replyWithMarkdown(
    '👉 *What degree or qualification did/will you earn?*\n\n' +
    '_Examples: B.Sc, HND, ND, Diploma, WAEC, Master\'s, PhD_'
  );
}

function handleEducationDegree(ctx, text) {
  if (!isNotEmpty(text)) {
    return ctx.reply('Please enter your degree or qualification.');
  }
  ctx.session.flow.tempEntry.degree = text;
  ctx.session.flow.currentStep = EDUCATION_FIELD;
  ctx.replyWithMarkdown(
    '👉 *What was your field of study?*\n\n' +
    '_Examples: Computer Science, Accounting, Business Administration_\n\n' +
    'Type *skip* if not applicable.'
  );
}

function handleEducationField(ctx, text) {
  if (isSkip(text)) {
    ctx.session.flow.tempEntry.field = null;
  } else {
    ctx.session.flow.tempEntry.field = text;
  }
  ctx.session.flow.currentStep = EDUCATION_LOCATION;
  ctx.reply(
    '👉 *Where is the school located?*\n\n' +
    'Type *skip* if you prefer not to share.'
  );
}

function handleEducationLocation(ctx, text) {
  if (isSkip(text)) {
    ctx.session.flow.tempEntry.location = null;
  } else {
    ctx.session.flow.tempEntry.location = text;
  }
  ctx.session.flow.currentStep = EDUCATION_START_YEAR;
  ctx.reply(
    '👉 *When did you start this program?*\n\n' +
    'Enter the start year (e.g., 2021) or type *skip*.'
  );
}

function handleEducationStartYear(ctx, text) {
  if (isSkip(text)) {
    ctx.session.flow.tempEntry.startYear = null;
  } else if (!isValidYear(text)) {
    return ctx.reply('Please enter a valid year (e.g., 2021) or type *skip*.');
  } else {
    ctx.session.flow.tempEntry.startYear = text;
  }
  ctx.session.flow.currentStep = EDUCATION_END_YEAR;
  ctx.replyWithMarkdown(
    '👉 *When did/will you complete this program?*\n\n' +
    'Enter the end year (e.g., 2025) or type:\n' +
    '• `Present` if still studying\n' +
    '• `Expected 2026` if you haven\'t graduated yet\n' +
    '• *skip* if you prefer not to share'
  );
}

function handleEducationEndYear(ctx, text) {
  if (isSkip(text)) {
    ctx.session.flow.tempEntry.endYear = null;
  } else {
    ctx.session.flow.tempEntry.endYear = text;
    if (text.toLowerCase().includes('present') || text.toLowerCase().includes('current')) {
      ctx.session.flow.tempEntry.isInProgress = true;
    }
  }
  ctx.session.flow.currentStep = EDUCATION_GPA;
  ctx.reply(
    '👉 *What was your GPA/CGPA? (Optional)*\n\n' +
    'Type *skip* if you don\'t want to include this.'
  );
}

function handleEducationGPA(ctx, text) {
  if (isSkip(text)) {
    ctx.session.flow.tempEntry.gpa = null;
  } else {
    ctx.session.flow.tempEntry.gpa = text;
  }
  
  ctx.session.cv.education.push(ctx.session.flow.tempEntry);
  ctx.session.flow.tempEntry = null;
  ctx.session.flow.currentStep = EDUCATION_COMPLETE;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('➕ Add another education', 'education_add')],
    [Markup.button.callback('➡️ Continue to Experience', 'education_continue')]
  ]);
  
  ctx.replyWithMarkdown(
    '✅ *Education entry saved!*\n\n' +
    'Would you like to add another education entry or continue to experience?',
    keyboard
  );
}

// Phase 2 - Experience handlers
function startExperienceSection(ctx) {
  ctx.session.flow.tempEntry = {
    title: null,
    company: null,
    location: null,
    startDate: null,
    endDate: null,
    isCurrent: false,
    bullets: [],
  };
  ctx.session.flow.currentStep = EXPERIENCE_TITLE;
  ctx.replyWithMarkdown(
    '💼 *Now let\'s add your experience.*\n\n' +
    'This can include:\n' +
    '• Full-time/part-time jobs\n' +
    '• Internships\n' +
    '• NYSC roles\n' +
    '• Volunteer work\n' +
    '• Relevant projects\n\n' +
    '👉 *What was your job/role title?*'
  );
}

function handleExperienceTitle(ctx, text) {
  if (!isNotEmpty(text)) {
    return ctx.reply('Please enter your job or role title.');
  }
  ctx.session.flow.tempEntry.title = text;
  ctx.session.flow.currentStep = EXPERIENCE_COMPANY;
  ctx.reply('👉 *What company/organization did you work for?*');
}

function handleExperienceCompany(ctx, text) {
  if (!isNotEmpty(text)) {
    return ctx.reply('Please enter the company or organization name.');
  }
  ctx.session.flow.tempEntry.company = text;
  ctx.session.flow.currentStep = EXPERIENCE_LOCATION;
  ctx.reply(
    '👉 *Where was this located? (Optional)*\n\n' +
    'Type *skip* if you prefer not to share.'
  );
}

function handleExperienceLocation(ctx, text) {
  if (isSkip(text)) {
    ctx.session.flow.tempEntry.location = null;
  } else {
    ctx.session.flow.tempEntry.location = text;
  }
  ctx.session.flow.currentStep = EXPERIENCE_START_DATE;
  ctx.reply(
    '👉 *When did you start this role?*\n\n' +
    'Enter a date (e.g., Jan 2024, 2023) or type *skip*.'
  );
}

function handleExperienceStartDate(ctx, text) {
  if (isSkip(text)) {
    ctx.session.flow.tempEntry.startDate = null;
  } else {
    ctx.session.flow.tempEntry.startDate = text;
  }
  ctx.session.flow.currentStep = EXPERIENCE_END_DATE;
  ctx.replyWithMarkdown(
    '👉 *When did/will this role end?*\n\n' +
    'Enter an end date (e.g., Mar 2025) or type:\n' +
    '• `Present` if you still work here\n' +
    '• *skip* if you prefer not to share'
  );
}

function handleExperienceEndDate(ctx, text) {
  if (isSkip(text)) {
    ctx.session.flow.tempEntry.endDate = null;
  } else {
    ctx.session.flow.tempEntry.endDate = text;
    if (text.toLowerCase().includes('present') || text.toLowerCase().includes('current')) {
      ctx.session.flow.tempEntry.isCurrent = true;
    }
  }
  ctx.session.flow.currentStep = EXPERIENCE_BULLET;
  ctx.replyWithMarkdown(
    '📝 *Now let\'s add your key responsibilities and achievements.*\n\n' +
    'Enter one bullet point at a time.\n\n' +
    '👉 *What was a key responsibility or achievement in this role?*\n\n' +
    '_Examples:_\n' +
    '• "Handled customer inquiries and resolved complaints."\n' +
    '• "Maintained records and prepared weekly reports."\n' +
    '• "Built responsive landing pages using HTML, CSS, and JavaScript."'
  );
}

function handleExperienceBullet(ctx, text) {
  if (!isNotEmpty(text)) {
    return ctx.reply('Please enter a bullet point describing a responsibility or achievement.');
  }
  
  ctx.session.flow.tempEntry.bullets.push(text);
  ctx.session.flow.currentStep = EXPERIENCE_BULLET_ACTION;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('➕ Add another bullet', 'bullet_add')],
    [Markup.button.callback('✅ Finish this entry', 'bullet_finish')]
  ]);
  
  const bulletCount = ctx.session.flow.tempEntry.bullets.length;
  ctx.replyWithMarkdown(
    `✅ *Bullet ${bulletCount} added!*\n\n` +
    `Current bullets:\n${ctx.session.flow.tempEntry.bullets.map((b, i) => `${i+1}. ${b}`).join('\n')}\n\n` +
    'What would you like to do next?',
    keyboard
  );
}

// Phase 2 - Skills handlers
function startSkillsSection(ctx) {
  ctx.session.flow.currentStep = SKILLS_TECHNICAL;
  ctx.replyWithMarkdown(
    '🎯 *Now let\'s add your skills.*\n\n' +
    '👉 *What are your technical skills?*\n\n' +
    '_Examples: Excel, Google Sheets, customer support, HTML, CSS, JavaScript_\n\n' +
    'List them separated by commas or type *skip* if none.'
  );
}

function handleSkillsTechnical(ctx, text) {
  if (isSkip(text)) {
    ctx.session.cv.skills.technical = [];
  } else {
    ctx.session.cv.skills.technical = parseCommaSeparated(text);
  }
  ctx.session.flow.currentStep = SKILLS_LANGUAGES;
  ctx.replyWithMarkdown(
    '👉 *What languages do you speak?*\n\n' +
    '_Examples: English, Igbo, French, Spanish_\n\n' +
    'List them separated by commas or type *skip* if none.'
  );
}

function handleSkillsLanguages(ctx, text) {
  if (isSkip(text)) {
    ctx.session.cv.skills.languages = [];
  } else {
    ctx.session.cv.skills.languages = parseCommaSeparated(text);
  }
  ctx.session.flow.currentStep = SKILLS_OTHER;
  ctx.replyWithMarkdown(
    '👉 *What other skills do you have?*\n\n' +
    '_Examples: communication, teamwork, problem-solving, time management_\n\n' +
    'List them separated by commas or type *skip* if none.'
  );
}

function handleSkillsOther(ctx, text) {
  if (isSkip(text)) {
    ctx.session.cv.skills.other = [];
  } else {
    ctx.session.cv.skills.other = parseCommaSeparated(text);
  }
  ctx.session.flow.currentStep = PROJECTS_INTRO;
  startProjectsSection(ctx);
}

// Phase 3 - Projects handlers
function startProjectsSection(ctx) {
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('✅ Yes, add projects', 'projects_yes')],
    [Markup.button.callback('⏭️ Skip projects', 'projects_skip')]
  ]);
  
  ctx.replyWithMarkdown(
    '📁 *Do you want to add projects to your CV?*\n\n' +
    'Projects can include academic projects, personal projects, or professional work you\'re proud of.',
    keyboard
  );
}

function handleProjectsName(ctx, text) {
  if (!isNotEmpty(text)) {
    return ctx.reply('Please enter a project name.');
  }
  ctx.session.flow.tempEntry.name = text;
  ctx.session.flow.currentStep = PROJECTS_ROLE;
  ctx.replyWithMarkdown(
    '👉 *What was your role in this project? (Optional)*\n\n' +
    '_Examples: Developer, Team Lead, Researcher_\n\n' +
    'Type *skip* if not applicable.'
  );
}

function handleProjectsRole(ctx, text) {
  if (isSkip(text)) {
    ctx.session.flow.tempEntry.role = null;
  } else {
    ctx.session.flow.tempEntry.role = text;
  }
  ctx.session.flow.currentStep = PROJECTS_TECH;
  ctx.replyWithMarkdown(
    '👉 *What technologies or tools did you use? (Optional)*\n\n' +
    '_Examples: Python, React, Excel, Figma_\n\n' +
    'List them separated by commas or type *skip*.'
  );
}

function handleProjectsTech(ctx, text) {
  if (isSkip(text)) {
    ctx.session.flow.tempEntry.tech = [];
  } else {
    ctx.session.flow.tempEntry.tech = parseCommaSeparated(text);
  }
  ctx.session.flow.currentStep = PROJECTS_DESCRIPTION;
  ctx.reply(
    '👉 *Please provide a short description of the project.*\n\n' +
    'What was the project about? What did you achieve? (1-2 sentences)'
  );
}

function handleProjectsDescription(ctx, text) {
  if (!isNotEmpty(text)) {
    return ctx.reply('Please provide a short description of the project.');
  }
  ctx.session.flow.tempEntry.description = text;
  
  ctx.session.cv.projects.push(ctx.session.flow.tempEntry);
  ctx.session.flow.tempEntry = null;
  ctx.session.flow.currentStep = PROJECTS_COMPLETE;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('➕ Add another project', 'projects_add')],
    [Markup.button.callback('➡️ Continue to Activities', 'projects_continue')]
  ]);
  
  ctx.replyWithMarkdown(
    '✅ *Project added!*\n\n' +
    'Would you like to add another project or continue to activities?',
    keyboard
  );
}

// Phase 3 - Activities handlers
function startActivitiesSection(ctx) {
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('✅ Yes, add activities', 'activities_yes')],
    [Markup.button.callback('⏭️ Skip activities', 'activities_skip')]
  ]);
  
  ctx.replyWithMarkdown(
    '🌟 *Do you want to add leadership, volunteer, or extracurricular activities?*\n\n' +
    'This can include:\n' +
    '• Leadership roles in clubs/societies\n' +
    '• Volunteer work\n' +
    '• Extracurricular activities\n' +
    '• Professional organizations',
    keyboard
  );
}

function handleActivitiesTitle(ctx, text) {
  if (!isNotEmpty(text)) {
    return ctx.reply('Please enter a role title.');
  }
  ctx.session.flow.tempEntry.title = text;
  ctx.session.flow.currentStep = ACTIVITIES_ORGANIZATION;
  ctx.replyWithMarkdown(
    '👉 *What organization was this with? (Optional)*\n\n' +
    'Type *skip* if not applicable.'
  );
}

function handleActivitiesOrganization(ctx, text) {
  if (isSkip(text)) {
    ctx.session.flow.tempEntry.organization = null;
  } else {
    ctx.session.flow.tempEntry.organization = text;
  }
  ctx.session.flow.currentStep = ACTIVITIES_DESCRIPTION;
  ctx.replyWithMarkdown(
    '👉 *Briefly describe your role or contributions. (Optional)*\n\n' +
    'Type *skip* if you prefer not to add a description.'
  );
}

function handleActivitiesDescription(ctx, text) {
  if (isSkip(text)) {
    ctx.session.flow.tempEntry.description = null;
  } else {
    ctx.session.flow.tempEntry.description = text;
  }
  
  ctx.session.cv.activities.push(ctx.session.flow.tempEntry);
  ctx.session.flow.tempEntry = null;
  ctx.session.flow.currentStep = ACTIVITIES_COMPLETE;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('➕ Add another activity', 'activities_add')],
    [Markup.button.callback('➡️ Continue to Certifications', 'activities_continue')]
  ]);
  
  ctx.replyWithMarkdown(
    '✅ *Activity added!*\n\n' +
    'Would you like to add another activity or continue to certifications?',
    keyboard
  );
}

// Phase 3 - Certifications handlers
function startCertificationsSection(ctx) {
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('✅ Yes, add certifications', 'certifications_yes')],
    [Markup.button.callback('⏭️ Skip certifications', 'certifications_skip')]
  ]);
  
  ctx.replyWithMarkdown(
    '🏆 *Do you want to add certifications or awards?*\n\n' +
    'This can include:\n' +
    '• Professional certifications\n' +
    '• Awards and honors\n' +
    '• Training certificates',
    keyboard
  );
}

function handleCertificationsName(ctx, text) {
  if (!isNotEmpty(text)) {
    return ctx.reply('Please enter the certification or award name.');
  }
  ctx.session.flow.tempEntry.name = text;
  ctx.session.flow.currentStep = CERTIFICATIONS_ISSUER;
  ctx.replyWithMarkdown(
    '👉 *Who issued this? (Optional)*\n\n' +
    '_Examples: Google, LinkedIn, University of Lagos_\n\n' +
    'Type *skip* if not applicable.'
  );
}

function handleCertificationsIssuer(ctx, text) {
  if (isSkip(text)) {
    ctx.session.flow.tempEntry.issuer = null;
  } else {
    ctx.session.flow.tempEntry.issuer = text;
  }
  ctx.session.flow.currentStep = CERTIFICATIONS_YEAR;
  ctx.replyWithMarkdown(
    '👉 *What year was this awarded? (Optional)*\n\n' +
    'Enter a year (e.g., 2023) or type *skip*.'
  );
}

function handleCertificationsYear(ctx, text) {
  if (isSkip(text)) {
    ctx.session.flow.tempEntry.year = null;
  } else if (!isValidYear(text) && text !== 'skip') {
    return ctx.reply('Please enter a valid year (e.g., 2023) or type *skip*.');
  } else {
    ctx.session.flow.tempEntry.year = text;
  }
  
  ctx.session.cv.certifications.push(ctx.session.flow.tempEntry);
  ctx.session.flow.tempEntry = null;
  ctx.session.flow.currentStep = CERTIFICATIONS_COMPLETE;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('➕ Add another certification', 'certifications_add')],
    [Markup.button.callback('➡️ Continue to References', 'certifications_continue')]
  ]);
  
  ctx.replyWithMarkdown(
    '✅ *Certification added!*\n\n' +
    'Would you like to add another certification or continue to references?',
    keyboard
  );
}

// Phase 3 - References
function startReferencesSection(ctx) {
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('✅ Yes', 'references_yes')],
    [Markup.button.callback('❌ No', 'references_no')]
  ]);
  
  ctx.replyWithMarkdown(
    '📋 *Do you want your CV to include the line "References available on request"?*\n\n' +
    'This is common in most CVs, but you can choose not to include it.',
    keyboard
  );
}

// Phase 3 - Preview
async function showPreview(ctx) {
  const preview = generateCVPreview(ctx.session);
  
  // Send preview with proper await
  await ctx.replyWithMarkdown(
    `📄 *Your CV Preview*\n\n` +
    '```\n' +
    preview +
    '\n```'
  );
  
  // Show edit options after preview
  await showEditMenu(ctx);
}

// Phase 4 - Edit Flow
async function showEditMenu(ctx) {
  ctx.session.flow.currentStep = EDIT_MENU;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('👤 Personal Details', 'edit_personal')],
    [Markup.button.callback('📝 Professional Summary', 'edit_summary')],
    [Markup.button.callback('🎓 Education', 'edit_education')],
    [Markup.button.callback('💼 Experience', 'edit_experience')],
    [Markup.button.callback('🛠️ Skills', 'edit_skills')],
    [Markup.button.callback('📁 Projects', 'edit_projects')],
    [Markup.button.callback('🌟 Activities', 'edit_activities')],
    [Markup.button.callback('🏆 Certifications', 'edit_certifications')],
    [Markup.button.callback('📋 References', 'edit_references')],
    [Markup.button.callback('✅ Finish Editing', 'finish_editing')]
  ]);
  
  await ctx.replyWithMarkdown(
    '✏️ *Edit your CV*\n\n' +
    'Select a section to edit. You\'ll be guided through updating that section.\n\n' +
    'Editing a section will replace the existing content with your new input.',
    keyboard
  );
}

// Edit handlers - Personal Details
function handleEditPersonal(ctx, text) {
  const session = ctx.session;
  
  if (!session.flow.tempEntry) {
    session.flow.tempEntry = { step: 'name' };
  }
  
  const step = session.flow.tempEntry.step;
  
  switch (step) {
    case 'name':
      if (!isNotEmpty(text)) {
        return ctx.reply('Please enter your full name. It cannot be empty.');
      }
      session.cv.personal.fullName = text;
      session.flow.tempEntry.step = 'phone';
      ctx.reply('Great! Now, what is your phone number?');
      break;
      
    case 'phone':
      if (!isValidPhone(text)) {
        return ctx.reply('Please enter a valid phone number (at least 10 digits).');
      }
      session.cv.personal.phone = text;
      session.flow.tempEntry.step = 'email';
      ctx.reply('Got it! What\'s your email address?');
      break;
      
    case 'email':
      if (!isValidEmail(text)) {
        return ctx.reply('Please enter a valid email address (e.g., name@example.com).');
      }
      session.cv.personal.email = text;
      session.flow.tempEntry.step = 'location';
      ctx.reply('Thanks! Where are you located? (City, Country)');
      break;
      
    case 'location':
      if (!isNotEmpty(text)) {
        return ctx.reply('Please enter your location.');
      }
      session.cv.personal.location = text;
      session.flow.tempEntry.step = 'linkedin';
      ctx.reply(
        'Do you have a LinkedIn profile? (Optional)\n' +
        'Type your LinkedIn URL or type *skip* to skip this step.'
      );
      break;
      
    case 'linkedin':
      if (isSkip(text)) {
        session.cv.personal.linkedin = null;
      } else if (isValidLinkedIn(text)) {
        session.cv.personal.linkedin = text;
      } else {
        return ctx.reply('Please enter a valid LinkedIn URL or type *skip* to skip.');
      }
      session.flow.tempEntry.step = 'website';
      ctx.reply(
        'Do you have a personal website or portfolio? (Optional)\n' +
        'Type your URL or type *skip* to skip this step.'
      );
      break;
      
    case 'website':
      if (isSkip(text)) {
        session.cv.personal.website = null;
      } else if (isValidUrl(text)) {
        session.cv.personal.website = text;
      } else {
        return ctx.reply('Please enter a valid URL (starting with http:// or https://) or type *skip* to skip.');
      }
      session.flow.tempEntry.step = 'targetRole';
      ctx.reply(
        'What professional title would you like to appear beneath your name on your CV?\n' +
        'Type *skip* to skip this step.'
      );
      break;
      
    case 'targetRole':
      if (isSkip(text)) {
        session.cv.targetRole = null;
      } else if (!isNotEmpty(text)) {
        return ctx.reply('Please enter the role you\'re applying for or type *skip*.');
      } else {
        session.cv.targetRole = text;
      }
      session.flow.tempEntry = null;
      ctx.replyWithMarkdown('✅ *Personal details updated!*');
      showEditMenu(ctx);
      break;
      
    default:
      ctx.reply('Something went wrong. Please try again.');
  }
}

// Edit handlers - Summary
function handleEditSummary(ctx, text) {
  if (!isNotEmpty(text)) {
    return ctx.reply('Please write a 2-4 sentence professional summary.');
  }
  if (text.split('.').length < 2 && text.length < 30) {
    return ctx.reply('Please provide a more detailed summary (at least 2-4 sentences).');
  }
  
  ctx.session.cv.summary = text;
  ctx.session.cv.summaryMeta.useGeneratedSummary = false;
  ctx.session.flow.tempEntry = null;
  ctx.replyWithMarkdown('✅ *Summary updated!*');
  showEditMenu(ctx);
}

// Export helper functions for actions.js
module.exports = {
  handleText,
  startEducationSection,
  startExperienceSection,
  startSkillsSection,
  startProjectsSection,
  startActivitiesSection,
  startCertificationsSection,
  startReferencesSection,
  showPreview,
  showEditMenu,
};