const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gmailId: { type: String, unique: true, sparse: true },
  sender: { type: String, required: true },
  senderEmail: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  snippet: { type: String },
  category: { 
    type: String, 
    enum: ['Jobs & Internships', 'Learning Resources', 'College Notifications', 'Finance & Banking', 'Personal', 'Events'],
    default: 'Personal'
  },
  summary: { type: String },
  date: { type: Date, required: true },
  isRead: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false },
  attachments: [{
    filename: String,
    mimeType: String,
    attachmentId: String,
    size: Number
  }],
  aiInsights: {
    summary: String,
    company: String,
    role: String,
    stipend: String,
    location: String,
    deadline: String,
    skills: [String],
    actionItems: [String],
    links: [String],
    generatedAt: Date
  }
});

module.exports = mongoose.model('Email', EmailSchema);
