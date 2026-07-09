const { COMPLETED } = require('../constants/steps');

/**
 * Creates a default session state for the CV bot
 */
function getDefaultSession() {
  console.log('🔍 getDefaultSession() called');
  const session = {
    flow: {
      currentStep: null,
      mode: 'interview',
      editingSection: null,
      tempEntry: null,
      awaitingSectionAction: false,
    },
    cv: {
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
    }
  };
  console.log(`🔍 Default session created - mode: ${session.flow.mode}, currentStep: ${session.flow.currentStep}`);
  return session;
}

/**
 * Resets session to default state
 */
function resetSession(ctx) {
  console.log('🔍 resetSession() called');
  console.log(`🔍 Before reset - mode: ${ctx.session?.flow?.mode}, currentStep: ${ctx.session?.flow?.currentStep}`);
  
  const defaultSession = getDefaultSession();
  ctx.session = defaultSession;
  
  console.log(`🔍 After reset - mode: ${ctx.session.flow.mode}, currentStep: ${ctx.session.flow.currentStep}`);
  return ctx.session;
}

/**
 * Checks if user has completed all required sections
 */
function isSessionComplete(session) {
  const { personal, targetRole, summary, education, experience } = session.cv;
  
  // Check Phase 1 fields
  if (!personal.fullName || !personal.phone || !personal.email || !personal.location) {
    return false;
  }
  if (!targetRole) return false;
  if (!summary) return false;
  
  // Check Phase 2 fields
  if (education.length === 0) return false;
  if (experience.length === 0) return false;
  
  // Phase 3 fields are optional
  return true;
}

module.exports = {
  getDefaultSession,
  resetSession,
  isSessionComplete,
};