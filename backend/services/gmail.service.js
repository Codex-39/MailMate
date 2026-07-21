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

const decodeBase64 = (data) => {
  if (!data) return '';
  return Buffer.from(data, 'base64').toString('utf8');
};

const extractBody = (payload) => {
  if (!payload) return '';

  if (payload.body?.data) {
    return decodeBase64(payload.body.data);
  }

  if (payload.parts) {
    const html = payload.parts.find(p => p.mimeType === 'text/html');
    if (html?.body?.data) return decodeBase64(html.body.data);

    const text = payload.parts.find(p => p.mimeType === 'text/plain');
    if (text?.body?.data) return decodeBase64(text.body.data);

    for (const part of payload.parts) {
      const body = extractBody(part);
      if (body) return body;
    }
  }

  return '';
};

const extractAttachments = (payload) => {
  const attachments = [];

  const walk = (parts) => {
    for (const part of parts) {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          attachmentId: part.body.attachmentId,
          size: part.body.size || 0
        });
      }

      if (part.parts) {
        walk(part.parts);
      }
    }
  };

  if (payload?.parts) {
    walk(payload.parts);
  }

  return attachments;
};

const syncGmailInbox = async (user) => {

  if (!user.accessToken) {
    throw new Error("Missing Google access token");
  }

  try {

    const oauth2Client = createOAuthClient(user);

    // DEBUG
    try {
      const info = await oauth2Client.getTokenInfo(user.accessToken);

      console.log("========== TOKEN INFO ==========");
      console.log("User:", user.email);
      console.log("Scopes:", info.scopes);
      console.log("===============================");
    } catch (e) {
      console.error("TOKEN INFO ERROR");
      console.error(e);
    }

    const gmail = google.gmail({
      version: 'v1',
      auth: oauth2Client
    });

    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 50,
      q: "category:primary"
    });

    const messages = response.data.messages || [];

    let syncedCount = 0;

    for (const msg of messages) {

      const exists = await Email.findOne({
        userId: user._id,
        gmailId: msg.id
      });

      if (exists) continue;

      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id
      });

      const payload = detail.data.payload;

      const headers = payload.headers || [];

      const subject =
        headers.find(h => h.name.toLowerCase() === "subject")?.value ||
        "No Subject";

      const from =
        headers.find(h => h.name.toLowerCase() === "from")?.value ||
        "Unknown";

      let sender = from;
      let senderEmail = from;

      const match = from.match(/<([^>]+)>/);

      if (match) {
        senderEmail = match[1];
        sender = from.replace(/<.*>/, "").replace(/"/g, "").trim();
      }

      const body =
        extractBody(payload) ||
        detail.data.snippet ||
        "";

      const snippet = detail.data.snippet || "";

      const category = await categorizeEmail(subject, body, sender);

      const summary = await summarizeEmail(subject, body, sender);

      const date =
        headers.find(h => h.name.toLowerCase() === "date")?.value;

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
        date: date ? new Date(date) : new Date(),
        isRead: !(detail.data.labelIds || []).includes("UNREAD"),
        isStarred: (detail.data.labelIds || []).includes("STARRED"),
        attachments: extractAttachments(payload)
      });

      syncedCount++;
    }

    await User.findByIdAndUpdate(user._id, {
      lastSyncedAt: new Date()
    });

    console.log(`Synced ${syncedCount} emails`);

    return {
      success: true,
      count: syncedCount
    };

  } catch (err) {

    console.error("========== FULL GMAIL ERROR ==========");
    console.error(err);
    console.error("======================================");

    throw err;
  }
};

const getEmailById = async (userId, emailId) =>
  Email.findOne({ _id: emailId, userId });

const groupEmailsBySender = async (userId) => {
  const emails = await Email.find({ userId });

  const map = {};

  emails.forEach(email => {
    if (!map[email.sender]) {
      map[email.sender] = {
        name: email.sender,
        emailCount: 0,
        unreadCount: 0,
        avatar:
          email.sender
            .split(" ")
            .map(x => x[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
      };
    }

    map[email.sender].emailCount++;

    if (!email.isRead)
      map[email.sender].unreadCount++;
  });

  return Object.values(map);
};

const searchEmails = async (userId, query) => {
  const regex = new RegExp(query, "i");

  return Email.find({
    userId,
    $or: [
      { subject: regex },
      { sender: regex },
      { senderEmail: regex },
      { body: regex }
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