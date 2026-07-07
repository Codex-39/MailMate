const { GoogleGenerativeAI } = require('@google/generative-ai');
const Email = require('../models/Email');
const User = require('../models/User');
const mongoose = require('mongoose');

const isGeminiAvailable = !!process.env.GEMINI_API_KEY;
let aiClient = null;

if (isGeminiAvailable) {
  try {
    aiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (err) {
    console.error('Error initializing Gemini client in analytics service:', err.message);
  }
}

/**
 * Strips script tags, style tags, HTML markup, tracking pixels, and template noise.
 * Converts HTML to readable, clean plain text.
 */
const cleanHtmlToText = (html) => {
  if (!html) return '';
  
  let text = html;
  
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ');
  text = text.replace(/<link[^>]*>/gi, ' ');
  text = text.replace(/<meta[^>]*>/gi, ' ');
  text = text.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, ' ');
  text = text.replace(/<\/p>|<\/div>|<\/tr>|<\/h[1-6]>/gi, '\n');
  text = text.replace(/<br[^>]*>/gi, '\n');
  text = text.replace(/<[^>]+>/g, ' ');
  
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
    
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n\s*\n+/g, '\n\n');
  
  return text.trim();
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
 * Generate natural language daily digest using Google Gemini AI
 */
const generateAIDigestText = async (emailListStr) => {
  if (isGeminiAvailable && aiClient) {
    try {
      const model = aiClient.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `
You are an email inbox daily briefing assistant. Write a natural, conversational, 1-3 sentence summary of the emails received today, and extract up to 3 important action items.
Do not guess, make up, or invent details not present in the list of email subjects.

Return a valid JSON object with the exact keys:
{
  "aiDigest": "A friendly summary like: 'Today you received 14 emails. 5 internship opportunities were detected, 2 application confirmations, 1 finance alert, and 6 informational emails. Most important action: Complete the Axlero Solutions assessment before June 30.'",
  "importantActions": ["List of up to 3 critical action items or next steps extracted directly from the email subjects. Return an empty array if none."]
}

Do not wrap the JSON output in markdown \`\`\`json or add conversational text. Return ONLY the JSON object.

Emails received today:
${emailListStr}
`;

      const responseText = await retryGenerateContent(model, prompt);
      
      let cleaned = responseText.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
        cleaned = cleaned.replace(/\s*```$/, '');
      }
      
      const parsed = JSON.parse(cleaned.trim());
      return {
        aiDigest: typeof parsed.aiDigest === 'string' && parsed.aiDigest.trim() !== '' ? parsed.aiDigest.trim() : '',
        importantActions: Array.isArray(parsed.importantActions) ? parsed.importantActions.filter(a => typeof a === 'string') : []
      };
    } catch (err) {
      console.error('Gemini daily digest text generation failed:', err.message);
    }
  }
  return null;
};

/**
 * Get daily digest and metrics using Mongoose aggregation pipeline and cache check
 */
const getDailyDigest = async (userId, force = false) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // 1. Fetch user to check cache
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (!force && user.dailyDigestCache && user.dailyDigestCache.cachedAt) {
    const cacheAge = Date.now() - new Date(user.dailyDigestCache.cachedAt).getTime();
    if (cacheAge < 60 * 60 * 1000) { // 1 hour
      return {
        totalEmails: user.dailyDigestCache.totalEmails,
        unreadEmails: user.dailyDigestCache.unreadEmails,
        internships: user.dailyDigestCache.internships,
        jobs: user.dailyDigestCache.jobs,
        college: user.dailyDigestCache.college,
        finance: user.dailyDigestCache.finance,
        personal: user.dailyDigestCache.personal,
        importantActions: user.dailyDigestCache.importantActions,
        aiDigest: user.dailyDigestCache.aiDigest
      };
    }
  }

  // 2. Perform aggregation to calculate counts
  const countsAggregate = await Email.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startOfToday }
      }
    },
    {
      $group: {
        _id: null,
        totalEmails: { $sum: 1 },
        unreadEmails: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
        internships: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$category', 'Jobs & Internships'] },
                  { $regexMatch: { input: '$subject', regex: /intern/i } }
                ]
              },
              1,
              0
            ]
          }
        },
        jobs: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$category', 'Jobs & Internships'] },
                  { $not: { $regexMatch: { input: '$subject', regex: /intern/i } } }
                ]
              },
              1,
              0
            ]
          }
        },
        college: { $sum: { $cond: [{ $eq: ['$category', 'College Notifications'] }, 1, 0] } },
        finance: { $sum: { $cond: [{ $eq: ['$category', 'Finance & Banking'] }, 1, 0] } },
        personal: { $sum: { $cond: [{ $eq: ['$category', 'Personal'] }, 1, 0] } }
      }
    }
  ]);

  const stats = countsAggregate[0] || {
    totalEmails: 0,
    unreadEmails: 0,
    internships: 0,
    jobs: 0,
    college: 0,
    finance: 0,
    personal: 0
  };

  // If there are no emails today, return early with zero state
  if (stats.totalEmails === 0) {
    const zeroState = {
      totalEmails: 0,
      unreadEmails: 0,
      internships: 0,
      jobs: 0,
      college: 0,
      finance: 0,
      personal: 0,
      importantActions: [],
      aiDigest: "You received no new emails today. Your inbox is quiet!"
    };

    user.dailyDigestCache = {
      ...zeroState,
      cachedAt: new Date()
    };
    await user.save();
    return zeroState;
  }

  // 3. Project only subject headers, senders, and category for Gemini prompting to avoid loading full bodies into memory
  const todayEmails = await Email.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startOfToday }
      }
    },
    {
      $project: {
        subject: 1,
        sender: 1,
        category: 1
      }
    }
  ]);

  const emailListStr = todayEmails.map((e, idx) => {
    return `${idx + 1}. Sender: ${e.sender} | Subject: ${e.subject} | Category: ${e.category}`;
  }).join('\n');

  // 4. Invoke AI Digest and handle fallback behavior
  let aiData = null;
  
  if (isGeminiAvailable && aiClient) {
    aiData = await generateAIDigestText(emailListStr);
  }

  if (!aiData || !aiData.aiDigest) {
    // If Gemini fails, use standard statistics warning fallback
    aiData = {
      aiDigest: "AI digest currently unavailable. Statistics are shown instead.",
      importantActions: ["Review today's unread notifications in your inbox"]
    };
  }

  // 5. Store in cache and return
  const finalDigest = {
    totalEmails: stats.totalEmails,
    unreadEmails: stats.unreadEmails,
    internships: stats.internships,
    jobs: stats.jobs,
    college: stats.college,
    finance: stats.finance,
    personal: stats.personal,
    importantActions: aiData.importantActions,
    aiDigest: aiData.aiDigest
  };

  user.dailyDigestCache = {
    ...finalDigest,
    cachedAt: new Date()
  };
  await user.save();

  return finalDigest;
};

module.exports = {
  getDailyDigest
};
