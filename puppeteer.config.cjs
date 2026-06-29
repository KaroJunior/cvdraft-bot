const { join } = require('path');

/**
 * Puppeteer configuration for CVDraft
 * Uses project-local cache to ensure Chrome is available in all environments
 */
module.exports = {
  // Use project-local cache directory instead of system-wide
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
  
  // Log downloads for debugging
  logLevel: 'info',
  
  // Skip downloading Chrome if it already exists
  skipDownload: false,
};