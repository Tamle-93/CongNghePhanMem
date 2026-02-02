import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function AuthorCameraReady() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [decision, setDecision] = useState(null);
  const [cameraReadyFile, setCameraReadyFile] = useState(null);
  const [copyrightFile, setCopyrightFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPaperAndDecision();
  }, [id]);

  const fetchPaperAndDecision = async () => {
    try {
      const [paperRes, decisionRes] = await Promise.all([
        api.getPaperById(id),
        api.getDecision(id).catch(() => ({ data: null }))
      ]);
      setPaper(paperRes.data?.data || paperRes.data);
      setDecision(decisionRes.data?.data || null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size <= 10 * 1024 * 1024) { // 10MB limit
        if (type === 'camera') {
          setCameraReadyFile(file);
        } else {
          setCopyrightFile(file);
        }
      } else {
        alert('File không được vượt quá 10MB');
      }
    } else {
      alert('Chỉ chấp nhận file PDF');
    }
  };

  const handleSubmit = async () => {
    if (!cameraReadyFile) {
      alert('Vui lòng tải lên bản Camera-Ready');
      return;
    }
    if (!copyrightFile) {
      alert('Vui lòng tải lên giấy phép bản quyền đã ký');
      return;
    }
    if (!confirmed) {
      alert('Vui lòng xác nhận các thông tin trước khi gửi');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('camera_ready_file', cameraReadyFile);
      formData.append('copyright_file', copyrightFile);
      formData.append('notes', notes);
      formData.append('paper_id', id);

      console.log('Submitting camera-ready:', {
        paper_id: id,
        camera_file: cameraReadyFile?.name,
        copyright_file: copyrightFile?.name
      });

      const response = await api.post(`/papers/${id}/camera-ready`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Camera-ready response:', response);
      alert('Đã nộp bản Camera-Ready thành công!');
      navigate(`/author/papers/${id}`);
    } catch (error) {
      console.error('Error submitting camera-ready:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Không thể nộp bản Camera-Ready. Vui lòng thử lại.';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!paper || paper.status !== 'accepted') {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <span className="material-symbols-outlined text-6xl text-slate-300">block</span>
        <p className="text-slate-500">Chỉ có thể nộp Camera-Ready cho bài báo đã được chấp nhận</p>
        <button 
          onClick={() => navigate('/author/papers')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-slate-500 gap-2 items-center">
          <Link to="/author/papers" className="hover:text-primary">
            Bài báo của tôi
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-slate-900 font-medium">Nộp Camera-Ready</span>
        </nav>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-4xl">celebration</span>
            <h1 className="text-3xl font-black">Nộp Bản Camera-Ready</h1>
          </div>
          <p className="text-green-100 text-lg">
            Chúc mừng! Bài báo của bạn đã được chấp nhận. Vui lòng nộp bản Camera-Ready (bản cuối cùng) theo format yêu cầu.
          </p>
        </div>

        {/* Paper Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Thông tin bài báo</h2>
          <div className="space-y-2">
            <p className="text-slate-700"><span className="font-semibold">Tiêu đề:</span> {paper.title}</p>
            <p className="text-slate-700"><span className="font-semibold">Mã bài:</span> #{paper.id}</p>
            {decision && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-900 mb-2">Nhận xét từ Chair:</p>
                <p className="text-sm text-slate-700">{decision.final_comment || 'Không có nhận xét'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Camera-Ready */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600">upload_file</span>
            Tải lên bản Camera-Ready
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                File Camera-Ready (PDF) <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, 'camera')}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {cameraReadyFile && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  {cameraReadyFile.name} ({(cameraReadyFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Giấy phép bản quyền đã ký (Copyright Form) <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, 'copyright')}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {copyrightFile && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  {copyrightFile.name} ({(copyrightFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Các thay đổi bạn đã thực hiện trong bản Camera-Ready..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">checklist</span>
            Yêu cầu Camera-Ready
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
              <p className="text-sm text-slate-700">
                <strong>Format:</strong> Sử dụng template chính thức của hội nghị
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
              <p className="text-sm text-slate-700">
                <strong>Số trang:</strong> Tuân thủ giới hạn số trang (thường 6-8 trang)
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
              <p className="text-sm text-slate-700">
                <strong>Nội dung:</strong> Đã chỉnh sửa theo góp ý của reviewer (nếu có)
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
              <p className="text-sm text-slate-700">
                <strong>Bản quyền:</strong> Đã ký và scan giấy phép bản quyền
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-5 h-5 text-green-600 border-slate-300 rounded focus:ring-2 focus:ring-green-500"
            />
            <span className="text-sm text-slate-700">
              Tôi xác nhận rằng bản Camera-Ready đã được chuẩn bị theo đúng format yêu cầu,
              nội dung đã được chỉnh sửa theo góp ý của reviewer, và giấy phép bản quyền đã được ký hợp lệ.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={submitting || !cameraReadyFile || !copyrightFile || !confirmed}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <span className="animate-spin material-symbols-outlined">progress_activity</span>
                Đang nộp...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">send</span>
                Nộp Camera-Ready
              </>
            )}
          </button>
          <button
            onClick={() => navigate('/author/papers')}
            className="px-6 py-4 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
        </div>
      </main>
    </div>
  );
}
