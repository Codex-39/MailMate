const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check if Gemini API key is available
const isGeminiAvailable = !!process.env.GEMINI_API_KEY;
let aiClient = null;

if (isGeminiAvailable) {
  try {
    aiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (err) {
    console.error('Error initializing Gemini client, falling back to heuristics:', err.message);
  }
}

/**
 * Categorize email into one of:
 * 'Jobs & Internships', 'Learning Resources', 'College Notifications', 'Finance & Banking', 'Personal', 'Events'
 */
const categorizeEmail = async (subject, body, sender) => {
  const content = `Sender: ${sender}\nSubject: ${subject}\nBody: ${body}`.toLowerCase();
  
  if (isGeminiAvailable && aiClient) {
    try {
      const model = aiClient.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Categorize this email into exactly one of these 6 categories:
1. 'Jobs & Internships'
2. 'Learning Resources'
3. 'College Notifications'
4. 'Finance & Banking'
5. 'Personal'
6. 'Events'

Return ONLY the category name. Do not include quotes or formatting.
Email Content:
${content}`;

      const result = await model.generateContent(prompt);
      const category = result.response.text().trim();
      const validCategories = ['Jobs & Internships', 'Learning Resources', 'College Notifications', 'Finance & Banking', 'Personal', 'Events'];
      if (validCategories.includes(category)) {
        return category;
      }
    } catch (err) {
      console.warn('Gemini categorization failed, falling back to heuristics:', err.message);
    }
  }

  // Heuristic rule-based categorization
  if (
    content.includes('internship') || 
    content.includes('hiring') || 
    content.includes('recruit') || 
    content.includes('job opening') || 
    content.includes('career') || 
    content.includes('apply now') || 
    content.includes('placement') ||
    content.includes('assessment') ||
    content.includes('unstop') ||
    content.includes('internshala') ||
    content.includes('linkedin') ||
    content.includes('infosys')
  ) {
    return 'Jobs & Internships';
  }

  if (
    content.includes('geeksforgeeks') || 
    content.includes('course') || 
    content.includes('tutorial') || 
    content.includes('udemy') || 
    content.includes('coursera') || 
    content.includes('learn') || 
    content.includes('class') || 
    content.includes('lecture') || 
    content.includes('bootcamp') ||
    content.includes('practice problems') ||
    content.includes('dsa')
  ) {
    return 'Learning Resources';
  }

  if (
    content.includes('exam') || 
    content.includes('semester') || 
    content.includes('college') || 
    content.includes('university') || 
    content.includes('dean') || 
    content.includes('scholarship') || 
    content.includes('assignment') || 
    content.includes('results') ||
    content.includes('marks') ||
    content.includes('registration link') ||
    content.includes('academic')
  ) {
    return 'College Notifications';
  }

  if (
    content.includes('bank') || 
    content.includes('transaction') || 
    content.includes('otp') || 
    content.includes('invoice') || 
    content.includes('receipt') || 
    content.includes('balance') || 
    content.includes('credit card') || 
    content.includes('payment') || 
    content.includes('debit') || 
    content.includes('refund') ||
    content.includes('salary')
  ) {
    return 'Finance & Banking';
  }

  if (
    content.includes('webinar') || 
    content.includes('conference') || 
    content.includes('meetup') || 
    content.includes('event') || 
    content.includes('workshop') || 
    content.includes('hackathon') || 
    content.includes('rsvp') ||
    content.includes('zoom link')
  ) {
    return 'Events';
  }

  return 'Personal';
};

/**
 * Generate a summary for the email
 */
const summarizeEmail = async (subject, body, sender = '') => {
  if (isGeminiAvailable && aiClient) {
    try {
      const model = aiClient.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Summarize this email in a short, concise, and professional summary of 2-3 sentences.
Highlight key information like deadlines, application instructions, and important links. Do not say "This email is about" or include headers. Just give the summary.
Subject: ${subject}
Sender: ${sender}
Body: ${body}`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      console.warn('Gemini summarization failed, falling back to heuristics:', err.message);
    }
  }

  // Heuristic rule-based summarizer
  const lowerBody = body.toLowerCase();
  const lowerSubject = subject.toLowerCase();
  
  // Extract date-like strings
  const dateRegex = /(before\s+)?(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}(th|st|nd|rd)?/i;
  const matchDate = body.match(dateRegex);
  const deadlineStr = matchDate ? `by ${matchDate[0]}` : 'soon';

  if (lowerSubject.includes('internship') || lowerBody.includes('internship')) {
    const company = sender || 'A prominent recruiter';
    return `${company} is inviting applications for their new Internship Program. Interested candidates can apply online ${deadlineStr}. Ensure you complete the initial assessment profile before the deadline.`;
  }
  
  if (lowerSubject.includes('hiring') || lowerBody.includes('hiring') || lowerSubject.includes('drive')) {
    const company = sender || 'A company';
    return `${company} has launched a new recruitment drive for B.Tech/M.Tech students. Applications are open and candidates are required to submit their resumes ${deadlineStr}. Eligibility criteria include zero active backlogs.`;
  }

  if (lowerSubject.includes('geeksforgeeks') || lowerSubject.includes('course') || lowerBody.includes('course')) {
    return 'This update features curated tutorials and practice exercises covering data structures, algorithms, and key web development frameworks. A limited-time discount code is provided for premium certifications.';
  }

  if (lowerSubject.includes('exam') || lowerBody.includes('exam') || lowerSubject.includes('date sheet')) {
    return `College administration has released the upcoming examination schedule. Students are advised to double-check their exam dates and register for hall tickets ${deadlineStr}. Attendance criteria of 75% remains mandatory.`;
  }

  if (lowerSubject.includes('payment') || lowerSubject.includes('invoice') || lowerBody.includes('otp') || lowerBody.includes('transaction')) {
    return 'An account update regarding a recent transaction or billing receipt. Review details to ensure the amount matches your expectations. Contact your bank immediately if you do not recognize this activity.';
  }

  if (lowerSubject.includes('webinar') || lowerSubject.includes('hackathon') || lowerBody.includes('hackathon') || lowerBody.includes('event')) {
    return `You are invited to join an interactive event/hackathon. The session details, agenda, and participation credentials are listed below. Pre-registration is requested ${deadlineStr} to secure a slot.`;
  }

  // Default summary: clean up the first couple of sentences or snippet
  let summary = body.replace(/[\r\n]+/g, ' ').trim();
  if (summary.length > 150) {
    summary = summary.substring(0, 147) + '...';
  }
  return `This message regards "${subject}". Summary details: ${summary} Please review the full contents for details.`;
};

/**
 * Strips script tags, style tags, HTML markup, tracking pixels, and template noise.
 * Converts HTML to readable, clean plain text.
 */
const cleanHtmlToText = (html) => {
  if (!html) return '';
  
  let text = html;
  
  // 1. Remove script tags and their content
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ');
  
  // 2. Remove style tags and their content
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ');
  
  // 3. Remove metadata like link tags, meta tags, head tags
  text = text.replace(/<link[^>]*>/gi, ' ');
  text = text.replace(/<meta[^>]*>/gi, ' ');
  text = text.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, ' ');
  
  // 4. Replace block level tags with newlines/spaces
  text = text.replace(/<\/p>|<\/div>|<\/tr>|<\/h[1-6]>/gi, '\n');
  text = text.replace(/<br[^>]*>/gi, '\n');
  
  // 5. Remove all other HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // 6. Replace HTML entities with text
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
    
  // 7. Collapse spaces and blank lines
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n\s*\n+/g, '\n\n');
  
  return text.trim();
};

/**
 * Filter out invalid/unwanted URLs (analytics, Google Fonts, image tracking assets)
 */
const isValuableLink = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const lower = url.toLowerCase();
  
  // Ignore fonts, styles, tracking links, static images, newsletters
  const ignorePatterns = [
    'fonts.googleapis',
    'gstatic.com',
    'analytics',
    'tracking',
    'pixel',
    'css',
    'png',
    'jpg',
    'jpeg',
    'gif',
    'svg',
    'logo',
    'favicon',
    'doubleclick',
    'googletagmanager',
    'google-analytics',
    'segment.com',
    'mixpanel',
    'facebook.com/tr',
    'twitter.com/up',
    'mailchimp.com/track',
    'sendgrid.net',
    'hs-analytics',
    'hs-sites',
    'webpack',
    'font-awesome',
    'bootstrap'
  ];
  
  return !ignorePatterns.some(pattern => lower.includes(pattern));
};

/**
 * Fallback heuristic analyzer using regex and pattern matching
 */
const getHeuristicInsights = (emailContent) => {
  const content = emailContent.toLowerCase();
  
  const result = {
    summary: '',
    company: 'N/A',
    role: 'N/A',
    location: 'N/A',
    stipend: 'N/A',
    deadline: 'N/A',
    skills: [],
    actionItems: [],
    importantLinks: []
  };

  // 1. Extract Links
  const urlRegex = /(https?:\/\/[^\s"'<>]+)/g;
  const foundLinks = emailContent.match(urlRegex) || [];
  const cleanLinks = foundLinks.map(l => l.replace(/[.,;)]+$/, ''));
  result.importantLinks = Array.from(new Set(cleanLinks))
    .filter(isValuableLink)
    .slice(0, 3);

  // 2. Extract Skills
  const skillsList = ['javascript', 'python', 'react', 'node', 'mongodb', 'java', 'c++', 'sql', 'html', 'css', 'git', 'aws', 'dsa'];
  skillsList.forEach(skill => {
    if (content.includes(skill)) {
      let displayName = skill;
      if (skill === 'node') displayName = 'Node.js';
      else if (skill === 'mongodb') displayName = 'MongoDB';
      else if (skill === 'c++') displayName = 'C++';
      else if (skill === 'html') displayName = 'HTML';
      else if (skill === 'css') displayName = 'CSS';
      else if (skill === 'dsa') displayName = 'DSA';
      else if (skill === 'aws') displayName = 'AWS';
      else displayName = skill.charAt(0).toUpperCase() + skill.slice(1);
      
      result.skills.push(displayName);
    }
  });

  // 3. Extract Deadlines (only if date is found)
  const dateRegex = /(before\s+)?(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}(th|st|nd|rd)?/i;
  const matchDate = emailContent.match(dateRegex);
  if (matchDate) {
    result.deadline = matchDate[0];
  }

  // 4. Extract Company
  if (content.includes('linkedin')) result.company = 'LinkedIn';
  else if (content.includes('infosys')) result.company = 'Infosys';
  else if (content.includes('geeksforgeeks')) result.company = 'GeeksforGeeks';
  else if (content.includes('internshala')) result.company = 'Internshala';
  else if (content.includes('unstop')) result.company = 'Unstop';
  else if (content.includes('google')) result.company = 'Google';
  else if (content.includes('sbi') || content.includes('state bank')) result.company = 'SBI';

  // 5. Extract Role
  if (content.includes('intern')) result.role = 'Intern';
  else if (content.includes('developer') || content.includes('engineer')) result.role = 'Software Developer';
  else if (content.includes('analyst')) result.role = 'Business Analyst';

  // 6. Extract Stipend
  if (content.includes('stipend') || content.includes('salary')) {
    const stipendMatch = emailContent.match(/(rs\.?|inr|₹|usd|\$)\s?\d{1,3}(,\d{3})*(\/\s?(month|mth|pm|year|yr))?/i);
    if (stipendMatch) {
      result.stipend = stipendMatch[0];
    }
  }

  // 7. Extract Location
  if (content.includes('remote') || content.includes('work from home')) result.location = 'Remote';
  else if (content.includes('bangalore') || content.includes('bengaluru')) result.location = 'Bangalore, India';
  else if (content.includes('mumbai')) result.location = 'Mumbai, India';
  else if (content.includes('delhi') || content.includes('noida') || content.includes('gurgaon')) result.location = 'Delhi NCR, India';

  // 8. Extract Action Items
  if (content.includes('apply')) result.actionItems.push('Apply via the application link');
  if (content.includes('test') || content.includes('assessment')) result.actionItems.push('Prepare and complete the online assessment');
  if (content.includes('resume') || content.includes('cv')) result.actionItems.push('Update and upload your resume');
  if (content.includes('register')) result.actionItems.push('Register for the event before the deadline');

  // 9. Generate Summary
  if (content.includes('sbi') && content.includes('travel')) {
    result.summary = 'State Bank of India promotional email detailing a travel discount offer and transaction benefits.';
  } else if (content.includes('internshala') && content.includes('confirm')) {
    result.summary = 'Notification confirming internship application submission or candidate profile verification status.';
  } else if (content.includes('assessment') || content.includes('test')) {
    result.summary = 'Information regarding upcoming placement assessment schedule, pre-requisites, and test platform login guidelines.';
  } else {
    const sentences = emailContent.replace(/[\r\n]+/g, ' ').split(/[.!?]+/);
    const cleanSentences = sentences.map(s => s.trim()).filter(s => s.length > 15);
    if (cleanSentences.length > 0) {
      result.summary = cleanSentences.slice(0, 2).join('. ') + '.';
    } else {
      result.summary = 'Received email notification from ' + (result.company !== 'N/A' ? result.company : 'sender') + '.';
    }
  }

  return result;
};

/**
 * Call Gemini generateContent API with retry logic and exponential backoff
 */
const retryGenerateContent = async (model, prompt, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`Gemini API call failed (attempt ${i + 1}/${retries}), retrying in ${delay}ms... Error: ${err.message}`);
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

/**
 * Generate structured email intelligence insights from email body
 */
const generateEmailInsights = async (emailContent) => {
  const cleanText = cleanHtmlToText(emailContent);
  
  if (isGeminiAvailable && aiClient) {
    // Retry once if JSON parsing fails (total 2 attempts)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = aiClient.getGenerativeModel({ 
          model: 'gemini-pro'
        });
        
        const prompt = `
You are an email information extraction engine. Analyze the following email text and extract ONLY factual details explicitly stated in the text.
Do not guess, infer, or extrapolate. If any parameter is not directly mentioned in the email, you must return "N/A" (or an empty array for lists).

Extract the following parameters into a valid JSON object:
{
  "summary": "A concise 1-3 sentence summary of what the email is actually about (e.g. travel offer, internship confirmation, placement assessment).",
  "company": "Name of the company/organization explicitly sending or mentioned in the email. Return 'N/A' if not explicitly stated.",
  "role": "Job role, position, or opportunity name explicitly mentioned. Return 'N/A' if not explicitly stated.",
  "location": "Location of the job, internship, or event. Return 'N/A' if not explicitly stated.",
  "stipend": "Stipend or salary details explicitly mentioned. Return 'N/A' if not explicitly stated.",
  "deadline": "Application deadline or action due date explicitly stated. Return 'N/A' if not explicitly stated.",
  "skills": ["List of skills explicitly listed as requirements. Do not invent or assume skills. Return an empty array if none are listed."],
  "actionItems": ["List of next steps or action items for the recipient explicitly requested in the email (e.g. click link, reply, fill form). Return an empty array if none are listed."],
  "importantLinks": ["List of user-facing, meaningful links (e.g. application form, registration, test page, company site). Ignore tracking pixels, CSS assets, fonts, or tracking links."]
}

Do not include code block wrappers like \`\`\`json or any conversational text. Return ONLY the JSON object.

Email Text Content:
${cleanText}
`;

        const responseText = await retryGenerateContent(model, prompt);
        
        // Clean up response formatting if code-block wrapper leaked
        let cleaned = responseText.trim();
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
          cleaned = cleaned.replace(/\s*```$/, '');
        }
        
        const parsed = JSON.parse(cleaned.trim());
        
        // Enforce data types and return validated payload
        return {
          summary: typeof parsed.summary === 'string' && parsed.summary.trim() !== '' ? parsed.summary.trim() : 'No summary available.',
          company: typeof parsed.company === 'string' && parsed.company.trim() !== '' ? parsed.company.trim() : 'N/A',
          role: typeof parsed.role === 'string' && parsed.role.trim() !== '' ? parsed.role.trim() : 'N/A',
          location: typeof parsed.location === 'string' && parsed.location.trim() !== '' ? parsed.location.trim() : 'N/A',
          stipend: typeof parsed.stipend === 'string' && parsed.stipend.trim() !== '' ? parsed.stipend.trim() : 'N/A',
          deadline: typeof parsed.deadline === 'string' && parsed.deadline.trim() !== '' ? parsed.deadline.trim() : 'N/A',
          skills: Array.isArray(parsed.skills) ? parsed.skills.filter(s => typeof s === 'string' && s !== 'N/A') : [],
          actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems.filter(a => typeof a === 'string' && a !== 'N/A') : [],
          importantLinks: Array.isArray(parsed.importantLinks) ? parsed.importantLinks.filter(l => typeof l === 'string' && isValuableLink(l)) : []
        };
      } catch (err) {
        console.error(`Attempt ${attempt} of generateEmailInsights failed:`, err.message);
        if (attempt === 2) {
          console.warn('Gemini generateEmailInsights failed twice or returned malformed JSON, falling back to heuristics.');
        }
      }
    }
  }

  // Fallback to rules-based insights
  return getHeuristicInsights(cleanText);
};

module.exports = {
  categorizeEmail,
  summarizeEmail,
  generateEmailInsights
};
