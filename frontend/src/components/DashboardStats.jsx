import React from 'react';
import { useEmail } from '../context/EmailContext';
import { 
  Mail, 
  MailOpen, 
  AlertOctagon, 
  Star, 
  RefreshCw 
} from 'lucide-react';

const DashboardStats = () => {
  const { metrics, syncing } = useEmail();

  const stats = [
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
    },
    {
      title: "Starred / Favorites",
      value: metrics.starredCount,
      icon: Star,
      color: "from-yellow-400 to-amber-500",
      shadow: "shadow-yellow-400/20",
      description: "Quick access favorites"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div 
            key={i} 
            className="glass-card rounded-2xl p-4.5 flex items-center justify-between shadow-glass group relative overflow-hidden"
          >
            {/* Glowing Hover Background overlay */}
            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none from-white to-transparent"></div>
            
            <div className="space-y-1.5 z-10">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                {stat.title}
              </span>
              <h3 className="text-3xl font-extrabold text-white tracking-tight">
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
    </div>
  );
};

export default DashboardStats;
