'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Chat from './Chat';

export default function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`flex-1 transition-all duration-300 ${
        sidebarOpen ? 'md:ml-0' : 'ml-0'
      }`}>
        <Chat />
      </div>
    </div>
  );
}