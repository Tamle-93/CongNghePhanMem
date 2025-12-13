// File: Frontend/src/pages/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Form, Input, Button, Select, message, Card, Alert } from 'antd';
import { MailOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthPages.css';

const { Option } = Select;

const ForgotPasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email: values.email,
        role: values.role
      });

      if (response.data.status === 'success') {
        message.success('Hệ thống sẽ lấy ngẫu nhiên câu hỏi bảo mật của bạn');
        // TODO: Chuyển đến trang trả lời câu hỏi bảo mật
        navigate('/verify-security-questions', { 
          state: { email: values.email } 
        });
      }
    } catch (error) {
      if (error.response) {
        message.error(error.response.data.message || 'Không tìm thấy tài khoản');
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
        <h1 className="auth-title">Khôi phục mật khẩu</h1>

        {/* Alert */}
        <Alert
          message="Hệ thống sẽ lấy ngẫu nhiên câu hỏi bảo mật của bạn."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* Form */}
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          size="large"
          className="auth-form"
          initialValues={{ role: 'Author' }}
        >
          {/* Email */}
          <Form.Item
            label={<span style={{ color: '#ff4d4f' }}>* Email đăng ký</span>}
            name="email"
            rules={[
              { required: true, message: 'Nhập email!' },
              { type: 'email', message: 'Email không đúng định dạng!' }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Nhập email..."
            />
          </Form.Item>

          {/* Vai trò */}
          <Form.Item
            label={<span style={{ color: '#ff4d4f' }}>* Vai trò</span>}
            name="role"
          >
            <Select>
              <Option value="Author">Tác giả (Author)</Option>
              <Option value="Reviewer">Phản biện (Reviewer)</Option>
              <Option value="Chair">Chủ tọa (Chair)</Option>
              <Option value="Admin">Quản trị (Admin)</Option>
            </Select>
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="auth-button"
            >
              Tiếp tục
            </Button>
          </Form.Item>

          {/* Footer */}
          <div className="auth-footer">
            <Button type="link" onClick={() => navigate('/login')}>
              ← Quay lại
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;