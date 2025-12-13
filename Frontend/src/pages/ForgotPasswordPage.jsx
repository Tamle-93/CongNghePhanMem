import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Steps, Select, Alert } from 'antd';
import { MailOutlined, SafetyCertificateOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient'; // Dùng API thật

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // State lưu dữ liệu tạm để gửi đi
  const [resetData, setResetData] = useState({
    email: '',
    role: '',
    question: '', // Câu hỏi Server trả về
    answer: '',
    new_password: ''
  });

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // --- BƯỚC 1: GỬI EMAIL ĐỂ LẤY CÂU HỎI ---
      if (currentStep === 0) {
        const payload = { email: values.email, role: values.role };
        
        // Gọi API Backend: /api/auth/forgot-password/init
        const res = await axiosClient.post('/api/auth/forgot-password/init', payload);
        
        if (res.data.status === 'success') {
            const questionText = res.data.data.question;
            
            // Lưu lại thông tin để dùng cho bước sau
            setResetData({ ...resetData, email: values.email, role: values.role, question: questionText });
            
            message.success('Tìm thấy tài khoản! Vui lòng trả lời câu hỏi bảo mật.');
            setCurrentStep(1);
        }
      } 
      
      // --- BƯỚC 2: NHẬP CÂU TRẢ LỜI (Chỉ lưu tạm vào State, chưa gửi) ---
      else if (currentStep === 1) {
        setResetData({ ...resetData, answer: values.securityAnswer });
        setCurrentStep(2); // Chuyển sang bước nhập mật khẩu mới
      } 
      
      // --- BƯỚC 3: GỬI TẤT CẢ ĐỂ ĐỔI PASS ---
      else {
        const payload = {
            email: resetData.email,
            role: resetData.role,
            question: resetData.question,
            answer: resetData.answer,
            new_password: values.newPassword
        };

        // Gọi API Backend: /api/auth/forgot-password/reset
        const res = await axiosClient.post('/api/auth/forgot-password/reset', payload);

        if (res.data.status === 'success') {
            message.success('Đổi mật khẩu thành công! Hãy đăng nhập lại.');
            navigate('/login');
        }
      }
    } catch (error) {
        const msg = error.response?.data?.message || 'Có lỗi xảy ra!';
        message.error(msg);
    } finally {
        setLoading(false);
    }
  };

  const styles = {
    container: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f5ff', zIndex: 1000 },
    card: { width: 500, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '20px' }
  };

  return (
    <div style={styles.container}>
      <Card style={styles.card} bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Title level={4}>Khôi phục mật khẩu</Title>
        </div>

        <Steps current={currentStep} size="small" style={{ marginBottom: 30 }}>
          <Step title="Tài khoản" />
          <Step title="Xác minh" />
          <Step title="Đổi Pass" />
        </Steps>

        <Form layout="vertical" onFinish={onFinish} size="large" initialValues={{ role: 'Author' }}>
          
          {/* BƯỚC 1: NHẬP EMAIL & ROLE */}
          {currentStep === 0 && (
            <>
              <Alert message="Hệ thống sẽ lấy ngẫu nhiên câu hỏi bảo mật của bạn." type="info" showIcon style={{marginBottom: 20}} />
              <Form.Item name="email" label="Email đăng ký" rules={[{ required: true, type: 'email' }]}>
                <Input prefix={<MailOutlined />} placeholder="Nhập email..." />
              </Form.Item>
              <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                <Select placeholder="Chọn vai trò">
                    <Option value="Author">Tác giả (Author)</Option>
                    <Option value="Reviewer">Phản biện (Reviewer)</Option>
                </Select>
              </Form.Item>
            </>
          )}

          {/* BƯỚC 2: TRẢ LỜI CÂU HỎI (Lấy từ Backend) */}
          {currentStep === 1 && (
            <>
              <div style={{ background: '#fff7e6', padding: 15, borderRadius: 6, marginBottom: 20, border: '1px solid #ffd591' }}>
                <Text strong style={{color: '#d46b08'}}>Câu hỏi bảo mật:</Text> <br/>
                <Text style={{fontSize: 16}}>{resetData.question}</Text>
              </div>
              <Form.Item name="securityAnswer" label="Câu trả lời của bạn:" rules={[{ required: true }]}>
                <Input prefix={<SafetyCertificateOutlined />} placeholder="Nhập câu trả lời..." />
              </Form.Item>
            </>
          )}

          {/* BƯỚC 3: ĐỔI MẬT KHẨU MỚI */}
          {currentStep === 2 && (
            <>
              <Form.Item name="newPassword" rules={[{ required: true, min: 6 }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
              </Form.Item>
              <Form.Item name="confirm" dependencies={['newPassword']} 
                rules={[
                  { required: true },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                      return Promise.reject(new Error('Mật khẩu không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
              </Form.Item>
            </>
          )}

          <Button type="primary" htmlType="submit" block loading={loading}>
            {currentStep === 2 ? 'Lưu Mật Khẩu' : 'Tiếp Tục'}
          </Button>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/login"><ArrowLeftOutlined /> Quay lại</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};
export default ForgotPasswordPage;