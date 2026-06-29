import React from 'react';
import { Sparkles, Calendar, CheckSquare, RefreshCw, Briefcase, User, MapPin, Wallet, ExternalLink, AlertTriangle } from 'lucide-react';

const AIIntelligencePanel = ({ insights, loading, error, onRegenerate }) => {
  if (loading) {
    return (
      <div className="rounded-[28px] mailmate-ai-glow p-8 shadow-lg relative overflow-hidden flex flex-col items-center justify-center min-h-[200px] text-white select-none">
        <RefreshCw className="w-6 h-6 text-purple-400 animate-spin mb-3" />
        <p className="text-xs font-black text-white/50 tracking-wider uppercase">Analyzing email with MailMate AI...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-500/20 bg-red-950/10 p-8 shadow-lg relative overflow-hidden flex flex-col items-center justify-center min-h-[200px] text-white select-none">
        <AlertTriangle className="w-6 h-6 text-red-400 mb-3" />
        <p className="text-xs font-black text-red-400/80 tracking-wider uppercase">Unable to generate AI insights.</p>
        <button
          onClick={onRegenerate}
          className="mt-4 text-[10px] font-bold text-white/50 hover:text-white flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 shadow-sm transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry Analysis</span>
        </button>
      </div>
    );
  }

  if (!insights) return null;

  // Destructure with default fallbacks
  const {
    summary = 'No summary available.',
    company = 'N/A',
    role = 'N/A',
    stipend = 'N/A',
    location = 'N/A',
    deadline = 'N/A',
    skills = [],
    actionItems = [],
    links = []
  } = insights;

  return (
    <div className="rounded-[28px] mailmate-ai-glow p-5 shadow-lg relative overflow-hidden select-none text-white">
      {/* Siri glow particle element */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#5B5FEF]/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-fuchsia-400/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header Block */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/5">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-white/80 animate-pulse" />
          <h4 className="text-[10px] font-bold tracking-wider uppercase text-siri-gradient">
            MailMate AI Intelligence
          </h4>
        </div>

        <button
          onClick={onRegenerate}
          disabled={loading}
          className="text-[9.5px] font-bold text-white/50 hover:text-white flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Regenerate</span>
        </button>
      </div>

      {/* Summary Block */}
      <div className="space-y-1 mb-5">
        <span className="text-[9px] font-bold text-white/35 uppercase tracking-widest block font-mono">Summary</span>
        <p className="text-[12.5px] text-white/85 font-semibold leading-relaxed border-l-2 border-purple-500/40 pl-3.5 italic">
          {summary}
        </p>
      </div>

      {/* Grid Metadata Parameters (Company, Role, Location, Stipend, Deadline) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-5 pt-1.5">
        {/* Company Card */}
        <div className="flex items-center space-x-3 bg-white/3 border border-white/5 p-3 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-300 shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[8.5px] font-extrabold text-white/40 uppercase block tracking-wider font-mono">Company</span>
            <span className="text-xs font-black text-white truncate block">{company || 'N/A'}</span>
          </div>
        </div>

        {/* Role Card */}
        <div className="flex items-center space-x-3 bg-white/3 border border-white/5 p-3 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-300 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[8.5px] font-extrabold text-white/40 uppercase block tracking-wider font-mono">Role</span>
            <span className="text-xs font-black text-white truncate block">{role || 'N/A'}</span>
          </div>
        </div>

        {/* Location Card */}
        <div className="flex items-center space-x-3 bg-white/3 border border-white/5 p-3 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-300 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[8.5px] font-extrabold text-white/40 uppercase block tracking-wider font-mono">Location</span>
            <span className="text-xs font-black text-white truncate block">{location || 'N/A'}</span>
          </div>
        </div>

        {/* Stipend Card */}
        <div className="flex items-center space-x-3 bg-white/3 border border-white/5 p-3 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-300 shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[8.5px] font-extrabold text-white/40 uppercase block tracking-wider font-mono">Stipend</span>
            <span className="text-xs font-black text-white truncate block">{stipend || 'N/A'}</span>
          </div>
        </div>

        {/* Deadline Card */}
        <div className="flex items-center space-x-3 bg-white/3 border border-white/5 p-3 rounded-2xl shadow-sm sm:col-span-2 md:col-span-1">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-300 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[8.5px] font-extrabold text-white/40 uppercase block tracking-wider font-mono">Deadline</span>
            <span className="text-xs font-black text-white truncate block">{deadline || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Skills Tag List */}
      {skills && skills.length > 0 && (
        <div className="mb-5">
          <span className="text-[9px] font-bold text-white/35 uppercase tracking-widest block mb-2 font-mono">Key Skills Required</span>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-[10.5px] font-bold bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/15 transition-all duration-300 shadow-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Items List */}
      {actionItems && actionItems.length > 0 && (
        <div className="mb-5 pt-3 border-t border-white/5">
          <span className="text-[9px] font-bold text-white/35 uppercase tracking-widest block mb-2.5 font-mono">Recommended Actions</span>
          <div className="space-y-2.5">
            {actionItems.map((action, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2.5 bg-white/1.5 border border-white/5 p-2.5 rounded-2xl hover:border-purple-500/15 transition-all duration-300 shadow-sm"
              >
                <div className="w-5 h-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <CheckSquare className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11.5px] font-bold text-white/80 leading-relaxed">
                  {action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links List */}
      {links && links.length > 0 && (
        <div className="pt-3 border-t border-white/5">
          <span className="text-[9px] font-bold text-white/35 uppercase tracking-widest block mb-2 font-mono">Important Links</span>
          <div className="flex flex-wrap gap-2">
            {links.map((link, idx) => {
              // Extract hostname for cleaner presentation
              let label = 'Visit Resource';
              try {
                const url = new URL(link);
                label = url.hostname.replace('www.', '');
              } catch (e) {
                // Not a valid URL object, use default label
              }

              return (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3.5 py-2 text-[10.5px] font-black bg-[#5B5FEF]/10 border border-[#5B5FEF]/25 text-[#7DD3FC] hover:text-white rounded-xl hover:bg-[#5B5FEF]/20 hover:border-[#5B5FEF]/40 transition-all duration-300 shadow-md active:scale-95 group"
                >
                  <span>{label}</span>
                  <ExternalLink className="w-3 h-3 text-[#7DD3FC]/80 group-hover:text-white transition-colors" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIIntelligencePanel;
