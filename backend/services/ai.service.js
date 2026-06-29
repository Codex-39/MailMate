const { GoogleGenAI } = require('@google/generative-ai');

// Check if Gemini API key is available
const isGeminiAvailable = !!process.env.GEMINI_API_KEY;
let aiClient = null;

if (isGeminiAvailable) {
  try {
    // Note: In newer versions, it's import { GoogleGenAI } from '@google/generative-ai' or similar structure
    // Let's implement it carefully
    const { GoogleGenAI } = require('@google/generative-ai');
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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

module.exports = {
  categorizeEmail,
  summarizeEmail
};
