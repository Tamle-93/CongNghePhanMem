import React, { useState, useEffect } from 'react';
import { Layout, Tabs, Card, Button, Typography, Space, Form, Input, Select, Upload, List, Empty, Row, Col, Avatar } from 'antd';
import { 
  BookOutlined, LogoutOutlined, PlusOutlined, 
  InboxOutlined, DeleteOutlined, UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;
const { TextArea } = Input;

const AuthorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('1');
  const [user, setUser] = useState({ fullname: '', email: '' });
  const [myPapers, setMyPapers] = useState([]); // Dữ liệu rỗng

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // --- COMPONENT CON: KHUNG CĂN GIỮA (Dùng chung cho cả 3 Tab) ---
  const CenteredContainer = ({ children, title }) => (
    <div style={{ 
      maxWidth: '900px',      // Giới hạn chiều rộng (không tràn ra 2 bên)
      margin: '0 auto',       // CĂN GIỮA MÀN HÌNH
      backgroundColor: '#fff',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      {title && <Title level={3} style={{ textAlign: 'center', marginBottom: 30 }}>{title}</Title>}
      {children}
    </div>
  );

  // --- TAB 1: DANH SÁCH BÀI BÁO ---
  const MyPapersTab = () => (
    <CenteredContainer title="Danh sách bài báo của tôi">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setActiveTab('2')}>
          Nộp bài mới
        </Button>
      </div>

      {myPapers.length === 0 ? (
        <Empty 
            description="Bạn chưa nộp bài báo nào." 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      ) : (
        <List dataSource={myPapers} renderItem={item => <List.Item>{item.title}</List.Item>} />
      )}
    </CenteredContainer>
  );

  // --- TAB 2: NỘP BÀI MỚI ---
  const SubmitPaperTab = () => (
    <CenteredContainer title="Nộp bài báo mới">
        <Form layout="vertical" size="large">
          <Form.Item label="Hội nghị" name="conference" required>
            <Select placeholder="Chọn hội nghị">
              <Option value="conf2025">UTH Scientific Conference 2025</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Tiểu ban" name="track" required>
            <Select placeholder="Chọn tiểu ban">
              <Option value="ai">Artificial Intelligence</Option>
              <Option value="se">Software Engineering</Option>
              <Option value="iot">Internet of Things</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Tiêu đề bài báo" name="title" required>
            <Input placeholder="Nhập tiêu đề bài báo..." />
          </Form.Item>

          <Form.Item label="Tóm tắt (Abstract)" name="abstract" required>
            <TextArea rows={5} placeholder="Nhập tóm tắt bài báo (150-250 từ)..." />
          </Form.Item>

          <Form.Item label="Từ khóa" name="keywords" required>
            <Input placeholder="Ví dụ: machine learning, healthcare..." />
          </Form.Item>

          <Form.Item label="Đồng tác giả" style={{ marginBottom: 10 }}>
            <Form.List name="coAuthors">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={10} style={{ marginBottom: 10 }}>
                      <Col span={11}><Form.Item {...restField} name={[name, 'name']} noStyle><Input placeholder="Tên" /></Form.Item></Col>
                      <Col span={11}><Form.Item {...restField} name={[name, 'email']} noStyle><Input placeholder="Email" /></Form.Item></Col>
                      <Col span={2}><Button type="text" danger onClick={() => remove(name)} icon={<DeleteOutlined />} /></Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm đồng tác giả</Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item label="Tải lên bản PDF" required>
            <Dragger style={{ background: '#fafafa', border: '1px dashed #d9d9d9' }}>
              <p className="ant-upload-drag-icon"><InboxOutlined style={{ color: '#1890ff' }} /></p>
              <p className="ant-upload-text">Kéo thả file PDF hoặc click để chọn</p>
              <p className="ant-upload-hint">Dung lượng tối đa: 10MB</p>
            </Dragger>
          </Form.Item>

          <div style={{ marginTop: 30, textAlign: 'center' }}>
            <Space size="large">
                <Button size="large" style={{ width: 140 }}>Lưu nháp</Button>
                <Button type="primary" size="large" style={{ width: 140 }}>Nộp bài</Button>
            </Space>
          </div>
        </Form>
    </CenteredContainer>
  );

  // --- TAB 3: BÀI ĐƯỢC CHẤP NHẬN ---
  const AcceptedTab = () => (
    <CenteredContainer title="Bài báo được chấp nhận">
       <Empty 
            description="Chưa có bài báo nào được chấp nhận." 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
       />
    </CenteredContainer>
  );

  // --- CSS STYLES ---
  const styles = {
    layout: { minHeight: '100vh', backgroundColor: '#f0f2f5' },
    header: {
      position: 'fixed', 
      top: 0, 
      left: 0,
      width: '100%', 
      height: 70, // Header cao 70px
      zIndex: 1000, 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      backgroundColor: 'white', 
      padding: '0 30px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    content: {
      marginTop: 90, // Đẩy nội dung xuống 90px (Lớn hơn chiều cao Header) -> KHÔNG BAO GIỜ BỊ CHE
      padding: '0 20px 40px 20px', // Padding xung quanh
      display: 'flex',
      justifyContent: 'center' // Căn giữa Tabs
    },
    tabs: {
      width: '100%',
      maxWidth: '900px' // Tabs cũng chỉ rộng tối đa 900px cho đồng bộ
    }
  };

  return (
    <Layout style={styles.layout}>
      {/* HEADER CỐ ĐỊNH */}
      <Header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, background: '#1890ff', borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <BookOutlined style={{ color: 'white', fontSize: 22 }} />
          </div>
          <div>
             <Title level={4} style={{ margin: 0, color: '#003a8c', lineHeight: 1.2 }}>UTH-ConfMS</Title>
             <Text type="secondary" style={{ fontSize: 12 }}>Hệ thống quản lý</Text>
          </div>
        </div>
        
        <Space size="middle">
           <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
              <Text strong style={{ display: 'block' }}>{user.fullname || 'Loading...'}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{user.email}</Text>
           </div>
           <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
           <Button icon={<LogoutOutlined />} onClick={handleLogout}>Thoát</Button>
        </Space>
      </Header>

      {/* NỘI DUNG CHÍNH */}
      <Content style={styles.content}>
        <Tabs 
          style={styles.tabs}
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
          type="line"
          items={[
            { key: '1', label: 'Bài báo của tôi', children: <MyPapersTab /> },
            { key: '2', label: 'Nộp bài mới', children: <SubmitPaperTab /> },
            { key: '3', label: 'Bài được chấp nhận', children: <AcceptedTab /> },
          ]}
        />
      </Content>
    </Layout>
  );
};

export default AuthorDashboard;