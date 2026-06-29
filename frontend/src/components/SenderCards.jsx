import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmail } from '../context/EmailContext';
import { Layers } from 'lucide-react';

const SenderCards = () => {
  const { senderCards, activeSender, setActiveCategory, setActiveFilter } = useEmail();
  const navigate = useNavigate();

  // Color-aligned themes for sender cards
  const getSenderTheme = (senderName) => {
    const name = senderName.toLowerCase();
    if (name.includes('linkedin')) {
      return {
        bg: 'from-blue-600 to-sky-400',
        initials: 'in',
        style: 'font-serif lowercase font-black text-white'
      };
    }
    if (name.includes('infosys')) {
      return {
        bg: 'from-blue-700 to-indigo-500',
        initials: 'INF',
        style: 'font-sans font-black tracking-tighter text-white uppercase text-[8px]'
      };
    }
    if (name.includes('geeksforgeeks') || name.includes('gfg')) {
      return {
        bg: 'from-emerald-600 to-teal-400',
        initials: 'GFG',
        style: 'font-sans font-black text-white text-[8px]'
      };
    }
    if (name.includes('internshala')) {
      return {
        bg: 'from-cyan-500 to-blue-400',
        initials: 'IS',
        style: 'font-sans font-black text-white'
      };
    }
    if (name.includes('unstop')) {
      return {
        bg: 'from-amber-400 to-orange-500',
        initials: 'U',
        style: 'font-sans font-black text-black'
      };
    }
    if (name.includes('hdfc') || name.includes('bank')) {
      return {
        bg: 'from-blue-800 to-blue-600',
        initials: '🏦',
        style: 'text-white text-xs'
      };
    }
    if (name.includes('college') || name.includes('registrar') || name.includes('dean')) {
      return {
        bg: 'from-purple-700 to-indigo-500',
        initials: '🏫',
        style: 'text-white'
      };
    }
    
    // Hash colors for unique custom avatars
    const colors = [
      'from-purple-600 to-indigo-500',
      'from-rose-500 to-pink-500',
      'from-emerald-600 to-green-500',
      'from-amber-500 to-yellow-400',
      'from-blue-600 to-indigo-400',
      'from-fuchsia-600 to-purple-400'
    ];
    let sum = 0;
    for (let i = 0; i < senderName.length; i++) {
      sum += senderName.charCodeAt(i);
    }
    const bg = colors[sum % colors.length];
    const clean = senderName.replace(/\([^)]*\)/g, '').trim();
    const parts = clean.split(' ').filter(p => p.length > 0);
    let initials = '✉️';
    if (parts.length === 1) {
      initials = parts[0][0].toUpperCase();
    } else if (parts.length > 1) {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return { bg, initials, style: 'font-sans font-black text-white text-[9.5px]' };
  };

  const handleSenderClick = (senderName) => {
    setActiveCategory(null);
    setActiveFilter('all');
    if (activeSender === senderName) {
      navigate('/');
    } else {
      navigate(`/sender/${encodeURIComponent(senderName)}`);
    }
  };

  return (
    <div className="space-y-2 shrink-0 text-white select-none">
      <div className="flex items-center space-x-2 px-1 select-none">
        <Layers className="w-3.5 h-3.5 text-purple-450" />
        <h4 className="text-[9.5px] font-black uppercase tracking-widest text-white/35">
          Sender Groups
        </h4>
      </div>
      
      {/* Horizontal Scroll Slider Track */}
      <div className="flex items-center space-x-3.5 overflow-x-auto no-scrollbar py-1 px-1 -mx-1 select-none">
        {senderCards.map((card) => {
          const theme = getSenderTheme(card.name);
          const isSelected = activeSender === card.name;
          
          return (
            <button
              key={card.name}
              onClick={() => handleSenderClick(card.name)}
              className={`text-left p-3.5 rounded-2xl border transition-all shrink-0 apple-spring hover:scale-102 flex flex-col justify-between w-[130px] h-[92px] cursor-pointer ${
                isSelected 
                  ? 'bg-purple-500/20 border-purple-500/40 text-white shadow-md' 
                  : 'glass-panel border-white/5 text-white/80 hover:border-white/10'
              }`}
            >
              <div className="flex justify-between items-center w-full">
                {/* Initials Circle */}
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${theme.bg} flex items-center justify-center text-[10px] shadow-md shrink-0 border border-white/10`}>
                  <span className={theme.style}>{theme.initials}</span>
                </div>
                
                {/* Unread badge */}
                {card.unreadCount > 0 && (
                  <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${
                    isSelected 
                      ? 'bg-purple-500 text-white border-purple-400/20' 
                      : 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                  }`}>
                    {card.unreadCount} New
                  </span>
                )}
              </div>

              <div className="leading-tight mt-1.5">
                <h5 className="text-[12.5px] font-extrabold truncate text-white">
                  {card.name}
                </h5>
                <span className="text-[10px] font-semibold text-white/45 block mt-0.5">
                  {card.emailCount} Email{card.emailCount !== 1 ? 's' : ''}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SenderCards;
