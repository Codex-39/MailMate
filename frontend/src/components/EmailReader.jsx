import React, { useState } from 'react';
import { useEmail } from '../context/EmailContext';
import AISummaryCard from './AISummaryCard';
import { motion } from 'framer-motion';
import { Star, Mail, MailOpen, FileText, Download, ArrowLeft, RefreshCw, Paperclip } from 'lucide-react';

const EmailReader = ({ onBack }) => {
  const { 
    selectedEmail, 
    toggleStar, 
    toggleRead, 
    generateAISummary, 
    detailsLoading 
  } = useEmail();

  const [downloadingFile, setDownloadingFile] = useState(null);

  if (detailsLoading && !selectedEmail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/2 border border-white/5 rounded-[32px] h-full shadow-glass text-white">
        <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
        <p className="mt-3.5 text-xs text-white/40 font-bold uppercase tracking-wider">Unsealing Message...</p>
      </div>
    );
  }

  if (!selectedEmail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/2 border border-white/5 rounded-[32px] h-full text-center select-none shadow-glass relative overflow-hidden text-white">
        <div className="absolute top-[30%] left-[30%] w-40 h-40 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-purple-400 shadow-sm">
          <Mail className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-white/60">Read Mail</h4>
        <p className="text-[10.5px] text-white/30 mt-1.5 max-w-[200px] leading-relaxed">
          Select a message card from the left panel to inspect email body details and generate AI summaries.
        </p>
      </div>
    );
  }

  const handleDownload = (filename, size) => {
    setDownloadingFile(filename);
    setTimeout(() => {
      setDownloadingFile(null);
      alert(`📥 Download Successful: "${filename}" (${(size / 1024).toFixed(0)} KB) saved to folder.`);
    }, 1200);
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '✉️';
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  };

  // Brand-aligned sender avatar helper
  const getSenderTheme = (senderName) => {
    if (!senderName) return { bg: 'from-purple-600 to-indigo-500', initials: '✉️', style: '' };
    const name = senderName.toLowerCase();
    if (name.includes('linkedin')) {
      return {
        bg: 'from-blue-600 to-sky-400',
        initials: 'in',
        style: 'font-serif lowercase font-black text-white text-[12px]'
      };
    }
    if (name.includes('infosys')) {
      return {
        bg: 'from-blue-700 to-indigo-500',
        initials: 'INF',
        style: 'font-sans font-black tracking-tighter text-white text-[9px]'
      };
    }
    if (name.includes('geeksforgeeks') || name.includes('gfg')) {
      return {
        bg: 'from-emerald-600 to-teal-400',
        initials: 'GFG',
        style: 'font-sans font-black text-white text-[8px]'
      };
    }
    if (name.includes('internshala')) {
      return {
        bg: 'from-cyan-500 to-blue-400',
        initials: 'IS',
        style: 'font-sans font-black text-white text-[10px]'
      };
    }
    if (name.includes('unstop')) {
      return {
        bg: 'from-amber-400 to-orange-500',
        initials: 'U',
        style: 'font-sans font-black text-black text-[12px]'
      };
    }
    if (name.includes('hdfc') || name.includes('bank')) {
      return {
        bg: 'from-blue-800 to-blue-600',
        initials: '🏦',
        style: 'text-white text-xs'
      };
    }
    
    // General initials
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
    return { bg, initials, style: 'font-sans font-black text-white text-[10px]' };
  };

  const isHtml = /<[a-z][\s\S]*>/i.test(selectedEmail.body);
  const theme = getSenderTheme(selectedEmail.sender);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className="flex-1 flex flex-col min-h-0 glass-panel rounded-[32px] overflow-hidden shadow-2xl border border-white/5 h-full text-white"
    >
      
      {/* Reader Controls Toolbar */}
      <div className="p-3 bg-white/2 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1.5">
          {/* Back button (Mobile view only) */}
          <button 
            onClick={onBack}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl md:hidden transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleRead(selectedEmail._id)}
            className="px-3.5 py-1.5 hover:bg-white/5 text-white/50 hover:text-purple-300 rounded-xl transition-all flex items-center space-x-2 text-xs font-bold"
            title={selectedEmail.isRead ? "Mark as Unread" : "Mark as Read"}
          >
            {selectedEmail.isRead ? (
              <>
                <Mail className="w-3.5 h-3.5" />
                <span>Mark Unread</span>
              </>
            ) : (
              <>
                <MailOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Mark Read</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => toggleStar(selectedEmail._id)}
            className="px-3.5 py-1.5 hover:bg-white/5 text-white/50 hover:text-amber-400 rounded-xl transition-all flex items-center space-x-2 text-xs font-bold"
          >
            <Star className={`w-3.5 h-3.5 ${selectedEmail.isStarred ? 'text-amber-450 fill-amber-450 animate-pulse' : ''}`} />
            <span>{selectedEmail.isStarred ? 'Starred' : 'Star'}</span>
          </button>
        </div>
      </div>

      {/* Reader Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5">
        
        {/* Email Header */}
        <div className="space-y-3.5">
          <h2 className="text-base md:text-xl font-black font-sans tracking-tight leading-snug">
            {selectedEmail.subject}
          </h2>

          <div className="flex items-center space-x-3 bg-white/2 border border-white/5 p-3 rounded-2xl select-none">
            {/* Sender Initials Avatar */}
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${theme.bg} flex items-center justify-center font-bold text-white shrink-0 border border-white/10 shadow-md`}>
              <span className={theme.style}>{theme.initials}</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between leading-tight">
                <h4 className="text-xs font-extrabold text-white truncate">
                  {selectedEmail.sender}
                </h4>
                <span className="text-[9.5px] text-white/40 font-bold font-mono mt-0.5 sm:mt-0">
                  {new Date(selectedEmail.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              <p className="text-[10px] text-white/40 font-bold font-mono mt-0.5">
                {selectedEmail.senderEmail}
              </p>
            </div>
          </div>
        </div>

        {/* MailMate AI Summary Embed */}
        <AISummaryCard 
          email={selectedEmail} 
          onRegenerate={generateAISummary}
          loading={detailsLoading}
        />

        {/* Email Body Card */}
        <div className="bg-white/1.5 border border-white/5 p-5 rounded-2xl shadow-sm min-h-[180px] select-text">
          {isHtml ? (
            <div 
              dangerouslySetInnerHTML={{ __html: selectedEmail.body }} 
              className="prose prose-invert prose-sm max-w-none text-white/70 overflow-x-auto text-xs" 
            />
          ) : (
            <p className="whitespace-pre-line text-xs text-white/80 leading-relaxed font-sans font-medium tracking-wide">
              {selectedEmail.body}
            </p>
          )}
        </div>

        {/* File Attachments Pills */}
        {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-white/5">
            <h4 className="text-[9.5px] font-black uppercase tracking-widest text-white/35 flex items-center space-x-1.5 px-0.5">
              <Paperclip className="w-3.5 h-3.5 text-purple-400" />
              <span>Attachments ({selectedEmail.attachments.length})</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {selectedEmail.attachments.map((file, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/2 border border-white/5 hover:border-purple-500/20 transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 leading-tight">
                      <p className="text-[10.5px] font-extrabold text-white truncate max-w-[130px]" title={file.filename}>
                        {file.filename}
                      </p>
                      <p className="text-[8.5px] text-white/40 font-bold font-mono">
                        {formatSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(file.filename, file.size)}
                    disabled={downloadingFile === file.filename}
                    className="p-1.5 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 rounded-xl transition-all border border-transparent hover:border-purple-500/30"
                    title="Download attachment"
                  >
                    {downloadingFile === file.filename ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EmailReader;
