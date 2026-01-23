# Backend/src/domain/services/email_service.py
"""
Email Service - Send notifications to users
"""
from flask_mail import Mail, Message
from datetime import datetime
import os

mail = Mail()

class EmailService:
    """Email notification service"""
    
    @staticmethod
    def send_email(to, subject, body, html=None):
        """
        Send email to recipient
        
        Args:
            to: str or list - recipient email(s)
            subject: str - email subject
            body: str - plain text body
            html: str (optional) - HTML body
            
        Returns: (success: bool, message: str)
        """
        try:
            if isinstance(to, str):
                to = [to]
            
            msg = Message(
                subject=subject,
                recipients=to,
                body=body,
                html=html
            )
            
            mail.send(msg)
            return True, "Email sent successfully"
            
        except Exception as e:
            return False, f"Failed to send email: {str(e)}"
    
    @staticmethod
    def send_paper_submission_confirmation(author_email, author_name, paper_title, conference_name):
        """Send confirmation email after paper submission"""
        subject = f"[{conference_name}] Xác nhận nộp bài báo"
        
        body = f"""
Kính gửi {author_name},

Chúng tôi đã nhận được bài báo của bạn:

Tiêu đề: {paper_title}
Hội nghị: {conference_name}
Thời gian nộp: {datetime.now().strftime('%d/%m/%Y %H:%M')}

Bài báo của bạn sẽ được xem xét bởi ban tổ chức. Chúng tôi sẽ thông báo kết quả trong thời gian sớm nhất.

Trân trọng,
Ban tổ chức {conference_name}
"""
        
        html = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2563eb;">✓ Xác nhận nộp bài báo</h2>
        <p>Kính gửi <strong>{author_name}</strong>,</p>
        <p>Chúng tôi đã nhận được bài báo của bạn:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Tiêu đề:</strong> {paper_title}</p>
            <p><strong>Hội nghị:</strong> {conference_name}</p>
            <p><strong>Thời gian nộp:</strong> {datetime.now().strftime('%d/%m/%Y %H:%M')}</p>
        </div>
        <p>Bài báo của bạn sẽ được xem xét bởi ban tổ chức. Chúng tôi sẽ thông báo kết quả trong thời gian sớm nhất.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #6b7280; font-size: 14px;">Trân trọng,<br>Ban tổ chức {conference_name}</p>
    </div>
</body>
</html>
"""
        
        return EmailService.send_email(author_email, subject, body, html)
    
    @staticmethod
    def send_review_assignment_notification(reviewer_email, reviewer_name, paper_title, conference_name, deadline):
        """Notify reviewer about new assignment"""
        subject = f"[{conference_name}] Phân công phản biện bài báo"
        
        body = f"""
Kính gửi {reviewer_name},

Bạn được phân công phản biện bài báo:

Tiêu đề: {paper_title}
Hội nghị: {conference_name}
Hạn phản biện: {deadline.strftime('%d/%m/%Y')}

Vui lòng đăng nhập vào hệ thống để xem chi tiết và hoàn thành phản biện.

Trân trọng,
Ban tổ chức {conference_name}
"""
        
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        html = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #0ea5e9;">📝 Phân công phản biện</h2>
        <p>Kính gửi <strong>{reviewer_name}</strong>,</p>
        <p>Bạn được phân công phản biện bài báo:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Tiêu đề:</strong> {paper_title}</p>
            <p><strong>Hội nghị:</strong> {conference_name}</p>
            <p style="color: #ef4444;"><strong>⏰ Hạn phản biện:</strong> {deadline.strftime('%d/%m/%Y')}</p>
        </div>
        <p>Vui lòng đăng nhập vào hệ thống để xem chi tiết và hoàn thành phản biện.</p>
        <a href="{frontend_url}" style="display: inline-block; padding: 10px 20px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">
            Đăng nhập ngay
        </a>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #6b7280; font-size: 14px;">Trân trọng,<br>Ban tổ chức {conference_name}</p>
    </div>
</body>
</html>
"""
        
        return EmailService.send_email(reviewer_email, subject, body, html)
    
    @staticmethod
    def send_decision_notification(author_email, author_name, paper_title, decision, comments, conference_name):
        """Notify author about paper decision"""
        
        decision_text = {
            'Accept': '✓ CHẤP NHẬN',
            'Reject': '✗ TỪ CHỐI',
            'Revision': '⟳ YÊU CẦU SỬA'
        }
        
        decision_color = {
            'Accept': '#10b981',
            'Reject': '#ef4444',
            'Revision': '#f59e0b'
        }
        
        subject = f"[{conference_name}] Kết quả phản biện: {paper_title}"
        
        body = f"""
Kính gửi {author_name},

Chúng tôi xin thông báo kết quả phản biện bài báo của bạn:

Tiêu đề: {paper_title}
Hội nghị: {conference_name}
Kết quả: {decision_text[decision]}

Nhận xét:
{comments}

{'Chúc mừng! Vui lòng đăng nhập để nộp bản hoàn chỉnh (camera-ready).' if decision == 'Accept' else ''}

Trân trọng,
Ban tổ chức {conference_name}
"""
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        
        html = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: {decision_color[decision]};">{decision_text[decision]}</h2>
        <p>Kính gửi <strong>{author_name}</strong>,</p>
        <p>Chúng tôi xin thông báo kết quả phản biện bài báo của bạn:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Tiêu đề:</strong> {paper_title}</p>
            <p><strong>Hội nghị:</strong> {conference_name}</p>
            <p style="color: {decision_color[decision]};"><strong>Kết quả:</strong> {decision_text[decision]}</p>
        </div>
        <div style="background-color: #fff; padding: 15px; border-left: 4px solid {decision_color[decision]}; margin: 20px 0;">
            <p><strong>Nhận xét:</strong></p>
            <p style="white-space: pre-wrap;">{comments}</p>
        </div>
        {'<p style="color: #10b981; font-weight: bold;">🎉 Chúc mừng! Vui lòng đăng nhập để nộp bản hoàn chỉnh (camera-ready).</p>' if decision == 'Accept' else ''}
        {f'<a href="{frontend_url}" style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">Nộp bản hoàn chỉnh</a>' if decision == 'Accept' else ''}
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #6b7280; font-size: 14px;">Trân trọng,<br>Ban tổ chức {conference_name}</p>
    </div>
</body>
</html>
"""
        
        return EmailService.send_email(author_email, subject, body, html)
    
    @staticmethod
    def send_reminder_email(to_email, to_name, reminder_type, details):
        """
        Send reminder email
        
        Args:
            to_email: recipient email
            to_name: recipient name
            reminder_type: 'review_deadline', 'submission_deadline', etc.
            details: dict with specific details
        """
        
        subject_map = {
            'review_deadline': 'Nhắc nhở: Hạn phản biện sắp đến',
            'submission_deadline': 'Nhắc nhở: Hạn nộp bài sắp đến',
            'camera_ready': 'Nhắc nhở: Nộp bản hoàn chỉnh'
        }
        
        subject = subject_map.get(reminder_type, 'Thông báo từ hệ thống')
        
        body = f"""
Kính gửi {to_name},

Đây là email nhắc nhở về: {subject}

Chi tiết: {details}

Vui lòng đăng nhập vào hệ thống để thực hiện.

Trân trọng,
UTH-ConfMS
"""
        
        return EmailService.send_email(to_email, subject, body)


# Email configuration in app.py:
"""
from flask_mail import Mail
from domain.services.email_service import mail

def create_app(config_name=None):
    app = Flask(__name__)
    
    # Email configuration
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@uth-confms.edu.vn')
    
    # Initialize Mail
    mail.init_app(app)
    
    return app
"""