// File: Frontend/src/pages/AuthorDashboard.jsx
import { useState, useEffect } from 'react';
import { Layout, Card, Button, Tag, message, Empty } from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  DownloadOutlined,
  LogoutOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthorDashboard.css';

const { Header, Content } = Layout;

const AuthorDashboard = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-papers');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!token) {
      message.error('Vui lòng đăng nhập!');
      navigate('/login');
      return;
    }
    fetchMyPapers();
  }, []);

  const fetchMyPapers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/papers/mine`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        setPapers(response.data.data.papers || []);
      }
    } catch (error) {
      console.error('Fetch papers error:', error);
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập hết hạn!');
        navigate('/login');
      } else {
        message.error('Không thể tải danh sách bài báo');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.success('Đăng xuất thành công!');
    navigate('/login');
  };

  const getStatusTag = (status) => {
    const statusMap = {
      'Pending': { color: 'orange', icon: <ClockCircleOutlined />, text: 'Đang phản biện' },
      'Accepted': { color: 'green', icon: <CheckCircleOutlined />, text: 'Chấp nhận' },
      'Rejected': { color: 'red', icon: <CloseCircleOutlined />, text: 'Bản nháp' },
      'Withdrawn': { color: 'default', icon: <CloseCircleOutlined />, text: 'Đã rút' }
    };

    const statusInfo = statusMap[status] || statusMap['Pending'];
    
    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon} className="status-tag">
        {statusInfo.text}
      </Tag>
    );
  };

  return (
    <Layout className="dashboard-layout">
      {/* Header */}
      <Header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <BookOutlined />
          </div>
          <div className="logo-text">
            <h2>UTH-ConfMS</h2>
            <span>Tác giả</span>
          </div>
        </div>

        <div className="header-right">
          <div className="user-info">
            <span className="user-name">{user.fullname || user.FullName || 'Người dùng'}</span>
            <span className="user-email">{user.email || user.Email}</span>
          </div>
          <Button 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            className="logout-btn"
          >
            Đăng xuất
          </Button>
        </div>
      </Header>

      {/* Content */}
      <Content className="dashboard-content">
        <div className="content-wrapper">
          {/* Tabs */}
          <div className="tabs-container">
            <Button
              type={activeTab === 'my-papers' ? 'primary' : 'text'}
              onClick={() => setActiveTab('my-papers')}
              className="tab-button"
            >
              Bài báo của tôi
            </Button>
            <Button
              type={activeTab === 'submit-new' ? 'primary' : 'text'}
              onClick={() => setActiveTab('submit-new')}
              className="tab-button"
            >
              Nộp bài mới
            </Button>
            <Button
              type={activeTab === 'accepted' ? 'primary' : 'text'}
              onClick={() => setActiveTab('accepted')}
              className="tab-button"
            >
              Bài được chấp nhận
            </Button>
          </div>

          {/* Tab: Bài báo của tôi */}
          {activeTab === 'my-papers' && (
            <div className="papers-section">
              <div className="section-header">
                <h3>Danh sách bài báo</h3>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setActiveTab('submit-new')}
                  size="large"
                >
                  Nộp bài mới
                </Button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</div>
              ) : papers.length === 0 ? (
                <Empty 
                  description="Bạn chưa có bài báo nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button type="primary" onClick={() => setActiveTab('submit-new')}>
                    Nộp bài báo đầu tiên
                  </Button>
                </Empty>
              ) : (
                <div className="papers-list">
                  {papers.map((paper) => (
                    <Card key={paper.id} className="paper-card">
                      <div className="paper-header">
                        <h4 className="paper-title">{paper.title || paper.Title}</h4>
                        {getStatusTag(paper.status || paper.Status)}
                      </div>

                      <div className="paper-meta">
                        <span>Hội nghị: {paper.conference_name || 'UTH Scientific Conference 2025'}</span>
                        <span>•</span>
                        <span>Tiểu ban: {paper.track_name || 'Artificial Intelligence'}</span>
                        {paper.submitteddate && (
                          <>
                            <span>•</span>
                            <span>Ngày nộp: {new Date(paper.submitteddate).toLocaleDateString('vi-VN')}</span>
                          </>
                        )}
                      </div>

                      {paper.authors && (
                        <div className="paper-authors">
                          Đồng tác giả: {paper.authors}
                        </div>
                      )}

                      <div className="paper-actions">
                        <Button icon={<EyeOutlined />} type="link">
                          Xem chi tiết
                        </Button>
                        <Button icon={<DownloadOutlined />} type="link">
                          Nộp bản hoàn chỉnh
                        </Button>
                        {(paper.status === 'Pending' || paper.status === 'Rejected') && (
                          <>
                            <Button icon={<EditOutlined />} type="link">
                              Chỉnh sửa
                            </Button>
                            <Button icon={<DeleteOutlined />} type="link" danger>
                              Xóa
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Nộp bài mới */}
          {activeTab === 'submit-new' && (
            <div className="submit-section">
              <Card>
                <h3>Nộp bài báo mới</h3>
                <p style={{ color: '#8c8c8c', marginBottom: 24 }}>
                  Tính năng này đang được phát triển...
                </p>
                <Button type="default" onClick={() => setActiveTab('my-papers')}>
                  ← Quay lại danh sách
                </Button>
              </Card>
            </div>
          )}

          {/* Tab: Bài được chấp nhận */}
          {activeTab === 'accepted' && (
            <div className="accepted-section">
              <Card>
                <h3>Bài báo được chấp nhận</h3>
                {papers.filter(p => p.status === 'Accepted').length === 0 ? (
                  <Empty description="Chưa có bài báo nào được chấp nhận" />
                ) : (
                  <div className="papers-list">
                    {papers.filter(p => p.status === 'Accepted').map((paper) => (
                      <Card key={paper.id} className="paper-card accepted-paper">
                        <div className="paper-header">
                          <h4 className="paper-title">{paper.title}</h4>
                          {getStatusTag('Accepted')}
                        </div>
                        <p style={{ color: '#52c41a', margin: '16px 0' }}>
                          Bài báo của bạn đã được chấp nhận. Vui lòng nộp bản hoàn chỉnh (camera-ready) 
                          trước ngày 15/01/2025. Bản hoàn chỉnh cần tuân thủ các góp ý từ người phản biện.
                        </p>
                        <div className="paper-actions">
                          <Button icon={<DownloadOutlined />} type="primary">
                            Nộp bản hoàn chỉnh
                          </Button>
                          <Button icon={<EyeOutlined />} type="link">
                            Xem nhận xét phản biện
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default AuthorDashboard;