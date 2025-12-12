// File: Frontend/src/pages/LoginPage.jsx
// Team UTH-ConfMS
// MỤC ĐÍCH: Giao diện đăng nhập

import { useState } from 'react';
import { Form, Input, Button, Select, message, Card } from 'antd';
import { MailOutlined, LockOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const { Option } = Select;

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // URL API Backend
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      // Gọi API đăng nhập
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: values.email, // Có thể dùng email hoặc username
        password: values.password
      });

      if (response.data.status === 'success') {
        const { token, user } = response.data.data;

        // Lưu token và thông tin user vào localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        message.success('Đăng nhập thành công!');

        // Chuyển hướng dựa theo role
        switch (user.role) {
          case 'Admin':
            navigate('/admin/dashboard');
            break;
          case 'Chair':
            navigate('/chair/dashboard');
            break;
          case 'Reviewer':
            navigate('/reviewer/dashboard');
            break;
          case 'Author':
          default:
            navigate('/author/dashboard');
            break;
        }
      }
    } catch (error) {
      console.error('Login error:', error);

      if (error.response) {
        // Lỗi từ server (401, 400, 500...)
        const errorMsg = error.response.data.message || 'Đăng nhập thất bại';
        message.error(errorMsg);
      } else if (error.request) {
        // Không kết nối được server
        message.error('Không thể kết nối đến server');
      } else {
        message.error('Đã xảy ra lỗi không xác định');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    message.info('Chức năng quên mật khẩu đang được phát triển');
    // TODO: Chuyển đến trang quên mật khẩu
    // navigate('/forgot-password');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        {/* Logo và Tiêu đề */}
        <div className="login-header">
          <div className="login-logo">
            <BookOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </div>
          <h1 className="login-title">UTH-ConfMS</h1>
          <p className="login-subtitle">Hệ thống Quản lý Hội nghị Khoa học</p>
        </div>

        {/* Form đăng nhập */}
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không đúng định dạng!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="your.email@uth.edu.vn"
              autoComplete="email"
            />
          </Form.Item>

          {/* Mật khẩu */}
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>

          {/* Demo Role Selector (Chỉ để test - Xóa khi production) */}
          <div className="demo-section">
            <p className="demo-label">Demo - Chọn vai trò để đăng nhập:</p>
            <Form.Item
              name="demoRole"
              initialValue="Author"
            >
              <Select>
                <Option value="Author">Tác giả (Author)</Option>
                <Option value="Reviewer">Phản biện (Reviewer)</Option>
                <Option value="Chair">Chủ tọa (Chair)</Option>
                <Option value="Admin">Quản trị (Admin)</Option>
              </Select>
            </Form.Item>
          </div>

          {/* Nút đăng nhập */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="login-button"
            >
              Đăng nhập
            </Button>
          </Form.Item>

          {/* Links phụ */}
          <div className="login-footer">
            <Button type="link" onClick={handleForgotPassword}>
              Quên mật khẩu?
            </Button>
            <span className="login-divider">•</span>
            <Button type="link" onClick={handleRegister}>
              Đăng ký tài khoản
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;