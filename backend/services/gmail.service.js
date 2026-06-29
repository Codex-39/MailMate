const { google } = require('googleapis');
const Email = require('../models/Email');
const User = require('../models/User');
const { categorizeEmail, summarizeEmail } = require('./ai.service');

// Initialize Google OAuth2 client
const createOAuthClient = (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  if (user && user.accessToken) {
    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });
  }
  
  return oauth2Client;
};

// Helper: Decode Gmail base64 body content
const decodeBase64 = (data) => {
  if (!data) return '';
  return Buffer.from(data, 'base64').toString('utf-8');
};

// Parse Gmail payload to extract HTML or plain text body
const extractBody = (payload) => {
  if (!payload) return '';
  
  if (payload.body && payload.body.data) {
    return decodeBase64(payload.body.data);
  }
  
  if (payload.parts) {
    let htmlPart = payload.parts.find(p => p.mimeType === 'text/html');
    if (htmlPart && htmlPart.body && htmlPart.body.data) {
      return decodeBase64(htmlPart.body.data);
    }
    
    let textPart = payload.parts.find(p => p.mimeType === 'text/plain');
    if (textPart && textPart.body && textPart.body.data) {
      return decodeBase64(textPart.body.data);
    }
    
    for (const part of payload.parts) {
      const subBody = extractBody(part);
      if (subBody) return subBody;
    }
  }
  
  return '';
};

// Extract attachments list from Gmail payload
const extractAttachments = (payload) => {
  const attachments = [];
  if (!payload || !payload.parts) return attachments;

  const traverseParts = (parts) => {
    for (const part of parts) {
      if (part.filename && part.body && part.body.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          attachmentId: part.body.attachmentId,
          size: part.body.size || 0
        });
      }
      if (part.parts) {
        traverseParts(part.parts);
      }
    }
  };

  traverseParts(payload.parts);
  return attachments;
};

// Sync Gmail inbox for user
const syncGmailInbox = async (user) => {
  const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  
  if (!isGoogleConfigured || !user.accessToken) {
    throw new Error('Google OAuth is not configured or user tokens are missing.');
  }

  try {
    const oauth2Client = createOAuthClient(user);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Fetch list of message summaries
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 50,
      q: 'category:primary'
    });
    
    const messages = response.data.messages || [];
    let syncedCount = 0;
    
    for (const msg of messages) {
      // Check if email already exists in DB
      const existingEmail = await Email.findOne({ userId: user._id, gmailId: msg.id });
      if (existingEmail) continue;

      // Fetch detail message
      const detailMsg = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id
      });
      
      const payload = detailMsg.data.payload;
      const headers = payload.headers || [];
      
      const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject');
      const subject = subjectHeader ? subjectHeader.value : 'No Subject';
      
      const fromHeader = headers.find(h => h.name.toLowerCase() === 'from');
      const fromValue = fromHeader ? fromHeader.value : 'Unknown Sender';
      
      let sender = 'Unknown';
      let senderEmail = 'unknown@mail.com';
      
      const emailMatch = fromValue.match(/<([^>]+)>/);
      if (emailMatch) {
        senderEmail = emailMatch[1];
        sender = fromValue.replace(/<[^>]+>/, '').replace(/"/g, '').trim() || senderEmail;
      } else {
        senderEmail = fromValue.trim();
        sender = fromValue.trim();
      }
      
      const dateHeader = headers.find(h => h.name.toLowerCase() === 'date');
      const date = dateHeader ? new Date(dateHeader.value) : new Date();
      
      const body = extractBody(payload) || detailMsg.data.snippet || 'No Content';
      const snippet = detailMsg.data.snippet || body.substring(0, 100);
      const attachments = extractAttachments(payload);
      
      const category = await categorizeEmail(subject, body, sender);
      const summary = await summarizeEmail(subject, body, sender);
      
      const isRead = !(detailMsg.data.labelIds && detailMsg.data.labelIds.includes('UNREAD'));
      const isStarred = detailMsg.data.labelIds && detailMsg.data.labelIds.includes('STARRED');
      
      await Email.create({
        userId: user._id,
        gmailId: msg.id,
        sender,
        senderEmail,
        subject,
        body,
        snippet,
        category,
        summary,
        date,
        isRead,
        isStarred,
        attachments
      });
      
      syncedCount++;
    }
    
    // Update lastSyncedAt on user
    await User.findByIdAndUpdate(user._id, { lastSyncedAt: new Date() });

    console.log(`✅ Successfully synced ${syncedCount} new Google emails for ${user.email}`);
    return { success: true, count: syncedCount, mode: 'google' };
  } catch (err) {
    console.error('Error syncing Gmail:', err.message);
    throw new Error('Failed to sync emails from Gmail API');
  }
};

const getEmailById = async (userId, emailId) => {
  return await Email.findOne({ _id: emailId, userId });
};

const groupEmailsBySender = async (userId) => {
  const emails = await Email.find({ userId });
  const senderGroups = {};

  emails.forEach(email => {
    const senderName = email.sender || 'Unknown';
    if (!senderGroups[senderName]) {
      let avatar = senderName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '✉️';
      senderGroups[senderName] = { name: senderName, emailCount: 0, unreadCount: 0, avatar };
    }
    senderGroups[senderName].emailCount++;
    if (!email.isRead) {
      senderGroups[senderName].unreadCount++;
    }
  });

  return Object.values(senderGroups).sort((a, b) => b.emailCount - a.emailCount);
};

const searchEmails = async (userId, query) => {
  const searchRegex = new RegExp(query, 'i');
  return await Email.find({
    userId,
    $or: [
      { subject: { $regex: searchRegex } },
      { sender: { $regex: searchRegex } },
      { senderEmail: { $regex: searchRegex } },
      { body: { $regex: searchRegex } }
    ]
  }).sort({ date: -1 });
};

module.exports = {
  createOAuthClient,
  syncGmailInbox,
  getEmailById,
  groupEmailsBySender,
  searchEmails
};
