// src/components/layout/Layout.jsx
import React from 'react';
import Header from './Header';

const Layout = ({ children, currentPage, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onNavigate={onNavigate} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;