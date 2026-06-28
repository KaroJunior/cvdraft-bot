# CVDraft Bot - Complete Developer Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Project Architecture](#3-project-architecture)
4. [File-by-File Explanation](#4-file-by-file-explanation)
5. [Complete Flow of the Bot](#5-complete-flow-of-the-bot)
6. [Session Structure](#6-session-structure)
7. [Conversation Flow](#7-conversation-flow)
8. [Validation System](#8-validation-system)
9. [PDF Generation](#9-pdf-generation)
10. [HTML Template](#10-html-template)
11. [Commands](#11-commands)
12. [How to Change the Bot](#12-how-to-change-the-bot)
13. [Hosting](#13-hosting)
14. [Maintenance Guide](#14-maintenance-guide)
15. [Troubleshooting Guide](#15-troubleshooting-guide)
16. [Future Improvements](#16-future-improvements)
17. [FAQ](#17-faq)
18. [Codebase Best Practices](#18-codebase-best-practices)
19. [Quick Reference Cheat Sheet](#19-quick-reference-cheat-sheet)

---

## 1. Project Overview

### What is CVDraft?

CVDraft is a Telegram bot that helps users create professional, ATS-friendly Harvard-style CVs through a simple conversational interview. Users answer questions one at a time, review their CV, make edits, and download a polished PDF—all within Telegram.

### The Problem It Solves

Creating a professional CV is time-consuming and confusing. Many people don't know what to include, how to format it, or what makes a CV ATS-friendly (parsable by applicant tracking systems). CVDraft guides users through the process step-by-step, collecting all necessary information and generating a properly formatted PDF.

### Who It Is For

- Students and fresh graduates creating their first CV
- Early-career professionals updating their CV
- Anyone who wants a simple, no-fuss way to create a professional CV
- Users who prefer mobile-first interaction (Telegram)

### How Users Interact

Users interact entirely through Telegram messages and buttons. The bot asks questions one at a time, validates answers, and stores responses in a temporary session. At the end, users review a plain-text preview, make edits, and receive a PDF.

### Complete User Journey

1. **/start** - User initiates the bot
2. **Create CV** - User clicks the button to begin
3. **Personal Details** - Name, phone, email, location, LinkedIn, website
4. **Target Role** - Optional professional title/subtitle
5. **Summary** - Either write manually or use the helper mode
6. **Education** - One or more entries (school, degree, field, location, years, GPA)
7. **Experience** - One or more entries with bullet points (role, company, dates)
8. **Skills** - Technical, languages, other (comma-separated)
9. **Projects** - Optional (name, role, tech, description)
10. **Activities** - Optional (title, organization, description)
11. **Certifications** - Optional (name, issuer, year)
12. **References** - Toggle "References available on request"
13. **Preview** - Full plain-text CV preview shown
14. **Edit** - Edit any section by re-entering it
15. **Looks Good** - Generate PDF
16. **PDF Delivery** - User receives the PDF file

---

## 2. Features

### Conversational CV Builder

The bot conducts a structured interview, asking one question at a time. Each answer is validated and stored in the session. The flow is linear but allows going back via the edit system.

**How it works**: The bot uses a `currentStep` variable in the session to track where the user is. When a user sends a message, the `handleText()` function checks `currentStep` and routes to the appropriate handler. Each handler updates the session, advances `currentStep`, and asks the next question.

### Harvard-Style PDF Generation

Generates a clean, professional PDF based on the Harvard CV format—simple, readable, and ATS-friendly. The PDF uses Arial/Helvetica fonts, proper margins, and clear section headings.

**How it works**: Session data → `generateHTML()` creates an HTML string → Puppeteer renders HTML → PDF is generated → sent to user.

### ATS-Friendly Formatting

The CV is designed to be parsed by Applicant Tracking Systems:
- No tables, columns, or complex layouts
- No graphics, images, or icons
- Simple headings and consistent spacing
- Clean bullet points (not special characters)
- Standard fonts (Arial, Helvetica, Calibri)

### Review & Edit Flow

After the initial preview, users can edit any section. Editing clears that section's data and re-runs the same interview questions. When finished, a new preview is generated.

**How it works**: The `EDIT_MENU` step shows buttons for each section. Clicking a button sets `currentStep` to `EDIT_*` (e.g., `EDIT_EDUCATION`), clears the relevant data, and calls the same `start` function used in the main flow. When the section is complete, it returns to `EDIT_MENU`.

### Validation System

Each user input is validated before being stored:
- Required fields cannot be empty
- Email uses regex validation
- Phone numbers require at least 10 digits
- URLs must start with http:// or https://
- Years must be 4-digit numbers
- "skip" is recognized for optional fields

### Inline Keyboards

Buttons are used extensively to guide the user:
- "Create CV" to start
- "Write it myself" / "Help me build one" for summary
- "Add another" / "Continue" for repeatable sections
- "Add bullet" / "Finish entry" for experience bullets
- "Yes" / "No" for references
- Edit menu buttons
- "Looks Good" / "Edit Again" after preview

### Session Management

All user data is stored in memory (not a database). Each user gets a unique session object that persists as long as the bot is running and the user's session is active. Data is cleared when:
- User sends `/startover`
- User sends `/cancel`
- Bot restarts (memory cleared)

### Privacy Approach

No data is permanently stored. All user information exists only in memory during the session and is deleted when the session ends or the bot restarts. No analytics, tracking, or third-party sharing.

### Commands

| Command | Purpose |
|---------|---------|
| `/start` | Start the bot or create a new CV |
| `/help` | Show help information |
| `/startover` | Reset everything and start over |
| `/cancel` | Cancel current operation |

### Error Handling

All user-facing errors show friendly messages. Internal errors are logged to the console. The bot never crashes—errors are caught and shown to the user with a suggestion to use `/startover`.

---

## 3. Project Architecture

### Folder Structure

```
cvdraft-bot/
├── src/
│   ├── bot.js              # Entry point - bootstraps everything
│   ├── config/
│   │   └── index.js        # Environment variables and config
│   ├── constants/
│   │   └── steps.js        # All step constants (conversation states)
│   ├── handlers/
│   │   ├── commands.js     # /start, /help, /startover, /cancel
│   │   ├── text.js         # Text message handlers (all interview questions)
│   │   └── actions.js      # Callback query handlers (button clicks)
│   ├── services/
│   │   ├── session.js      # Session management (create, reset, check)
│   │   ├── summary.js      # Non-AI summary generation
│   │   ├── preview.js      # Plain-text preview generation
│   │   ├── pdfGenerator.js # PDF generation with Puppeteer
│   │   └── tempCleanup.js  # Optional temp file cleanup
│   ├── templates/
│   │   └── harvard.js      # Harvard-style HTML template
│   └── utils/
│       └── validation.js   # Input validation functions
├── temp/                    # Temporary PDF files (auto-cleaned)
├── .env                     # Environment variables (BOT_TOKEN)
├── package.json             # Dependencies and scripts
└── package-lock.json        # Locked dependency versions
```

### Why Each Folder Exists

| Folder | Purpose |
|--------|---------|
| `src/` | All source code |
| `config/` | Centralized configuration - easy to update bot name, token, etc. |
| `constants/` | All conversation step names in one place - prevents typos |
| `handlers/` | Separates different types of user interaction (commands, text, buttons) |
| `services/` | Business logic that can be reused across handlers |
| `templates/` | HTML templates for PDF generation - easy to add more templates |
| `utils/` | Helper functions used across the project |

---

## 4. File-by-File Explanation

### src/bot.js

**Why it exists**: Entry point of the application. Bootstraps the bot, sets up middleware, registers commands, and starts listening.

**What it's responsible for**:
- Validating BOT_TOKEN exists
- Creating Telegraf instance
- Setting up session middleware
- Registering all commands
- Registering action and text handlers
- Launching the bot
- Graceful shutdown on SIGINT/SIGTERM

**Dependencies**: All handlers and services

**What happens if modified**: Any change to the core bot setup, command list, or middleware stack

---

### src/config/index.js

**Why it exists**: Centralizes all configuration and environment variables.

**What it's responsible for**:
- Loading .env file
- Exporting BOT_TOKEN
- Exporting bot name and username

**Dependencies**: dotenv package

**What happens if modified**: Changes bot name, token, or other configuration

---

### src/constants/steps.js

**Why it exists**: Defines all conversation step names as constants to prevent typos and make refactoring easier.

**What it's responsible for**:
- Exporting step names used throughout the bot

**Dependencies**: None

**What happens if modified**: Adding/removing steps affects the conversation flow

---

### src/handlers/commands.js

**Why it exists**: Handles all slash commands (/start, /help, /startover, /cancel).

**What it's responsible for**:
- /start: Welcome message, reset session, show "Create CV" button
- /help: Show help information
- /startover: Reset everything, start over
- /cancel: Cancel current operation, clear session
- `generateAndSendPDF()`: The actual PDF generation and delivery function

**Dependencies**: session.js, preview.js, pdfGenerator.js

**What happens if modified**: Changes command behavior

---

### src/handlers/text.js

**Why it exists**: Handles all text messages (user answers to interview questions).

**What it's responsible for**:
- Routing messages based on `currentStep`
- All interview question handlers (personal details, summary, education, etc.)
- Starting each section (education, experience, skills, etc.)
- Showing preview and edit menu
- Edit flow for personal details and summary

**Dependencies**: validation.js, summary.js, preview.js, steps.js

**What happens if modified**: Changes interview flow, questions, or validation

---

### src/handlers/actions.js

**Why it exists**: Handles all button clicks (callback queries).

**What it's responsible for**:
- All button callbacks: "Create CV", summary mode, adding entries, editing, finishing, etc.
- Edit flow callbacks (edit_personal, edit_education, etc.)
- "Looks Good" triggers PDF generation

**Dependencies**: text.js, commands.js

**What happens if modified**: Changes button behavior

---

### src/services/session.js

**Why it exists**: Manages session state - creating, resetting, and checking sessions.

**What it's responsible for**:
- `getDefaultSession()`: Creates a new blank session
- `resetSession()`: Wipes the session and starts fresh
- `isSessionComplete()`: Checks if all required data exists

**Dependencies**: steps.js

**What happens if modified**: Changes session structure or reset behavior

---

### src/services/summary.js

**Why it exists**: Generates a professional summary from user answers without using AI.

**What it's responsible for**:
- `isEntryLevel()`: Detects if user is entry-level based on keywords
- `generateSummary()`: Combines background, strengths, goal, and highlight into a paragraph

**Dependencies**: None

**What happens if modified**: Changes summary generation logic or phrasing

---

### src/services/preview.js

**Why it exists**: Generates a plain-text CV preview for display in Telegram.

**What it's responsible for**:
- `generateCVPreview()`: Formats all CV data into a readable plain-text preview
- Handles conditional sections (only show if data exists)
- Formats bullets, dates, and contact lines

**Dependencies**: None

**What happens if modified**: Changes preview appearance

---

### src/services/pdfGenerator.js

**Why it exists**: Converts CV data to a PDF file.

**What it's responsible for**:
- `generatePDF()`: Launches Puppeteer, renders HTML, creates PDF
- `createPDF()`: Creates temp file and calls generatePDF
- `cleanupFile()`: Safely deletes temporary files

**Dependencies**: puppeteer, harvard.js

**What happens if modified**: Changes PDF generation settings (margins, format, etc.)

---

### src/services/tempCleanup.js

**Why it exists**: Optional cleanup of old temporary files.

**What it's responsible for**:
- `cleanupOldTempFiles()`: Deletes files in temp directory older than specified age

**Dependencies**: fs, path

**What happens if modified**: Changes cleanup behavior

---

### src/templates/harvard.js

**Why it exists**: Generates the HTML used for PDF generation.

**What it's responsible for**:
- `generateHTML()`: Creates a complete HTML document from CV data
- Escapes HTML to prevent injection
- Conditionally includes sections
- Applies Harvard-style CSS

**Dependencies**: None

**What happens if modified**: Changes PDF layout, fonts, or styling

---

### src/utils/validation.js

**Why it exists**: Provides reusable validation functions.

**What it's responsible for**:
- isNotEmpty(): Required field validation
- isValidEmail(): Email regex validation
- isValidPhone(): Phone number validation
- isSkip(): Detects "skip" for optional fields
- isValidLinkedIn(): Basic LinkedIn URL check
- isValidUrl(): URL format check
- parseCommaSeparated(): Converts comma-separated strings to arrays
- isValidYear(): 4-digit year validation

**Dependencies**: None

**What happens if modified**: Changes validation rules

---

## 5. Complete Flow of the Bot

### /start Command Flow

```
User sends /start
    ↓
handleStart() in commands.js
    ↓
resetSession() - wipes any existing session
    ↓
Show welcome message with "Create CV" button
```

### Creating a CV - Full Interview Flow

```
User clicks "Create CV"
    ↓
handleCreateCV() in actions.js
    ↓
resetSession()
    ↓
Set currentStep = PERSONAL_FULL_NAME
    ↓
Ask: "What is your full name?"

User responds with text
    ↓
handleText() in text.js sees currentStep = PERSONAL_FULL_NAME
    ↓
handleFullName() validates and stores
    ↓
Set currentStep = PERSONAL_PHONE
    ↓
Ask: "What is your phone number?"

... continues through all steps ...

At each step:
    1. Validate input
    2. Store in session.cv
    3. Advance currentStep
    4. Ask next question
```

### Summary Helper Flow

```
User clicks "Help me build one"
    ↓
handleSummaryAuto() in actions.js
    ↓
Set currentStep = SUMMARY_BG
    ↓
Ask: "Briefly describe your current background"

User responds
    ↓
handleSummaryBackground() stores background
    ↓
Set currentStep = SUMMARY_STRENGTHS
    ↓
Ask: "What are your top 2-4 strengths?"

User responds
    ↓
handleSummaryStrengths() stores strengths
    ↓
Set currentStep = SUMMARY_GOAL
    ↓
Ask: "What role(s) are you targeting?"

User responds
    ↓
handleSummaryGoal() stores careerGoal
    ↓
Set currentStep = SUMMARY_HIGHLIGHT
    ↓
Ask: "Tell me about one achievement..."

User responds (or types skip)
    ↓
handleSummaryHighlight() stores highlight
    ↓
Call generateSummary() with all answers
    ↓
Store generated summary in session
    ↓
Set currentStep = EDUCATION_INTRO
    ↓
Show "Continue to Education" button
```

### Repeatable Section Flow (Education Example)

```
User clicks "Continue to Education"
    ↓
handleEducationStart() in actions.js
    ↓
Initialize tempEntry object
    ↓
Set currentStep = EDUCATION_SCHOOL
    ↓
Ask: "What is the name of your school?"

User responds
    ↓
handleEducationSchool() stores in tempEntry
    ↓
Set currentStep = EDUCATION_DEGREE
    ↓
Ask: "What degree?"

... continues through all education questions ...

handleEducationGPA() stores GPA
    ↓
Push tempEntry to cv.education
    ↓
Clear tempEntry
    ↓
Set currentStep = EDUCATION_COMPLETE
    ↓
Show "Add another education" / "Continue to Experience" buttons
```

### Experience Bullet Flow

```
User enters title, company, dates
    ↓
Set currentStep = EXPERIENCE_BULLET
    ↓
Ask: "What was a key responsibility?"

User responds
    ↓
handleExperienceBullet() adds bullet to tempEntry.bullets
    ↓
Set currentStep = EXPERIENCE_BULLET_ACTION
    ↓
Show "Add another bullet" / "Finish this entry" buttons

User clicks "Add another bullet"
    ↓
handleBulletAdd() in actions.js
    ↓
Set currentStep = EXPERIENCE_BULLET
    ↓
Ask for next bullet

User clicks "Finish this entry"
    ↓
handleBulletFinish() in actions.js
    ↓
Check if at least 1 bullet exists
    ↓
Push tempEntry to cv.experience
    ↓
Clear tempEntry
    ↓
Set currentStep = EXPERIENCE_COMPLETE
    ↓
Show "Add another experience" / "Continue to Skills" buttons
```

### Preview & Edit Flow

```
After Skills complete:
    ↓
Set currentStep = PROJECTS_INTRO
    ↓
Ask: "Do you want to add projects?"

... Projects (optional) ...
... Activities (optional) ...
... Certifications (optional) ...
... References (Yes/No) ...

After References:
    ↓
showPreview() in text.js
    ↓
Generate preview with generateCVPreview()
    ↓
Send preview as monospace block
    ↓
showEditMenu() in text.js
    ↓
Show edit menu with buttons for each section + "Finish Editing"
```

### Editing a Section Flow

```
User clicks "Edit Education"
    ↓
handleEditEducation() in actions.js
    ↓
Clear cv.education = []
    ↓
Set currentStep = EDIT_EDUCATION
    ↓
Set returnToEditMenu = true
    ↓
Call startEducationSection()
    ↓
Re-run education interview (same as initial flow)

... after completing education ...

handleEducationContinue() sees edit mode
    ↓
Show "Education updated!" message
    ↓
showEditMenu() - return to edit menu
```

### Finish Editing & PDF Generation

```
User clicks "Finish Editing"
    ↓
handleFinishEditing() in actions.js
    ↓
Generate updated preview
    ↓
Send preview
    ↓
Show "Looks Good" / "Edit Again" buttons

User clicks "Looks Good"
    ↓
handleLooksGood() in actions.js
    ↓
Call generateAndSendPDF() in commands.js
    ↓
Show "Generating your CV PDF..."
    ↓
createPDF() in pdfGenerator.js
    ↓
Generate HTML (harvard.js)
    ↓
Launch Puppeteer
    ↓
Render HTML to PDF
    ↓
ctx.replyWithDocument() - send PDF to user
    ↓
cleanupFile() - delete temp file
    ↓
Show final completion message
```

---

## 6. Session Structure

### Complete Session Object

```json
{
  "flow": {
    "currentStep": "PERSONAL_FULL_NAME",
    "mode": "interview",
    "editingSection": null,
    "tempEntry": null,
    "awaitingSectionAction": false,
    "returnToEditMenu": false
  },
  "cv": {
    "personal": {
      "fullName": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com",
      "location": "New York, USA",
      "linkedin": "https://linkedin.com/in/johndoe",
      "website": "https://johndoe.com"
    },
    "targetRole": "Frontend Developer",
    "summary": "Experienced frontend developer...",
    "summaryMeta": {
      "useGeneratedSummary": true,
      "background": "Computer Science student",
      "strengths": "HTML, CSS, JavaScript",
      "careerGoal": "frontend developer roles",
      "highlight": "built a portfolio website"
    },
    "education": [
      {
        "school": "Harvard University",
        "degree": "B.Sc",
        "field": "Computer Science",
        "location": "Cambridge, MA",
        "startYear": "2020",
        "endYear": "2024",
        "isInProgress": false,
        "gpa": "3.8"
      }
    ],
    "experience": [
      {
        "title": "Frontend Developer Intern",
        "company": "Tech Corp",
        "location": "Remote",
        "startDate": "Jun 2023",
        "endDate": "Aug 2023",
        "isCurrent": false,
        "bullets": [
          "Built responsive landing pages",
          "Worked with senior developers"
        ]
      }
    ],
    "projects": [
      {
        "name": "Portfolio Website",
        "role": "Developer",
        "tech": ["React", "CSS"],
        "description": "Built a personal portfolio..."
      }
    ],
    "activities": [
      {
        "title": "Club President",
        "organization": "CS Club",
        "description": "Led weekly meetings..."
      }
    ],
    "skills": {
      "technical": ["HTML", "CSS", "JavaScript"],
      "languages": ["English", "Igbo"],
      "other": ["communication", "teamwork"]
    },
    "certifications": [
      {
        "name": "AWS Certified",
        "issuer": "Amazon",
        "year": "2023"
      }
    ],
    "referencesOnRequest": true
  }
}
```

### flow Object

| Property | Purpose |
|----------|---------|
| `currentStep` | Current conversation state (determines which handler runs) |
| `mode` | "interview" or "editing" - determines behavior |
| `editingSection` | Which section is being edited (used for cleanup) |
| `tempEntry` | Temporary object for in-progress entries (education, experience, etc.) |
| `awaitingSectionAction` | Boolean flag for button-based flows |
| `returnToEditMenu` | Flag to return to edit menu after completing a section |

### cv Object

| Property | Purpose |
|----------|---------|
| `personal` | User's personal details (name, contact info) |
| `targetRole` | Optional professional subtitle |
| `summary` | Final professional summary text |
| `summaryMeta` | Raw answers used to generate the summary |
| `education` | Array of education entries |
| `experience` | Array of experience entries with bullets |
| `projects` | Array of project entries (optional) |
| `activities` | Array of activity entries (optional) |
| `skills` | Skills grouped by type |
| `certifications` | Array of certification entries (optional) |
| `referencesOnRequest` | Boolean - include references line |

### Where Data Is Stored

- **During interview**: Data is stored in `session.cv` as soon as each field is validated
- **During editing**: Data is cleared for the section being edited, then re-collected
- **Temporary entries**: Education, experience, projects, activities, and certifications use `tempEntry` to build the entry before pushing to the final array

### When Data Is Deleted

- User sends `/startover` - full reset
- User sends `/cancel` - full reset
- User sends `/start` - full reset
- Bot restarts - all in-memory sessions lost
- Editing a section - that section's data is cleared

---

## 7. Conversation Flow

### How currentStep Works

The bot uses a state machine pattern. `currentStep` determines which handler runs when a user sends a message.

```javascript
function handleText(ctx) {
  const currentStep = ctx.session.flow.currentStep;
  
  switch (currentStep) {
    case PERSONAL_FULL_NAME:
      return handleFullName(ctx, text);
    case PERSONAL_PHONE:
      return handlePhone(ctx, text);
    // ... etc
  }
}
```

### Step Transitions

Each handler:
1. Validates input
2. Stores data
3. Sets `currentStep` to the next step
4. Asks the next question

### Callback Query Flow

Buttons use callback queries. The `handleAction()` function routes based on the callback data:

```javascript
async function handleAction(ctx) {
  const data = ctx.callbackQuery.data;
  
  switch (data) {
    case 'create_cv':
      return handleCreateCV(ctx);
    case 'summary_manual':
      return handleSummaryManual(ctx);
    // ... etc
  }
}
```

### Text vs Button Handlers

- **Text handlers**: For free-text input (names, descriptions, emails, etc.)
- **Button handlers**: For choices (Yes/No, Add/Continue, mode selection)

### Flow Control Patterns

**Linear Flow**: Most of the interview follows a linear path where each step leads to the next.

**Looping Flow**: Repeatable sections (education, experience) loop through entry collection, then show buttons to add another or continue.

**Branching Flow**: Summary mode branches into manual or helper, then rejoins the main flow.

**Edit Flow**: Clears data, re-runs section flow, then returns to edit menu.

---

## 8. Validation System

### Validation Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `isNotEmpty(value)` | Required field | Name, email, phone |
| `isValidEmail(email)` | Email format | `john@example.com` |
| `isValidPhone(phone)` | Phone number | `+1234567890` |
| `isSkip(value)` | Optional field skip | "skip" |
| `isValidLinkedIn(url)` | LinkedIn URL | `linkedin.com/in/name` |
| `isValidUrl(url)` | URL format | `https://example.com` |
| `parseCommaSeparated(input)` | Parse lists | "HTML, CSS, JS" → `["HTML","CSS","JS"]` |
| `isValidYear(value)` | 4-digit year | 2024 |

### Required vs Optional Fields

**Required Fields** (cannot be skipped):
- Full name
- Phone
- Email
- Location
- Target role (can be skipped with "skip")
- Summary (can be manual or generated)
- School (education)
- Degree (education)
- Experience title
- Experience company
- At least 1 bullet per experience
- Project name
- Project description
- Activity title
- Certification name

**Optional Fields** (can be skipped with "skip"):
- LinkedIn URL
- Website URL
- Field of study (education)
- Location (education)
- Start year (education)
- End year (education)
- GPA (education)
- Location (experience)
- Start date (experience)
- End date (experience)
- Projects (entire section optional)
- Activities (entire section optional)
- Certifications (entire section optional)
- Tech stack (projects)
- Role (projects)
- Organization (activities)
- Description (activities)
- Issuer (certifications)
- Year (certifications)

### Validation Error Messages

Each validation failure shows a specific error message:
- Empty required field: "Please enter your full name. It cannot be empty."
- Invalid email: "Please enter a valid email address (e.g., name@example.com)."
- Invalid phone: "Please enter a valid phone number (at least 10 digits)."
- Invalid URL: "Please enter a valid URL (starting with http:// or https://)..."
- Invalid year: "Please enter a valid year (e.g., 2021)..."

---

## 9. PDF Generation

### Step-by-Step PDF Generation

```
1. Session data (cv object)
   ↓
2. generateHTML(cvData) in harvard.js
   - Escapes all data for safety
   - Builds HTML structure
   - Applies CSS styles
   - Returns complete HTML string
   ↓
3. createPDF(cvData) in pdfGenerator.js
   - Creates temp directory if it doesn't exist
   - Generates unique filename: cv_${Date.now()}.pdf
   - Calls generatePDF()
   ↓
4. generatePDF(cvData, outputPath)
   - Launches Puppeteer (headless Chrome)
   - Sets page content to HTML
   - Waits for network to be idle
   - Converts to PDF with options:
     - format: 'A4'
     - margins: 60px all sides
     - printBackground: false
   - Saves to outputPath
   - Closes browser
   ↓
5. ctx.replyWithDocument()
   - Reads PDF file
   - Sends to user with filename: CVDraft_CV.pdf
   - Caption: "✅ Your CV is ready!..."
   ↓
6. cleanupFile(pdfPath)
   - Deletes temporary PDF file
   - Silently ignores if file doesn't exist
```

### Files Involved

| File | Role |
|------|------|
| `templates/harvard.js` | Generates HTML from CV data |
| `services/pdfGenerator.js` | Puppeteer orchestration, temp file management |
| `handlers/commands.js` | Orchestrates the whole flow |
| `temp/` | Temporary file storage |

### PDF Options

```javascript
await page.pdf({
  path: outputPath,           // Where to save
  format: 'A4',               // Page size
  printBackground: false,     // No background colors
  margin: {
    top: '60px',              // 60px margins all around
    bottom: '60px',
    left: '60px',
    right: '60px'
  },
  preferCSSPageSize: true     // Use CSS @page rules
});
```

### Error Handling

If PDF generation fails:
1. Error is caught in `generateAndSendPDF()`
2. PDF file is cleaned up (if it was created)
3. User sees friendly error message
4. Error is logged to console
5. Bot continues running

---

## 10. HTML Template

### Template Structure

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Reset and base styles */
    /* Harvard-style CV styling */
  </style>
</head>
<body>
  <!-- Name -->
  <h1>JOHN DOE</h1>
  
  <!-- Target Role -->
  <h2>Frontend Developer</h2>
  
  <!-- Contact -->
  <p>+1234567890 | john@example.com | New York</p>
  
  <!-- Sections -->
  <h3>Professional Summary</h3>
  <p>...</p>
  
  <h3>Education</h3>
  <div>...</div>
  
  <!-- etc -->
</body>
</html>
```

### CSS Design Principles

| Element | Style | Rationale |
|---------|-------|-----------|
| Body | 11pt, Helvetica/Arial | Standard readable font |
| H1 | 20pt, bold, uppercase | Professional header |
| H2 | 13pt, normal | Role subtitle |
| H3 | 13pt, bold, uppercase | Section headers with underline |
| Bullets | List-style: none, ::before with • | ATS-friendly |
| Margins | 60px all sides | Professional spacing |
| Colors | Black and white only | Print-ready, ATS-friendly |

### Conditional Sections

The template only includes sections that have data:

```javascript
if (education && education.length > 0) {
  // Render education section
}

if (projects && projects.length > 0) {
  // Render projects section
}

// etc
```

### Bullet Rendering

Bullets are cleaned of existing symbols and rendered with a single `•`:

```javascript
let cleanBullet = bullet.trim();
cleanBullet = cleanBullet.replace(/^[•·●◦▪▫◆◇►▶]+\s*/, '');
bulletList.push(`<li>${escape(cleanBullet)}</li>`);
```

### HTML Escaping

All user data is escaped to prevent XSS:

```javascript
const escape = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
```

### How to Change the Layout

1. Edit `src/templates/harvard.js`
2. Modify the CSS in the `<style>` section
3. Modify the HTML structure in the `return` statement
4. Changes take effect on next PDF generation

### How to Add a New Template

1. Create a new file in `src/templates/` (e.g., `modern.js`)
2. Export a `generateHTML()` function
3. In `pdfGenerator.js`, import and use the new template
4. Add template selection logic if multiple templates are desired

---

## 11. Commands

### /start

**Purpose**: Start the bot or create a new CV

**Behavior**:
- Resets the session (clears any existing data)
- Shows welcome message with CVDraft branding
- Shows "📝 Create CV" button

**When to use**: When the user wants to start a new CV or restart the bot

### /help

**Purpose**: Show help information

**Behavior**:
- Shows friendly help message explaining what the bot does
- Lists all available commands
- Explains how to start and edit
- Includes privacy notice

**When to use**: When the user needs guidance

### /startover

**Purpose**: Reset everything and start over

**Behavior**:
- Resets the session (clears all data)
- Shows confirmation message
- Shows "📝 Create CV" button

**When to use**: When the user made a mistake and wants to start fresh

### /cancel

**Purpose**: Cancel current operation

**Behavior**:
- Resets the session (clears all data)
- Shows cancellation message
- Shows "📝 Create CV" button

**When to use**: When the user wants to abandon the current session

---

## 12. How to Change the Bot

### Change Welcome Message

Edit `src/handlers/commands.js`, find `handleStart()`:

```javascript
const welcomeMessage = `
Welcome to *${BOT_NAME}!* 📄

[YOUR NEW MESSAGE HERE]
`;
```

### Change Interview Questions

Each question is asked in its handler in `src/handlers/text.js`. Example:

```javascript
// Change this line:
ctx.reply('Great! Now, what is your phone number?');

// To this:
ctx.reply('Please enter your phone number:');
```

### Add a New Section

1. Add step constants in `src/constants/steps.js`
2. Add the section to the session in `src/services/session.js`
3. Create handlers in `src/handlers/text.js`
4. Add flow transitions to connect the section
5. Add to preview in `src/services/preview.js`
6. Add to HTML template in `src/templates/harvard.js`

### Remove a Section

1. Remove step constants (or leave them unused)
2. Remove handlers from `src/handlers/text.js`
3. Remove from preview in `src/services/preview.js`
4. Remove from HTML template in `src/templates/harvard.js`
5. Remove from session in `src/services/session.js`

### Change PDF Filename

Edit `src/handlers/commands.js`, find `generateAndSendPDF()`:

```javascript
await ctx.replyWithDocument(
  { source: pdfPath, filename: 'CVDraft_CV.pdf' }, // Change filename here
  { caption: '...' }
);
```

### Change Bot Name

Edit `src/config/index.js`:

```javascript
module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  BOT_NAME: 'CVDraft', // Change this
  BOT_USERNAME: '@cvdraft_bot', // Change this
};
```

### Change Help Text

Edit `src/handlers/commands.js`, find `handleHelp()`:

```javascript
const helpMessage = `
[YOUR NEW HELP TEXT]
`;
```

### Change Button Labels

Find the button in `src/handlers/text.js` or `src/handlers/actions.js`:

```javascript
Markup.button.callback('New Label', 'callback_data')
```

### Add Another Template

1. Create `src/templates/modern.js`
2. Export `generateHTML(cvData)`
3. In `src/services/pdfGenerator.js`, add a parameter to choose template
4. Update `createPDF()` to accept template name

### Change Validation Rules

Edit `src/utils/validation.js`:

```javascript
// Example: Change phone validation to require 11 digits
function isValidPhone(phone) {
  const clean = phone.replace(/[\s\-()]/g, '');
  return clean.length >= 11 && /^[\d+]+$/.test(clean);
}
```

---

## 13. Hosting

### Requirements

- Node.js 16+ (v16.13.2 or higher for Puppeteer)
- npm or yarn
- Telegram Bot Token from BotFather
- Internet connection for Puppeteer to download Chromium

### Environment Variables

Create a `.env` file:
```
BOT_TOKEN=your_telegram_bot_token_here
```

### BotFather Setup

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` to create a new bot
3. Choose a name: `CVDraft`
4. Choose a username: `cvdraft_bot` (must end with "bot")
5. Copy the provided BOT_TOKEN
6. Send `/setcommands` to BotFather
7. Select your bot
8. Send:
```
start - Start creating a professional CV
help - Learn how to use CVDraft
startover - Start your CV again
cancel - Cancel the current operation
```

### Deploy to Render

1. Push code to GitHub
2. Go to render.com and create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - Name: `cvdraft-bot`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variable:
   - Key: `BOT_TOKEN`
   - Value: Your bot token
6. Click "Create Web Service"

### Deploy to Heroku

1. Push code to GitHub
2. Create a `Procfile`:
   ```
   worker: node src/bot.js
   ```
3. Go to heroku.com and create a new app
4. Connect your GitHub repository
5. Add Config Var: `BOT_TOKEN`
6. Deploy

### Update the Bot

1. Make code changes
2. Commit and push to GitHub
3. On Render/Heroku, redeploy from the dashboard
4. Or use Git deployment

### Restarting

**Render**: Dashboard → "Manual Deploy" → "Deploy latest commit"
**Heroku**: Dashboard → "More" → "Restart all dynos"
**Local**: Ctrl+C then `npm start`

### Logs

**Render**: Dashboard → "Logs" tab
**Heroku**: `heroku logs --tail`
**Local**: Console output

### Troubleshooting Deployment

| Issue | Solution |
|-------|----------|
| BOT_TOKEN not found | Check .env file or environment variables |
| Puppeteer fails | Use `--no-sandbox` flag (already in code) |
| Port conflicts | Render handles this automatically |
| Memory issues | Upgrade plan or optimize code |

---

## 14. Maintenance Guide

### Updating Dependencies

```bash
# Check outdated packages
npm outdated

# Update safely (patch and minor versions)
npm update

# Update major versions (careful!)
npm install telegraf@latest puppeteer@latest dotenv@latest
```

### Testing

**Manual Testing Checklist**:
1. Complete full CV flow from start to PDF
2. Test all validation rules
3. Test adding multiple entries (education, experience, etc.)
4. Test editing each section
5. Test /startover, /cancel, /help
6. Test PDF generation with various data sizes

**Before Deployment**:
1. Run `npm install` to ensure dependencies are fresh
2. Test locally with your bot token
3. Push changes

### Debugging

**Enable detailed logging**: The bot already logs every message to console.

**Common debugging steps**:
1. Check console logs for errors
2. Check if `BOT_TOKEN` is correct
3. Check if Puppeteer can launch (needs Chromium)
4. Check temp directory permissions

### Locating Bugs

1. **User flow issues**: Check `currentStep` transitions
2. **Validation issues**: Check `src/utils/validation.js`
3. **PDF issues**: Check `src/templates/harvard.js` and Puppeteer logs
4. **Session issues**: Check `src/services/session.js`

### Safe Changes

**Safe changes**:
- Changing messages or text
- Adding optional fields
- Changing validation rules
- Adding new commands

**Dangerous changes** (requires careful testing):
- Changing session structure
- Changing step constants
- Changing the PDF generation flow
- Changing the core handlers

---

## 15. Troubleshooting Guide

### Bot Not Responding

**Check**:
1. Is the bot running? Check process/console
2. Is BOT_TOKEN correct in .env?
3. Is the bot running on the correct port?
4. Check Telegram API status

**Solution**: Restart the bot, verify token

### Token Issues

**Error**: "BOT_TOKEN is not defined in .env file"

**Solution**: Create .env file with `BOT_TOKEN=your_token_here`

**Error**: "Invalid token specified"

**Solution**: Get new token from BotFather with `/token`

### Puppeteer Issues

**Error**: "Failed to launch browser"

**Solutions**:
1. Install system dependencies (Linux): `apt-get install -y ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 xdg-utils`
2. Use `--no-sandbox` flag (already in code)
3. Increase memory limits

### Render Sleeping

**Issue**: Bot goes to sleep on free tier

**Solution**:
1. Use uptime monitoring (ping the bot with /start)
2. Upgrade to paid tier (Render)
3. Add cron job to send periodic messages

### PDF Generation Errors

**Error**: "PDF generation failed"

**Check**:
1. Is temp directory writable?
2. Is Puppeteer installed correctly?
3. Is there enough memory?

**Solution**: Check logs for specific error, verify temp directory permissions

### Missing Environment Variables

**Check**: `.env` file exists with `BOT_TOKEN`

**Solution**: Create `.env` or add to hosting environment variables

---

## 16. Future Improvements

### Multiple Templates

**How to add**: Create more template files in `src/templates/` and add a template selection flow.

**Example**:
- Harvard style (current)
- Modern style
- Creative style
- Minimalist style

### AI Summary Generation

**How to add**: Replace `summary.js` with an AI API call (OpenAI, etc.) and add AI configuration.

**Considerations**: Cost, rate limiting, response time

### Multi-Language Support

**How to add**: Create language files (JSON) and detect user's Telegram language.

**Example**:
- English (current)
- French
- Spanish
- Portuguese

### Premium Plans

**How to add**: Add payment integration (Stripe, PayPal) and feature flags.

**Features for premium**:
- Multiple templates
- Multiple CVs saved
- DOCX export
- AI rewriting
- Cover letter generator

### Cloud Storage

**How to add**: Integrate with cloud storage (S3, Google Cloud, etc.) to save CVs.

**Benefits**: Users can save and edit CVs later (currently no persistence)

### User Accounts

**How to add**: Add a simple username/password or email-based authentication.

**Challenge**: Telegram session only, need external database

### Export Formats

**How to add**: Add DOCX generation using `docx` npm package.

**Existing**: PDF generation already works

### Cover Letters

**How to add**: New flow after CV is complete, using CV data to generate cover letter.

---

## 17. FAQ

### Why is there no database?

The bot intentionally avoids persistence to keep it simple, free, and privacy-focused. Users can complete their CV in one session and data is immediately deleted.

### What happens if the bot restarts?

All session data is lost. Users will need to start over with `/start`.

### Can I save my CV for later?

Not in the free version. The bot is designed for one-session use. Download the PDF to keep your CV.

### Is my data private?

Yes. No data is stored permanently. All data exists only in memory during your session and is deleted when you finish.

### How do I edit my CV?

After the initial preview, click "Edit CV" and select the section you want to change. You'll re-enter that section and return to the edit menu.

### Why is the PDF so simple?

The PDF is designed to be ATS-friendly - simple formatting that Applicant Tracking Systems can parse. No fancy graphics or complex layouts.

### Can I add my photo?

Not in this version. Photos are not ATS-friendly and are intentionally excluded.

### How can I change the bot's messages?

Edit the text strings in the relevant handler files in `src/handlers/`.

### Why is everything in one Telegram session?

The bot uses session-based state to remember where you are in the flow. Each user gets their own session.

### Can I use this for my company?

Yes! The code is open source. You can customize it with your branding.

---

## 18. Codebase Best Practices

### What Should Never Be Changed Casually

| File | Reason |
|------|--------|
| `src/constants/steps.js` | Changing step names breaks the entire flow |
| `src/services/session.js` | Session structure is used everywhere |
| `src/handlers/actions.js` | Button callbacks are tied to specific flows |
| `src/bot.js` | Core bootstrapping |

### Files That Are Safe to Modify

| File | Safe Changes |
|------|--------------|
| `src/handlers/text.js` | Messages, prompts, validation rules |
| `src/handlers/commands.js` | Command messages, help text |
| `src/templates/harvard.js` | CSS, HTML structure, fonts |
| `src/utils/validation.js` | Validation rules (carefully) |
| `src/services/summary.js` | Summary generation logic |

### How to Avoid Breaking Conversation Flow

1. **Always set `currentStep`** before asking a question
2. **Always validate input** before storing
3. **Always handle errors** with user-friendly messages
4. **Always clear `tempEntry`** after pushing to array
5. **Always check edit mode** when continuing from sections

### How to Safely Introduce New Features

1. Add new step constants
2. Add new handlers
3. Update session if needed
4. Update preview if needed
5. Update HTML template if needed
6. Test thoroughly

### Important Rules

1. **Never store user data permanently** - privacy is key
2. **Never crash** - catch all errors
3. **Always validate** - no empty required fields
4. **Always escape HTML** - prevent injection
5. **Always clean up temp files** - no orphaned PDFs

---

## 19. Quick Reference Cheat Sheet

### Most Important Files

| File | What It Does |
|------|--------------|
| `src/bot.js` | Entry point |
| `src/handlers/text.js` | All interview logic |
| `src/handlers/actions.js` | All button logic |
| `src/services/session.js` | Session management |
| `src/templates/harvard.js` | PDF generation |

### Core Commands

| Command | Purpose |
|---------|---------|
| `/start` | Start/restart |
| `/help` | Help |
| `/startover` | Reset |
| `/cancel` | Cancel |

### Step Constants (Most Common)

| Constant | Purpose |
|----------|---------|
| `PERSONAL_FULL_NAME` | Ask for name |
| `TARGET_ROLE` | Ask for role |
| `SUMMARY_MANUAL` | Manual summary |
| `SUMMARY_BG` | Helper mode - background |
| `EDUCATION_SCHOOL` | Education - school |
| `EXPERIENCE_TITLE` | Experience - title |
| `SKILLS_TECHNICAL` | Skills - technical |
| `PREVIEW` | Show preview |

### Quick Flow Reference

```
/start → Create CV → Personal Details → Summary → Education → Experience → Skills → Projects → Activities → Certifications → References → Preview → Edit (optional) → Looks Good → PDF
```

### Debugging Quick Tips

| Issue | Quick Check |
|-------|-------------|
| Bot not responding | Check BOT_TOKEN, check logs |
| Validation not working | Check validation.js |
| PDF not generating | Check temp directory, Puppeteer |
| Button not working | Check callback data in actions.js |
| Wrong question asked | Check currentStep in session |
