const { resetSession, isSessionComplete } = require('../services/session');
const { BOT_NAME, BOT_USERNAME } = require('../config');
const { Markup } = require('telegraf');
const { PERSONAL_FULL_NAME, COMPLETED } = require('../constants/steps');
const { generateCVPreview } = require('../services/preview');
const { createPDF, cleanupFile } = require('../services/pdfGenerator');

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

*Available commands*
/start — Begin creating your CV
/help — Show this help message
/startover — Reset and start over
/cancel — Cancel current operation

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
 * Generate and send PDF
 */
async function generateAndSendPDF(ctx) {
  const session = ctx.session;
  let pdfPath = null;
  
  try {
    // Show generating message
    await ctx.replyWithMarkdown('📄 *Generating your CV PDF...*');
    
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
    
  } catch (error) {
    console.error('PDF generation error:', error);
    
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

module.exports = {
  handleStart,
  handleHelp,
  handleStartOver,
  handleCancel,
  handleCreateCV,
  generateAndSendPDF,
};