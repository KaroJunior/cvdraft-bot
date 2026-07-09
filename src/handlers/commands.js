const { resetSession, isSessionComplete } = require('../services/session');
const { BOT_NAME, BOT_USERNAME } = require('../config');
const { Markup } = require('telegraf');
const { PERSONAL_FULL_NAME, COMPLETED, PREVIEW } = require('../constants/steps');
const { generateCVPreview } = require('../services/preview');
const { createPDF, cleanupFile } = require('../services/pdfGenerator');
const { parseCVFromPreview, validateRecoveryData } = require('../services/recovery');

/**
 * Handle /start command
 */
function handleStart(ctx) {
  // Reset session
  resetSession(ctx);
  
  const welcomeMessage = `
Welcome to *${BOT_NAME}!* 📄

I'll help you create a professional, ATS-friendly Harvard-style CV quickly and easily.

⚠️ *Important:* The free version doesn't save your progress permanently. Please complete your CV in one session.

Ready to get started? Click the button below to begin building your professional CV.

*${BOT_NAME}* — Your Personal CV Assistant 🤖
  `;
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('📝 Create CV', 'create_cv')]
  ]);
  
  return ctx.replyWithMarkdown(welcomeMessage, keyboard);
}

/**
 * Handle /help command
 */
async function handleHelp(ctx) {
  const helpMessage = `
🤖 *${BOT_NAME} Help*

*What I do*
I help you create a professional, ATS-friendly Harvard-style CV through a simple interview process.

*How to start*
Send /start and click "Create CV" to begin the interview.

*Editing your CV*
After your preview appears, you can edit any section using the "Edit CV" button.

*Recover your CV*
If you lost your CV after seeing the preview, use /recover to rebuild it from the preview text.

*Available commands*
/start — Begin creating your CV
/help — Show this help message
/startover — Reset and start over
/cancel — Cancel current operation
/recover — Recover your CV from a preview

*Privacy & Security*
🔒 Your information is only used to generate your CV. It is not permanently stored and is discarded after your CV is generated.

*Support*
If you encounter any issues, use /startover to begin again.

Thank you for using ${BOT_NAME}! 🎉
  `;
  
  await ctx.replyWithMarkdown(helpMessage);
}

/**
 * Handle /startover command
 */
function handleStartOver(ctx) {
  resetSession(ctx);
  
  ctx.replyWithMarkdown(
    '🔄 *Session reset!* Let\'s start over.\n\n' +
    'I\'ll guide you through creating your CV step by step.',
    Markup.inlineKeyboard([
      [Markup.button.callback('📝 Create CV', 'create_cv')]
    ])
  );
}

/**
 * Handle /cancel command
 */
function handleCancel(ctx) {
  const session = ctx.session;
  if (!session || !session.flow.currentStep) {
    return ctx.reply('There\'s no active process to cancel. Use /start to begin!');
  }
  
  resetSession(ctx);
  ctx.replyWithMarkdown(
    '❌ *Cancelled!*\n\n' +
    'Your progress has been cleared. Use /start to begin again when you\'re ready.',
    Markup.inlineKeyboard([
      [Markup.button.callback('📝 Create CV', 'create_cv')]
    ])
  );
}

/**
 * Handle callback for "Create CV" button
 */
function handleCreateCV(ctx) {
  // Reset session and start interview
  resetSession(ctx);
  ctx.session.flow.currentStep = PERSONAL_FULL_NAME;
  
  ctx.replyWithMarkdown(
    '*Let\'s create your CV!* 📝\n\n' +
    'First, I need some personal details.\n\n' +
    '👉 *What is your full name?*'
  );
}

/**
 * Handle /recover command
 * Reconstructs CV from a pasted preview
 */
async function handleRecover(ctx) {
  console.log('🔄 Recovery started');
  
  const session = ctx.session;
  
  // Reset any existing session
  resetSession(ctx);
  
  // Set a flag to indicate we're in recovery mode
  session.flow.mode = 'recovery';
  session.flow.currentStep = 'RECOVERY_WAITING';
  
  await ctx.replyWithMarkdown(
    '🔄 *CV Recovery*\n\n' +
    'Please paste your complete CV Preview exactly as it appeared.\n\n' +
    'I\'ll regenerate your PDF from it.\n\n' +
    '*Note:* The preview should include all sections of your CV.'
  );
}

/**
 * Generate and send PDF
 */
async function generateAndSendPDF(ctx) {
  const session = ctx.session;
  let pdfPath = null;
  
  try {
    // Show generating message
    await ctx.replyWithMarkdown('📄 *Generating your CV PDF...*');
    console.log('📄 PDF generation started');
    
    // Create PDF
    pdfPath = await createPDF(session.cv);
    
    // Send PDF to user
    await ctx.replyWithDocument(
      { source: pdfPath, filename: 'CVDraft_CV.pdf' },
      {
        caption: '✅ *Your CV is ready!*\n\nYour Harvard-style ATS-friendly CV has been generated successfully.',
        parse_mode: 'Markdown'
      }
    );
    
    // Clean up
    await cleanupFile(pdfPath);
    
    // Set session to completed
    session.flow.currentStep = COMPLETED;
    
    // Show final message
    await ctx.replyWithMarkdown(
      '🎉 *CV generation complete!*\n\n' +
      'You can use /startover to create another CV.\n' +
      'Thank you for using CVDraft!'
    );
    
    console.log('✅ PDF generation completed successfully');
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    
    // Clean up if file exists
    if (pdfPath) {
      await cleanupFile(pdfPath);
    }
    
    await ctx.replyWithMarkdown(
      '⚠️ *Something went wrong while generating your PDF.*\n\n' +
      'Please try again with /startover.\n\n' +
      'If the problem persists, please try again later.'
    );
  }
}

/**
 * Process recovery text from user
 */
async function processRecoveryText(ctx, text) {
  const session = ctx.session;
  
  // Only process if we're in recovery mode
  if (session.flow.mode !== 'recovery' || session.flow.currentStep !== 'RECOVERY_WAITING') {
    return false;
  }
  
  try {
    // Parse the preview text into CV data
    const cvData = parseCVFromPreview(text);
    
    // Validate required sections
    if (!validateRecoveryData(cvData)) {
      await ctx.replyWithMarkdown(
        '⚠️ *Invalid CV preview*\n\n' +
        'The preview you pasted is missing required sections. Please make sure it includes:\n' +
        '• Full name\n' +
        '• Professional title\n' +
        '• Professional summary\n' +
        '• At least one education entry\n\n' +
        'Please paste the complete preview again or use /start to create a new CV.'
      );
      return true;
    }
    
    // Store recovered CV data in session
    session.cv = cvData;
    session.flow.mode = 'normal';
    session.flow.currentStep = PREVIEW;
    
    // Generate preview to show user
    const preview = generateCVPreview(session);
    
    await ctx.replyWithMarkdown(
      '✅ *CV recovered successfully!*\n\n' +
      'Here\'s what was recovered:\n\n' +
      '```\n' +
      preview +
      '\n```'
    );
    
    console.log('✅ Recovery completed successfully');
    
    // Show PDF generation options
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('📄 Generate PDF', 'looks_good')],
      [Markup.button.callback('🔄 Start Over', 'create_cv')]
    ]);
    
    await ctx.replyWithMarkdown(
      'What would you like to do next?',
      keyboard
    );
    
    return true;
    
  } catch (error) {
    console.error('❌ Recovery parsing error:', error);
    await ctx.replyWithMarkdown(
      '⚠️ *Could not parse your CV preview.*\n\n' +
      `Error: ${error.message}\n\n` +
      'Please make sure you\'re pasting the complete preview text exactly as it appeared.\n\n' +
      'Use /start to create a new CV.'
    );
    return true;
  }
}

module.exports = {
  handleStart,
  handleHelp,
  handleStartOver,
  handleCancel,
  handleCreateCV,
  generateAndSendPDF,
  handleRecover,
  processRecoveryText,
};