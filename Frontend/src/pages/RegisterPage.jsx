// File: Frontend/src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Form, Input, Button, Select, message, Card, Steps } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthPages.css';

const { Option } = Select;
const { Step } = Steps;

const SECURITY_QUESTIONS = [
  "Tên ngôi trường tiểu học đầu tiên của bạn?",
  "Tên người bạn thân nhất hồi nhỏ?",
  "Món ăn bạn yêu thích nhất?",
  "Tên thú cưng đầu tiên của bạn?",
  "Thành phố nơi cha mẹ bạn gặp nhau?",
  "Biệt danh hồi nhỏ của bạn là gì?"
];

const RegisterPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Step 1: Thông tin tài khoản
  const handleStep1 = (values) => {
    setFormData({ ...formData, ...values });
    setCurrentStep(1);
  };

  // Step 2: Thiết lập bảo mật (3 câu hỏi)
  const handleStep2 = async (values) => {
    setLoading(true);

    const finalData = {
      username: formData.email.split('@')[0], // Tạo username từ email
      password: formData.password,
      fullname: formData.fullname,
      email: formData.email,
      role: formData.role || 'Author', // ← THÊM: Lấy role từ form
      security_questions: [
        { question: values.question1, answer: values.answer1 },
        { question: values.question2, answer: values.answer2 },
        { question: values.question3, answer: values.answer3 }
      ]
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, finalData);

      if (response.data.status === 'success') {
        message.success('Đăng ký thành công! Vui lòng đăng nhập');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (error) {
      console.error('Register error:', error);
      if (error.response) {
        const errorMsg = error.response.data.message || 'Đăng ký thất bại';
        const errorDetails = error.response.data.details;
        
        if (errorDetails && Array.isArray(errorDetails)) {
          message.error(errorDetails.join(', '));
        } else {
          message.error(errorMsg);
        }
      } else {
        message.error('Không thể kết nối đến server. Vui lòng kiểm tra Backend đã chạy chưa!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card register-card">
        {/* Logo */}
        <div className="auth-logo">
          <BookOutlined />
        </div>

        {/* Title */}
        <h1 className="auth-title">Đăng Ký Tài Khoản</h1>

        {/* Steps */}
        <Steps current={currentStep} className="register-steps">
          <Step title="Thông tin tài khoản" />
          <Step title="Thiết lập bảo mật" />
        </Steps>

        {/* Step 1: Thông tin tài khoản */}
        {currentStep === 0 && (
          <Form
            form={form}
            onFinish={handleStep1}
            layout="vertical"
            size="large"
            className="auth-form"
            initialValues={{ role: 'Author' }}
          >
            <p className="step-label">1. Thông tin tài khoản</p>

            {/* Vai trò - CHO PHÉP CHỌN TẤT CẢ */}
            <Form.Item
              label={<span style={{ color: '#ff4d4f' }}>* Đăng ký với vai trò:</span>}
              name="role"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
            >
              <Select>
                <Option value="Author">Tác giả (Author)</Option>
                <Option value="Reviewer">Phản biện (Reviewer)</Option>
                <Option value="Chair">Chủ tọa (Chair)</Option>
              </Select>
            </Form.Item>

            {/* Họ và tên */}
            <Form.Item
              name="fullname"
              rules={[{ required: true, message: 'Nhập họ và tên!' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Họ và tên"
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Nhập email!' },
                { type: 'email', message: 'Email không đúng định dạng!' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="tamleim5060@ut.edu.vn"
              />
            </Form.Item>

            {/* Mật khẩu */}
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Nhập mật khẩu!' },
                { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="••••••"
                iconRender={(visible) => (visible ? '👁️' : '👁️‍🗨️')}
              />
            </Form.Item>

            {/* Button */}
            <Form.Item>
              <Button type="primary" htmlType="submit" block className="auth-button">
                Tiếp tục
              </Button>
            </Form.Item>

            <div className="auth-footer">
              <Button type="link" onClick={() => navigate('/login')}>
                ← Quay lại Đăng nhập
              </Button>
            </div>
          </Form>
        )}

        {/* Step 2: Thiết lập bảo mật */}
        {currentStep === 1 && (
          <Form
            onFinish={handleStep2}
            layout="vertical"
            size="large"
            className="auth-form"
          >
            <p className="step-label">2. Thiết lập bảo mật (Chọn 3 câu hỏi)</p>
            <p className="step-hint">
              * Dùng để khôi phục mật khẩu khi bị quên. Hãy chọn 3 câu khác nhau.
            </p>

            {/* Câu hỏi 1 */}
            <Form.Item
              name="question1"
              rules={[{ required: true, message: 'Chọn câu hỏi 1!' }]}
            >
              <Select placeholder="Chọn câu hỏi 1" showSearch>
                {SECURITY_QUESTIONS.map((q, idx) => (
                  <Option key={idx} value={q}>{q}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="answer1"
              rules={[{ required: true, message: 'Nhập câu trả lời!' }]}
            >
              <Input placeholder="Câu trả lời 1" />
            </Form.Item>

            {/* Câu hỏi 2 */}
            <Form.Item
              name="question2"
              rules={[{ required: true, message: 'Chọn câu hỏi 2!' }]}
            >
              <Select placeholder="Chọn câu hỏi 2" showSearch>
                {SECURITY_QUESTIONS.map((q, idx) => (
                  <Option key={idx} value={q}>{q}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="answer2"
              rules={[{ required: true, message: 'Nhập câu trả lời!' }]}
            >
              <Input placeholder="Câu trả lời 2" />
            </Form.Item>

            {/* Câu hỏi 3 */}
            <Form.Item
              name="question3"
              rules={[{ required: true, message: 'Chọn câu hỏi 3!' }]}
            >
              <Select placeholder="Chọn câu hỏi 3" showSearch>
                {SECURITY_QUESTIONS.map((q, idx) => (
                  <Option key={idx} value={q}>{q}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="answer3"
              rules={[{ required: true, message: 'Nhập câu trả lời!' }]}
            >
              <Input placeholder="Câu trả lời 3" />
            </Form.Item>

            {/* Button */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="auth-button"
              >
                Đăng ký
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

export default RegisterPage;