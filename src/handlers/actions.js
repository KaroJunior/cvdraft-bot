const { resetSession } = require('../services/session');
const { 
  SUMMARY_MODE, 
  SUMMARY_MANUAL, 
  SUMMARY_BG,
  SUMMARY_HIGHLIGHT,
  EDUCATION_INTRO,
  EDUCATION_COMPLETE,
  EXPERIENCE_BULLET_ACTION,
  EXPERIENCE_COMPLETE,
  PROJECTS_INTRO,
  PROJECTS_NAME,
  PROJECTS_COMPLETE,
  ACTIVITIES_INTRO,
  ACTIVITIES_TITLE,
  ACTIVITIES_COMPLETE,
  CERTIFICATIONS_INTRO,
  CERTIFICATIONS_NAME,
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
  COMPLETED 
} = require('../constants/steps');
const { Markup } = require('telegraf');
const { 
  startEducationSection, 
  startExperienceSection, 
  startSkillsSection,
  startProjectsSection,
  startActivitiesSection,
  startCertificationsSection,
  startReferencesSection,
  showPreview,
  showEditMenu
} = require('./text');
const { generateAndSendPDF } = require('./commands');

/**
 * Handle callback queries (button clicks)
 */
async function handleAction(ctx) {
  const data = ctx.callbackQuery.data;
  
  switch (data) {
    // Phase 1 actions
    case 'create_cv':
      return handleCreateCV(ctx);
    case 'summary_manual':
      return handleSummaryManual(ctx);
    case 'summary_auto':
      return handleSummaryAuto(ctx);
    
    // Phase 2 - Education actions
    case 'education_start':
      return handleEducationStart(ctx);
    case 'education_add':
      return handleEducationAdd(ctx);
    case 'education_continue':
      return handleEducationContinue(ctx);
    
    // Phase 2 - Experience actions
    case 'experience_start':
      return handleExperienceStart(ctx);
    case 'bullet_add':
      return handleBulletAdd(ctx);
    case 'bullet_finish':
      return handleBulletFinish(ctx);
    case 'experience_add':
      return handleExperienceAdd(ctx);
    case 'experience_continue':
      return handleExperienceContinue(ctx);
    
    // Phase 3 - Projects actions
    case 'projects_yes':
      return handleProjectsYes(ctx);
    case 'projects_skip':
      return handleProjectsSkip(ctx);
    case 'projects_add':
      return handleProjectsAdd(ctx);
    case 'projects_continue':
      return handleProjectsContinue(ctx);
    
    // Phase 3 - Activities actions
    case 'activities_yes':
      return handleActivitiesYes(ctx);
    case 'activities_skip':
      return handleActivitiesSkip(ctx);
    case 'activities_add':
      return handleActivitiesAdd(ctx);
    case 'activities_continue':
      return handleActivitiesContinue(ctx);
    
    // Phase 3 - Certifications actions
    case 'certifications_yes':
      return handleCertificationsYes(ctx);
    case 'certifications_skip':
      return handleCertificationsSkip(ctx);
    case 'certifications_add':
      return handleCertificationsAdd(ctx);
    case 'certifications_continue':
      return handleCertificationsContinue(ctx);
    
    // Phase 3 - References actions
    case 'references_yes':
      return handleReferencesYes(ctx);
    case 'references_no':
      return handleReferencesNo(ctx);
    
    // Phase 4 - Edit flow actions
    case 'edit_personal':
      return handleEditPersonal(ctx);
    case 'edit_summary':
      return handleEditSummary(ctx);
    case 'edit_education':
      return handleEditEducation(ctx);
    case 'edit_experience':
      return handleEditExperience(ctx);
    case 'edit_skills':
      return handleEditSkills(ctx);
    case 'edit_projects':
      return handleEditProjects(ctx);
    case 'edit_activities':
      return handleEditActivities(ctx);
    case 'edit_certifications':
      return handleEditCertifications(ctx);
    case 'edit_references':
      return handleEditReferences(ctx);
    case 'finish_editing':
      return handleFinishEditing(ctx);
    case 'edit_again':
      return handleEditAgain(ctx);
    case 'looks_good':
      return handleLooksGood(ctx);
    
    default:
      return ctx.answerCbQuery('Unknown action');
  }
}

// Phase 1 handlers
function handleCreateCV(ctx) {
  resetSession(ctx);
  ctx.session.flow.currentStep = require('../constants/steps').PERSONAL_FULL_NAME;
  ctx.answerCbQuery('Starting CV creation...');
  ctx.replyWithMarkdown(
    '*Let\'s create your CV!* 📝\n\n' +
    'First, I need some personal details.\n\n' +
    '👉 *What is your full name?*'
  );
}

function handleSummaryManual(ctx) {
  ctx.answerCbQuery('You chose to write it yourself');
  // Check if we're in edit mode
  if (ctx.session.flow.currentStep === EDIT_SUMMARY) {
    ctx.session.flow.currentStep = EDIT_SUMMARY;
    ctx.session.flow.tempEntry = { mode: 'manual' };
    ctx.replyWithMarkdown(
      '✍️ Please write a *2-4 sentence* professional summary or career objective.\n\n' +
      'Example: "Results-driven marketing professional with 5+ years of experience in digital strategy..."'
    );
  } else {
    ctx.session.flow.currentStep = SUMMARY_MANUAL;
    ctx.replyWithMarkdown(
      '✍️ Please write a *2-4 sentence* professional summary or career objective.\n\n' +
      'Example: "Results-driven marketing professional with 5+ years of experience in digital strategy..."'
    );
  }
}

function handleSummaryAuto(ctx) {
  ctx.answerCbQuery('I\'ll help you build a summary');
  // Check if we're in edit mode
  if (ctx.session.flow.currentStep === EDIT_SUMMARY) {
    ctx.session.flow.currentStep = EDIT_SUMMARY;
    ctx.session.flow.tempEntry = { mode: 'auto' };
    ctx.replyWithMarkdown(
      '🛠️ *Let\'s build your professional summary together!*\n\n' +
      'I\'ll ask you 4 short questions to create a tailored summary.\n\n' +
      '👉 *Question 1:* Briefly describe your current background.\n\n' +
      '_Examples: Computer Science student, recent Economics graduate, customer support intern with 1 year experience, frontend developer with 2 years experience._'
    );
  } else {
    ctx.session.flow.currentStep = SUMMARY_BG;
    ctx.replyWithMarkdown(
      '🛠️ *Let\'s build your professional summary together!*\n\n' +
      'I\'ll ask you 4 short questions to create a tailored summary.\n\n' +
      '👉 *Question 1:* Briefly describe your current background.\n\n' +
      '_Examples: Computer Science student, recent Economics graduate, customer support intern with 1 year experience, frontend developer with 2 years experience._'
    );
  }
}

// Phase 2 - Education action handlers
function handleEducationStart(ctx) {
  ctx.answerCbQuery('Starting education section...');
  startEducationSection(ctx);
}

function handleEducationAdd(ctx) {
  ctx.answerCbQuery('Adding another education entry...');
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
  ctx.session.flow.currentStep = require('../constants/steps').EDUCATION_SCHOOL;
  ctx.reply('👉 *What is the name of your school/institution?*');
}

async function handleEducationContinue(ctx) {
  ctx.answerCbQuery('Continuing to experience...');
  // Check if we're in edit mode
  if (ctx.session.flow.currentStep === EDIT_EDUCATION || 
      ctx.session.flow.currentStep === EDUCATION_COMPLETE && 
      ctx.session.flow.returnToEditMenu) {
    ctx.session.flow.returnToEditMenu = false;
    await ctx.replyWithMarkdown('✅ *Education updated!*');
    await showEditMenu(ctx);
  } else {
    startExperienceSection(ctx);
  }
}

// Phase 2 - Experience action handlers
function handleExperienceStart(ctx) {
  ctx.answerCbQuery('Starting experience section...');
  startExperienceSection(ctx);
}

function handleBulletAdd(ctx) {
  ctx.answerCbQuery('Adding another bullet...');
  ctx.session.flow.currentStep = require('../constants/steps').EXPERIENCE_BULLET;
  ctx.reply('👉 *Enter another responsibility or achievement:*');
}

async function handleBulletFinish(ctx) {
  ctx.answerCbQuery('Finishing experience entry...');
  const tempEntry = ctx.session.flow.tempEntry;
  
  if (!tempEntry.bullets || tempEntry.bullets.length === 0) {
    await ctx.reply('⚠️ You need to add at least one bullet point before finishing. Please add a bullet.');
    ctx.session.flow.currentStep = require('../constants/steps').EXPERIENCE_BULLET;
    return;
  }
  
  ctx.session.cv.experience.push(tempEntry);
  ctx.session.flow.tempEntry = null;
  ctx.session.flow.currentStep = EXPERIENCE_COMPLETE;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('➕ Add another experience', 'experience_add')],
    [Markup.button.callback('➡️ Continue to Skills', 'experience_continue')]
  ]);
  
  await ctx.replyWithMarkdown(
    '✅ *Experience entry saved!*\n\n' +
    'Would you like to add another experience or continue to skills?',
    keyboard
  );
}

function handleExperienceAdd(ctx) {
  ctx.answerCbQuery('Adding another experience entry...');
  ctx.session.flow.tempEntry = {
    title: null,
    company: null,
    location: null,
    startDate: null,
    endDate: null,
    isCurrent: false,
    bullets: [],
  };
  ctx.session.flow.currentStep = require('../constants/steps').EXPERIENCE_TITLE;
  ctx.reply('👉 *What was your job/role title?*');
}

async function handleExperienceContinue(ctx) {
  ctx.answerCbQuery('Continuing to skills...');
  // Check if we're in edit mode
  if (ctx.session.flow.currentStep === EDIT_EXPERIENCE || 
      ctx.session.flow.currentStep === EXPERIENCE_COMPLETE && 
      ctx.session.flow.returnToEditMenu) {
    ctx.session.flow.returnToEditMenu = false;
    await ctx.replyWithMarkdown('✅ *Experience updated!*');
    await showEditMenu(ctx);
  } else {
    startSkillsSection(ctx);
  }
}

// Phase 3 - Projects action handlers
function handleProjectsYes(ctx) {
  ctx.answerCbQuery('Adding projects...');
  ctx.session.flow.tempEntry = {
    name: null,
    role: null,
    tech: [],
    description: null,
  };
  ctx.session.flow.currentStep = PROJECTS_NAME;
  ctx.reply('👉 *What is the project name?*');
}

function handleProjectsSkip(ctx) {
  ctx.answerCbQuery('Skipping projects...');
  ctx.session.flow.currentStep = ACTIVITIES_INTRO;
  startActivitiesSection(ctx);
}

function handleProjectsAdd(ctx) {
  ctx.answerCbQuery('Adding another project...');
  ctx.session.flow.tempEntry = {
    name: null,
    role: null,
    tech: [],
    description: null,
  };
  ctx.session.flow.currentStep = PROJECTS_NAME;
  ctx.reply('👉 *What is the project name?*');
}

async function handleProjectsContinue(ctx) {
  ctx.answerCbQuery('Continuing to activities...');
  // Check if we're in edit mode
  if (ctx.session.flow.currentStep === EDIT_PROJECTS || 
      ctx.session.flow.currentStep === PROJECTS_COMPLETE && 
      ctx.session.flow.returnToEditMenu) {
    ctx.session.flow.returnToEditMenu = false;
    await ctx.replyWithMarkdown('✅ *Projects updated!*');
    await showEditMenu(ctx);
  } else {
    ctx.session.flow.currentStep = ACTIVITIES_INTRO;
    startActivitiesSection(ctx);
  }
}

// Phase 3 - Activities action handlers
function handleActivitiesYes(ctx) {
  ctx.answerCbQuery('Adding activities...');
  ctx.session.flow.tempEntry = {
    title: null,
    organization: null,
    description: null,
  };
  ctx.session.flow.currentStep = ACTIVITIES_TITLE;
  ctx.reply('👉 *What was your role title?*');
}

function handleActivitiesSkip(ctx) {
  ctx.answerCbQuery('Skipping activities...');
  ctx.session.flow.currentStep = CERTIFICATIONS_INTRO;
  startCertificationsSection(ctx);
}

function handleActivitiesAdd(ctx) {
  ctx.answerCbQuery('Adding another activity...');
  ctx.session.flow.tempEntry = {
    title: null,
    organization: null,
    description: null,
  };
  ctx.session.flow.currentStep = ACTIVITIES_TITLE;
  ctx.reply('👉 *What was your role title?*');
}

async function handleActivitiesContinue(ctx) {
  ctx.answerCbQuery('Continuing to certifications...');
  // Check if we're in edit mode
  if (ctx.session.flow.currentStep === EDIT_ACTIVITIES || 
      ctx.session.flow.currentStep === ACTIVITIES_COMPLETE && 
      ctx.session.flow.returnToEditMenu) {
    ctx.session.flow.returnToEditMenu = false;
    await ctx.replyWithMarkdown('✅ *Activities updated!*');
    await showEditMenu(ctx);
  } else {
    ctx.session.flow.currentStep = CERTIFICATIONS_INTRO;
    startCertificationsSection(ctx);
  }
}

// Phase 3 - Certifications action handlers
function handleCertificationsYes(ctx) {
  ctx.answerCbQuery('Adding certifications...');
  ctx.session.flow.tempEntry = {
    name: null,
    issuer: null,
    year: null,
  };
  ctx.session.flow.currentStep = CERTIFICATIONS_NAME;
  ctx.reply('👉 *What is the certification or award name?*');
}

function handleCertificationsSkip(ctx) {
  ctx.answerCbQuery('Skipping certifications...');
  ctx.session.flow.currentStep = REFERENCES_INTRO;
  startReferencesSection(ctx);
}

function handleCertificationsAdd(ctx) {
  ctx.answerCbQuery('Adding another certification...');
  ctx.session.flow.tempEntry = {
    name: null,
    issuer: null,
    year: null,
  };
  ctx.session.flow.currentStep = CERTIFICATIONS_NAME;
  ctx.reply('👉 *What is the certification or award name?*');
}

async function handleCertificationsContinue(ctx) {
  ctx.answerCbQuery('Continuing to references...');
  // Check if we're in edit mode
  if (ctx.session.flow.currentStep === EDIT_CERTIFICATIONS || 
      ctx.session.flow.currentStep === CERTIFICATIONS_COMPLETE && 
      ctx.session.flow.returnToEditMenu) {
    ctx.session.flow.returnToEditMenu = false;
    await ctx.replyWithMarkdown('✅ *Certifications updated!*');
    await showEditMenu(ctx);
  } else {
    ctx.session.flow.currentStep = REFERENCES_INTRO;
    startReferencesSection(ctx);
  }
}

// Phase 3 - References action handlers
async function handleReferencesYes(ctx) {
  ctx.answerCbQuery('References will be included');
  ctx.session.cv.referencesOnRequest = true;
  ctx.session.flow.currentStep = PREVIEW;
  
  // Check if we're in edit mode
  if (ctx.session.flow.currentStep === EDIT_REFERENCES) {
    await ctx.replyWithMarkdown('✅ *References updated!*');
    await showEditMenu(ctx);
  } else {
    await ctx.replyWithMarkdown('✅ *References will be included in your CV.*\n\nGenerating your CV preview...');
    await showPreview(ctx);
  }
}

async function handleReferencesNo(ctx) {
  ctx.answerCbQuery('References will not be included');
  ctx.session.cv.referencesOnRequest = false;
  ctx.session.flow.currentStep = PREVIEW;
  
  // Check if we're in edit mode
  if (ctx.session.flow.currentStep === EDIT_REFERENCES) {
    await ctx.replyWithMarkdown('✅ *References updated!*');
    await showEditMenu(ctx);
  } else {
    await ctx.replyWithMarkdown('✅ *References will not be included.*\n\nGenerating your CV preview...');
    await showPreview(ctx);
  }
}

// Phase 4 - Edit flow handlers
function handleEditPersonal(ctx) {
  ctx.answerCbQuery('Editing personal details...');
  ctx.session.flow.currentStep = EDIT_PERSONAL;
  ctx.session.flow.tempEntry = { step: 'name' };
  ctx.replyWithMarkdown(
    '👤 *Edit Personal Details*\n\n' +
    'Let\'s update your personal information.\n\n' +
    '👉 *What is your full name?*'
  );
}

function handleEditSummary(ctx) {
  ctx.answerCbQuery('Editing summary...');
  ctx.session.flow.currentStep = EDIT_SUMMARY;
  ctx.session.flow.tempEntry = { mode: 'select' };
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('✍️ Write it myself', 'summary_manual')],
    [Markup.button.callback('🛠️ Help me build one', 'summary_auto')]
  ]);
  
  ctx.replyWithMarkdown(
    '📝 *Edit Professional Summary*\n\n' +
    'How would you like to update your summary?',
    keyboard
  );
}

function handleEditEducation(ctx) {
  ctx.answerCbQuery('Editing education...');
  // Clear existing education
  ctx.session.cv.education = [];
  ctx.session.flow.currentStep = EDIT_EDUCATION;
  ctx.session.flow.returnToEditMenu = true;
  ctx.replyWithMarkdown('🎓 *Editing Education*\n\nLet\'s re-enter your education details.');
  startEducationSection(ctx);
}

function handleEditExperience(ctx) {
  ctx.answerCbQuery('Editing experience...');
  // Clear existing experience
  ctx.session.cv.experience = [];
  ctx.session.flow.currentStep = EDIT_EXPERIENCE;
  ctx.session.flow.returnToEditMenu = true;
  ctx.replyWithMarkdown('💼 *Editing Experience*\n\nLet\'s re-enter your experience details.');
  startExperienceSection(ctx);
}

function handleEditSkills(ctx) {
  ctx.answerCbQuery('Editing skills...');
  // Clear existing skills
  ctx.session.cv.skills = {
    technical: [],
    languages: [],
    other: [],
  };
  ctx.session.flow.currentStep = EDIT_SKILLS;
  ctx.session.flow.returnToEditMenu = true;
  ctx.replyWithMarkdown('🛠️ *Editing Skills*\n\nLet\'s re-enter your skills.');
  startSkillsSection(ctx);
}

function handleEditProjects(ctx) {
  ctx.answerCbQuery('Editing projects...');
  // Clear existing projects
  ctx.session.cv.projects = [];
  ctx.session.flow.currentStep = EDIT_PROJECTS;
  ctx.session.flow.returnToEditMenu = true;
  ctx.replyWithMarkdown('📁 *Editing Projects*\n\nLet\'s re-enter your projects.');
  startProjectsSection(ctx);
}

function handleEditActivities(ctx) {
  ctx.answerCbQuery('Editing activities...');
  // Clear existing activities
  ctx.session.cv.activities = [];
  ctx.session.flow.currentStep = EDIT_ACTIVITIES;
  ctx.session.flow.returnToEditMenu = true;
  ctx.replyWithMarkdown('🌟 *Editing Activities*\n\nLet\'s re-enter your activities.');
  startActivitiesSection(ctx);
}

function handleEditCertifications(ctx) {
  ctx.answerCbQuery('Editing certifications...');
  // Clear existing certifications
  ctx.session.cv.certifications = [];
  ctx.session.flow.currentStep = EDIT_CERTIFICATIONS;
  ctx.session.flow.returnToEditMenu = true;
  ctx.replyWithMarkdown('🏆 *Editing Certifications*\n\nLet\'s re-enter your certifications.');
  startCertificationsSection(ctx);
}

function handleEditReferences(ctx) {
  ctx.answerCbQuery('Editing references...');
  ctx.session.flow.currentStep = EDIT_REFERENCES;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('✅ Yes', 'references_yes')],
    [Markup.button.callback('❌ No', 'references_no')]
  ]);
  
  ctx.replyWithMarkdown(
    '📋 *Edit References*\n\n' +
    'Do you want your CV to include the line "References available on request"?',
    keyboard
  );
}

async function handleFinishEditing(ctx) {
  ctx.answerCbQuery('Generating updated preview...');
  ctx.session.flow.currentStep = PREVIEW;
  
  const preview = require('../services/preview').generateCVPreview(ctx.session);
  
  // Send preview with proper await
  await ctx.replyWithMarkdown(
    `📄 *Updated CV Preview*\n\n` +
    '```\n' +
    preview +
    '\n```'
  );
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('✅ Looks Good', 'looks_good')],
    [Markup.button.callback('✏️ Edit Again', 'edit_again')]
  ]);
  
  await ctx.replyWithMarkdown(
    'Does everything look good?',
    keyboard
  );
}

async function handleEditAgain(ctx) {
  ctx.answerCbQuery('Returning to edit menu...');
  await showEditMenu(ctx);
}

async function handleLooksGood(ctx) {
  ctx.answerCbQuery('Generating your PDF...');
  // Generate and send PDF
  await generateAndSendPDF(ctx);
}

module.exports = {
  handleAction,
};