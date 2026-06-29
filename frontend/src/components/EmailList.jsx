import React from 'react';
import { useEmail } from '../context/EmailContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, AlertCircle, RefreshCw, X, Filter } from 'lucide-react';

const EmailList = () => {
  const { 
    emails, 
    selectedEmail, 
    fetchEmailDetails, 
    toggleStar, 
    loading, 
    activeCategory, 
    activeSender, 
    activeFilter, 
    setActiveFilter,
    resetFilters,
    searchQuery
  } = useEmail();

  const getCategoryStyles = (category) => {
    switch (category) {
      case 'Jobs & Internships':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'Learning Resources':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'College Notifications':
        return 'bg-sky-500/10 text-sky-300 border-sky-500/20';
      case 'Finance & Banking':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'Events':
        return 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20';
      default:
        return 'bg-white/5 text-white/60 border-white/10';
    }
  };

  const getSenderInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '✉️';
  };

  const formatEmailDate = (dateString) => {
    const emailDate = new Date(dateString);
    const today = new Date();
    
    if (emailDate.toDateString() === today.toDateString()) {
      return emailDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (emailDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return emailDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleSelectEmail = (id) => {
    fetchEmailDetails(id);
  };

  const hasActiveFilters = activeCategory || activeSender || searchQuery;

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4 text-white">
      
      {/* Title & Clear Filters Trigger */}
      <div className="flex justify-between items-center px-1 shrink-0">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-purple-400" />
          <h4 className="text-xs font-black uppercase tracking-wider text-white/45">
            {activeSender ? `${activeSender} Feed` : 
             activeCategory ? `${activeCategory}` : 
             searchQuery ? 'Search Feed' : 'Incoming Mail'}
          </h4>
          <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-bold text-white/65">
            {emails.length}
          </span>
        </div>
        
        {hasActiveFilters && (
          <button 
            onClick={resetFilters}
            className="text-[9.5px] font-bold text-white/60 hover:text-white flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 shadow-sm transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Reset Feed</span>
          </button>
        )}
      </div>

      {/* Local filters tab */}
      <div className="flex items-center space-x-1.5 shrink-0 bg-white/2 border border-white/5 p-1 rounded-xl w-fit shadow-sm select-none">
        {['all', 'unread', 'starred'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-[10.5px] font-bold tracking-wide transition-all uppercase ${
              activeFilter === tab
                ? 'bg-purple-500 text-white shadow-sm border border-purple-500/20'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable Email Feed Cards */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-0.5">
        {loading ? (
          <div className="h-40 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
            <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider">Retrieving Inbox...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="py-16 px-4 text-center bg-white/1 border border-white/5 rounded-[24px]">
            <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-2.5" />
            <h5 className="text-xs font-bold text-white/45 uppercase">Inbox Clean</h5>
            <p className="text-[10.5px] text-white/30 mt-1 max-w-[200px] mx-auto leading-relaxed">
              No matching messages were found in this directory.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {emails.map((email) => {
                const isSelected = selectedEmail && selectedEmail._id === email._id;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    key={email._id}
                    onClick={() => handleSelectEmail(email._id)}
                    className={`glass-card rounded-2xl p-3.5 cursor-pointer relative border transition-all select-none hover:scale-[1.01] flex flex-col space-y-2 ${
                      isSelected 
                        ? 'border-purple-500/40 bg-purple-500/5 ring-1 ring-purple-500/10 shadow-md shadow-purple-500/5' 
                        : ''
                    }`}
                  >
                    {/* Header row: avatar, sender name, unread dot, date */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 min-w-0">
                        {/* Avatar Bubble */}
                        <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[9px] text-white/80 shrink-0 shadow-sm">
                          {getSenderInitials(email.sender)}
                        </div>
                        
                        <span className={`text-xs truncate ${!email.isRead ? 'font-extrabold text-white' : 'font-semibold text-white/60'}`}>
                          {email.sender}
                        </span>
                        
                        {/* Unread Dot */}
                        {!email.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 shadow shadow-purple-500"></span>
                        )}
                      </div>

                      <span className="text-[9px] text-white/40 shrink-0 font-bold font-mono">
                        {formatEmailDate(email.date)}
                      </span>
                    </div>

                    {/* Subject & Preview */}
                    <div className="space-y-0.5">
                      <h5 className={`text-[12.5px] truncate ${!email.isRead ? 'font-bold text-white' : 'font-semibold text-white/70'}`}>
                        {email.subject}
                      </h5>
                      <p className="text-[11px] text-white/40 line-clamp-1 leading-relaxed font-semibold">
                        {email.snippet || email.body.substring(0, 80).replace(/<[^>]+>/g, '')}
                      </p>
                    </div>

                    {/* Badges footer */}
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${getCategoryStyles(email.category)}`}>
                        {email.category}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(email._id);
                        }}
                        className="p-1 rounded-full hover:bg-white/5 transition-colors shrink-0 text-white/30 hover:text-amber-400"
                      >
                        <Star 
                          className={`w-3.5 h-3.5 transition-colors ${
                            email.isStarred 
                              ? 'fill-amber-400 text-amber-400' 
                              : ''
                          }`} 
                        />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailList;
