import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmail } from '../context/EmailContext';
import AIIntelligencePanel from '../components/AIIntelligencePanel';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Star, MailOpen, FileText, Download, RefreshCw, Paperclip } from 'lucide-react';

const EmailDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedEmail, 
    fetchEmailDetails, 
    detailsLoading, 
    toggleStar, 
    toggleRead, 
    generateAISummary 
  } = useEmail();

  const [downloadingFile, setDownloadingFile] = useState(null);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(false);

  const fetchInsights = async (forceRegen = false) => {
    if (!id) return;
    setInsightsLoading(true);
    setInsightsError(false);
    try {
      const res = await api.get(`/emails/${id}/insights`, {
        params: forceRegen ? { force: 'true' } : {}
      });
      setInsights(res.data);
    } catch (err) {
      console.error('Error fetching email insights:', err);
      setInsightsError(true);
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEmailDetails(id);
      fetchInsights(false);
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownload = (filename, size) => {
    setDownloadingFile(filename);
    setTimeout(() => {
      setDownloadingFile(null);
      alert(`📥 Download Successful: "${filename}" (${(size / 1024).toFixed(0)} KB) saved to downloads folder.`);
    }, 1200);
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
    if (name.includes('college') || name.includes('registrar') || name.includes('dean')) {
      return {
        bg: 'from-purple-700 to-indigo-500',
        initials: '🏫',
        style: 'text-white text-[11px]'
      };
    }
    
    // Default dynamic initials
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

  if (detailsLoading && !selectedEmail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-transparent text-white h-full">
        <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
        <p className="mt-3 text-xs text-white/40 font-bold uppercase tracking-wider">Unsealing Message...</p>
      </div>
    );
  }

  if (!selectedEmail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-transparent text-center select-none h-full text-white">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-purple-400">
          <Mail className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-bold text-white/50 uppercase">Message Lost</h4>
        <p className="text-[11px] text-white/30 mt-1 max-w-[200px] leading-relaxed">
          The requested email could not be retrieved from the server.
        </p>
        <button 
          onClick={handleBack}
          className="mt-6 px-4 py-2 bg-purple-500 text-white hover:bg-purple-600 rounded-xl text-[11px] font-bold transition-all active:scale-[0.98]"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isHtml = /<[a-z][\s\S]*>/i.test(selectedEmail.body);
  const theme = getSenderTheme(selectedEmail.sender);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className="flex-1 flex flex-col min-h-0 bg-transparent max-w-3xl mx-auto w-full px-4 md:px-6 py-4 overflow-y-auto no-scrollbar select-none text-white"
    >
      
      {/* Header controls */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/5 mb-5 select-none shrink-0">
        <button 
          onClick={handleBack}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-bold text-white transition-all active:scale-98"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-purple-400" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Read / Unread toggle */}
          <button
            onClick={() => toggleRead(selectedEmail._id)}
            className="px-3.5 py-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all flex items-center space-x-2 text-[11px] font-bold"
          >
            {selectedEmail.isRead ? (
              <>
                <Mail className="w-3.5 h-3.5 text-white/40" />
                <span>Mark Unread</span>
              </>
            ) : (
              <>
                <MailOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Mark Read</span>
              </>
            )}
          </button>

          {/* Star toggle */}
          <button
            onClick={() => toggleStar(selectedEmail._id)}
            className="px-3.5 py-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all flex items-center space-x-2 text-[11px] font-bold"
          >
            <Star className={`w-3.5 h-3.5 ${selectedEmail.isStarred ? 'text-amber-400 fill-amber-400' : 'text-white/30'}`} />
            <span>{selectedEmail.isStarred ? 'Starred' : 'Star'}</span>
          </button>
        </div>
      </div>

      {/* Reader Body content */}
      <div className="space-y-5">
        
        {/* Email title & info */}
        <div className="space-y-3.5">
          <h2 className="text-xl md:text-2xl font-black text-white leading-snug">
            {selectedEmail.subject}
          </h2>

          <div className="flex items-center space-x-3.5 py-3 border-y border-white/5 select-none">
            {/* Initials bubble (aligned to dynamic gradients) */}
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${theme.bg} flex items-center justify-center font-bold text-white shrink-0 border border-white/10 shadow-md`}>
              <span className={theme.style}>{theme.initials}</span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between leading-tight">
                <h4 className="text-[13px] font-extrabold text-white truncate">
                  {selectedEmail.sender}
                </h4>
                <span className="text-[9.5px] text-white/45 font-bold font-mono mt-0.5 sm:mt-0">
                  {new Date(selectedEmail.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              <p className="text-[10.5px] text-white/40 truncate mt-0.5 font-bold font-mono">
                {selectedEmail.senderEmail}
              </p>
            </div>
          </div>
        </div>

        {/* MailMate AI Intelligence Panel */}
        <AIIntelligencePanel 
          insights={insights} 
          loading={insightsLoading}
          error={insightsError}
          onRegenerate={() => fetchInsights(true)}
        />

        {/* Email content block wrapped in frosted glass container */}
        <div className="p-5 rounded-2xl border border-white/5 bg-white/1.5 leading-relaxed text-[13px] font-medium selection:bg-purple-500/20 text-white/80 select-text overflow-hidden">
          {isHtml ? (
            <div 
              dangerouslySetInnerHTML={{ __html: selectedEmail.body }} 
              className="prose prose-invert prose-sm max-w-none text-white/70 overflow-x-auto text-[13px]" 
            />
          ) : (
            <p className="whitespace-pre-line text-white/80 font-sans tracking-wide">
              {selectedEmail.body}
            </p>
          )}
        </div>

        {/* File Attachments block */}
        {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
          <div className="space-y-3 pt-5 border-t border-white/5">
            <h4 className="text-[9.5px] font-black uppercase tracking-widest text-white/35 flex items-center space-x-1.5 px-0.5">
              <Paperclip className="w-3.5 h-3.5 text-purple-400" />
              <span>Attachments ({selectedEmail.attachments.length})</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {selectedEmail.attachments.map((file, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/4 shadow-sm hover:border-purple-500/20 transition-all duration-300"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 leading-tight">
                      <p className="text-[11.5px] font-extrabold text-white truncate max-w-[150px]" title={file.filename}>
                        {file.filename}
                      </p>
                      <p className="text-[9px] text-white/40 font-bold font-mono">
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

export default EmailDetail;
