// src/components/layout/Header.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      await logout();
    }
  };

  const getNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'Author':
        return [
          { id: 'author', label: 'Quản lý bài báo' },
          { id: 'submit', label: 'Nộp bài' }
        ];
      case 'Reviewer':
        return [
          { id: 'reviewer', label: 'Bài cần phản biện' }
        ];
      case 'Chair':
        return [
          { id: 'chair', label: 'Dashboard' },
          { id: 'papers', label: 'Quản lý bài nộp' },
          { id: 'assignments', label: 'Phân công' }
        ];
      case 'Admin':
        return [
          { id: 'admin', label: 'Dashboard' },
          { id: 'users', label: 'Người dùng' },
          { id: 'conferences', label: 'Hội nghị' }
        ];
      default:
        return [];
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <button
            onClick={() => onNavigate(user.role.toLowerCase())}
            className="text-xl font-bold text-blue-600 hover:text-blue-700 transition"
          >
            UTH-ConfMS
          </button>
          <nav className="flex space-x-4">
            {getNavItems().map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-2 rounded transition ${
                  currentPage === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{user?.full_name}</span>
            <span className="mx-2">•</span>
            <span className="text-blue-600">{user?.role}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;