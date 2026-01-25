import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ChairAssignments() {
  const { id } = useParams(); // paper_id from URL or null for bulk assignment
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExpertise, setFilterExpertise] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const promises = [api.listUsers({ role: 'reviewer' })];
      if (id) {
        promises.push(api.getPaperById(id));
      }
      
      const [reviewersRes, paperRes] = await Promise.all(promises);
      setReviewers(reviewersRes.data?.users || []);
      if (paperRes) {
        setPaper(paperRes.data);
        // Mock AI suggestions based on paper keywords
        generateAiSuggestions(paperRes.data, reviewersRes.data?.users || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAiSuggestions = (paper, allReviewers) => {
    // Mock AI suggestion scoring
    const suggestions = allReviewers.slice(0, 5).map((reviewer, index) => ({
      ...reviewer,
      matchScore: 95 - (index * 5),
      reasons: [
        'Chuyên gia về ' + (paper.keywords?.[0] || 'AI'),
        'Đã review ' + (15 - index * 2) + ' bài tương tự',
        'Tải công việc thấp (' + (3 + index) + ' bài)'
      ]
    }));
    setAiSuggestions(suggestions);
  };

  const handleToggleReviewer = (reviewerId) => {
    if (selectedReviewers.includes(reviewerId)) {
      setSelectedReviewers(selectedReviewers.filter(id => id !== reviewerId));
    } else {
      if (selectedReviewers.length < 3) {
        setSelectedReviewers([...selectedReviewers, reviewerId]);
      } else {
        alert('Tối đa 3 phản biện cho mỗi bài báo');
      }
    }
  };

  const handleSubmitAssignment = async () => {
    if (selectedReviewers.length === 0) {
      alert('Vui lòng chọn ít nhất 1 phản biện');
      return;
    }

    try {
      await api.assignReviewers({
        paper_id: id,
        reviewer_ids: selectedReviewers
      });
      alert('Phân công thành công!');
      navigate('/chair/papers');
    } catch (error) {
      console.error('Error assigning reviewers:', error);
      alert('Có lỗi xảy ra khi phân công');
    }
  };

  const filteredReviewers = reviewers.filter(reviewer => {
    const matchesSearch = !searchTerm || 
      reviewer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reviewer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExpertise = !filterExpertise || 
      reviewer.expertise?.includes(filterExpertise);
    return matchesSearch && matchesExpertise;
  });

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          {paper && (
            <div className="flex items-center gap-2 text-primary mb-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <button 
                onClick={() => navigate('/chair/papers')}
                className="text-sm font-semibold hover:underline"
              >
                Quay lại danh sách bài nộp
              </button>
            </div>
          )}
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Phân Công Phản Biện Thông Minh
          </h1>
          <p className="text-slate-500 text-base font-normal mt-2">
            Gán người phản biện phù hợp dựa trên AI Suggestion và kiểm soát khối lượng công việc.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium border border-slate-200">
            Đã chọn: <span className="text-primary font-bold">{selectedReviewers.length}/3</span>
          </div>
          <button 
            onClick={handleSubmitAssignment}
            disabled={selectedReviewers.length === 0}
            className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hoàn thành phân công
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar - Paper Info */}
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {paper && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">description</span>
                <h3 className="font-bold text-lg text-slate-900">Thông tin bài báo</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Mã bài</span>
                  <p className="font-mono text-primary font-bold">#{paper.id}</p>
                </div>
                
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Tiêu đề</span>
                  <p className="font-semibold text-slate-900 text-sm leading-snug">{paper.title}</p>
                </div>

                {paper.keywords && paper.keywords.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Từ khóa</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {paper.keywords.slice(0, 4).map((keyword, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Phân ban</span>
                  <p className="text-slate-700 font-medium">{paper.track?.name || 'Chưa phân ban'}</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-2xl">psychology</span>
                <h3 className="font-bold text-lg">AI Suggestions</h3>
              </div>
              
              <p className="text-purple-100 text-sm mb-4">
                Dựa trên phân tích từ khóa, lịch sử review và khối lượng công việc
              </p>

              <div className="space-y-3">
                {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                  <div key={suggestion.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer border border-white/20">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="size-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{suggestion.full_name}</p>
                          <p className="text-xs text-purple-100">{suggestion.organization || suggestion.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black">{suggestion.matchScore}%</div>
                        <div className="text-[10px] text-purple-100">Match</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-1">
                      {suggestion.reasons.map((reason, rIndex) => (
                        <div key={rIndex} className="flex items-center gap-2 text-xs text-purple-100">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleToggleReviewer(suggestion.id)}
                      disabled={selectedReviewers.length >= 3 && !selectedReviewers.includes(suggestion.id)}
                      className="mt-3 w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                    >
                      {selectedReviewers.includes(suggestion.id) ? 'Đã chọn ✓' : 'Chọn'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content - Reviewer List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search & Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              
              <select
                value={filterExpertise}
                onChange={(e) => setFilterExpertise(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
              >
                <option value="">Tất cả lĩnh vực</option>
                <option value="AI">Trí tuệ nhân tạo</option>
                <option value="Data Science">Khoa học dữ liệu</option>
                <option value="Software Engineering">Công nghệ phần mềm</option>
                <option value="IoT">Internet of Things</option>
              </select>
            </div>
          </div>

          {/* Reviewer Cards */}
          <div className="space-y-4">
            {filteredReviewers.map((reviewer) => {
              const isSelected = selectedReviewers.includes(reviewer.id);
              const workload = reviewer.assigned_papers || Math.floor(Math.random() * 8);
              
              return (
                <div
                  key={reviewer.id}
                  className={`bg-white rounded-xl border-2 p-6 transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-primary bg-blue-50/50 shadow-lg' 
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                  onClick={() => handleToggleReviewer(reviewer.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {reviewer.full_name?.[0] || 'R'}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900">{reviewer.full_name}</h3>
                        <p className="text-sm text-slate-500">{reviewer.email}</p>
                        <p className="text-sm text-slate-600 mt-1">{reviewer.organization || 'Đại học GTVT TP.HCM'}</p>
                        
                        {reviewer.expertise && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {reviewer.expertise.split(',').slice(0, 3).map((exp, index) => (
                              <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                                {exp.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right space-y-3">
                      <div className={`px-4 py-2 rounded-lg ${
                        workload <= 3 ? 'bg-green-50 text-green-700' :
                        workload <= 6 ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        <div className="text-xs font-medium">Khối lượng</div>
                        <div className="text-2xl font-black">{workload}</div>
                        <div className="text-[10px]">bài đang review</div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleReviewer(reviewer.id);
                        }}
                        disabled={selectedReviewers.length >= 3 && !isSelected}
                        className={`w-full py-2 px-4 rounded-lg font-bold transition-all ${
                          isSelected
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isSelected ? 'Đã chọn ✓' : 'Chọn'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredReviewers.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <span className="material-symbols-outlined text-6xl mb-4">person_search</span>
                <p>Không tìm thấy phản biện nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
