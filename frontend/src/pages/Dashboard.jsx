// frontend/src/pages/Dashboard.jsx
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.roles?.[0] || 'User';

  const stats = [
    { label: 'Bài báo', value: '12', icon: '📄', color: 'blue' },
    { label: 'Phản biện', value: '8', icon: '✍️', color: 'green' },
    { label: 'Hội nghị', value: '3', icon: '🎓', color: 'purple' },
    { label: 'Thông báo', value: '5', icon: '🔔', color: 'orange' }
  ];

  const recentActivities = [
    { action: 'Nộp bài báo mới', time: '2 giờ trước', icon: '📝' },
    { action: 'Nhận phản biện', time: '5 giờ trước', icon: '✅' },
    { action: 'Cập nhật hồ sơ', time: '1 ngày trước', icon: '👤' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Xin chào, {user?.full_name}! 👋
            </h1>
            <p className="text-blue-100">
              Vai trò: <span className="font-semibold">{role}</span>
            </p>
            <p className="text-blue-100 text-sm mt-1">{user?.email}</p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl backdrop-blur">
              {role === 'Author' && '✍️'}
              {role === 'Reviewer' && '👨‍🔬'}
              {role === 'Chair' && '👨‍💼'}
              {role === 'Admin' && '⚙️'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="text-2xl mr-4">{activity.icon}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="space-y-3">
            <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-lg transition text-left flex items-center">
              <span className="mr-3">📝</span>
              Nộp bài báo mới
            </button>
            <button className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-medium py-3 px-4 rounded-lg transition text-left flex items-center">
              <span className="mr-3">📊</span>
              Xem thống kê
            </button>
            <button className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-3 px-4 rounded-lg transition text-left flex items-center">
              <span className="mr-3">⚙️</span>
              Cài đặt tài khoản
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;