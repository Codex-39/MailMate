import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEmail } from '../context/EmailContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Mail,
  Briefcase,
  BookOpen,
  GraduationCap,
  CreditCard,
  User,
  Calendar,
  Settings,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ closeSidebar }) => {
  const { 
    activeCategory, 
    setActiveCategory, 
    setActiveSender, 
    setActiveFilter, 
    syncInbox, 
    syncing,
    resetFilters,
    folderCounts
  } = useEmail();
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategoryClick = (category) => {
    setActiveSender(null);
    setActiveCategory(category);
    setActiveFilter('all');
    if (location.pathname !== '/') {
      navigate('/');
    }
    if (closeSidebar) closeSidebar();
  };

  const handleAllSendersClick = () => {
    resetFilters();
    if (location.pathname !== '/') {
      navigate('/');
    }
    if (closeSidebar) closeSidebar();
  };

  const handleSettingsClick = () => {
    if (location.pathname !== '/settings') {
      navigate('/settings');
    }
    if (closeSidebar) closeSidebar();
  };

  const categoriesList = [
    { name: 'Jobs & Internships', icon: Briefcase },
    { name: 'Learning Resources', icon: BookOpen },
    { name: 'College Notifications', icon: GraduationCap, label: 'College' },
    { name: 'Finance & Banking', icon: CreditCard },
    { name: 'Personal', icon: User },
    { name: 'Events', icon: Calendar }
  ];

  const formatCount = (count) => {
    const val = count || 0;
    return val < 10 ? `0${val}` : val;
  };

  return (
    <aside className="w-64 h-full glass-panel rounded-[28px] flex flex-col justify-between p-5 select-none shrink-0 relative overflow-hidden text-white">
      
      {/* Sirius ambient glow particle inside sidebar top */}
      <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-col space-y-7 overflow-y-auto no-scrollbar relative z-10">
        
        {/* Brand Logo */}
        <div 
          onClick={handleAllSendersClick}
          className="flex items-center space-x-3.5 cursor-pointer px-1 py-1 group"
        >
          <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/15 transition-all duration-300 shadow-md group-hover:border-purple-500/30">
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#c084fc' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' className="w-4.5 h-4.5 group-hover:scale-110 transition-transform">
              <path d='m22 2-7 20-4-9-9-4Z' />
              <path d='M22 2 11 13' />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[16px] font-extrabold tracking-tight text-white leading-none">MailMate</span>
            <span className="text-[8px] text-purple-400 font-bold uppercase tracking-widest mt-1">Intelligence</span>
          </div>
        </div>

        {/* MAILBOX Section */}
        <div className="space-y-1.5">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest px-2.5">Mailbox</p>
          
          <button 
            onClick={handleAllSendersClick}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-[12.5px] font-bold transition-all relative ${
              location.pathname === '/' && !activeCategory
                ? 'glass-active'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span>All Senders</span>
            {location.pathname === '/' && !activeCategory && (
              <motion.div 
                layoutId="activeIndicator" 
                className="absolute right-3 w-1.5 h-1.5 rounded-full bg-purple-400" 
              />
            )}
          </button>
        </div>

        {/* CATEGORIES Section */}
        <div className="space-y-1.5">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest px-2.5">Categories</p>
          
          {categoriesList.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.name && location.pathname === '/';
            const label = cat.label || cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12.5px] font-bold transition-all relative ${
                  isActive
                    ? 'glass-active'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className="w-4 h-4 shrink-0 text-white/70" />
                  <span className="truncate">{label}</span>
                </div>
                
                <div className="flex items-center space-x-1.5 shrink-0">
                  <span className="text-[10px] font-mono text-white/40">
                    {formatCount(folderCounts[cat.name])}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator" 
                      className="w-1.5 h-1.5 rounded-full bg-purple-400" 
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* OPTIONS Section */}
        <div className="space-y-1.5">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest px-2.5">Options</p>
          <button
            onClick={handleSettingsClick}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[12.5px] font-bold transition-all relative ${
              location.pathname === '/settings'
                ? 'glass-active'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </div>
            {location.pathname === '/settings' && (
              <motion.div 
                layoutId="activeIndicator" 
                className="absolute right-3 w-1.5 h-1.5 rounded-full bg-purple-400" 
              />
            )}
          </button>
        </div>

      </div>

      {/* Footer Section: Sync Button */}
      <div className="space-y-4 pt-4 border-t border-white/5 relative z-10">
        {/* Sync Inbox Button */}
        <button
          onClick={syncInbox}
          disabled={syncing}
          className="w-full flex items-center justify-center space-x-2.5 py-3 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all active:scale-[0.98] disabled:opacity-50 text-[12px] shadow-sm hover:border-purple-500/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing Inbox...' : 'Sync Inbox'}</span>
        </button>
        
        {/* Decorative MailMate AI badge */}
        <div className="flex items-center justify-center space-x-1.5 text-[9px] text-white/35 font-bold uppercase tracking-wider py-1 border border-white/5 bg-white/2 rounded-xl">
          <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
          <span>Secured by Gmail API</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
