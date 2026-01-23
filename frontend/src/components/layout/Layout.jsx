// frontend/src/components/layout/Layout.jsx
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const getMenuItems = () => {
    if (!user || !user.roles) return [];

    const role = user.roles[0];

    const menus = {
      Author: [
        { path: '/author/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/author/papers', label: 'Quản lý bài báo', icon: '📄' },
        { path: '/author/submit', label: 'Nộp bài mới', icon: '➕' },
      ],
      Reviewer: [
        { path: '/reviewer/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/reviewer/assignments', label: 'Bài cần phản biện', icon: '📝' },
      ],
      Chair: [
        { path: '/chair/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/chair/papers', label: 'Quản lý bài nộp', icon: '📄' },
        { path: '/chair/assignments', label: 'Phân công', icon: '👥' },
        { path: '/chair/discussions', label: 'Thảo luận', icon: '💬' },
        { path: '/chair/decisions', label: 'Quyết định', icon: '✅' },
      ],
      Admin: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/users', label: 'Người dùng', icon: '👥' },
        { path: '/admin/conferences', label: 'Hội nghị', icon: '🏛️' },
        { path: '/admin/audit-logs', label: 'Nhật ký', icon: '📋' },
      ]
    };

    return menus[role] || [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              UTH-ConfMS
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.roles?.join(', ')}</p>
              </div>
              
              <Link
                to="/settings"
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                title="Cài đặt"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <nav className="p-4 space-y-2">
            {getMenuItems().map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;