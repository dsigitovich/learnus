'use client';

import { MessageSquare } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 bg-white text-gray-800 h-screen flex flex-col border-r border-gray-200">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">Learnus</h1>
      </div>
      
      {/* Chat Header */}
      <div className="p-4">
        <div className="flex items-center space-x-3 text-gray-600">
          <MessageSquare size={20} />
          <span>Чат</span>
        </div>
      </div>
      
      <div className="flex-1" />
    </div>
  );
}
