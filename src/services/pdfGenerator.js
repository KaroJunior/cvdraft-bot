const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const fsSync = require('fs');
const { generateHTML } = require('../templates/harvard');

/**
 * Gets the path to the Chrome executable
 * Works for both local development and production environments
 */
function getChromePath() {
  // Check if we're on Render
  const isRender = process.env.RENDER === 'true';
  
  if (isRender) {
    // On Render, use the project-local cache path
    const projectRoot = process.cwd();
    const localCachePath = path.join(projectRoot, '.cache', 'puppeteer');
    
    // Common Chrome paths in the project-local cache
    const possiblePaths = [
      // Chrome for Linux (Render uses Linux)
      path.join(localCachePath, 'chrome', 'linux-*', 'chrome-linux64', 'chrome'),
      path.join(localCachePath, 'chrome', 'linux-*', 'chrome-linux', 'chrome'),
    ];
    
    // Return null to let Puppeteer auto-detect using its cache directory
    return null;
  }
  
  // Local development - let Puppeteer handle it
  return null;
}

/**
 * Debug function to log environment and path information
 */
function debugPuppeteerEnvironment() {
  console.log('========================================');
  console.log('🔍 PUPPETEER DEBUG INFORMATION');
  console.log('========================================');
  
  // Environment variables
  console.log('📌 Environment Variables:');
  console.log(`  PUPPETEER_CACHE_DIR: ${process.env.PUPPETEER_CACHE_DIR || '(not set)'}`);
  console.log(`  PUPPETEER_EXECUTABLE_PATH: ${process.env.PUPPETEER_EXECUTABLE_PATH || '(not set)'}`);
  console.log(`  HOME: ${process.env.HOME || '(not set)'}`);
  console.log(`  RENDER: ${process.env.RENDER || '(not set)'}`);
  console.log(`  NODE_ENV: ${process.env.NODE_ENV || '(not set)'}`);
  
  // Working directory
  console.log(`\n📂 Working Directory: ${process.cwd()}`);
  
  // Project-local cache path
  const projectCachePath = path.join(process.cwd(), '.cache', 'puppeteer');
  console.log(`\n📁 Project cache path: ${projectCachePath}`);
  console.log(`  Exists: ${fsSync.existsSync(projectCachePath)}`);
  
  if (fsSync.existsSync(projectCachePath)) {
    try {
      const files = fsSync.readdirSync(projectCachePath);
      console.log(`  Contents: ${files.join(', ')}`);
      
      // Check for chrome folder
      if (files.includes('chrome')) {
        const chromePath = path.join(projectCachePath, 'chrome');
        const chromeFiles = fsSync.readdirSync(chromePath);
        console.log(`  chrome/ contents: ${chromeFiles.join(', ')}`);
        
        // Look for the actual Chrome executable
        chromeFiles.forEach(folder => {
          if (folder.startsWith('linux-')) {
            const fullPath = path.join(chromePath, folder);
            try {
              const subFiles = fsSync.readdirSync(fullPath);
              console.log(`    ${folder}/ contents: ${subFiles.join(', ')}`);
              
              // Check for chrome-linux64 or chrome-linux
              ['chrome-linux64', 'chrome-linux'].forEach(chromeDir => {
                if (subFiles.includes(chromeDir)) {
                  const chromeExecutable = path.join(fullPath, chromeDir, 'chrome');
                  console.log(`    🔧 Executable candidate: ${chromeExecutable}`);
                  console.log(`      Exists: ${fsSync.existsSync(chromeExecutable)}`);
                }
              });
            } catch (error) {
              console.log(`    Could not read ${folder}: ${error.message}`);
            }
          }
        });
      }
    } catch (error) {
      console.log(`  Could not read cache directory: ${error.message}`);
    }
  }
  
  // Puppeteer executable path
  let executablePath = null;
  try {
    executablePath = puppeteer.executablePath();
    console.log(`\n🔧 Puppeteer executablePath(): ${executablePath}`);
    if (executablePath) {
      const exists = fsSync.existsSync(executablePath);
      console.log(`  File exists: ${exists}`);
      if (exists) {
        try {
          const stats = fsSync.statSync(executablePath);
          console.log(`  File size: ${stats.size} bytes`);
        } catch (statError) {
          console.log(`  Could not stat file: ${statError.message}`);
        }
      }
    }
  } catch (error) {
    console.log(`\n🔧 Puppeteer executablePath() error: ${error.message}`);
  }
  
  console.log('========================================\n');
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
    // DEBUG: Log environment before launching
    debugPuppeteerEnvironment();
    
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
    
    // Set cache directory to project-local path if on Render or if PUPPETEER_CACHE_DIR isn't set
    const isRender = process.env.RENDER === 'true';
    if (isRender || !process.env.PUPPETEER_CACHE_DIR) {
      const projectCachePath = path.join(process.cwd(), '.cache', 'puppeteer');
      process.env.PUPPETEER_CACHE_DIR = projectCachePath;
      console.log(`⚠️ Set PUPPETEER_CACHE_DIR to: ${projectCachePath}`);
    }
    
    console.log('🚀 Launching Puppeteer with options:', JSON.stringify(launchOptions, null, 2));
    console.log(`📄 Output path: ${outputPath}`);
    
    // Launch Puppeteer with production-ready options
    browser = await puppeteer.launch(launchOptions);
    
    console.log('✅ Puppeteer launched successfully!');
    
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
    
    console.log('✅ PDF generated successfully!');
    
    return outputPath;
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
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