const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  googleId: { type: String },
  profilePicture: { type: String },
  accessToken: { type: String },
  refreshToken: { type: String },
  tokenExpiry: { type: Date },
  gmailHistoryId: { type: String },
  lastSyncedAt: { type: Date },
  dailyDigestCache: {
    totalEmails: { type: Number },
    unreadEmails: { type: Number },
    internships: { type: Number },
    jobs: { type: Number },
    college: { type: Number },
    finance: { type: Number },
    personal: { type: Number },
    importantActions: [{ type: String }],
    aiDigest: { type: String },
    cachedAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
