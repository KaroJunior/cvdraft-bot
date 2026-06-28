/**
 * Validates that a string is not empty or just whitespace
 */
function isNotEmpty(value) {
  return value && value.trim().length > 0;
}

/**
 * Basic email validation
 */
function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates phone number (basic: at least 10 digits, allows +, spaces, hyphens)
 */
function isValidPhone(phone) {
  if (!phone) return false;
  const clean = phone.replace(/[\s\-()]/g, '');
  return clean.length >= 10 && /^[\d+]+$/.test(clean);
}

/**
 * Checks if value should be treated as "skip" for optional fields
 */
function isSkip(value) {
  if (!value) return false;
  return value.trim().toLowerCase() === 'skip';
}

/**
 * Validates LinkedIn URL (basic check)
 */
function isValidLinkedIn(url) {
  if (!url) return false;
  return url.includes('linkedin.com') || url.includes('linkedin');
}

/**
 * Validates URL (basic check)
 */
function isValidUrl(url) {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Parses comma-separated string into trimmed array
 * Handles "skip" by returning empty array
 */
function parseCommaSeparated(input) {
  if (!input || input.trim().toLowerCase() === 'skip') {
    return [];
  }
  return input.split(',').map(item => item.trim()).filter(item => item.length > 0);
}

/**
 * Basic year validation (accepts 4-digit years)
 */
function isValidYear(value) {
  if (!value) return false;
  const year = value.trim();
  // Accept 4-digit years from 1900-2099
  return /^[12]\d{3}$/.test(year);
}

module.exports = {
  isNotEmpty,
  isValidEmail,
  isValidPhone,
  isSkip,
  isValidLinkedIn,
  isValidUrl,
  parseCommaSeparated,
  isValidYear,
};