import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEmail } from '../context/EmailContext';
import { motion } from 'framer-motion';
import { User, Shield, Info, LogOut, CheckCircle, Bell, Palette, Chrome } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const { showToast } = useEmail();

  // Settings interactive state toggles
  const [themeMode, setThemeMode] = useState('dark-glass');
  const [desktopNotif, setDesktopNotif] = useState(true);
  const [summaryHighlight, setSummaryHighlight] = useState(true);
  const [soundAlert, setSoundAlert] = useState(false);

  const handleSaveSettings = () => {
    showToast('Settings saved successfully');
  };

  const toggleTheme = (theme) => {
    setThemeMode(theme);
    if (theme === 'oled-black') {
      document.body.style.backgroundColor = '#000000';
    } else {
      document.body.style.backgroundColor = '#04050a';
    }
    showToast(`Theme updated to ${theme === 'oled-black' ? 'OLED Black' : 'Dark Glassmorphism'}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className="flex-1 flex flex-col min-h-0 bg-transparent max-w-xl mx-auto w-full px-4 py-4 overflow-y-auto no-scrollbar text-white select-none"
    >
      
      {/* Title */}
      <div className="space-y-0.5 mb-6 select-none">
        <h2 className="text-xl font-black text-white">Settings</h2>
        <p className="text-[9.5px] text-white/35 font-bold uppercase tracking-widest">Profile & System Configurations</p>
      </div>

      <div className="space-y-5">
        
        {/* User Profile Info */}
        {user && (
          <div className="p-5 rounded-2xl border border-white/5 bg-white/1.5 space-y-4">
            <h3 className="text-[9.5px] font-black uppercase tracking-widest text-white/35 flex items-center space-x-1.5 select-none">
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>User Profile</span>
            </h3>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-sm text-white select-none border border-white/15 shadow-md">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="leading-tight">
                <h4 className="text-[13.5px] font-extrabold text-white">{user.name}</h4>
                <p className="text-[11px] text-white/40 font-bold font-mono mt-0.5">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Theme Settings Panel */}
        <div className="p-5 rounded-2xl border border-white/5 bg-white/1.5 space-y-4">
          <h3 className="text-[9.5px] font-black uppercase tracking-widest text-white/35 flex items-center space-x-1.5 select-none">
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span>Theme Configuration</span>
          </h3>
          
          <div className="grid grid-cols-2 gap-3.5">
            <button
              onClick={() => toggleTheme('dark-glass')}
              className={`p-3 rounded-2xl border text-left leading-tight transition-all duration-300 ${
                themeMode === 'dark-glass'
                  ? 'border-purple-500/40 bg-purple-500/10'
                  : 'border-white/5 bg-white/2 hover:bg-white/5'
              }`}
            >
              <h4 className="text-[11.5px] font-bold text-white">Dark Glassmorphism</h4>
              <p className="text-[9.5px] text-white/40 mt-1">Deep purple tones and liquid glows.</p>
            </button>

            <button
              onClick={() => toggleTheme('oled-black')}
              className={`p-3 rounded-2xl border text-left leading-tight transition-all duration-300 ${
                themeMode === 'oled-black'
                  ? 'border-purple-500/40 bg-purple-500/10'
                  : 'border-white/5 bg-white/2 hover:bg-white/5'
              }`}
            >
              <h4 className="text-[11.5px] font-bold text-white">OLED Deep Black</h4>
              <p className="text-[9.5px] text-white/40 mt-1">Zero emission dark mode for OLED screens.</p>
            </button>
          </div>
        </div>

        {/* Notifications Options */}
        <div className="p-5 rounded-2xl border border-white/5 bg-white/1.5 space-y-4">
          <h3 className="text-[9.5px] font-black uppercase tracking-widest text-white/35 flex items-center space-x-1.5 select-none">
            <Bell className="w-3.5 h-3.5 text-purple-400" />
            <span>System Alerts</span>
          </h3>

          <div className="space-y-4">
            {/* Desktop Notification toggle */}
            <div className="flex items-center justify-between">
              <div className="leading-tight">
                <h4 className="text-[12px] font-bold text-white">Desktop Notifications</h4>
                <p className="text-[9.5px] text-white/40 mt-0.5">Show notifications when new emails arrive.</p>
              </div>
              <button 
                onClick={() => {
                  setDesktopNotif(!desktopNotif);
                  showToast(`Desktop notifications ${!desktopNotif ? 'enabled' : 'disabled'}`);
                }}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${desktopNotif ? 'bg-purple-500' : 'bg-white/10'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${desktopNotif ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Siri Highlights toggle */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3.5">
              <div className="leading-tight">
                <h4 className="text-[12px] font-bold text-white">Summary Highlights</h4>
                <p className="text-[9.5px] text-white/40 mt-0.5">Enable automatic Siri summaries for inbox alerts.</p>
              </div>
              <button 
                onClick={() => {
                  setSummaryHighlight(!summaryHighlight);
                  showToast(`MailMate AI alerts ${!summaryHighlight ? 'enabled' : 'disabled'}`);
                }}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${summaryHighlight ? 'bg-purple-500' : 'bg-white/10'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${summaryHighlight ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Sound alerts toggle */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3.5">
              <div className="leading-tight">
                <h4 className="text-[12px] font-bold text-white">Sound Effects</h4>
                <p className="text-[9.5px] text-white/40 mt-0.5">Play alert sounds on synchronizations.</p>
              </div>
              <button 
                onClick={() => {
                  setSoundAlert(!soundAlert);
                  showToast(`Sound effects ${!soundAlert ? 'enabled' : 'disabled'}`);
                }}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${soundAlert ? 'bg-purple-500' : 'bg-white/10'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${soundAlert ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Connected Gmail Account connections status */}
        <div className="p-5 rounded-2xl border border-white/5 bg-white/1.5 space-y-4">
          <h3 className="text-[9.5px] font-black uppercase tracking-widest text-white/35 flex items-center space-x-1.5 select-none">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Connection Integrity</span>
          </h3>

          <div className="space-y-3 text-[11.5px] text-white/70 font-medium">
            <div className="flex justify-between items-center py-0.5">
              <span>Database Server</span>
              <span className="flex items-center space-x-1 text-emerald-400 font-bold select-none text-[11px]">
                <CheckCircle className="w-3 h-3 fill-emerald-950/40" />
                <span>Connected</span>
              </span>
            </div>

            <div className="flex justify-between items-center py-0.5 border-t border-white/5 pt-2">
              <span>Gmail API Sync status</span>
              <span className="flex items-center space-x-1 text-emerald-400 font-bold select-none text-[11px]">
                <CheckCircle className="w-3 h-3 fill-emerald-950/40" />
                <span>OAuth Active</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center py-0.5 border-t border-white/5 pt-2">
              <span>Connected Account Address</span>
              <span className="text-white/40 font-bold text-[10.5px] font-mono">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Help Info Box */}
        <div className="p-4 rounded-2xl bg-white/0.5 border border-white/5 text-[11px] text-white/35 leading-relaxed font-semibold select-none flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-purple-400/80 shrink-0 mt-0.5" />
          <span>
            MailMate aggregates incoming emails dynamically based on sender headers from your linked Gmail inbox. Settings configured here will persist in memory.
          </span>
        </div>

        {/* Action Logout */}
        <button
          onClick={logout}
          className="w-full py-3.5 text-center bg-rose-500/10 hover:bg-rose-500/15 text-rose-400 font-bold rounded-2xl transition-colors select-none text-[12.5px] flex items-center justify-center space-x-2 border border-rose-500/20 active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4 text-rose-450" />
          <span>Logout session</span>
        </button>

      </div>
    </motion.div>
  );
};

export default Settings;
