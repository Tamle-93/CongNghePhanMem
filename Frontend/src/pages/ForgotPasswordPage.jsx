// File: Frontend/src/pages/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Form, Input, Button, message, Card, Alert, Steps } from 'antd';
import { MailOutlined, BookOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthPages.css';

const { Step } = Steps;

const ForgotPasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [questionIndex, setQuestionIndex] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Step 1: Nhập email
  const handleStep1 = async (values) => {
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password/step1`, {
        email: values.email
      });

      if (response.data.status === 'success') {
        setEmail(values.email);
        setSecurityQuestion(response.data.data.question);
        setQuestionIndex(response.data.data.question_index);
        setCurrentStep(1);
        message.success('Vui lòng trả lời câu hỏi bảo mật');
      }
    } catch (error) {
      console.error('Forgot password step 1 error:', error);
      if (error.response) {
        message.error(error.response.data.message || 'Không tìm thấy email');
      } else {
        message.error('Không thể kết nối đến server');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Trả lời câu hỏi + mật khẩu mới
  const handleStep2 = async (values) => {
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password/step2`, {
        email: email,
        question_index: questionIndex,
        answer: values.answer,
        new_password: values.new_password
      });

      if (response.data.status === 'success') {
        message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (error) {
      console.error('Forgot password step 2 error:', error);
      if (error.response) {
        const errorMsg = error.response.data.message || 'Đổi mật khẩu thất bại';
        const errorDetails = error.response.data.details;
        
        if (errorDetails && Array.isArray(errorDetails)) {
          message.error(errorDetails.join(', '));
        } else {
          message.error(errorMsg);
        }
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

        {/* Steps */}
        <Steps current={currentStep} className="register-steps" style={{ marginBottom: 24 }}>
          <Step title="Nhập email" />
          <Step title="Trả lời câu hỏi" />
        </Steps>

        {/* Step 1: Nhập email */}
        {currentStep === 0 && (
          <>
            <Alert
              message="Hệ thống sẽ lấy ngẫu nhiên câu hỏi bảo mật của bạn."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form
              form={form}
              onFinish={handleStep1}
              layout="vertical"
              size="large"
              className="auth-form"
            >
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

              <div className="auth-footer">
                <Button type="link" onClick={() => navigate('/login')}>
                  ← Quay lại
                </Button>
              </div>
            </Form>
          </>
        )}

        {/* Step 2: Trả lời câu hỏi */}
        {currentStep === 1 && (
          <Form
            onFinish={handleStep2}
            layout="vertical"
            size="large"
            className="auth-form"
          >
            <Alert
              message={`Câu hỏi: ${securityQuestion}`}
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form.Item
              label={<span style={{ color: '#ff4d4f' }}>* Câu trả lời</span>}
              name="answer"
              rules={[{ required: true, message: 'Nhập câu trả lời!' }]}
            >
              <Input placeholder="Nhập câu trả lời..." />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: '#ff4d4f' }}>* Mật khẩu mới</span>}
              name="new_password"
              rules={[
                { required: true, message: 'Nhập mật khẩu mới!' },
                { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Nhập mật khẩu mới..."
                iconRender={(visible) => (visible ? '👁️' : '👁️‍🗨️')}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="auth-button"
              >
                Đổi mật khẩu
              </Button>
            </Form.Item>

            <div className="auth-footer">
              <Button type="link" onClick={() => setCurrentStep(0)}>
                ← Quay lại
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
