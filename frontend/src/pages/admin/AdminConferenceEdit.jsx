import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getSaveErrorMessage, getLoadErrorMessage } from '../../utils/errorHandler';

const AdminConferenceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [chairs, setChairs] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    acronym: '',
    description: '',
    chair_id: '',
    submission_deadline: '',
    review_deadline: '',
    is_active: true
  });

  useEffect(() => {
    fetchConference();
    fetchChairs();
  }, [id]);

  const fetchConference = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/conferences/${id}`);
      if (response.data.status === 'success') {
        const conf = response.data.data;
        setFormData({
          name: conf.name || '',
          acronym: conf.acronym || '',
          description: conf.description || '',
          chair_id: conf.chair_id || '',
          submission_deadline: conf.submission_deadline ? conf.submission_deadline.split('T')[0] : '',
          review_deadline: conf.review_deadline ? conf.review_deadline.split('T')[0] : '',
          is_active: conf.is_active !== false
        });
      }
    } catch (error) {
      console.error('Error fetching conference:', error);
      alert('Không thể tải thông tin hội nghị');
    } finally {
      setLoading(false);
    }
  };

  const fetchChairs = async () => {
    try {
      const response = await api.get('/admin/users', { params: { role: 'Chair' } });
      if (response.data.status === 'success') {
        setChairs(response.data.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching chairs:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên hội nghị');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/admin/conferences/${id}`, formData);
      alert('Cập nhật hội nghị thành công!');
      navigate('/admin/conferences');
    } catch (error) {
      console.error('Error updating conference:', error);
      alert(getSaveErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/admin/conferences')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Quay lại danh sách
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh Sửa Hội Nghị</h1>
          <p className="text-gray-600 mt-2">Cập nhật thông tin hội nghị khoa học</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên hội nghị <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tên viết tắt</label>
            <input
              type="text"
              name="acronym"
              value={formData.acronym}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Chủ tọa chính</label>
            <select
              name="chair_id"
              value={formData.chair_id}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn chủ tọa</option>
              {chairs.map(chair => (
                <option key={chair.id} value={chair.id}>{chair.full_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hạn nộp bài</label>
              <input
                type="date"
                name="submission_deadline"
                value={formData.submission_deadline}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hạn phản biện</label>
              <input
                type="date"
                name="review_deadline"
                value={formData.review_deadline}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Hội nghị đang hoạt động
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/conferences')}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminConferenceEdit;
