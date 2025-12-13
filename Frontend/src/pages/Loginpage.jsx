// File: Frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import { Form, Input, Button, Select, message, Card } from 'antd';
import { MailOutlined, LockOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthPages.css';

const { Option } = Select;

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: values.email,
        password: values.password
      });

      if (response.data.status === 'success') {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        message.success('Đăng nhập thành công!');

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
      if (error.response) {
        message.error(error.response.data.message || 'Đăng nhập thất bại');
      } else {
        message.error('Không thể kết nối đến server');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <BookOutlined />
        </div>

        {/* Title */}
        <h1 className="auth-title">UTH-ConfMS</h1>
        <p className="auth-subtitle">Hệ thống Quản lý Hội nghị</p>

        {/* Form */}
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          size="large"
          className="auth-form"
        >
          {/* Email */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Nhập Email!' },
              { type: 'email', message: 'Email không đúng định dạng!' }
            ]}
            validateStatus={form.getFieldError('email').length > 0 ? 'error' : ''}
            help={form.getFieldError('email')[0]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Email đăng nhập"
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Nhập mật khẩu!' }
            ]}
            validateStatus={form.getFieldError('password').length > 0 ? 'error' : ''}
            help={form.getFieldError('password')[0]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Mật khẩu"
              iconRender={(visible) => (visible ? '👁️' : '👁️‍🗨️')}
            />
          </Form.Item>

          {/* Role Selector (Demo) */}
          <div className="demo-section">
            <p className="demo-label">Đăng nhập với vai trò:</p>
            <Form.Item name="role" initialValue="Author">
              <Select>
                <Option value="Author">Tác giả (Author)</Option>
                <Option value="Reviewer">Phản biện (Reviewer)</Option>
                <Option value="Chair">Chủ tọa (Chair)</Option>
                <Option value="Admin">Quản trị (Admin)</Option>
              </Select>
            </Form.Item>
          </div>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="auth-button"
            >
              Đăng nhập
            </Button>
          </Form.Item>

          {/* Footer Links */}
          <div className="auth-footer">
            <Button type="link" onClick={() => navigate('/forgot-password')}>
              Quên mật khẩu?
            </Button>
            <span className="auth-divider">•</span>
            <Button type="link" onClick={() => navigate('/register')}>
              Đăng ký tài khoản
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;