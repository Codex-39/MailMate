import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEmail } from '../context/EmailContext';
import { ArrowLeft, Menu, Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import UserMenuDropdown from './UserMenuDropdown';

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { metrics } = useEmail();
  const location = useLocation();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isHome = location.pathname === '/';
  const isSender = location.pathname.startsWith('/sender/');
  const isEmail = location.pathname.startsWith('/email/');
  const isSettings = location.pathname === '/settings';

  const handleBack = () => {
    if (isEmail) {
      navigate(-1);
    } else if (isSender || isSettings) {
      navigate('/');
    }
  };

  return (
    <header className="h-16 bg-transparent flex items-center justify-between px-2 md:px-4 shrink-0 border-b border-white/5 select-none text-white relative">
      
      {/* Left controls: Toggle Sidebar (Mobile) or Back Button */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={toggleSidebar}
          className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {!isHome && (
          <button
            onClick={handleBack}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-bold text-white transition-all active:scale-98"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-purple-400" />
            <span>Back</span>
          </button>
        )}
      </div>

      {/* Middle: Breadcrumbs */}
      <div className="hidden sm:flex items-center text-[11.5px] font-bold text-white/40">
        <span className="text-white font-black uppercase tracking-wider">MailMate</span>
        {isSender && (
          <>
            <span className="mx-2 text-purple-500/50">/</span>
            <span className="text-white/60 uppercase tracking-wider">Sender Archive</span>
          </>
        )}
        {isEmail && (
          <>
            <span className="mx-2 text-purple-500/50">/</span>
            <span className="text-white/60 uppercase tracking-wider">Message Details</span>
          </>
        )}
        {isSettings && (
          <>
            <span className="mx-2 text-purple-500/50">/</span>
            <span className="text-white/60 uppercase tracking-wider">Settings</span>
          </>
        )}
      </div>

      {/* Right Controls: Avatar + Bell with dropdowns */}
      <div className="flex items-center space-x-3.5 relative z-30">
        {user && (
          <div className="relative">
            <button 
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false);
              }}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 text-white/80 hover:text-white transition-all relative flex items-center justify-center backdrop-blur-md shadow-sm active:scale-95"
            >
              <Bell className="w-4.5 h-4.5 text-white/80" />
              {metrics.unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-purple-500 ring-2 ring-[#0f111a] shadow-sm shadow-purple-500"></span>
              )}
            </button>
            <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
          </div>
        )}

        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
              }}
              className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shadow-sm bg-white/10 flex items-center justify-center font-bold text-[13px] text-white hover:border-purple-500/30 transition-all select-none active:scale-95 backdrop-blur-md"
            >
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
              )}
            </button>
            <UserMenuDropdown isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
