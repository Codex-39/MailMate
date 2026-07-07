const express = require('express');
const router = express.Router();
const Email = require('../models/Email');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Helper: check if email date is "today"
const isToday = (emailDate) => {
  const today = new Date();
  const d = new Date(emailDate);
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
};

// @route   GET api/analytics/dashboard
// @desc    Retrieve counters and sender statistics
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.userId;
    const emails = await Email.find({ userId });

    // 1. Calculate Metric Counters & Filter Counts
    let totalToday = 0;
    let unreadCount = 0;
    let starredCount = 0;
    let importantCount = 0; // Filtered to crucial notifications (opportunities, exams)
    let recentCount = 0;   // Count of emails in last 24h

    const todayHighlights = [];
    const folderCounts = {
      'Jobs & Internships': 0,
      'Learning Resources': 0,
      'College Notifications': 0,
      'Finance & Banking': 0,
      'Personal': 0,
      'Events': 0
    };

    emails.forEach(email => {
      const emailDate = new Date(email.date);
      
      // Calculate 24h recent
      const hoursOffset = (new Date() - emailDate) / (1000 * 60 * 60);
      if (hoursOffset <= 24) {
        recentCount++;
      }

      if (isToday(emailDate)) {
        totalToday++;
      }
      
      if (!email.isRead) {
        unreadCount++;
      }
      
      if (email.isStarred) {
        starredCount++;
      }

      // Smart category counting
      if (folderCounts[email.category] !== undefined) {
        folderCounts[email.category]++;
      }

      // Check if email falls under "Important Today" (Jobs & Internships, College Notifications, or specific tags)
      const subj = email.subject.toLowerCase();
      const body = email.body.toLowerCase();
      const isImportantCategory = email.category === 'Jobs & Internships' || email.category === 'College Notifications';
      const containsUrgentKeyword = subj.includes('urgent') || subj.includes('opportunity') || subj.includes('hiring') || subj.includes('exam') || subj.includes('scholarship') || subj.includes('assessment') || subj.includes('debit');

      if (isImportantCategory || containsUrgentKeyword) {
        importantCount++;
        
        // Populate highlights section
        if (isToday(emailDate) || email.isStarred || !email.isRead) {
          if (todayHighlights.length < 8) { // cap highlights count
            let icon = '🔥';
            if (email.category === 'Jobs & Internships') icon = '💼';
            if (email.category === 'College Notifications') icon = '🏫';
            if (email.category === 'Finance & Banking') icon = '💰';

            todayHighlights.push({
              id: email._id,
              sender: email.sender,
              subject: email.subject,
              category: email.category,
              date: email.date,
              icon
            });
          }
        }
      }
    });

    // 2. Calculate Sender Cards Grouping from actual data
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

    // Convert sender groups to array and sort by volume descending
    const senderCards = Object.values(senderGroups).sort((a, b) => b.emailCount - a.emailCount);

    res.json({
      metrics: {
        totalToday,
        unreadCount,
        starredCount,
        importantCount,
        recentCount
      },
      folderCounts,
      senderCards,
      todayHighlights
    });
  } catch (err) {
    console.error('Dashboard analytics error:', err);
    res.status(500).json({ message: 'Error compiling dashboard statistics' });
  }
});

// @route   GET api/analytics/charts
// @desc    Retrieve detailed chart aggregates (Categories, volume history)
router.get('/charts', async (req, res) => {
  try {
    const userId = req.user.userId;
    const emails = await Email.find({ userId });

    // 1. Category Distribution
    const categories = ['Jobs & Internships', 'Learning Resources', 'College Notifications', 'Finance & Banking', 'Personal', 'Events'];
    const categoryStats = categories.map(cat => ({
      name: cat,
      value: 0,
      unread: 0
    }));

    emails.forEach(email => {
      const idx = categories.indexOf(email.category);
      if (idx !== -1) {
        categoryStats[idx].value++;
        if (!email.isRead) {
          categoryStats[idx].unread++;
        }
      }
    });

    // 2. Last 7 Days Volume History
    const dateMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap[key] = { name: key, total: 0, unread: 0 };
    }

    emails.forEach(email => {
      const emailDate = new Date(email.date);
      const key = emailDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dateMap[key]) {
        dateMap[key].total++;
        if (!email.isRead) {
          dateMap[key].unread++;
        }
      }
    });

    const volumeHistory = Object.values(dateMap);

    // 3. Top Senders list
    const senderCounts = {};
    emails.forEach(email => {
      senderCounts[email.sender] = (senderCounts[email.sender] || 0) + 1;
    });

    const topSenders = Object.entries(senderCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      categoryStats,
      volumeHistory,
      topSenders
    });
  } catch (err) {
    console.error('Chart analytics error:', err);
    res.status(500).json({ message: 'Error compiling chart statistics' });
  }
});

// @route   GET api/analytics/daily-digest
// @desc    Get daily AI-generated digest and dashboard aggregates
router.get('/daily-digest', async (req, res) => {
  try {
    const userId = req.user.userId;
    const force = req.query.force === 'true';
    
    const { getDailyDigest } = require('../services/analytics.service');
    const digest = await getDailyDigest(userId, force);
    
    res.json(digest);
  } catch (err) {
    console.error('Daily digest route error:', err);
    res.status(500).json({ message: 'Error compiling daily digest summary', error: err.message });
  }
});

module.exports = router;
