import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, conferences: 0, papers: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, conferencesRes, papersRes] = await Promise.all([
          api.listUsers().catch(() => ({ data: { users: [] } })),
          api.listConferences().catch(() => ({ data: { conferences: [] } })),
          api.listPapers().catch(() => ({ data: { papers: [] } }))
        ]);
        
        const usersList = usersRes.data?.users || [];
        setUsers(usersList);
        setStats({
          users: usersList.length,
          conferences: (conferencesRes.data?.conferences || []).length,
          papers: (papersRes.data?.papers || []).length
        });
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Bảng điều khiển Admin</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">👥</div>
            <div>
              <p className="text-sm text-slate-500">Người dùng</p>
              <p className="text-2xl font-bold text-slate-900">{stats.users}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">🏛️</div>
            <div>
              <p className="text-sm text-slate-500">Hội nghị</p>
              <p className="text-2xl font-bold text-slate-900">{stats.conferences}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-xl">📄</div>
            <div>
              <p className="text-sm text-slate-500">Bài nộp</p>
              <p className="text-2xl font-bold text-slate-900">{stats.papers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Danh sách người dùng</h2>
        </div>
        
        <div className="overflow-x-auto">
          {users.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Chưa có người dùng nào
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Tên</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Email</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Vai trò</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-500">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.slice(0, 10).map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{user.full_name || user.username}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {user.role || user.roles?.[0] || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${user.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.is_active !== false ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;





