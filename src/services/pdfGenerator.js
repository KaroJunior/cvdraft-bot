const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const fsSync = require('fs'); // For synchronous checks
const { generateHTML } = require('../templates/harvard');

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
  console.log(`  RENDER_EXTERNAL_HOSTNAME: ${process.env.RENDER_EXTERNAL_HOSTNAME || '(not set)'}`);
  
  // Working directory
  console.log(`\n📂 Working Directory: ${process.cwd()}`);
  
  // Puppeteer executable path
  let executablePath = null;
  try {
    executablePath = puppeteer.executablePath();
    console.log(`\n🔧 Puppeteer executablePath(): ${executablePath}`);
  } catch (error) {
    console.log(`\n🔧 Puppeteer executablePath() error: ${error.message}`);
  }
  
  // Check if executable exists
  if (executablePath) {
    const exists = fsSync.existsSync(executablePath);
    console.log(`  File exists: ${exists}`);
    if (exists) {
      try {
        const stats = fsSync.statSync(executablePath);
        console.log(`  File size: ${stats.size} bytes`);
        console.log(`  File permissions: ${stats.mode.toString(8)}`);
      } catch (statError) {
        console.log(`  Could not stat file: ${statError.message}`);
      }
    }
  }
  
  // Check common Chrome paths on Render
  console.log('\n📁 Checking common Chrome paths:');
  const commonPaths = [
    '/opt/render/.cache/puppeteer/chrome/linux-121.0.6167.85/chrome-linux64/chrome',
    '/opt/render/.cache/puppeteer/chrome/linux-*/chrome-linux64/chrome',
    '/opt/render/.cache/puppeteer/chrome/linux-*',
    '/opt/render/.cache/puppeteer/',
    '/root/.cache/puppeteer/',
    '/home/render/.cache/puppeteer/',
  ];
  
  commonPaths.forEach(testPath => {
    // Check if path exists (only for exact paths, not glob patterns)
    if (!testPath.includes('*')) {
      const exists = fsSync.existsSync(testPath);
      console.log(`  ${testPath}: ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
      if (exists) {
        try {
          const stats = fsSync.statSync(testPath);
          if (stats.isDirectory()) {
            console.log(`    (Directory)`);
            // List contents of directory
            try {
              const files = fsSync.readdirSync(testPath);
              console.log(`    Contents: ${files.join(', ')}`);
            } catch (readError) {
              console.log(`    Could not read directory: ${readError.message}`);
            }
          } else {
            console.log(`    (File, ${stats.size} bytes)`);
          }
        } catch (statError) {
          console.log(`    Could not stat: ${statError.message}`);
        }
      }
    } else {
      // For glob patterns, check if parent directory exists and list contents
      const parentPath = testPath.substring(0, testPath.lastIndexOf('/'));
      if (parentPath && fsSync.existsSync(parentPath)) {
        console.log(`  ${parentPath}: exists`);
        try {
          const files = fsSync.readdirSync(parentPath);
          console.log(`    Contents: ${files.join(', ')}`);
        } catch (readError) {
          console.log(`    Could not read directory: ${readError.message}`);
        }
      } else if (parentPath) {
        console.log(`  ${parentPath}: ❌ NOT FOUND`);
      }
    }
  });
  
  // Check if Puppeteer can find Chrome via its internal resolution
  console.log('\n🔍 Testing Puppeteer Chrome resolution:');
  try {
    // Try to get the browser path using Puppeteer's internal method
    const { Browser } = require('puppeteer/lib/cjs/puppeteer/common/Browser');
    console.log('  Puppeteer Browser module loaded successfully');
  } catch (error) {
    console.log(`  Could not load Puppeteer internals: ${error.message}`);
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
    
    // In production, let Puppeteer find Chrome automatically
    // The environment variable will help Puppeteer find the installed Chrome
    if (process.env.RENDER === 'true') {
      // Puppeteer will use the default cache location
      // Set the cache directory explicitly
      const cacheDir = process.env.PUPPETEER_CACHE_DIR || 
                       '/opt/render/.cache/puppeteer';
      if (process.env.PUPPETEER_CACHE_DIR === undefined) {
        process.env.PUPPETEER_CACHE_DIR = cacheDir;
        console.log(`⚠️ Set PUPPETEER_CACHE_DIR to: ${cacheDir}`);
      }
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
