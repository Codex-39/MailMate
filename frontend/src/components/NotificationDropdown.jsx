import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmail } from '../context/EmailContext';
import { useNavigate } from 'react-router-dom';
import { Bell, RefreshCw, Mail, ArrowRight, UserPlus } from 'lucide-react';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const { emails, syncing, metrics, todayHighlights } = useEmail();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get recent 3 emails
  const recentEmails = emails.slice(0, 3);

  // Get unique new senders from highlights or emails
  const newSenders = [...new Set(emails.slice(0, 5).map(e => e.sender))].slice(0, 2);

  const handleEmailClick = (emailId) => {
    navigate(`/email/${emailId}`);
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2.5 w-80 z-50 pointer-events-auto" ref={dropdownRef}>
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="glass-panel rounded-3xl p-4 shadow-2xl border border-white/10 select-none overflow-hidden relative"
      >
        {/* Subtle blur background element */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none"></div>

        <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
          <div className="flex items-center space-x-1.5">
            <Bell className="w-4 h-4 text-purple-400" />
            <h4 className="text-[11px] font-black uppercase tracking-wider text-white">Notifications</h4>
          </div>
          <span className="text-[9.5px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
            {metrics.unreadCount} New
          </span>
        </div>

        {/* Content list */}
        <div className="space-y-4 max-h-[320px] overflow-y-auto no-scrollbar">
          
          {/* Sync Status block */}
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${syncing ? 'animate-spin' : ''}`} />
              <div className="min-w-0 leading-tight">
                <span className="text-[9.5px] font-bold text-white/40 uppercase block font-mono">Sync Status</span>
                <span className="text-[11px] font-bold text-white truncate block">
                  {syncing ? 'Syncing Gmail data...' : 'Synced successfully'}
                </span>
              </div>
            </div>
          </div>

          {/* Unread updates count banner */}
          <div className="leading-tight px-1 select-none">
            <span className="text-[9.5px] font-bold text-white/40 uppercase block font-mono">Inbox State</span>
            <p className="text-[11.5px] text-white/80 font-semibold mt-1">
              You have <span className="text-purple-400 font-bold">{metrics.unreadCount} unread messages</span> in your inbox.
            </p>
          </div>

          {/* New Senders category */}
          {newSenders.length > 0 && (
            <div className="space-y-1.5 px-1">
              <span className="text-[9.5px] font-bold text-white/40 uppercase block font-mono">Recent Senders</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {newSenders.map((sender, idx) => (
                  <span 
                    key={idx} 
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[10.5px] text-purple-300 font-bold max-w-[120px] truncate"
                  >
                    <UserPlus className="w-3 h-3 text-purple-400 shrink-0" />
                    <span className="truncate">{sender}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent Emails checklist */}
          <div className="space-y-2">
            <span className="text-[9.5px] font-bold text-white/40 uppercase block font-mono px-1">Recent Messages</span>
            
            {recentEmails.length === 0 ? (
              <p className="text-[11px] text-white/30 text-center py-2 select-none">No recent messages</p>
            ) : (
              <div className="space-y-1.5">
                {recentEmails.map((email) => (
                  <div
                    key={email._id}
                    onClick={() => handleEmailClick(email._id)}
                    className="p-2.5 rounded-2xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer flex justify-between items-start"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[11px] font-extrabold text-white truncate">{email.sender}</span>
                        {!email.isRead && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"></span>}
                      </div>
                      <p className="text-[10px] text-white/50 truncate mt-0.5">{email.subject}</p>
                    </div>
                    <ArrowRight className="w-3 h-3 text-white/30 self-center" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </motion.div>
    </div>
  );
};

export default NotificationDropdown;
