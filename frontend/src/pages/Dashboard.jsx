import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEmail } from '../context/EmailContext';
import SenderCards from '../components/SenderCards';
import EmailList from '../components/EmailList';
import EmailReader from '../components/EmailReader';

const Dashboard = () => {
  const { selectedEmail, setSelectedEmail, activeSender, setActiveSender, setActiveCategory } = useEmail();
  const { senderName } = useParams();
  const [showReaderMobile, setShowReaderMobile] = useState(false);

  // Sync route parameters with context filter
  useEffect(() => {
    if (senderName) {
      const decodedSender = decodeURIComponent(senderName);
      if (activeSender !== decodedSender) {
        setActiveCategory(null);
        setActiveSender(decodedSender);
      }
    } else {
      if (activeSender) {
        setActiveSender(null);
      }
    }
  }, [senderName, activeSender, setActiveSender, setActiveCategory]);

  // Toggle mobile reader visibility based on selected email
  useEffect(() => {
    if (selectedEmail) {
      setShowReaderMobile(true);
    } else {
      setShowReaderMobile(false);
    }
  }, [selectedEmail]);

  const handleBackToList = () => {
    setSelectedEmail(null);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-5">
      
      {/* Senders Horizontal Track (Hidden on mobile if reading) */}
      <div className={`${showReaderMobile ? 'hidden md:block' : 'block'} shrink-0`}>
        <SenderCards />
      </div>

      {/* Main Mail Browsing panels */}
      <div className="flex-1 flex min-h-0 space-x-0 md:space-x-5 overflow-hidden relative">
        
        {/* Column 1: Email Feed Cards (Hidden on mobile if reading) */}
        <div className={`w-full md:w-[360px] lg:w-[400px] shrink-0 h-full flex flex-col ${
          showReaderMobile ? 'hidden md:flex' : 'flex'
        }`}>
          <EmailList />
        </div>

        {/* Column 2: Detailed Email Reader (Hidden on mobile if listing) */}
        <div className={`flex-1 h-full flex flex-col ${
          !showReaderMobile ? 'hidden md:flex' : 'flex'
        }`}>
          <EmailReader onBack={handleBackToList} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
