const express = require('express');
const router = express.Router();
const Email = require('../models/Email');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth.middleware');
const { syncGmailInbox } = require('../services/gmail.service');
const { summarizeEmail } = require('../services/ai.service');

// All email routes are protected by JWT authMiddleware
router.use(authMiddleware);

// @route   GET api/emails/sync
// @desc    Sync user's Gmail inbox (Google Sync or seeded fallback)
router.post('/sync', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const syncResult = await syncGmailInbox(user);
    res.json({
      message: 'Sync completed successfully',
      ...syncResult
    });
  } catch (err) {
    console.error('Sync route error:', err);
    res.status(500).json({ message: 'Error syncing emails', error: err.message });
  }
});

// @route   GET api/emails
// @desc    Get all emails with filters (search, category, sender, starred, unread, important, recent)
router.get('/', async (req, res) => {
  try {
    const query = { userId: req.user.userId };

    // Filter by Category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by Sender display name
    if (req.query.sender) {
      query.sender = req.query.sender;
    }

    // Filter by Starred status
    if (req.query.isStarred === 'true') {
      query.isStarred = true;
    } else if (req.query.isStarred === 'false') {
      query.isStarred = false;
    }

    // Filter by Read status
    if (req.query.isRead === 'true') {
      query.isRead = true;
    } else if (req.query.isRead === 'false') {
      query.isRead = false;
    }

    // Global search term (filters by subject, sender name, or body keywords)
    if (req.query.search) {
      const searchRegex = req.query.search;
      query.$or = [
        { subject: { $regex: searchRegex, $options: 'i' } },
        { sender: { $regex: searchRegex, $options: 'i' } },
        { body: { $regex: searchRegex, $options: 'i' } }
      ];
    }

    let emails = await Email.find(query);

    // Apply Important Filter
    if (req.query.important === 'true') {
      const urgentRegex = /urgent|opportunity|hiring|exam|scholarship|assessment|debit/i;
      emails = emails.filter(email => {
        const isImportantCategory = email.category === 'Jobs & Internships' || email.category === 'College Notifications';
        const containsUrgentKeyword = urgentRegex.test(email.subject || '') || urgentRegex.test(email.body || '');
        return isImportantCategory || containsUrgentKeyword;
      });
    }

    // Apply Recent Filter (last 24 hours)
    if (req.query.recent === 'true') {
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      emails = emails.filter(email => new Date(email.date) >= last24h);
    }

    res.json(emails);
  } catch (err) {
    console.error('Get emails error:', err);
    res.status(500).json({ message: 'Error retrieving emails' });
  }
});

// @route   GET api/emails/:id
// @desc    Get single email details & mark as read
router.get('/:id', async (req, res) => {
  try {
    let email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Security check: email must belong to current user
    if (email.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to this email' });
    }

    // Automatically mark as read if not already
    if (!email.isRead) {
      email = await Email.findByIdAndUpdate(req.params.id, { isRead: true });
    }

    res.json(email);
  } catch (err) {
    console.error('Get single email error:', err);
    res.status(500).json({ message: 'Error retrieving email details' });
  }
});

// @route   POST api/emails/:id/toggle-star
// @desc    Toggle star/favorite flag on an email
router.post('/:id/toggle-star', async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    if (email.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const updatedEmail = await Email.findByIdAndUpdate(
      req.params.id,
      { isStarred: !email.isStarred }
    );

    res.json({ isStarred: updatedEmail.isStarred });
  } catch (err) {
    res.status(500).json({ message: 'Error updating favorite status' });
  }
});

// @route   POST api/emails/:id/toggle-read
// @desc    Toggle read/unread status manually
router.post('/:id/toggle-read', async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    if (email.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const updatedEmail = await Email.findByIdAndUpdate(
      req.params.id,
      { isRead: !email.isRead }
    );

    res.json({ isRead: updatedEmail.isRead });
  } catch (err) {
    res.status(500).json({ message: 'Error updating read status' });
  }
});

// @route   POST api/emails/:id/summarize
// @desc    Generate summary for an email dynamically
router.post('/:id/summarize', async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    if (email.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    // Force summary generation if not already set or specifically requested
    const summary = await summarizeEmail(email.subject, email.body, email.sender);
    const updatedEmail = await Email.findByIdAndUpdate(req.params.id, { summary });

    res.json({ summary: updatedEmail.summary });
  } catch (err) {
    console.error('Summarize route error:', err);
    res.status(500).json({ message: 'Error generating AI summary' });
  }
});

module.exports = router;
