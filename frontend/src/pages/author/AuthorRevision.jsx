import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function AuthorRevision() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [reviewRequests, setReviewRequests] = useState([]);
  const [revisionFile, setRevisionFile] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPaperAndReviews();
  }, [id]);

  const fetchPaperAndReviews = async () => {
    try {
      const [paperRes, reviewsRes] = await Promise.all([
        api.getPaperById(id),
        api.getReviewsByPaper(id)
      ]);
      setPaper(paperRes.data);
      
      // Extract review requests from reviews
      const requests = reviewsRes.data.flatMap((review, index) => 
        (review.comments || []).map((comment, cIndex) => ({
          id: `${index}-${cIndex}`,
          content: comment.content || comment,
          severity: comment.severity || (cIndex === 0 || cIndex === 1 ? 'critical' : 'minor')
        }))
      );
      setReviewRequests(requests);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size <= 10 * 1024 * 1024) { // 10MB limit
        setRevisionFile(file);
      } else {
        alert('File không được vượt quá 10MB');
      }
    } else {
      alert('Chỉ chấp nhận file PDF');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setRevisionFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!revisionFile) {
      alert('Vui lòng tải lên bản PDF đã chỉnh sửa');
      return;
    }
    if (!responseText.trim()) {
      alert('Vui lòng nhập giải trình các điểm sửa đổi');
      return;
    }
    if (!confirmed) {
      alert('Vui lòng xác nhận thông tin trước khi gửi');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', revisionFile);
      formData.append('response_to_reviewers', responseText);
      formData.append('paper_id', id);

      await api.submitRevision(id, formData);
      alert('Đã gửi bản chỉnh sửa thành công!');
      navigate(`/author/papers/${id}`);
    } catch (error) {
      console.error('Error submitting revision:', error);
      alert('Có lỗi xảy ra khi gửi bản chỉnh sửa. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const checkCoverage = () => {
    if (!responseText.trim()) {
      alert('Vui lòng nhập nội dung giải trình trước khi kiểm tra');
      return;
    }
    
    // Simple check for STT mentions
    const coveredRequests = reviewRequests.filter((req, index) => 
      responseText.includes(`${index + 1}`) || 
      responseText.includes(`STT ${index + 1}`) ||
      responseText.includes(`yêu cầu ${index + 1}`)
    );
    
    alert(`Bạn đã đề cập đến ${coveredRequests.length}/${reviewRequests.length} yêu cầu trong giải trình.`);
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

  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <span className="material-symbols-outlined text-6xl text-slate-300">description_off</span>
        <p className="text-slate-500">Không tìm thấy bài báo</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex flex-col gap-2">
        <nav className="flex text-sm text-slate-500 gap-2 items-center">
          <Link to="/author/papers" className="hover:text-primary">
            Bài báo của tôi
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-slate-900 font-medium">Nộp bản chỉnh sửa</span>
        </nav>
        <h1 className="text-slate-900 text-3xl font-black tracking-tight mt-2">
          Nộp Bản Chỉnh Sửa &amp; Giải Trình Phản Biện
        </h1>
        <p className="text-slate-500">
          Mã bài: <span className="font-mono font-bold text-primary">#{paper.id}</span> | Tiêu đề: {paper.title}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Review Requests Summary */}
          {reviewRequests.length > 0 && (
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">assignment_turned_in</span>
                  Tóm tắt yêu cầu từ Người phản biện
                </h3>
                <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-700 rounded uppercase">
                  Yêu cầu chỉnh sửa
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-4 font-bold text-slate-500 w-16 text-center">STT</th>
                      <th className="p-4 font-bold text-slate-500">Nội dung yêu cầu</th>
                      <th className="p-4 font-bold text-slate-500 w-32 text-center">Mức độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reviewRequests.map((request, index) => (
                      <tr key={request.id}>
                        <td className="p-4 text-center font-medium">{index + 1}</td>
                        <td className="p-4">{request.content}</td>
                        <td className="p-4 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            request.severity === 'critical' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {request.severity === 'critical' ? 'Quan trọng' : 'Nhỏ'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Upload Revised PDF */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">upload_file</span>
              Tải lên bản PDF đã chỉnh sửa
            </h3>
            <div 
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 group hover:border-primary transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary mb-2">
                cloud_upload
              </span>
              {revisionFile ? (
                <div className="text-center">
                  <p className="text-slate-900 font-medium">{revisionFile.name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {(revisionFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRevisionFile(null);
                    }}
                    className="mt-2 text-xs text-red-600 hover:underline"
                  >
                    Xóa file
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-slate-600 font-medium">
                    Kéo thả file vào đây hoặc <span className="text-primary">chọn từ máy tính</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Định dạng hỗ trợ: .pdf | Dung lượng tối đa: 10MB
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Response to Reviewers */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              Giải trình các điểm sửa đổi (Response to Reviewers)
            </h3>
            <textarea
              className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-900 p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
              placeholder="Nhập chi tiết các thay đổi bạn đã thực hiện dựa trên phản hồi của người phản biện..."
              rows="8"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              maxLength={2000}
            />
            <div className="mt-4 flex justify-between items-center">
              <p className="text-xs text-slate-500 italic">
                * Vui lòng ghi rõ mã yêu cầu (STT) khi giải trình.
              </p>
              <span className="text-xs text-slate-400">
                {responseText.length} / 2000 ký tự
              </span>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Assistant */}
          <div className="bg-blue-600 rounded-xl shadow-xl p-6 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-20">
              <span className="material-symbols-outlined text-8xl">auto_awesome</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined">psychology</span>
                AI Assistant
              </h3>
              <p className="text-sm text-blue-100 mb-6">
                Tôi có thể giúp bạn kiểm tra tính nhất quán giữa nội dung bản giải trình và các yêu cầu từ người phản biện.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={checkCoverage}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-3 px-4 rounded-lg flex items-center gap-3 transition-all text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-xl">fact_check</span>
                  Kiểm tra độ bao phủ yêu cầu
                </button>
                <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-3 px-4 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
                  <span className="material-symbols-outlined text-xl">spellcheck</span>
                  Soát lỗi định dạng &amp; chính tả
                </button>
              </div>
              
              {reviewRequests.length > 0 && (
                <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10 text-xs">
                  <div className="flex items-center gap-2 mb-2 text-blue-200">
                    <span className="material-symbols-outlined text-sm">info</span>
                    <span>Gợi ý hiện tại:</span>
                  </div>
                  <p className="leading-relaxed">
                    Bạn có {reviewRequests.length} yêu cầu cần giải trình. Đảm bảo đề cập đến từng yêu cầu bằng cách ghi rõ STT.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <input
                className="rounded text-primary focus:ring-primary border-slate-300"
                id="confirm"
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <label className="text-sm text-slate-600" htmlFor="confirm">
                Tôi xác nhận các thông tin trên là chính xác và tuân thủ quy định của hội nghị.
              </label>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={submitting || !revisionFile || !responseText.trim() || !confirmed}
              className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">send</span>
                  <span>Gửi bản chỉnh sửa</span>
                </>
              )}
            </button>
            
            <button 
              onClick={() => navigate(`/author/papers/${id}`)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Lưu bản nháp
            </button>
            
            {paper.revision_deadline && (
              <p className="text-[10px] text-center text-slate-400 mt-4 uppercase tracking-widest font-bold">
                Hạn chót: {new Date(paper.revision_deadline).toLocaleDateString('vi-VN')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
