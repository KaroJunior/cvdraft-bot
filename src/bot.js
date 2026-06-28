const express = require('express');
const { Telegraf, session } = require('telegraf');
const { BOT_TOKEN } = require('./config');
const { getDefaultSession } = require('./services/session');
const { handleStart, handleStartOver, handleCancel, handleHelp } = require('./handlers/commands');
const { handleText } = require('./handlers/text');
const { handleAction } = require('./handlers/actions');

// Validate BOT_TOKEN
if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is not defined in .env file');
  process.exit(1);
}

// Initialize Express server for Render
const app = express();
const PORT = process.env.PORT || 3000;

// Health check route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    bot: 'CVDraft',
    message: 'Telegram bot is running.'
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`✅ Express server running on port ${PORT}`);
});

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);

// Session middleware with default session
bot.use(session({
  defaultSession: () => getDefaultSession()
}));

// Logging middleware
bot.use((ctx, next) => {
  const start = Date.now();
  return next().then(() => {
    const ms = Date.now() - start;
    const username = ctx.from?.username || 'unknown';
    const text = ctx.message?.text || ctx.callbackQuery?.data || 'no text';
    console.log(`[${new Date().toISOString()}] ${username}: ${text} (${ms}ms)`);
  });
});

// Error handling middleware
bot.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Bot error:', error);
    await ctx.reply('⚠️ Something went wrong. Please try again or use /startover to restart.');
  }
});

// Commands
bot.command('start', handleStart);
bot.command('help', handleHelp);
bot.command('startover', handleStartOver);
bot.command('cancel', handleCancel);

// Handle callback queries (button clicks)
bot.action(/.*/, handleAction);

// Handle text messages (only when not in command or callback)
bot.on('text', handleText);

// Launch bot
bot.launch()
  .then(() => {
    console.log(`✅ ${require('./config').BOT_NAME} bot is running!`);
    console.log(`📍 Bot username: ${require('./config').BOT_USERNAME}`);
    console.log('📝 Press Ctrl+C to stop');
    console.log('📋 Available commands: /start, /help, /startover, /cancel');
  })
  .catch((error) => {
    console.error('❌ Failed to launch bot:', error);
    process.exit(1);
  });

// Enable graceful stop
process.once('SIGINT', () => {
  console.log('🛑 Bot stopped (SIGINT)');
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  console.log('🛑 Bot stopped (SIGTERM)');
  bot.stop('SIGTERM');
});