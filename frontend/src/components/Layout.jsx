import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from './Toast';
import { useEmail } from '../context/EmailContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast, showToast } = useEmail();

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#04050a] font-sans relative p-4 md:p-6 text-white">
      
      {/* Background Liquid Glowing Blobs (Deep Blue, Indigo, Purple, Pink Glow) */}
      <div className="absolute top-[-25%] left-[-15%] w-[70%] h-[70%] rounded-full bg-[#0a113a] opacity-60 blur-[130px] pointer-events-none animate-blob-1"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[75%] h-[75%] rounded-full bg-[#180a30] opacity-70 blur-[160px] pointer-events-none animate-blob-2"></div>
      <div className="absolute top-[20%] right-[10%] w-[55%] h-[55%] rounded-full bg-[#200f38] opacity-50 blur-[140px] pointer-events-none animate-blob-3"></div>
      
      {/* Soft color highlights/glows */}
      <div className="absolute top-[15%] left-[30%] w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[15%] left-[10%] w-[500px] h-[500px] rounded-full bg-fuchsia-600/5 blur-[150px] pointer-events-none"></div>

      {/* Floating Sidebar (Desktop and Mobile drawer) */}
      <div className={`fixed inset-0 z-40 md:relative md:z-auto transition-all duration-500 md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } md:mr-6 flex-shrink-0`}>
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-md md:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        <div className="relative h-full z-40 flex-shrink-0">
          <Sidebar closeSidebar={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Floating Topbar */}
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Inner Content panels list */}
        <main className="flex-1 overflow-hidden relative flex flex-col mt-4">
          {children}
        </main>
      </div>

      {/* Sleek success/error notification banners */}
      <Toast toast={toast} onClose={() => showToast(null)} />
    </div>
  );
};

export default Layout;
