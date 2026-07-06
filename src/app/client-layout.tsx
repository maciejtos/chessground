'use client';

import React from 'react';
import Navbar from '@/components/Navbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-sky-100 transition-colors duration-1000">
      <Navbar />
      <div className="flex-1 w-full max-w-[1920px] mx-auto min-h-0 relative">
        {children}
      </div>
    </div>
  );
}
