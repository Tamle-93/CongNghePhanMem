import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getSaveErrorMessage } from '../../utils/errorHandler';

const AdminCreateConference = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [chairs, setChairs] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    acronym: '',
    year: new Date().getFullYear(),
    organization: '',
    field: '',
    chair_id: '',
    description: '',
    website: '',
    logo: null,
    submission_deadline: '',
    review_deadline: '',
    notification_date: '',
    conference_start: '',
    conference_end: ''
  });

  useEffect(() => {
    fetchChairs();
  }, []);

  const fetchChairs = async () => {
    try {
      const response = await api.get('/admin/users', {
        params: { role: 'Chair' }
      });
      if (response.data.status === 'success') {
        setChairs(response.data.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching chairs:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên hội nghị');
      return false;
    }
    if (!formData.chair_id) {
      alert('Vui lòng chỉ định chủ tọa chính');
      return false;
    }
    if (!formData.submission_deadline || !formData.review_deadline) {
      alert('Vui lòng nhập đầy đủ các mốc thời gian quan trọng');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      const response = await api.post('/admin/conferences', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 'success') {
        alert('Tạo hội nghị mới thành công!');
        navigate('/admin/conferences');
      }
    } catch (error) {
      console.error('Error creating conference:', error);
      alert(getSaveErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy? Dữ liệu đã nhập sẽ bị mất.')) {
      navigate('/admin/conferences');
    }
  };

  return (
    <div className="min-h-screen bg-background-light ">
      <main className="flex-1 w-full max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav aria-label="Breadcrumb" className="flex mb-4 text-sm text-gray-500 ">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <button onClick={() => navigate('/admin/conferences')} className="hover:text-blue-600">
                  Quản lý hội nghị
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  <span className="ml-1 font-medium text-gray-900 ">Tạo hội nghị mới</span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 ">
            Biểu Mẫu Tạo Hội Nghị Mới
          </h1>
          <p className="mt-2 text-base text-gray-500 ">
            Vui lòng điền đầy đủ các thông tin chi tiết để khởi tạo một hội nghị khoa học mới trên hệ thống.
          </p>
        </div>

        {/* Form */}
        <div className="bg-surface-light  border border-gray-200  rounded-xl shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100  pb-2">
                <span className="material-symbols-outlined text-blue-600">info</span>
                <h3 className="font-bold text-lg text-gray-900 ">Thông tin cơ bản</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700  mb-2">
                    Tên hội nghị đầy đủ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50  border-gray-200  rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                    placeholder="Ví dụ: Hội nghị Khoa học Công nghệ Giao thông Vận tải 2024"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700  mb-2">
                    Tên viết tắt (Acronym) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="acronym"
                    value={formData.acronym}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50  border-gray-200  rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                    placeholder="Ví dụ: UTH-STC 2024"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700  mb-2">
                    Năm tổ chức <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50  border-gray-200  rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                  >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700  mb-2">
                    Đơn vị chủ trì <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50  border-gray-200  rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                    required
                  >
                    <option value="">Chọn khoa tại UTH</option>
                    <option value="Khoa Công nghệ thông tin">Khoa Công nghệ thông tin</option>
                    <option value="Khoa Cơ khí">Khoa Cơ khí</option>
                    <option value="Khoa Điện - Điện tử viễn thông">Khoa Điện - Điện tử viễn thông</option>
                    <option value="Khoa Công trình giao thông">Khoa Công trình giao thông</option>
                    <option value="Khoa Kinh tế vận tải">Khoa Kinh tế vận tải</option>
                    <option value="Khoa Hàng hải">Khoa Hàng hải</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700  mb-2">
                    Lĩnh vực chính <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="field"
                    value={formData.field}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50  border-gray-200  rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                    required
                  >
                    <option value="">Chọn lĩnh vực</option>
                    <option value="Kỹ thuật & Công nghệ">Kỹ thuật & Công nghệ</option>
                    <option value="Logistics & Chuỗi cung ứng">Logistics & Chuỗi cung ứng</option>
                    <option value="Trí tuệ nhân tạo">Trí tuệ nhân tạo</option>
                    <option value="Môi trường & Năng lượng">Môi trường & Năng lượng</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Personnel & Content */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100  pb-2">
                <span className="material-symbols-outlined text-blue-600">person_search</span>
                <h3 className="font-bold text-lg text-gray-900 ">Nhân sự & Nội dung</h3>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700  mb-2">
                  Chỉ định Chủ tọa chính <span className="text-red-500">*</span>
                </label>
                <select
                  name="chair_id"
                  value={formData.chair_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50  border-gray-200  rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                  required
                >
                  <option value="">Chọn chủ tọa...</option>
                  {chairs.map(chair => (
                    <option key={chair.id} value={chair.id}>
                      {chair.full_name} ({chair.email})
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Chủ tọa chính sẽ có quyền quản trị tối cao đối với hội nghị này.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700  mb-2">
                  Mô tả ngắn hội nghị
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-50  border-gray-200  rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                  placeholder="Nhập tóm tắt về mục đích và quy mô của hội nghị..."
                  rows="4"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700  mb-2">
                  Website chính thức của hội nghị
                </label>
                <div className="flex rounded-lg shadow-sm">
                  <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-200  bg-gray-100  text-gray-500 text-sm">
                    https://
                  </span>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="flex-1 block w-full px-4 py-2.5 bg-gray-50  border-gray-200  rounded-r-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                    placeholder="conference.uth.edu.vn"
                  />
                </div>
              </div>
            </div>

            {/* Important Dates */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100  pb-2">
                <span className="material-symbols-outlined text-blue-600">calendar_today</span>
                <h3 className="font-bold text-lg text-gray-900 ">Mốc thời gian quan trọng</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700  mb-2">
                    Hạn nộp bài <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="submission_deadline"
                    value={formData.submission_deadline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50  border-gray-200  rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700  mb-2">
                    Hạn phản biện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="review_deadline"
                    value={formData.review_deadline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50  border-gray-200  rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700  mb-2">
                    Ngày thông báo kết quả
                  </label>
                  <input
                    type="datetime-local"
                    name="notification_date"
                    value={formData.notification_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50  border-gray-200  rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700  mb-2">
                    Ngày diễn ra hội nghị
                  </label>
                  <input
                    type="date"
                    name="conference_start"
                    value={formData.conference_start}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gray-50  border-gray-200  rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Brand Identity */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100  pb-2">
                <span className="material-symbols-outlined text-blue-600">image</span>
                <h3 className="font-bold text-lg text-gray-900 ">Nhận diện thương hiệu</h3>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700  mb-2">
                  Tải lên Logo/Banner hội nghị
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300  border-dashed rounded-lg hover:border-blue-500  transition-colors group">
                  <div className="space-y-1 text-center">
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-blue-600 text-4xl mb-2 transition-colors">
                      cloud_upload
                    </span>
                    <div className="flex text-sm text-gray-600 ">
                      <label className="relative cursor-pointer bg-white  rounded-md font-semibold text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Tải ảnh lên</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">hoặc kéo và thả vào đây</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 5MB</p>
                    {formData.logo && (
                      <p className="text-xs text-blue-600 font-medium">Đã chọn: {formData.logo.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-8 border-t border-gray-100 ">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-gray-300  text-gray-700  font-bold text-sm hover:bg-gray-100  transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                {loading ? 'Đang tạo...' : 'Tạo hội nghị'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminCreateConference;

