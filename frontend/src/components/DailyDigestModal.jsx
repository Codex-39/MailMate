import React, { useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  RefreshCw, 
  Mail, 
  MailOpen, 
  Briefcase, 
  GraduationCap, 
  Wallet, 
  User, 
  CheckSquare, 
  AlertCircle 
} from 'lucide-react';

const DailyDigestModal = ({ isOpen, onClose, digest, refreshing, onRefresh, error }) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const stats = digest ? [
    { label: "Today's Total", value: digest.totalEmails, icon: Mail, color: "bg-purple-500/10 text-purple-300 border-purple-500/15" },
    { label: "Unread", value: digest.unreadEmails, icon: MailOpen, color: "bg-indigo-500/10 text-indigo-300 border-indigo-500/15" },
    { label: "Internships", value: digest.internships, icon: Briefcase, color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/15" },
    { label: "Jobs", value: digest.jobs, icon: Sparkles, color: "bg-blue-500/10 text-blue-300 border-blue-500/15" },
    { label: "College Info", value: digest.college, icon: GraduationCap, color: "bg-amber-500/10 text-amber-300 border-amber-500/15" },
    { label: "Finance Alerts", value: digest.finance, icon: Wallet, color: "bg-rose-500/10 text-rose-300 border-rose-500/15" },
    { label: "Personal", value: digest.personal, icon: User, color: "bg-teal-500/10 text-teal-300 border-teal-500/15" }
  ] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay with blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="glass-panel w-full max-w-2xl rounded-[28px] overflow-hidden flex flex-col p-6 md:p-8 shadow-2xl relative z-10 max-h-[85vh] animate-in fade-in-50 zoom-in-95 duration-200">
        
        {/* Siri style neon color glow elements inside modal background */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#5B5FEF]/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-fuchsia-400/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header Block */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/5 z-10">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
            <h3 className="text-sm font-black tracking-wider uppercase text-siri-gradient">
              Daily AI Intelligence Brief
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              title="Refresh Digest"
              className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto pr-1 space-y-6 z-10 scrollbar-thin">
          
          {error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-950/5 p-5 flex flex-col items-center text-center">
              <AlertCircle className="w-6 h-6 text-red-400 mb-2" />
              <p className="text-xs font-bold text-red-405">Unable to update your AI digest details right now.</p>
              <button 
                onClick={onRefresh}
                className="mt-3.5 text-[10px] font-extrabold text-white/60 hover:text-white flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : !digest ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 text-purple-400 animate-spin mb-3" />
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Compiling details...</p>
            </div>
          ) : (
            <>
              {/* Natural AI Summary text */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-sm">
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-2.5 font-mono">AI Executive Summary</span>
                <p className="text-[13px] text-white/90 font-medium leading-relaxed border-l-2 border-[#5B5FEF] pl-4 italic">
                  {digest.aiDigest}
                </p>
              </div>

              {/* Counters Grid Row */}
              <div>
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-3 font-mono">Today's Category Distributions</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${stat.color} shadow-sm transition-all hover:scale-[1.02] duration-300`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-[16px] font-black tracking-tight mt-0.5">
                          {stat.value}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wide opacity-50 text-center mt-0.5">
                          {stat.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Important actions checklists */}
              {digest.importantActions && digest.importantActions.length > 0 && (
                <div className="pt-2">
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-3 font-mono">Today's Critical Action Items</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {digest.importantActions.map((action, idx) => (
                      <div
                        key={idx}
                        className="flex items-start space-x-3 bg-white/2 border border-white/5 p-3.5 rounded-2xl hover:border-purple-500/15 transition-all duration-300 shadow-sm"
                      >
                        <div className="w-5 h-5 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5 animate-pulse">
                          <CheckSquare className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11.5px] font-bold text-white/80 leading-relaxed font-sans">
                          {action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end mt-6 pt-4 border-t border-white/5 z-10">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all text-xs active:scale-[0.98] shadow-lg shadow-purple-950/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyDigestModal;
