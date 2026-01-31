import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Footer from './Footer';
import NotificationDropdown from '../NotificationDropdown';
import GlobalSearch from '../GlobalSearch';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  
  // Current active role - saved in localStorage and synchronized across component instances
  const [activeRole, setActiveRole] = useState(() => {
    const saved = localStorage.getItem('activeRole');
    if (saved && user?.roles?.includes(saved)) {
      return saved;
    }
    return user?.roles?.[0] || 'Author';
  });

  // ✅ FIXED: Ensure activeRole stays synced with localStorage on mount and when location changes
  useEffect(() => {
    const savedRole = localStorage.getItem('activeRole');
    if (savedRole && user?.roles?.includes(savedRole)) {
      setActiveRole(savedRole);
    }
  }, [location, user]); // Re-sync when navigating or user changes

  // ✅ ORIGINAL: Update activeRole when user changes
  useEffect(() => {
    if (user?.roles?.length > 0) {
      const saved = localStorage.getItem('activeRole');
      if (saved && user.roles.includes(saved)) {
        setActiveRole(saved);
      } else {
        setActiveRole(user.roles[0]);
        localStorage.setItem('activeRole', user.roles[0]);
      }
    }
  }, [user]);

  const handleRoleChange = (newRole) => {
    if (!newRole || !user?.roles?.includes(newRole)) {
      console.error('Invalid role selected:', newRole);
      return;
    }
    
    setActiveRole(newRole);
    localStorage.setItem('activeRole', newRole);
    setShowRoleMenu(false);
    
    // Navigate to the appropriate home page for the new role
    const homePaths = {
      'Admin': '/admin',
      'Chair': '/chair',
      'Reviewer': '/reviewer',
      'Author': '/home'
    };
    navigate(homePaths[newRole] || '/home');
  };

  const handleLogout = () => {
    localStorage.removeItem('activeRole');
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (activeRole === 'Admin') {
      return [
        { path: '/admin', label: 'Trang chủ' },
        { path: '/admin/users', label: 'Người dùng' },
        { path: '/admin/conferences', label: 'Hội nghị' },
        { path: '/admin/audit-logs', label: 'Nhật ký' },
        { path: '/admin/system-config', label: 'Cấu hình' },
      ];
    }
    if (activeRole === 'Chair') {
      return [
        { path: '/chair', label: 'Trang chủ' },
        { path: '/chair/papers', label: 'Quản lý bài nộp' },
        { path: '/chair/tracks', label: 'Phân ban & Lộ trình' },
        { path: '/chair/reviewers', label: 'Đội ngũ PC' },
        { path: '/chair/decisions', label: 'Quyết định' },
      ];
    }
    if (activeRole === 'Reviewer') {
      return [
        { path: '/reviewer', label: 'Trang chủ' },
        { path: '/reviewer/assignments', label: 'Phân công' },
        { path: '/reviewer/papers', label: 'Bài phản biện' },
        { path: '/reviewer/reviews', label: 'Đánh giá' },
      ];
    }
    // Author
    return [
      { path: '/home', label: 'Trang chủ' },
      { path: '/conferences', label: 'Hội nghị' },
      { path: '/author/papers', label: 'Bài báo của tôi' },
      { path: '/author/submit', label: 'Nộp bài mới' },
      { path: '/guide', label: 'Hướng dẫn' },
    ];
  };

  const navItems = getNavItems();
  const roleLabels = { Admin: 'Quản trị viên', Chair: 'Chủ tọa', Reviewer: 'Phản biện', Author: 'Tác giả' };
  const roleColors = { 
    Admin: 'bg-red-100 text-red-700', 
    Chair: 'bg-purple-100 text-purple-700', 
    Reviewer: 'bg-blue-100 text-blue-700', 
    Author: 'bg-green-100 text-green-700' 
  };

  // Determine home path based on active role
  const getHomePath = () => {
    if (activeRole === 'Admin') return '/admin';
    if (activeRole === 'Chair') return '/chair';
    if (activeRole === 'Reviewer') return '/reviewer';
    return '/home'; // Author
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to={getHomePath()} className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <span className="text-xl font-bold text-slate-900">UTH-ConfMS</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-blue-600'
                      : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Side - Search, Notifications, User */}
          <div className="flex items-center gap-3">
            {/* Global Search */}
            <button
              onClick={() => setShowSearch(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-lg">search</span>
              <span>Tìm kiếm...</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">
                <span>Ctrl</span>+<span>K</span>
              </kbd>
            </button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Role Selector - show if user has multiple roles */}
            {user?.roles?.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${roleColors[activeRole]}`}
                >
                  <span>{roleLabels[activeRole]}</span>
                  <span className="material-symbols-outlined text-base">
                    {showRoleMenu ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                    <p className="px-4 py-2 text-xs text-slate-500 font-medium uppercase">Chuyển vai trò</p>
                    {user.roles.map((r) => (
                      <button
                        key={r}
                        onClick={() => handleRoleChange(r)}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 ${
                          activeRole === r ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        <span>{roleLabels[r]}</span>
                        {activeRole === r && (
                          <span className="material-symbols-outlined text-base text-blue-600">check</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.full_name?.[0] || user?.username?.[0] || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-900">{user?.full_name || user?.username}</p>
                  <p className="text-xs text-slate-500">{roleLabels[activeRole]}</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Hồ sơ cá nhân
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
