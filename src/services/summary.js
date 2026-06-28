/**
 * Determines if the user is a student/entry-level based on background text
 */
function isEntryLevel(background) {
  const keywords = [
    'student', 'graduate', 'recent', 'fresh', 'entry', 'intern', 
    'nysc', 'corper', 'junior', 'trainee', 'apprentice', 'undergraduate'
  ];
  const lowerBg = background.toLowerCase();
  return keywords.some(keyword => lowerBg.includes(keyword));
}

/**
 * Generates a professional summary from user answers
 * Uses conditional logic to create a natural-sounding paragraph
 */
function generateSummary(background, strengths, careerGoal, highlight) {
  // Clean inputs
  const bg = background.trim();
  const strengthsList = strengths.trim();
  const goal = careerGoal.trim();
  const hasHighlight = highlight && highlight.trim().length > 0 && 
                      highlight.trim().toLowerCase() !== 'skip';
  const highlightText = hasHighlight ? highlight.trim() : null;
  
  // Determine if entry-level for phrasing adaptation
  const isEntry = isEntryLevel(bg);
  
  // Build sentences
  let sentences = [];
  
  // Sentence 1: Background/identity
  let bgSentence = bg;
  // Ensure proper capitalization and punctuation
  if (!bgSentence.endsWith('.') && !bgSentence.endsWith('!') && !bgSentence.endsWith('?')) {
    bgSentence += '.';
  }
  sentences.push(bgSentence);
  
  // Sentence 2: Strengths/skills
  if (strengthsList) {
    let strengthSentence = '';
    // Parse strengths into a list
    const strengths = strengthsList.split(',').map(s => s.trim()).filter(s => s);
    
    if (strengths.length === 1) {
      strengthSentence = `I bring strong ${strengths[0]} skills to the table.`;
    } else if (strengths.length === 2) {
      strengthSentence = `I bring strong ${strengths[0]} and ${strengths[1]} skills.`;
    } else {
      const lastStrength = strengths.pop();
      strengthSentence = `I bring strong ${strengths.join(', ')}, and ${lastStrength} skills.`;
    }
    sentences.push(strengthSentence);
  }
  
  // Sentence 3: Career goal and value proposition - SINGLE COMPLETE SENTENCE
  if (goal) {
    let goalSentence = '';
    // Clean up the goal text - remove any existing prefixes
    let goalClean = goal;
    // Remove common prefixes if they exist
    goalClean = goalClean.replace(/^(i am seeking|i am looking for|seeking|looking for)\s*/i, '');
    // Ensure proper capitalization
    if (goalClean && goalClean.length > 0) {
      goalClean = goalClean.charAt(0).toLowerCase() + goalClean.slice(1);
    }
    
    if (isEntry) {
      goalSentence = `I am seeking entry-level ${goalClean} opportunities where I can contribute my skills and grow professionally.`;
    } else {
      goalSentence = `I am looking for ${goalClean} roles where I can leverage my experience and add value.`;
    }
    sentences.push(goalSentence);
  }
  
  // Sentence 4: Optional highlight/achievement
  if (highlightText) {
    let highlightSentence = highlightText;
    // Ensure proper capitalization and punctuation
    if (!highlightSentence.endsWith('.') && !highlightSentence.endsWith('!') && !highlightSentence.endsWith('?')) {
      highlightSentence += '.';
    }
    // Add a transition if it doesn't start with a pronoun or typical starter
    if (!/^(i|my|recently|during|as|with|through|by|having)/i.test(highlightSentence)) {
      highlightSentence = `I ${highlightSentence.toLowerCase()}`;
    }
    sentences.push(highlightSentence);
  }
  
  // Combine sentences with proper spacing
  let summary = sentences.join(' ');
  
  // Final cleanup: ensure no double spaces
  summary = summary.replace(/\s{2,}/g, ' ');
  
  // Ensure summary is not empty
  if (!summary || summary.trim().length === 0) {
    summary = 'Motivated professional with strong skills seeking opportunities to contribute and grow.';
  }
  
  return summary;
}

module.exports = {
  generateSummary,
};