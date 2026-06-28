const fs = require('fs').promises;
const path = require('path');

/**
 * Cleans up temporary files older than specified time
 * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
 */
async function cleanupOldTempFiles(maxAge = 3600000) {
  const tempDir = path.join(process.cwd(), 'temp');
  
  try {
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile() && (now - stats.mtimeMs) > maxAge) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    // Temp directory doesn't exist or other error - ignore
  }
}

module.exports = {
  cleanupOldTempFiles,
};