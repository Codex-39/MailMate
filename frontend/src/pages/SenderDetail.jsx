import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmail } from '../context/EmailContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, AlertCircle, ChevronRight, Star } from 'lucide-react';

const SenderDetail = () => {
  const { senderName } = useParams();
  const decodedSender = decodeURIComponent(senderName || '');
  const navigate = useNavigate();
  
  const { 
    emails, 
    setActiveSender, 
    loading,
    toggleStar
  } = useEmail();

  // Sync route parameters with active filter
  useEffect(() => {
    if (decodedSender) {
      setActiveSender(decodedSender);
    }
    return () => {
      setActiveSender(null);
    };
  }, [decodedSender, setActiveSender]);

  const handleBackToSenders = () => {
    navigate('/');
  };

  const handleEmailClick = (emailId) => {
    navigate(`/email/${emailId}`);
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
    
    return emailDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent max-w-3xl mx-auto w-full px-4 md:px-6 py-4 overflow-y-auto no-scrollbar select-none text-white">
      
      {/* Dynamic Back Header */}
      <div className="flex items-center space-x-3.5 mb-5 select-none">
        <button 
          onClick={handleBackToSenders}
          className="p-2.5 hover:bg-white/10 bg-white/5 border border-white/10 rounded-xl transition-all hover:scale-102 flex items-center justify-center shadow-sm"
          title="Back to All Senders"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-purple-400" />
        </button>
        <div className="leading-tight space-y-0.5">
          <span className="text-[9.5px] text-white/35 font-bold uppercase tracking-widest block">Sender Directory</span>
          <h2 className="text-lg font-black text-white">{decodedSender}</h2>
        </div>
      </div>

      {/* Senders Metadata Row */}
      <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-5 select-none">
        <span className="text-[9.5px] font-black uppercase tracking-widest text-white/35">
          Messages Archive
        </span>
        <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 px-3 py-0.5 rounded-full font-mono font-bold text-purple-300 shadow-sm">
          {emails.length} Email{emails.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Email Feed Rows */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
          <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest">Loading sender archive...</p>
        </div>
      ) : emails.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/8 rounded-2xl bg-white/2">
          <AlertCircle className="w-7 h-7 text-white/20 mx-auto mb-2" />
          <h4 className="text-[11.5px] font-bold text-white/45 uppercase">No Emails Found</h4>
          <p className="text-[10px] text-white/35 mt-1 max-w-[200px] mx-auto leading-relaxed">
            We couldn't locate any messages from {decodedSender}.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          <AnimatePresence>
            {emails.map((email) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                key={email._id}
                onClick={() => handleEmailClick(email._id)}
                className="glass-card flex items-center justify-between p-4 rounded-2xl cursor-pointer relative group hover:border-purple-500/20 active:scale-[0.99] w-full"
              >
                {/* Micro reflection hover */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/2 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>

                <div className="min-w-0 flex-1 pr-4 relative z-10">
                  {/* Subject & Unread tag */}
                  <div className="flex items-center space-x-2">
                    <h3 className={`text-[13px] truncate transition-colors group-hover:text-purple-300 ${
                      !email.isRead ? 'font-black text-white' : 'font-semibold text-white/70'
                    }`}>
                      {email.subject}
                    </h3>
                    {!email.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 shadow shadow-purple-500 animate-pulse"></span>
                    )}
                  </div>

                  {/* Preview snippet */}
                  <p className="text-[11px] text-white/40 line-clamp-1 leading-relaxed mt-1 font-medium">
                    {email.snippet || email.body.substring(0, 95).replace(/<[^>]+>/g, '')}
                  </p>
                </div>

                {/* Right Area: Date and actions */}
                <div className="flex items-center space-x-3.5 shrink-0 relative z-10">
                  <span className="text-[9.5px] text-white/40 font-bold shrink-0 font-mono">
                    {formatEmailDate(email.date)}
                  </span>
                  
                  {/* Star rating marker */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(email._id);
                    }}
                    className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Star className={`w-3.5 h-3.5 ${email.isStarred ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />
                  </button>

                  <div className="w-7 h-7 rounded-full border border-white/5 flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-purple-500/20 transition-all">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
};

export default SenderDetail;
