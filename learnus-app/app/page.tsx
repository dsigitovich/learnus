'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store';
import Chat from '@/components/Chat';
import ProgramTable from '@/components/ProgramTable';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const { viewMode } = useUIStore();
  
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
        {viewMode === 'chat' ? <Chat /> : <ProgramTable />}
      </div>
    </div>
  );
}
