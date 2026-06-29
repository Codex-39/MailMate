import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const EmailContext = createContext(null);

export const EmailProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Lists and Selected Items
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  
  // Dashboard Aggregates
  const [metrics, setMetrics] = useState({
    totalToday: 0,
    unreadCount: 0,
    starredCount: 0,
    importantCount: 0
  });
  const [senderCards, setSenderCards] = useState([]);
  const [todayHighlights, setTodayHighlights] = useState([]);
  const [chartsData, setChartsData] = useState(null);
  const [folderCounts, setFolderCounts] = useState({
    'Jobs & Internships': 0,
    'Learning Resources': 0,
    'College Notifications': 0,
    'Finance & Banking': 0,
    'Personal': 0,
    'Events': 0
  });
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSender, setActiveSender] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'starred'
  
  // Status flags
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // 1. Fetch dashboard metrics & groupings
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/analytics/dashboard');
      setMetrics(res.data.metrics);
      setSenderCards(res.data.senderCards);
      setTodayHighlights(res.data.todayHighlights);
      if (res.data.folderCounts) {
        setFolderCounts(res.data.folderCounts);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  }, [user]);

  // 2. Fetch emails based on search, category, sender, filter status
  const fetchEmails = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = {};
      
      if (searchQuery) params.search = searchQuery;
      if (activeCategory) params.category = activeCategory;
      if (activeSender) params.sender = activeSender;
      
      if (activeFilter === 'starred') params.isStarred = 'true';
      if (activeFilter === 'unread') params.isRead = 'false';
      if (activeFilter === 'important') params.important = 'true';
      if (activeFilter === 'recent') params.recent = 'true';

      const res = await api.get('/emails', { params });
      setEmails(res.data);
      
      // Auto-select first email in list if none is selected
      if (res.data.length > 0 && !selectedEmail) {
        // We will load detail for first email automatically in a larger screen
        // But let's avoid calling fetchEmailDetails inside useEffect loop, we will do it on UI load
      }
    } catch (err) {
      console.error('Error fetching emails list:', err);
    } finally {
      setLoading(false);
    }
  }, [user, searchQuery, activeCategory, activeSender, activeFilter]);

  // 3. Fetch single email details (forces mark as read)
  const fetchEmailDetails = async (emailId) => {
    if (!user || !emailId) return;
    setDetailsLoading(true);
    try {
      const res = await api.get(`/emails/${emailId}`);
      setSelectedEmail(res.data);
      
      // Update read status locally in lists and metrics immediately
      setEmails(prev => prev.map(e => e._id === emailId ? { ...e, isRead: true } : e));
      
      // Refresh dashboard counters
      fetchDashboardData();
    } catch (err) {
      console.error('Error fetching email details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // 4. Toggle Star (favorite)
  const toggleStar = async (emailId) => {
    try {
      const res = await api.post(`/emails/${emailId}/toggle-star`);
      const { isStarred } = res.data;
      
      // Update local states
      setEmails(prev => prev.map(e => e._id === emailId ? { ...e, isStarred } : e));
      if (selectedEmail && selectedEmail._id === emailId) {
        setSelectedEmail(prev => ({ ...prev, isStarred }));
      }
      
      fetchDashboardData();
    } catch (err) {
      console.error('Error toggling star:', err);
    }
  };

  // 5. Toggle Read/Unread manually
  const toggleRead = async (emailId) => {
    try {
      const res = await api.post(`/emails/${emailId}/toggle-read`);
      const { isRead } = res.data;
      
      // Update local states
      setEmails(prev => prev.map(e => e._id === emailId ? { ...e, isRead } : e));
      if (selectedEmail && selectedEmail._id === emailId) {
        setSelectedEmail(prev => ({ ...prev, isRead }));
      }
      
      fetchDashboardData();
    } catch (err) {
      console.error('Error toggling read:', err);
    }
  };

  // 6. Force generate AI Summary
  const generateAISummary = async (emailId) => {
    setDetailsLoading(true);
    try {
      const res = await api.post(`/emails/${emailId}/summarize`);
      const { summary } = res.data;
      
      if (selectedEmail && selectedEmail._id === emailId) {
        setSelectedEmail(prev => ({ ...prev, summary }));
      }
      
      setEmails(prev => prev.map(e => e._id === emailId ? { ...e, summary } : e));
    } catch (err) {
      console.error('Error generating AI Summary:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // 7. Sync Inbox
  const syncInbox = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      await api.post('/emails/sync');
      
      // Refresh list, dashboard, charts
      await fetchDashboardData();
      await fetchEmails();
      await fetchChartsData();
      
      // Select the first email if list updated and nothing is selected
      setSelectedEmail(null);
      showToast('Inbox Updated Successfully', 'success');
    } catch (err) {
      console.error('Error syncing inbox:', err);
      showToast('Sync failed: Check configuration', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // 8. Fetch detailed statistics charts
  const fetchChartsData = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/analytics/charts');
      setChartsData(res.data);
    } catch (err) {
      console.error('Error fetching charts stats:', err);
    }
  }, [user]);

  // Load initial data on user change
  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchEmails();
      fetchChartsData();
    } else {
      setEmails([]);
      setSelectedEmail(null);
      setSenderCards([]);
      setTodayHighlights([]);
      setChartsData(null);
    }
  }, [user, fetchDashboardData, fetchEmails, fetchChartsData]);

  // Trigger refetch whenever active filter/search changes
  useEffect(() => {
    if (user) {
      fetchEmails();
    }
  }, [user, activeCategory, activeSender, activeFilter, searchQuery, fetchEmails]);

  // Reset category or sender filters helper
  const resetFilters = () => {
    setActiveCategory(null);
    setActiveSender(null);
    setActiveFilter('all');
    setSearchQuery('');
  };

  return (
    <EmailContext.Provider value={{
      emails,
      selectedEmail,
      metrics,
      senderCards,
      todayHighlights,
      chartsData,
      folderCounts,
      searchQuery,
      activeCategory,
      activeSender,
      activeFilter,
      loading,
      syncing,
      detailsLoading,
      toast,
      showToast,
      setSearchQuery,
      setActiveCategory,
      setActiveSender,
      setActiveFilter,
      setSelectedEmail,
      fetchEmailDetails,
      toggleStar,
      toggleRead,
      generateAISummary,
      syncInbox,
      fetchChartsData,
      resetFilters
    }}>
      {children}
    </EmailContext.Provider>
  );
};

export const useEmail = () => useContext(EmailContext);
