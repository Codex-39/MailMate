import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ShieldAlert, Chrome } from 'lucide-react';

const UserMenuDropdown = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleSettingsClick = () => {
    navigate('/settings');
    onClose();
  };

  const handleLogoutClick = () => {
    onClose();
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  return (
    <div className="absolute right-0 mt-2.5 w-64 z-50 pointer-events-auto" ref={menuRef}>
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="glass-panel rounded-3xl p-4 shadow-2xl border border-white/10 select-none overflow-hidden relative text-white"
      >
        {/* Siri style glow blob */}
        <div className="absolute -bottom-12 -right-12 w-20 h-20 bg-purple-500/10 rounded-full blur-xl pointer-events-none"></div>

        {/* Profile Card Header */}
        <div className="flex items-center space-x-3 pb-3.5 border-b border-white/5 mb-3 select-none">
          <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shadow-sm bg-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="min-w-0 leading-tight">
            <h4 className="text-[12.5px] font-black text-white truncate">{user.name}</h4>
            <p className="text-[10px] text-white/40 truncate mt-0.5 font-bold font-mono">Logged In</p>
          </div>
        </div>

        {/* Connected Gmail Info */}
        <div className="p-2.5 rounded-2xl bg-white/3 border border-white/5 mb-3.5 select-none">
          <div className="flex items-center space-x-2 text-[9.5px] font-bold text-white/40 uppercase tracking-wider mb-1 font-mono">
            <Chrome className="w-3.5 h-3.5 text-purple-400" />
            <span>Connected Gmail</span>
          </div>
          <p className="text-[10.5px] font-bold text-white/80 truncate px-0.5">{user.email}</p>
        </div>

        {/* Actions options */}
        <div className="space-y-1">
          {/* Profile option */}
          <button
            onClick={handleSettingsClick}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-[12px] font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all text-left"
          >
            <User className="w-4 h-4 text-purple-400" />
            <span>View Profile</span>
          </button>

          {/* Settings option */}
          <button
            onClick={handleSettingsClick}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-[12px] font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all text-left"
          >
            <Settings className="w-4 h-4 text-purple-400" />
            <span>Account Settings</span>
          </button>

          <div className="h-px bg-white/5 my-2"></div>

          {/* Logout */}
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-[12px] font-bold text-rose-400 hover:text-rose-350 hover:bg-rose-500/10 transition-all text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out Session</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
};

export default UserMenuDropdown;
