import React from 'react';
import { useEmail } from '../context/EmailContext';
import { 
  Mail, 
  MailOpen, 
  AlertOctagon, 
  Sparkles, 
  ChevronRight 
} from 'lucide-react';

const DashboardStats = ({ digest, digestLoading, onViewDigest }) => {
  const { metrics, syncing } = useEmail();

  // Primary stats (the first 3 cards)
  const primaryStats = [
    {
      title: "Total Emails Today",
      value: metrics.totalToday,
      icon: Mail,
      color: "from-brand-purple to-brand-violet",
      shadow: "shadow-brand-purple/20",
      description: syncing ? "Syncing..." : "Updated real-time"
    },
    {
      title: "Unread Messages",
      value: metrics.unreadCount,
      icon: MailOpen,
      color: "from-brand-cyan to-brand-indigo",
      shadow: "shadow-brand-cyan/20",
      description: `${metrics.unreadCount} action items remaining`
    },
    {
      title: "Important Today",
      value: metrics.importantCount,
      icon: AlertOctagon,
      color: "from-brand-fuchsia to-brand-purple",
      shadow: "shadow-brand-fuchsia/20",
      description: "Jobs, Exams, & Scholarships"
    }
  ];

  // Helper to compile a concise summary sentence for the stats-based preview
  const getDigestBrief = () => {
    if (!digest) return "AI Daily Brief is ready to compile.";
    if (digest.totalEmails === 0) return "0 emails received today. Your inbox is clean!";

    const sentences = [];
    
    // 1. Unread emails count
    sentences.push(`${digest.unreadEmails} unread email${digest.unreadEmails !== 1 ? 's' : ''}`);
    
    // 2. Internship opportunities
    if (digest.internships > 0) {
      sentences.push(`${digest.internships} internship opportunit${digest.internships !== 1 ? 'ies' : 'y'} detected`);
    }

    // 3. College notifications, Job posts, or Finance alerts
    if (digest.jobs > 0) {
      sentences.push(`${digest.jobs} job notification${digest.jobs !== 1 ? 's' : ''}`);
    } else if (digest.college > 0) {
      sentences.push(`${digest.college} college update${digest.college !== 1 ? 's' : ''}`);
    } else if (digest.finance > 0) {
      sentences.push(`${digest.finance} finance alert${digest.finance !== 1 ? 's' : ''}`);
    }

    if (sentences.length === 1) {
      return `${sentences[0]}. Check your inbox for updates.`;
    }

    return sentences.join('. ') + '.';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 shrink-0 items-stretch">
      {/* 1. Render standard stat cards */}
      {primaryStats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div 
            key={i} 
            className="glass-card rounded-2xl p-5 flex items-center justify-between shadow-glass group relative overflow-hidden h-full border border-white/5"
          >
            {/* Glowing Hover Background overlay */}
            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none from-white to-transparent"></div>
            
            <div className="space-y-1.5 z-10">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                {stat.title}
              </span>
              <h3 className="text-3.5xl font-extrabold text-white tracking-tight">
                {stat.value}
              </h3>
              <p className="text-[10px] text-gray-500 font-medium">
                {stat.description}
              </p>
            </div>

            <div className={`p-3 bg-gradient-to-tr ${stat.color} rounded-xl shadow-glass flex items-center justify-center shrink-0 z-10`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        );
      })}

      {/* 2. Render dynamic MailMate AI Insight card */}
      <div className="glass-card rounded-2xl p-5 flex flex-col justify-between shadow-glass group relative overflow-hidden h-full border border-purple-500/10 hover:border-purple-500/20">
        
        {/* Glow color particle block inside card background */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none transition-all group-hover:scale-110"></div>
        
        <div className="space-y-2 z-10">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-wider text-siri-gradient uppercase block">
              MailMate AI
            </span>
          </div>
          
          <p className="text-[11.5px] text-gray-300 font-bold leading-relaxed italic line-clamp-3">
            {digestLoading ? (
              <span className="text-gray-500 animate-pulse block">Analyzing today's updates...</span>
            ) : (
              `"${getDigestBrief()}"`
            )}
          </p>
        </div>

        <div className="mt-4 pt-2 border-t border-white/5 z-10 flex items-center justify-between">
          <button 
            onClick={onViewDigest}
            disabled={digestLoading}
            className="text-[10px] font-extrabold text-purple-300 hover:text-white flex items-center space-x-0.5 transition-all group/btn disabled:opacity-50 select-none"
          >
            <span>View Digest</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
          
          {syncing && (
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
