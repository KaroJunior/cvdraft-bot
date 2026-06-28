const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { generateHTML } = require('../templates/harvard');

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
    
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
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