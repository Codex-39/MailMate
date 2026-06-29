import React, { useEffect } from 'react';
import { useEmail } from '../context/EmailContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  TrendingUp, 
  Mail, 
  AlertCircle, 
  Briefcase, 
  TrendingDown, 
  Award, 
  Sparkles 
} from 'lucide-react';

const Analytics = () => {
  const { chartsData, fetchChartsData } = useEmail();

  useEffect(() => {
    fetchChartsData();
  }, [fetchChartsData]);

  if (!chartsData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-dark-950">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-brand-purple/20"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-brand-purple animate-spin"></div>
        </div>
        <p className="mt-4 text-xs text-gray-500 font-semibold tracking-wide">Compiling statistics data...</p>
      </div>
    );
  }

  const { categoryStats, volumeHistory, topSenders } = chartsData;

  // Curated color themes mapping to smart categories
  const COLORS = {
    'Jobs & Internships': '#8b5cf6',   // Purple
    'Learning Resources': '#4ade80',   // Green
    'College Notifications': '#06b6d4', // Cyan
    'Finance & Banking': '#facc15',     // Yellow
    'Personal': '#9ca3af',              // Gray
    'Events': '#d946ef'                 // Fuchsia
  };

  const getCellColor = (name) => COLORS[name] || '#6366f1';

  // Custom tooltips for graphs
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel border border-gray-800 p-3 rounded-xl shadow-glass text-xs space-y-1">
          <p className="font-bold text-gray-200">{payload[0].payload.name}</p>
          {payload.map((p, idx) => (
            <p key={idx} className="font-semibold" style={{ color: p.color }}>
              {p.name}: <span className="text-white">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Compile insights recommendations
  const getAIRecommendations = () => {
    const jobsCount = categoryStats.find(c => c.name === 'Jobs & Internships')?.value || 0;
    const unreadJobs = categoryStats.find(c => c.name === 'Jobs & Internships')?.unread || 0;
    const collegeCount = categoryStats.find(c => c.name === 'College Notifications')?.value || 0;
    
    const recommendations = [];

    if (jobsCount > 0) {
      recommendations.push({
        title: "High Internship Activity",
        body: `You received ${jobsCount} jobs & internship emails recently. Infosys and Internshala are active. Complete outstanding profiles.`,
        type: 'jobs'
      });
    }
    
    if (unreadJobs > 0) {
      recommendations.push({
        title: "Pending Career Action items",
        body: `You have ${unreadJobs} unread career opportunities. Check deadlines and submit applications to prevent missing recruitment dates.`,
        type: 'unread'
      });
    }

    if (collegeCount > 0) {
      recommendations.push({
        title: "Semester Schedule & Fee Alerts",
        body: "College admin sent semester timetables and fee notifications. Clear finance documents before June 30.",
        type: 'college'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        title: "Inbox Cleanliness Optimal",
        body: "Inbox looks fully organized. AI filters categorized notifications. Sit back and monitor updates.",
        type: 'clean'
      });
    }

    return recommendations;
  };

  const recommendations = getAIRecommendations();

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto space-y-6">
      
      {/* Header Description */}
      <div className="shrink-0 space-y-1">
        <h2 className="text-xl font-extrabold text-white tracking-tight">Email Analytics & Insights</h2>
        <p className="text-xs text-gray-400 font-medium">Visual intelligence graphs showing email volumes and folders activity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[400px]">
        
        {/* Column 1: Time Series volume chart (Recharts Area) */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-4 md:p-5 flex flex-col justify-between shadow-glass min-h-[350px]">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Weekly Inbox Volume</h3>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Total messages vs unread trends of the last 7 days</p>
          </div>
          
          <div className="flex-1 w-full min-h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUnread" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area name="Total Received" type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area name="Unread" type="monotone" dataKey="unread" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorUnread)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Column 2: Category distribution Pie chart */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-4 md:p-5 flex flex-col justify-between shadow-glass min-h-[350px]">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Smart Categories Distribution</h3>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Breakdown of emails grouped by folder classification</p>
          </div>

          <div className="flex-1 w-full min-h-[220px] flex items-center justify-center mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats.filter(c => c.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryStats.map((entry, idx) => (
                    <Cell key={idx} fill={getCellColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend labels */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 font-medium pt-3 border-t border-gray-800/40">
            {categoryStats.map((stat, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-md shrink-0" style={{ backgroundColor: getCellColor(stat.name) }}></span>
                <span className="truncate" title={stat.name}>{stat.name} ({stat.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* Top Senders Section */}
        <div className="glass-card rounded-2xl p-4.5 shadow-glass space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Top Email Senders</h3>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Recruiters and systems generating most emails</p>
          </div>

          <div className="space-y-2.5">
            {topSenders.map((sender, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3 rounded-xl bg-gray-900/30 border border-gray-800/50 text-xs font-semibold"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center font-bold text-[10px] text-brand-purple shrink-0 select-none">
                    {idx + 1}
                  </div>
                  <span className="text-gray-300 truncate" title={sender.name}>{sender.name}</span>
                </div>
                <span className="text-gray-400 bg-gray-800/60 px-2 py-0.5 rounded font-mono font-bold text-[11px] shrink-0">
                  {sender.count} Message{sender.count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations Section */}
        <div className="glass-card rounded-2xl p-4.5 shadow-glass space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-purple animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">AI-Generated Inbox Insights</h3>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">Smart recommendations based on message categories</p>
            </div>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div 
                key={i} 
                className="p-3 rounded-xl bg-gradient-to-r from-brand-purple/5 to-brand-cyan/5 border border-brand-purple/15 flex items-start space-x-3 text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-brand-purple/15 flex items-center justify-center text-brand-purple shrink-0 mt-0.5 select-none">
                  {rec.type === 'college' ? '🏫' : rec.type === 'unread' ? '⚠️' : '💼'}
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-white leading-none">{rec.title}</h5>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-medium">{rec.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
