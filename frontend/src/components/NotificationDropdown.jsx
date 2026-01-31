import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Try to get real notifications first
      let notifs = [];
      try {
        const response = await api.getNotifications();
        notifs = response.data?.notifications || response.data?.data?.notifications || [];
      } catch {
        // If no notification API, generate from papers/conferences
        notifs = [];
      }
      
      // If no real notifications, generate from user's papers and conferences
      if (notifs.length === 0) {
        try {
          const [papersRes, conferencesRes] = await Promise.all([
            api.listPapers().catch(() => ({ data: { data: { papers: [] } } })),
            api.listConferences().catch(() => ({ data: { data: { conferences: [] } } }))
          ]);
          
          const papers = papersRes.data?.data?.papers || papersRes.data?.papers || [];
          const conferences = conferencesRes.data?.data?.conferences || conferencesRes.data?.conferences || [];
          
          // Generate notifications from papers
          papers.slice(0, 5).forEach((paper, index) => {
            if (paper.status === 'accepted') {
              notifs.push({
                id: `paper-accepted-${paper.id}`,
                type: 'decision_made',
                title: 'Bài báo được chấp nhận!',
                message: `"${paper.title}" đã được chấp nhận đăng.`,
                created_at: paper.updated_at || paper.created_at,
                is_read: index > 0,
                link: `/author/papers/${paper.id}`
              });
            } else if (paper.status === 'rejected') {
              notifs.push({
                id: `paper-rejected-${paper.id}`,
                type: 'decision_made',
                title: 'Kết quả phản biện',
                message: `"${paper.title}" không được chấp nhận.`,
                created_at: paper.updated_at || paper.created_at,
                is_read: index > 0,
                link: `/author/papers/${paper.id}`
              });
            } else if (paper.status === 'under_review') {
              notifs.push({
                id: `paper-review-${paper.id}`,
                type: 'review_assigned',
                title: 'Bài báo đang được phản biện',
                message: `"${paper.title}" đã được gửi tới phản biện.`,
                created_at: paper.updated_at || paper.created_at,
                is_read: true,
                link: `/author/papers/${paper.id}`
              });
            } else if (paper.status === 'submitted' || paper.status === 'pending') {
              notifs.push({
                id: `paper-submitted-${paper.id}`,
                type: 'paper_submitted',
                title: 'Nộp bài thành công',
                message: `"${paper.title}" đã được nộp.`,
                created_at: paper.created_at,
                is_read: true,
                link: `/author/papers/${paper.id}`
              });
            }
          });
          
          // Add deadline reminders for upcoming conferences
          const now = new Date();
          conferences.forEach((conf) => {
            if (conf.submission_deadline) {
              const deadline = new Date(conf.submission_deadline);
              const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
              
              if (daysLeft > 0 && daysLeft <= 7) {
                notifs.push({
                  id: `deadline-${conf.id || conf.conference_id}`,
                  type: 'deadline_reminder',
                  title: `Sắp hết hạn nộp bài!`,
                  message: `${conf.name}: Còn ${daysLeft} ngày để nộp bài.`,
                  created_at: new Date().toISOString(),
                  is_read: daysLeft > 3,
                  link: '/conferences'
                });
              }
            }
          });
          
          // Sort by created_at desc
          notifs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } catch (err) {
          console.error('Error generating notifications:', err);
        }
      }
      
      setNotifications(notifs.slice(0, 10)); // Limit to 10
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setIsOpen(false);
    
    // Navigate based on notification type
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      paper_submitted: 'description',
      review_assigned: 'assignment',
      review_completed: 'check_circle',
      decision_made: 'gavel',
      deadline_reminder: 'alarm',
      message: 'mail',
      system: 'info'
    };
    return icons[type] || 'notifications';
  };

  const getNotificationColor = (type) => {
    const colors = {
      paper_submitted: 'bg-blue-100 text-blue-600',
      review_assigned: 'bg-orange-100 text-orange-600',
      review_completed: 'bg-green-100 text-green-600',
      decision_made: 'bg-purple-100 text-purple-600',
      deadline_reminder: 'bg-red-100 text-red-600',
      message: 'bg-blue-100 text-blue-600',
      system: 'bg-slate-100 text-slate-600'
    };
    return colors[type] || 'bg-slate-100 text-slate-600';
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return time.toLocaleDateString('vi-VN');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <span className="material-symbols-outlined text-2xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[600px] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Thông báo</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Đánh dấu đã đọc tất cả
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <span className="material-symbols-outlined text-6xl mb-3 block text-slate-300">notifications_off</span>
                <p className="text-sm">Chưa có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)} shrink-0 h-fit`}>
                        <span className="material-symbols-outlined text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`text-sm font-semibold ${!notification.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1"></div>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 mb-1">
                          {notification.message}
                        </p>
                        <span className="text-xs text-slate-400">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Material Symbols Icons */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
};

export default NotificationDropdown;
