import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PaperSubmitPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [conferences, setConferences] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [spellChecking, setSpellChecking] = useState(false);
  const [spellCheckResult, setSpellCheckResult] = useState(null);
  
  // Suggested keywords for quick selection
  const suggestedKeywords = [
    'Machine Learning', 'Artificial Intelligence', 'Deep Learning',
    'Natural Language Processing', 'Computer Vision', 'Data Mining',
    'Cloud Computing', 'Internet of Things', 'Blockchain',
    'Software Engineering', 'Cybersecurity', 'Big Data',
    'Neural Networks', 'Distributed Systems', 'Web Development'
  ];
  
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    conference_id: '',
    track_id: '',
    topics: [],
    file: null
  });

  useEffect(() => {
    fetchConferences();
  }, []);

  const fetchConferences = async () => {
    try {
      const response = await api.listConferences();
      console.log('Conferences response:', response.data); // Debug
      setConferences(response.data?.data?.conferences || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const addKeyword = (e) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!keywords.includes(keywordInput.trim())) {
        setKeywords([...keywords, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const addAuthor = () => {
    setAuthors([...authors, { name: '', email: '', affiliation: '', isCorresponding: false }]);
  };

  const removeAuthor = (index) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.title.trim()) {
        alert('Vui lòng nhập tiêu đề bài báo');
        setCurrentStep(1);
        return;
      }
      if (!formData.abstract.trim()) {
        alert('Vui lòng nhập tóm tắt');
        setCurrentStep(1);
        return;
      }
      if (keywords.length === 0) {
        alert('Vui lòng thêm ít nhất 1 từ khóa');
        setCurrentStep(1);
        return;
      }
      if (!formData.conference_id) {
        alert('Vui lòng chọn hội nghị');
        setCurrentStep(1);
        return;
      }
      if (authors.length === 0) {
        alert('Vui lòng thêm ít nhất 1 tác giả');
        setCurrentStep(2);
        return;
      }
      if (!formData.file) {
        alert('Vui lòng tải lên file PDF');
        setCurrentStep(4);
        return;
      }

      // Prepare FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('abstract', formData.abstract);
      submitData.append('keywords', keywords.join(', '));
      submitData.append('conference_id', formData.conference_id);
      if (formData.track_id) {
        submitData.append('track_id', formData.track_id);
      }
      submitData.append('authors', JSON.stringify(authors));
      submitData.append('file', formData.file);

      await api.submitPaper(submitData);
      alert('Nộp bài thành công!');
      navigate('/author/papers');
    } catch (err) {
      console.error('Submit error:', err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm text-slate-500">
          <span className="hover:text-blue-600 cursor-pointer">Trang chủ</span>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">Nộp bài báo mới</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Nộp Bài Báo Mới</h1>
          <p className="text-slate-500">Vui lòng điền đầy đủ thông tin bên dưới để gửi bài báo của bạn đến hội nghị.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-8 space-y-8">
            {/* Steps Progress */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-0"></div>
                
                {[1, 2, 3, 4].map((step) => (
                  <div 
                    key={step}
                    onClick={() => setCurrentStep(step)}
                    className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div className={`size-10 rounded-full flex items-center justify-center font-bold ring-4 ring-white transition-colors ${
                      currentStep >= step 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border-2 border-slate-300 text-slate-500 group-hover:border-blue-600 group-hover:text-blue-600'
                    }`}>
                      {step}
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap transition-colors ${
                      currentStep === step ? 'text-blue-600 font-bold' : 'text-slate-500'
                    }`}>
                      {['Thông tin chung', 'Tác giả', 'Phân ban & Chủ đề', 'Tải tệp'][step - 1]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
              {/* Step 1: Thông tin chung */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="material-symbols-outlined text-blue-600">article</span>
                    <h3 className="text-lg font-bold text-slate-900">Thông tin bài báo</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tiêu đề bài báo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3"
                      placeholder="Nhập tiêu đề đầy đủ của bài báo..."
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Tóm tắt (Abstract) <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!formData.abstract.trim()) {
                              alert('Vui lòng nhập nội dung tóm tắt trước khi kiểm tra');
                              return;
                            }
                            setSpellChecking(true);
                            setSpellCheckResult(null);
                            try {
                              // Call backend AI API for spell checking
                              const response = await api.spellCheck(formData.abstract, 'vi');
                              
                              if (response.data?.status === 'success') {
                                setSpellCheckResult(response.data.data);
                              } else {
                                alert('Lỗi khi kiểm tra chính tả: ' + (response.data?.message || 'Unknown error'));
                              }
                            } catch (err) {
                              console.error(err);
                              const errorMsg = err.response?.data?.message || err.message || 'Lỗi kết nối với server';
                              alert('Lỗi khi kiểm tra chính tả: ' + errorMsg);
                            } finally {
                              setSpellChecking(false);
                            }
                          }}
                          disabled={spellChecking}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {spellChecking ? 'progress_activity' : 'spellcheck'}
                          </span>
                          {spellChecking ? 'Đang kiểm tra...' : 'Kiểm tra AI'}
                        </button>
                        <span className="text-xs text-slate-400">Tối đa 300 từ</span>
                      </div>
                    </div>
                    <textarea
                      value={formData.abstract}
                      onChange={(e) => {
                        setFormData({ ...formData, abstract: e.target.value });
                        setSpellCheckResult(null);
                      }}
                      rows="6"
                      className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3"
                      placeholder="Tóm tắt nội dung chính, phương pháp và kết quả nghiên cứu..."
                    />
                    
                    {/* Spell Check Result */}
                    {spellCheckResult && (
                      <div className={`mt-2 p-3 rounded-lg border ${
                        spellCheckResult.issues === 0 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-sm ${
                            spellCheckResult.issues === 0 ? 'text-green-600' : 'text-yellow-600'
                          }">verified</span>
                          <span className="text-sm font-semibold ${
                            spellCheckResult.issues === 0 ? 'text-green-800' : 'text-yellow-800'
                          }">
                            {spellCheckResult.issues === 0 
                              ? '✓ Không phát hiện lỗi' 
                              : `⚠ Phát hiện ${spellCheckResult.issues} lỗi tiềm ẩn`}
                          </span>
                          <span className="ml-auto text-xs font-medium ${
                            spellCheckResult.issues === 0 ? 'text-green-600' : 'text-yellow-600'
                          }">
                            Điểm: {spellCheckResult.score}/100
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Số từ: {spellCheckResult.wordCount} | 
                          {spellCheckResult.issues === 0 
                            ? ' Văn bản đạt tiêu chuẩn' 
                            : ' Hãy xem lại các từ được highlight'}
                        </p>
                        {spellCheckResult.suggestions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {spellCheckResult.suggestions.map((s, i) => (
                              <div key={i} className="text-xs text-slate-700">
                                • <span className="line-through text-red-600">{s.word}</span> → 
                                <span className="text-green-600 font-medium ml-1">{s.suggestion}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Từ khóa (Keywords) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-slate-300 min-h-[46px] bg-white">
                      {keywords.map((keyword, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-sm text-blue-700 font-medium">
                          {keyword}
                          <button 
                            onClick={() => removeKeyword(keyword)}
                            className="ml-2 text-blue-400 hover:text-red-500"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={addKeyword}
                        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
                        placeholder="Nhập từ khóa và nhấn Enter..."
                      />
                    </div>
                    
                    {/* Suggested Keywords */}
                    <div className="mt-3">
                      <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">lightbulb</span>
                        Gợi ý từ khóa phổ biến (click để thêm):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedKeywords
                          .filter(sk => !keywords.includes(sk))
                          .slice(0, 8)
                          .map((keyword, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              if (!keywords.includes(keyword)) {
                                setKeywords([...keywords, keyword]);
                              }
                            }}
                            className="px-3 py-1 text-xs rounded-full border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
                          >
                            + {keyword}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Chọn hội nghị <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.conference_id}
                      onChange={(e) => setFormData({ ...formData, conference_id: e.target.value })}
                      className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 p-3"
                    >
                      <option value="">-- Chọn hội nghị --</option>
                      {conferences.map((conf) => (
                        <option key={conf.id} value={conf.id}>
                          {conf.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Tác giả */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600">group</span>
                      <h3 className="text-lg font-bold text-slate-900">Danh sách tác giả</h3>
                    </div>
                    <button
                      onClick={addAuthor}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                      Thêm tác giả
                    </button>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                    <div className="flex">
                      <span className="material-symbols-outlined text-blue-500 mr-3">info</span>
                      <p className="text-sm text-blue-700">
                        Vui lòng đảm bảo ít nhất một tác giả được chọn làm "Tác giả liên hệ".
                      </p>
                    </div>
                  </div>

                  {authors.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <span className="material-symbols-outlined text-6xl mb-4">person_add</span>
                      <p>Chưa có tác giả nào. Nhấn "Thêm tác giả" để bắt đầu.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {authors.map((author, index) => (
                        <div key={index} className="border border-slate-200 rounded-xl p-5 bg-slate-50">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold text-slate-800">Tác giả #{index + 1}</h4>
                            <button
                              onClick={() => removeAuthor(index)}
                              className="text-red-500 hover:bg-red-50 p-1 rounded"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Họ và tên <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={author.name}
                                onChange={(e) => {
                                  const newAuthors = [...authors];
                                  newAuthors[index].name = e.target.value;
                                  setAuthors(newAuthors);
                                }}
                                className="w-full rounded-md border-slate-300 text-sm p-2"
                                placeholder="Ví dụ: Nguyễn Văn B"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Email <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="email"
                                value={author.email}
                                onChange={(e) => {
                                  const newAuthors = [...authors];
                                  newAuthors[index].email = e.target.value;
                                  setAuthors(newAuthors);
                                }}
                                className="w-full rounded-md border-slate-300 text-sm p-2"
                                placeholder="email@example.com"
                              />
                            </div>
                            
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Đơn vị công tác <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={author.affiliation}
                                onChange={(e) => {
                                  const newAuthors = [...authors];
                                  newAuthors[index].affiliation = e.target.value;
                                  setAuthors(newAuthors);
                                }}
                                className="w-full rounded-md border-slate-300 text-sm p-2"
                                placeholder="Ví dụ: Trường Đại học Giao thông Vận tải TP.HCM"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={author.isCorresponding}
                                  onChange={(e) => {
                                    const newAuthors = [...authors];
                                    newAuthors[index].isCorresponding = e.target.checked;
                                    setAuthors(newAuthors);
                                  }}
                                  className="rounded border-slate-300 text-blue-600"
                                />
                                <span className="text-sm text-slate-700">Tác giả liên hệ (Corresponding Author)</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Phân ban & Chủ đề */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="material-symbols-outlined text-blue-600">category</span>
                    <h3 className="text-lg font-bold text-slate-900">Chọn Phân ban & Chủ đề</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Phân ban (Track) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.track_id}
                      onChange={(e) => setFormData({ ...formData, track_id: e.target.value })}
                      className="w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 p-3"
                    >
                      <option value="">-- Chọn Phân ban --</option>
                      <option value="1">Khoa học máy tính (Computer Science)</option>
                      <option value="2">Kỹ thuật phần mềm (Software Engineering)</option>
                      <option value="3">Hệ thống thông tin (Information Systems)</option>
                      <option value="4">Mạng máy tính & Truyền thông (Networks)</option>
                    </select>
                    <p className="mt-2 text-xs text-slate-500">
                      Chọn phân ban phù hợp giúp bài báo được phân công cho đúng hội đồng phản biện chuyên môn.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Chủ đề (Topics) <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded font-medium">
                        Đã chọn: {formData.topics.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 max-h-[400px] overflow-y-auto">
                      {['Artificial Intelligence', 'Machine Learning', 'Data Science', 'Cloud Computing', 'Blockchain', 'IoT'].map((topic) => (
                        <label key={topic} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-200 hover:border-blue-500 cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            checked={formData.topics.includes(topic)}
                            onChange={(e) => {
                              const newTopics = e.target.checked
                                ? [...formData.topics, topic]
                                : formData.topics.filter(t => t !== topic);
                              setFormData({ ...formData, topics: newTopics });
                            }}
                            className="mt-1 rounded border-slate-300 text-blue-600"
                          />
                          <div>
                            <span className="block text-sm font-medium text-slate-700">{topic}</span>
                            <span className="text-xs text-slate-500">Chủ đề liên quan</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Tải tệp */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="space-y-4 mb-8">
                    {[
                      { title: 'Thông tin chung', desc: 'Tiêu đề, Tóm tắt, Từ khóa', step: 1 },
                      { title: 'Danh sách tác giả', desc: `${authors.length} tác giả`, step: 2 },
                      { title: 'Phân ban & Chủ đề', desc: formData.track_id ? 'Đã chọn' : 'Chưa chọn', step: 3 }
                    ].map((item) => (
                      <div key={item.step} className="flex items-center justify-between py-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-green-500">check_circle</span>
                          <div>
                            <h3 className="text-sm font-bold text-slate-700">{item.title}</h3>
                            <p className="text-xs text-slate-500">{item.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setCurrentStep(item.step)}
                          className="text-xs text-blue-600 font-bold uppercase hover:bg-blue-50 px-3 py-1.5 rounded transition-colors"
                        >
                          Sửa
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* File Upload */}
                  <div className="flex items-center gap-3 pb-2">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-blue-50 text-blue-600">
                      <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Tải tệp bài báo</h3>
                      <p className="text-sm text-slate-500">Vui lòng tải lên bản thảo chính (PDF).</p>
                    </div>
                  </div>

                  <div className="relative group">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="p-8 border-2 border-dashed border-blue-300 group-hover:border-blue-600 rounded-xl bg-slate-50 group-hover:bg-blue-50 transition-all text-center">
                      <div className="size-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl text-blue-600">upload_file</span>
                      </div>
                      {formData.file ? (
                        <div>
                          <p className="text-sm font-semibold text-slate-900 mb-1">{formData.file.name}</p>
                          <p className="text-xs text-slate-500">Nhấn để thay đổi file</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-semibold text-slate-900 mb-1">Kéo thả file PDF vào đây</p>
                          <p className="text-xs text-slate-500">hoặc nhấn để chọn file (Tối đa 10MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-200 mt-8">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Quay lại
                </button>

                {currentStep < 4 ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                  >
                    Tiếp tục
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">send</span>
                    Nộp bài
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
              <h3 className="font-bold text-slate-900 mb-4">Hướng dẫn nộp bài</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-lg">check_circle</span>
                  <span>Đảm bảo file PDF không quá 10MB</span>
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-lg">check_circle</span>
                  <span>Điền đầy đủ thông tin tác giả</span>
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-lg">check_circle</span>
                  <span>Chọn ít nhất 3 từ khóa liên quan</span>
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-lg">check_circle</span>
                  <span>Tóm tắt không quá 300 từ</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
};

export default PaperSubmitPage;





