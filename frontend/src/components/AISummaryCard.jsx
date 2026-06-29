import React from 'react';
import { Sparkles, Calendar, CheckSquare, RefreshCw } from 'lucide-react';

const AISummaryCard = ({ email, onRegenerate, loading }) => {
  if (!email) return null;

  // Extract key deadlines and action items from text content
  const getAISummaryDetails = () => {
    const text = (email.summary + " " + email.body).toLowerCase();
    let deadline = 'No date limit';
    let actions = ['Review content details'];

    if (text.includes('june 30') || text.includes('6/30')) {
      deadline = '30 June 2026';
    } else if (text.includes('july 15')) {
      deadline = '15 July 2026';
    } else if (text.includes('july 5')) {
      deadline = '5 July 2026';
    } else if (text.includes('june 28')) {
      deadline = '28 June 2026';
    } else if (text.includes('june 26')) {
      deadline = '26 June 2026';
    } else if (text.includes('tomorrow')) {
      deadline = 'Within 24 Hours';
    }

    if (text.includes('assessment') || text.includes('test') || text.includes('coding')) {
      actions = ['Complete Coding Assessment', 'Verify Dev Guidelines'];
    } else if (text.includes('apply') || text.includes('register') || text.includes('registration')) {
      actions = ['Submit Application Form', 'Upload Updated Resume'];
    } else if (text.includes('transaction') || text.includes('debit')) {
      actions = ['Verify Bank Account Ledger', 'Contact HDFC if unauthorized'];
    } else if (text.includes('exam') || text.includes('fee')) {
      actions = ['Clear Exam Registrations', 'Verify Course Attendance (>= 75%)'];
    } else if (text.includes('webinar') || text.includes('session')) {
      actions = ['RSVP Calendar Invitation', 'Attend Live Video Stream'];
    }

    return { deadline, actions };
  };

  const { deadline, actions } = getAISummaryDetails();

  return (
    <div className="rounded-[28px] mailmate-ai-glow p-5 shadow-lg relative overflow-hidden select-none">
      
      {/* Siri glow particle element */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#5B5FEF]/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-fuchsia-400/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Title block */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/5">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-white/80 animate-pulse" />
          <h4 className="text-[10px] font-bold tracking-wider uppercase text-siri-gradient">
            MailMate AI
          </h4>
        </div>

        <button
          onClick={() => onRegenerate(email._id)}
          disabled={loading}
          className="text-[9.5px] font-bold text-white/50 hover:text-white flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing...' : 'Summarize'}</span>
        </button>
      </div>

      {email.summary ? (
        <div className="space-y-4">
          {/* Headline block */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Core Insight</span>
            <p className="text-xs text-white/80 font-semibold leading-relaxed">
              {email.summary}
            </p>
          </div>

          {/* Action and Deadline row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-white/5">
            {/* Deadline Pill */}
            <div className="flex items-center space-x-3 bg-white/3 border border-white/5 p-2.5 rounded-2xl shadow-sm">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/80 shrink-0 shadow-inner border border-white/10">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-white/40 uppercase block tracking-wider font-mono">Deadline</span>
                <span className="text-xs font-extrabold text-white truncate block">{deadline}</span>
              </div>
            </div>

            {/* Actions list */}
            <div className="flex flex-col justify-center bg-white/3 border border-white/5 p-2.5 rounded-2xl shadow-sm">
              <span className="text-[9px] font-bold text-white/40 uppercase block tracking-wider mb-1 px-1 font-mono">Recommended Actions</span>
              <div className="space-y-0.5 px-1">
                {actions.map((act, i) => (
                  <div key={i} className="flex items-center space-x-1.5 text-xs text-white/80 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 shrink-0"></span>
                    <span className="truncate">{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center">
          <p className="text-xs text-white/40 font-semibold mb-3">No AI insights generated for this mail yet.</p>
          <button
            onClick={() => onRegenerate(email._id)}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-tr from-[#5B5FEF] to-[#7DD3FC] text-white text-[10.5px] font-bold rounded-xl transition-all shadow-md shadow-[#5B5FEF]/10 hover:scale-102 border border-white/10"
          >
            Request MailMate AI Summary
          </button>
        </div>
      )}
    </div>
  );
};

export default AISummaryCard;
