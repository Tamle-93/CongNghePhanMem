import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const GlobalSearch = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ papers: [], conferences: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, papers, conferences, users
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // Open with Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search with debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults({ papers: [], conferences: [], users: [] });
      return;
    }

    const delaySearch = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.globalSearch(query);
        setResults(response.data || { papers: [], conferences: [], users: [] });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [query]);

  const handleResultClick = (type, item) => {
    setIsOpen(false);
    setQuery('');
    
    if (type === 'paper') {
      navigate(`/author/papers/${item.id}`);
    } else if (type === 'conference') {
      navigate(`/conferences/${item.id}`);
    } else if (type === 'user') {
      navigate(`/profile/${item.id}`);
    }
  };

  const getTotalResults = () => {
    return results.papers.length + results.conferences.length + results.users.length;
  };

  const getFilteredResults = () => {
    if (activeTab === 'all') return results;
    if (activeTab === 'papers') return { papers: results.papers, conferences: [], users: [] };
    if (activeTab === 'conferences') return { papers: [], conferences: results.conferences, users: [] };
    if (activeTab === 'users') return { papers: [], conferences: [], users: results.users };
    return results;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors text-sm"
      >
        <span className="material-symbols-outlined text-lg">search</span>
        <span>Tìm kiếm...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">
          <span>Ctrl</span>+<span>K</span>
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
      <div
        ref={modalRef}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn"
      >
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-2xl">
              search
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm bài báo, hội nghị, người dùng..."
              className="w-full pl-14 pr-24 py-4 text-lg bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-xl outline-none transition-colors"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              ESC
            </button>
          </div>
        </div>

        {/* Tabs */}
        {query.length >= 2 && getTotalResults() > 0 && (
          <div className="flex gap-2 px-4 pt-4 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({getTotalResults()})
            </button>
            {results.papers.length > 0 && (
              <button
                onClick={() => setActiveTab('papers')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'papers'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Bài báo ({results.papers.length})
              </button>
            )}
            {results.conferences.length > 0 && (
              <button
                onClick={() => setActiveTab('conferences')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'conferences'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Hội nghị ({results.conferences.length})
              </button>
            )}
            {results.users.length > 0 && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'users'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Người dùng ({results.users.length})
              </button>
            )}
          </div>
        )}

        {/* Results */}
        <div className="max-h-[500px] overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : query.length < 2 ? (
            <div className="text-center py-12 text-slate-500">
              <span className="material-symbols-outlined text-6xl mb-3 block text-slate-300">search</span>
              <p className="text-sm">Nhập ít nhất 2 ký tự để tìm kiếm</p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs">Bài báo</span>
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs">Hội nghị</span>
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs">Người dùng</span>
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs">Từ khóa</span>
              </div>
            </div>
          ) : getTotalResults() === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <span className="material-symbols-outlined text-6xl mb-3 block text-slate-300">search_off</span>
              <p className="text-sm">Không tìm thấy kết quả cho "{query}"</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Papers */}
              {getFilteredResults().papers.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 px-2">Bài báo</h3>
                  <div className="space-y-2">
                    {getFilteredResults().papers.map((paper) => (
                      <div
                        key={paper.id}
                        onClick={() => handleResultClick('paper', paper)}
                        className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                            <span className="material-symbols-outlined text-lg">description</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {paper.title}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{paper.abstract}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                              <span>{paper.authors}</span>
                              <span>•</span>
                              <span className={`px-2 py-0.5 rounded ${
                                paper.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                paper.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                paper.status === 'under_review' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {paper.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conferences */}
              {getFilteredResults().conferences.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 px-2">Hội nghị</h3>
                  <div className="space-y-2">
                    {getFilteredResults().conferences.map((conf) => (
                      <div
                        key={conf.id}
                        onClick={() => handleResultClick('conference', conf)}
                        className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shrink-0">
                            <span className="material-symbols-outlined text-lg">event</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {conf.name}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1">{conf.location} • {conf.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {getFilteredResults().users.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 px-2">Người dùng</h3>
                  <div className="space-y-2">
                    {getFilteredResults().users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleResultClick('user', user)}
                        className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                            {user.full_name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {user.full_name}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1">{user.email}</p>
                            <span className="text-xs text-blue-600 mt-1 inline-block">{user.role}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Material Symbols Icons */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
};

export default GlobalSearch;
