import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Select } from 'antd';
import { LockOutlined, MailOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient'; // Đảm bảo đã import file này

const { Title, Text } = Typography;
const { Option } = Select;

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    message.loading({ content: 'Đang kết nối Database...', key: 'login' });

    try {
        // --- GỌI API THẬT XUỐNG BACKEND ---
        const response = await axiosClient.post('/api/auth/login', values);
        
        // Nếu Backend trả về success
        if (response.data.status === 'success') {
            const { token, user } = response.data.data;
            
            // Lưu Token thật vào máy
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            message.success({ content: 'Đăng nhập thành công!', key: 'login' });
            
            // Chuyển trang theo vai trò
            if (user.role === 'Author') navigate('/author-dashboard');
            else if (user.role === 'Reviewer') navigate('/reviewer-dashboard');
            else navigate('/');
        }
    } catch (error) {
        // Nếu nhập sai -> Backend trả lỗi 401 -> Nhảy vào đây
        const errorMsg = error.response?.data?.message || 'Lỗi kết nối Server!';
        message.error({ content: errorMsg, key: 'login' });
    } finally {
        setLoading(false);
    }
  };

  // ... (Phần CSS styles giữ nguyên như cũ vì bạn đã ưng ý layout) ...
  const styles = {
    container: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f5ff', zIndex: 1000 },
    card: { width: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: '12px', padding: '20px' },
    header: { textAlign: 'center', marginBottom: 25 },
    logoContainer: { display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: 56, height: 56, backgroundColor: '#1890ff', borderRadius: '50%', marginBottom: 15 },
    logoIcon: { fontSize: 28, color: 'white' },
    link: { color: '#1890ff', fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }
  };

  return (
    <div style={styles.container}>
      <Card style={styles.card} bordered={false}>
        <div style={styles.header}>
          <div style={styles.logoContainer}><BookOutlined style={styles.logoIcon} /></div>
          <Title level={4} style={{ marginBottom: 5 }}>UTH-ConfMS</Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>Hệ thống Quản lý Hội nghị</Text>
        </div>

        <Form name="login_form" onFinish={onFinish} layout="vertical" size="large" initialValues={{ role: 'Author' }}>
          
          <Form.Item name="email" rules={[{ required: true, message: 'Nhập Email!' }]}>
            <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} placeholder="Email đăng nhập" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Nhập mật khẩu!' }]}>
            <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Mật khẩu" />
          </Form.Item>

          <div style={{ marginBottom: 20 }}>
            <Text style={{ color: '#595959', fontSize: '13px' }}>Đăng nhập với vai trò:</Text>
            <Form.Item name="role" style={{ marginBottom: 0, marginTop: 5 }}>
              <Select>
                <Option value="Author">Tác giả (Author)</Option>
                <Option value="Reviewer">Phản biện (Reviewer)</Option>
                <Option value="Chair">Chủ trì (Chair)</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ height: '40px', fontWeight: 500 }}>
              Đăng nhập
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/forgot-password" style={styles.link}>Quên mật khẩu?</Link>
            <span style={{ margin: '0 8px' }}>•</span>
            <Link to="/register" style={styles.link}>Đăng ký tài khoản</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;