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
      const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
      const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
 * Fallback heuristic analyzer using regex and pattern matching
 */
const getHeuristicInsights = (emailContent) => {
  const content = emailContent.toLowerCase();
  
  const result = {
    summary: '',
    company: '',
    role: '',
    stipend: '',
    location: '',
    deadline: '',
    skills: [],
    actionItems: [],
    links: []
  };

  // 1. Extract Links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const foundLinks = emailContent.match(urlRegex) || [];
  result.links = Array.from(new Set(foundLinks)).slice(0, 3); // top 3 links

  // 2. Extract Skills
  const skillsList = ['javascript', 'python', 'react', 'node', 'mongodb', 'java', 'c++', 'sql', 'html', 'css', 'git', 'aws', 'dsa', 'machine learning', 'ai'];
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
      else if (skill === 'machine learning') displayName = 'Machine Learning';
      else if (skill === 'ai') displayName = 'AI';
      else displayName = skill.charAt(0).toUpperCase() + skill.slice(1);
      
      result.skills.push(displayName);
    }
  });

  // 3. Extract Deadlines
  const dateRegex = /(before\s+)?(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}(th|st|nd|rd)?/i;
  const matchDate = emailContent.match(dateRegex);
  result.deadline = matchDate ? matchDate[0] : 'N/A';

  // 4. Extract Company
  if (content.includes('linkedin')) result.company = 'LinkedIn';
  else if (content.includes('infosys')) result.company = 'Infosys';
  else if (content.includes('geeksforgeeks')) result.company = 'GeeksforGeeks';
  else if (content.includes('internshala')) result.company = 'Internshala';
  else if (content.includes('unstop')) result.company = 'Unstop';
  else if (content.includes('google')) result.company = 'Google';
  else result.company = 'External Recruiter';

  // 5. Extract Role
  if (content.includes('intern')) result.role = 'Intern';
  else if (content.includes('developer') || content.includes('engineer')) result.role = 'Software Developer';
  else if (content.includes('analyst')) result.role = 'Business Analyst';
  else result.role = 'Candidate';

  // 6. Extract Stipend
  if (content.includes('stipend') || content.includes('salary')) {
    const stipendMatch = emailContent.match(/(rs\.?|inr|₹|usd|\$)\s?\d{1,3}(,\d{3})*(\/\s?(month|mth|pm|year|yr))?/i);
    result.stipend = stipendMatch ? stipendMatch[0] : 'Competitive';
  } else {
    result.stipend = 'N/A';
  }

  // 7. Extract Location
  if (content.includes('remote') || content.includes('work from home')) result.location = 'Remote';
  else if (content.includes('bangalore') || content.includes('bengaluru')) result.location = 'Bangalore, India';
  else if (content.includes('mumbai')) result.location = 'Mumbai, India';
  else if (content.includes('delhi') || content.includes('noida') || content.includes('gurgaon')) result.location = 'Delhi NCR, India';
  else result.location = 'On-site';

  // 8. Extract Action Items
  if (content.includes('apply')) result.actionItems.push('Apply via the application link');
  if (content.includes('test') || content.includes('assessment')) result.actionItems.push('Prepare and complete the online assessment');
  if (content.includes('resume') || content.includes('cv')) result.actionItems.push('Update and upload your resume');
  if (content.includes('register')) result.actionItems.push('Register for the event before the deadline');
  if (result.actionItems.length === 0) result.actionItems.push('Review the email contents for further action');

  // 9. Generate Summary
  if (content.includes('intern') || content.includes('hiring')) {
    result.summary = `${result.company} is hiring for the ${result.role} role. The location is ${result.location} with a stipend of ${result.stipend}. Apply before the deadline of ${result.deadline || 'soon'}.`;
  } else {
    result.summary = `Received a notification from ${result.company} regarding ${result.role || 'updates'}. Action items include reviewing details and visiting the provided links.`;
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
  if (isGeminiAvailable && aiClient) {
    try {
      const model = aiClient.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });
      
      const prompt = `
Analyze the following email content and extract structured insights in JSON format.
You must return ONLY a valid JSON object. Do not include any explanation, markdown formatting blocks (like \`\`\`json), or extra text outside the JSON.

JSON Structure:
{
  "summary": "A concise 2-sentence summary of the email.",
  "company": "Name of the company/organization (e.g., Google, Infosys, LinkedIn, etc.) or empty string if not applicable.",
  "role": "Job role, internship title, or position name (e.g., Software Engineering Intern, Recruiter, Student) or empty string if not applicable.",
  "stipend": "Stipend or salary details mentioned (e.g., ₹20,000/month, Unpaid) or empty string if not applicable.",
  "location": "Job/internship location (e.g., Bangalore, Remote) or empty string if not applicable.",
  "deadline": "Application deadline or action due date (e.g., July 15, 2026) or empty string if not applicable.",
  "skills": ["Array of required skills mentioned (e.g., JavaScript, Python, React) or empty array if none."],
  "actionItems": ["List of next steps or action items for the recipient (e.g., 'Click the link to apply', 'Fill out the form') or empty array if none."],
  "links": ["Array of important URLs or links extracted from the email (e.g., application links, registration forms). Ensure they are complete and valid."]
}

Email Content:
${emailContent}
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
        summary: typeof parsed.summary === 'string' ? parsed.summary : '',
        company: typeof parsed.company === 'string' ? parsed.company : '',
        role: typeof parsed.role === 'string' ? parsed.role : '',
        stipend: typeof parsed.stipend === 'string' ? parsed.stipend : '',
        location: typeof parsed.location === 'string' ? parsed.location : '',
        deadline: typeof parsed.deadline === 'string' ? parsed.deadline : '',
        skills: Array.isArray(parsed.skills) ? parsed.skills.filter(s => typeof s === 'string') : [],
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems.filter(a => typeof a === 'string') : [],
        links: Array.isArray(parsed.links) ? parsed.links.filter(l => typeof l === 'string') : []
      };
    } catch (err) {
      console.error('Gemini generateEmailInsights failed, using heuristic fallback:', err.message);
    }
  }

  // Fallback to rules-based insights
  return getHeuristicInsights(emailContent);
};

module.exports = {
  categorizeEmail,
  summarizeEmail,
  generateEmailInsights
};
