const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { generateHTML } = require('../templates/harvard');

/**
 * Gets the path to the Chrome executable
 * Works for both local development and production environments
 */
function getChromePath() {
  // Check if we're in a Render-like environment
  const isProduction = process.env.NODE_ENV === 'production' || 
                       process.env.RENDER === 'true' ||
                       process.env.RENDER_EXTERNAL_HOSTNAME !== undefined;
  
  if (isProduction) {
    // On Render, Puppeteer's default cache location should work
    // But we can also check common paths
    const possiblePaths = [
      // Puppeteer's default cache
      path.join(process.env.HOME || '/root', '.cache/puppeteer/chrome/linux-*/chrome-linux64/chrome'),
      // Render's specific path
      '/opt/render/.cache/puppeteer/chrome/linux-121.0.6167.85/chrome-linux64/chrome',
      // Generic fallback
      '/opt/render/.cache/puppeteer/chrome/*/chrome-linux64/chrome'
    ];
    // Return null to let Puppeteer auto-detect
    return null;
  }
  
  // Local development - let Puppeteer handle it
  return null;
}

/**
 * Generates a PDF from CV data
 * @param {Object} cvData - The CV data object from session
 * @param {string} outputPath - Path where PDF should be saved
 * @returns {Promise<string>} - Path to generated PDF
 */
async function generatePDF(cvData, outputPath) {
  let browser = null;
  
  try {
    // Generate HTML
    const html = generateHTML(cvData);
    
    // Configure launch options for production
    const launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process'
      ]
    };
    
    // In production, let Puppeteer find Chrome automatically
    // The environment variable will help Puppeteer find the installed Chrome
    if (process.env.RENDER === 'true') {
      // Puppeteer will use the default cache location
      // Set the cache directory explicitly
      const cacheDir = process.env.PUPPETEER_CACHE_DIR || 
                       '/opt/render/.cache/puppeteer';
      if (process.env.PUPPETEER_CACHE_DIR === undefined) {
        process.env.PUPPETEER_CACHE_DIR = cacheDir;
      }
    }
    
    // Launch Puppeteer with production-ready options
    browser = await puppeteer.launch(launchOptions);
    
    const page = await browser.newPage();
    
    // Set content with proper viewport
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });
    
    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: false,
      margin: {
        top: '60px',
        bottom: '60px',
        left: '60px',
        right: '60px'
      },
      preferCSSPageSize: true
    });
    
    return outputPath;
    
  } catch (error) {
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Creates a temporary PDF file
 * @param {Object} cvData - The CV data object from session
 * @returns {Promise<string>} - Path to generated PDF
 */
async function createPDF(cvData) {
  const tempDir = path.join(process.cwd(), 'temp');
  
  // Ensure temp directory exists
  try {
    await fs.access(tempDir);
  } catch (error) {
    await fs.mkdir(tempDir, { recursive: true });
  }
  
  const filename = `cv_${Date.now()}.pdf`;
  const filePath = path.join(tempDir, filename);
  
  return await generatePDF(cvData, filePath);
}

/**
 * Safely cleans up a temporary file
 * @param {string} filePath - Path to file to delete
 */
async function cleanupFile(filePath) {
  if (!filePath) return;
  
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
  } catch (error) {
    // File doesn't exist or already deleted - ignore
  }
}

module.exports = {
  generatePDF,
  createPDF,
  cleanupFile,
};
