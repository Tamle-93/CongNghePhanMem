import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Select } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
// 👇 1. IMPORT AXIOS CLIENT (Quan trọng)
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;
const { Option } = Select;

// Danh sách câu hỏi mẫu
const SECURITY_QUESTIONS = [
  "Tên ngôi trường tiểu học đầu tiên của bạn?",
  "Tên người bạn thân nhất hồi nhỏ?",
  "Món ăn bạn yêu thích nhất?",
  "Tên thú cưng đầu tiên của bạn?",
  "Thành phố nơi cha mẹ bạn gặp nhau?",
  "Biệt danh hồi nhỏ của bạn là gì?"
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 👇 2. LOGIC GỌI API THẬT (Thay thế đoạn setTimeout cũ)
  const onFinish = async (values) => {
    setLoading(true);
    try {
        console.log("Dữ liệu gửi đi:", values); // Để debug xem gửi gì

        // Gọi xuống Backend (Python Flask)
        const res = await axiosClient.post('/api/auth/register', values);
        
        // Nếu Backend trả về success
        if (res.data.status === 'success') {
            message.success('Đăng ký thành công! Đã lưu vào Database.');
            navigate('/login'); // Chuyển về trang đăng nhập
        }
    } catch (error) {
        // Lấy lỗi từ Backend trả về (Ví dụ: "Email đã tồn tại")
        const msg = error.response?.data?.message || 'Đăng ký thất bại! Vui lòng thử lại.';
        message.error(msg);
    } finally {
        setLoading(false);
    }
  };

  const styles = {
    container: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f5ff', zIndex: 1000, overflowY: 'auto' },
    card: { width: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: '12px', padding: '20px', marginTop: '50px', marginBottom: '50px' },
    sectionTitle: { fontSize: '16px', fontWeight: 600, color: '#1890ff', marginBottom: 15, borderBottom: '1px solid #eee', paddingBottom: 5 }
  };

  return (
    <div style={styles.container}>
      <Card style={styles.card} bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Title level={3}>Đăng Ký Tài Khoản</Title>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large" initialValues={{ role: 'Author' }}>
          
          {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
          <div style={styles.sectionTitle}>1. Thông tin tài khoản</div>
          
          <Form.Item name="role" label="Đăng ký với vai trò:" rules={[{ required: true }]}>
            <Select>
                <Option value="Author">Tác giả (Author)</Option>
                <Option value="Reviewer">Phản biện (Reviewer)</Option>
            </Select>
          </Form.Item>

          <Form.Item name="fullname" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
          </Form.Item>

          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          {/* PHẦN 2: THIẾT LẬP BẢO MẬT (3 CÂU HỎI) */}
          <div style={{...styles.sectionTitle, marginTop: 20}}>2. Thiết lập bảo mật (Chọn 3 câu hỏi)</div>
          <Text type="secondary" style={{fontSize: 12, display: 'block', marginBottom: 15}}>
             * Dùng để khôi phục mật khẩu khi bị quên. Hãy chọn 3 câu khác nhau.
          </Text>

          {/* CÂU 1 */}
          <Form.Item style={{marginBottom: 0}}>
             <Form.Item name="q1" rules={[{ required: true, message: 'Chọn câu hỏi 1' }]} style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}>
                <Select placeholder="Chọn câu hỏi 1">
                    {SECURITY_QUESTIONS.map(q => <Option key={q} value={q}>{q}</Option>)}
                </Select>
             </Form.Item>
             <Form.Item name="a1" rules={[{ required: true, message: 'Nhập câu trả lời 1' }]} style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 0 0 16px' }}>
                <Input placeholder="Câu trả lời 1" />
             </Form.Item>
          </Form.Item>

          {/* CÂU 2 */}
          <Form.Item style={{marginBottom: 0}}>
             <Form.Item name="q2" rules={[{ required: true, message: 'Chọn câu hỏi 2' }]} style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}>
                <Select placeholder="Chọn câu hỏi 2">
                    {SECURITY_QUESTIONS.map(q => <Option key={q} value={q}>{q}</Option>)}
                </Select>
             </Form.Item>
             <Form.Item name="a2" rules={[{ required: true, message: 'Nhập câu trả lời 2' }]} style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 0 0 16px' }}>
                <Input placeholder="Câu trả lời 2" />
             </Form.Item>
          </Form.Item>

           {/* CÂU 3 */}
           <Form.Item style={{marginBottom: 20}}>
             <Form.Item name="q3" rules={[{ required: true, message: 'Chọn câu hỏi 3' }]} style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}>
                <Select placeholder="Chọn câu hỏi 3">
                    {SECURITY_QUESTIONS.map(q => <Option key={q} value={q}>{q}</Option>)}
                </Select>
             </Form.Item>
             <Form.Item name="a3" rules={[{ required: true, message: 'Nhập câu trả lời 3' }]} style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 0 0 16px' }}>
                <Input placeholder="Câu trả lời 3" />
             </Form.Item>
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading} style={{ height: '40px' }}>
            Đăng Ký
          </Button>
          
          <div style={{ textAlign: 'center', marginTop: 15 }}>
            <Link to="/login">Quay lại Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;