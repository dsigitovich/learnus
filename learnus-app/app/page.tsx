'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import Chat from '@/components/Chat';
import ProgramTree from '@/components/ProgramTree';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const { viewMode } = useStore();
  
  useEffect(() => {
    // Инициализация базы данных при первой загрузке
    fetch('/api/init')
      .then(res => res.json())
      .then(data => console.log('Database initialized:', data))
      .catch(err => console.error('Failed to initialize database:', err));
  }, []);
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1">
        {viewMode === 'chat' ? <Chat /> : <ProgramTree />}
      </div>
    </div>
  );
}