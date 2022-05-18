import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="p-5 lg:px-8 lg:py-5">
      <Navbar />
      {children}
    </div>
  );
}
