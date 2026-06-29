import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmail } from '../context/EmailContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, AlertCircle, RefreshCw, Sparkles, Filter } from 'lucide-react';

const Home = () => {
  const { 
    emails, 
    searchQuery, 
    setSearchQuery, 
    activeCategory, 
    setActiveSender, 
    loading
  } = useEmail();
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const [activeSubFilter, setActiveSubFilter] = useState('All');

  // Reset category sub-filter when active category changes
  useEffect(() => {
    setActiveSubFilter('All');
  }, [activeCategory]);

  // Focus search input on Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset active sender on home screen load
  useEffect(() => {
    setActiveSender(null);
  }, [setActiveSender]);

  const subFiltersMap = {
    'Jobs & Internships': ['All', 'Internships', 'Hiring', 'Assessments', 'Challenges'],
    'Learning Resources': ['All', 'Courses', 'Tutorials', 'Certifications'],
    'College Notifications': ['All', 'Exams', 'Circulars', 'Notifications'],
    'Finance & Banking': ['All', 'Banking', 'Transactions', 'Payments'],
    'Personal': ['All', 'Friends', 'Family', 'Personal Emails'],
    'Events': ['All', 'Hackathons', 'Meetups', 'Workshops']
  };

  const checkSubFilterMatch = (email, subFilter) => {
    const text = `${email.subject} ${email.body}`.toLowerCase();
    switch (subFilter) {
      // Jobs & Internships
      case 'Internships':
        return text.includes('intern');
      case 'Hiring':
        return text.includes('hire') || text.includes('hiring') || text.includes('careers') || text.includes('recruit') || text.includes('opening');
      case 'Assessments':
        return text.includes('assessment') || text.includes('test') || text.includes('coding') || text.includes('exam');
      case 'Challenges':
        return text.includes('challenge') || text.includes('hackathon') || text.includes('contest') || text.includes('championship');
      
      // Learning Resources
      case 'Courses':
        return text.includes('course') || text.includes('class') || text.includes('lecture') || text.includes('enroll');
      case 'Tutorials':
        return text.includes('tutorial') || text.includes('learn') || text.includes('guide') || text.includes('dsa') || text.includes('hook');
      case 'Certifications':
        return text.includes('certification') || text.includes('certificate') || text.includes('credential');

      // College
      case 'Exams':
        return text.includes('exam') || text.includes('semester') || text.includes('timetable') || text.includes('date sheet');
      case 'Circulars':
        return text.includes('circular') || text.includes('registrar') || text.includes('notice') || text.includes('official');
      case 'Notifications':
        return text.includes('notification') || text.includes('alert') || text.includes('announcement');

      // Finance & Banking
      case 'Banking':
        return text.includes('bank') || text.includes('savings') || text.includes('account') || text.includes('ledger');
      case 'Transactions':
        return text.includes('transaction') || text.includes('otp') || text.includes('debit') || text.includes('credit');
      case 'Payments':
        return text.includes('payment') || text.includes('bill') || text.includes('receipt') || text.includes('invoice') || text.includes('salary');

      // Personal
      case 'Friends':
        return text.includes('friend') || text.includes('buddy') || text.includes('connect');
      case 'Family':
        return text.includes('family') || text.includes('mom') || text.includes('dad') || text.includes('brother') || text.includes('sister');
      case 'Personal Emails':
        return !text.includes('careers') && !text.includes('courses') && !text.includes('transaction');

      // Events
      case 'Hackathons':
        return text.includes('hackathon') || text.includes('hack') || text.includes('devfolio');
      case 'Meetups':
        return text.includes('meetup') || text.includes('rsvp') || text.includes('zoom');
      case 'Workshops':
        return text.includes('workshop') || text.includes('session') || text.includes('webinar') || text.includes('seminar');

      default:
        return true;
    }
  };

  // 1. Dynamic Client Side Search & Filter Heuristics
  const filteredEmails = emails.filter(email => {
    if (searchQuery) {
      const clean = searchQuery.toLowerCase();
      const matchSender = (email.sender || '').toLowerCase().includes(clean);
      const matchSubject = (email.subject || '').toLowerCase().includes(clean);
      const matchBody = (email.body || '').toLowerCase().includes(clean);
      if (!matchSender && !matchSubject && !matchBody) return false;
    }

    if (activeCategory && activeSubFilter !== 'All') {
      const matchSub = checkSubFilterMatch(email, activeSubFilter);
      if (!matchSub) return false;
    }

    return true;
  });

  // Aggregate emails dynamically into sender groups
  const senderGroups = {};
  filteredEmails.forEach(email => {
    const senderName = email.sender || 'Unknown Sender';
    if (!senderGroups[senderName]) {
      senderGroups[senderName] = {
        name: senderName,
        emailCount: 0,
        unreadCount: 0
      };
    }
    
    senderGroups[senderName].emailCount++;
    if (!email.isRead) {
      senderGroups[senderName].unreadCount++;
    }
  });

  const senderCards = Object.values(senderGroups).sort((a, b) => b.emailCount - a.emailCount);

  const handleSenderClick = (name) => {
    navigate(`/sender/${encodeURIComponent(name)}`);
  };

  // Determine dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFirstName = () => {
    if (!user) return 'Rahul';
    return user.name.split(' ')[0];
  };

  // Dynamic colors and themes for sender avatars
  const getSenderTheme = (senderName) => {
    // Hash colors for unique custom avatars
    const colors = [
      'from-purple-600 to-indigo-500',
      'from-rose-500 to-pink-500',
      'from-emerald-600 to-green-500',
      'from-amber-500 to-yellow-400',
      'from-blue-600 to-indigo-400',
      'from-fuchsia-600 to-purple-400'
    ];
    let sum = 0;
    for (let i = 0; i < senderName.length; i++) {
      sum += senderName.charCodeAt(i);
    }
    const bg = colors[sum % colors.length];
    
    const clean = senderName.replace(/\([^)]*\)/g, '').trim();
    const parts = clean.split(' ').filter(p => p.length > 0);
    let initials = '✉️';
    if (parts.length === 1) {
      initials = parts[0][0].toUpperCase();
    } else if (parts.length > 1) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return { bg, initials, style: 'font-sans font-black text-white text-[11px]' };
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent max-w-4xl mx-auto w-full px-4 md:px-8 py-3 overflow-y-auto no-scrollbar select-none text-white">
      
      {/* Top Header Row - Minimal height */}
      <div className="flex items-center justify-between mb-4">
        <div className="leading-tight space-y-0.5">
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center space-x-1.5">
            <span>{getGreeting()}, {getFirstName()}</span>
            <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-[10.5px] text-white/45 font-bold uppercase tracking-wider">
            {activeCategory ? `Category: ${activeCategory}` : 'Organize your inbox by sender'}
          </p>
        </div>
      </div>

      {/* Prominent Search bar */}
      <div className="relative w-full mb-5 group">
        <div className="relative flex items-center">
          <div className="absolute left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-purple-400/80 group-focus-within:text-purple-300 transition-colors" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search senders, emails, subjects, keywords..."
            className="w-full pl-11 pr-20 py-3.5 text-[13px] text-white bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] backdrop-blur-[20px] rounded-[20px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] focus:bg-[rgba(255,255,255,0.12)] focus:border-purple-500/50 focus:shadow-[0_0_20px_rgba(168,85,247,0.25)] focus:outline-none transition-all duration-300 placeholder-white/40 hover:bg-[rgba(255,255,255,0.1)]"
          />
          {/* Ctrl+K badge */}
          <div className="absolute right-0 pr-3 flex items-center pointer-events-none select-none">
            <div className="px-2.5 py-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[8px] text-[10px] text-white/60 font-mono font-bold shadow-sm">
              Ctrl + K
            </div>
          </div>
        </div>
      </div>

      {/* Category sub-filters pill tracker */}
      {activeCategory && subFiltersMap[activeCategory] && (
        <div className="mb-6 flex flex-col space-y-2">
          <div className="flex items-center space-x-1 px-1">
            <Filter className="w-3 h-3 text-purple-400" />
            <span className="text-[9.5px] font-black text-white/45 uppercase tracking-wider">Sub Filters</span>
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
            {subFiltersMap[activeCategory].map((subFilter) => (
              <button
                key={subFilter}
                onClick={() => setActiveSubFilter(subFilter)}
                className={`px-4.5 py-1.5 rounded-full text-[10.5px] font-bold transition-all ${
                  activeSubFilter === subFilter
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20 border border-purple-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5'
                }`}
              >
                {subFilter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Senders Cards Section */}
      <div className="space-y-4 flex-1">
        {/* Directory header line */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-4">
          <h3 className="text-[9.5px] font-black uppercase tracking-widest text-white/35">
            Sender Directory
          </h3>
          <span className="text-[9px] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full font-mono font-bold text-white/55 shadow-sm">
            {senderCards.length} Sender{senderCards.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
            <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest">Grouping Mailbox...</p>
          </div>
        ) : senderCards.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/8 rounded-2xl bg-white/2">
            <AlertCircle className="w-7 h-7 text-white/20 mx-auto mb-2" />
            <h4 className="text-[11.5px] font-bold text-white/45 uppercase">No Senders Found</h4>
            <p className="text-[10px] text-white/30 mt-1 max-w-[240px] mx-auto leading-relaxed">
              We couldn't generate sender directories for this selection. Try adjusting filters or keyword searches.
            </p>
          </div>
        ) : (
          /* Dynamic Grid showing custom gradient sender cards */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {senderCards.map((card) => {
                const theme = getSenderTheme(card.name);
                return (
                  <motion.button
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    key={card.name}
                    onClick={() => handleSenderClick(card.name)}
                    className="glass-card flex items-center justify-between p-4 rounded-2xl text-left select-none outline-none relative group cursor-pointer hover:border-purple-500/20 active:scale-[0.99] w-full"
                  >
                    {/* Hover reflections */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/2 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>

                    <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-3 relative z-10">
                      {/* Initials Circle with customized gradient */}
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.bg} flex items-center justify-center shadow-lg shrink-0 border border-white/10`}>
                        <span className={theme.style}>{theme.initials}</span>
                      </div>

                      <div className="min-w-0 leading-tight">
                        <h4 className="text-[13px] font-extrabold text-white truncate group-hover:text-purple-300 transition-colors">
                          {card.name}
                        </h4>
                        <span className="text-[11px] text-white/45 font-semibold">
                          {card.emailCount} Email{card.emailCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 relative z-10">
                      {card.unreadCount > 0 && (
                        <span className="text-[9px] font-black bg-purple-500 text-white px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                          {card.unreadCount} new
                        </span>
                      )}
                      {/* Circle Chevron Button */}
                      <div className="w-7.5 h-7.5 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:text-white group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all select-none">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;
