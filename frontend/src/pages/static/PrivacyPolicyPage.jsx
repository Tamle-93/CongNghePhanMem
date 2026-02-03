import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <Link to="/home" className="inline-flex items-center gap-2 text-green-200 hover:text-white mb-4 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            Quay lại trang chủ
          </Link>
          <h1 className="text-3xl md:text-4xl font-black">Chính sách bảo mật</h1>
          <p className="text-green-100 mt-2">Cập nhật lần cuối: 01/01/2026</p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <div className="prose prose-slate max-w-none">
            
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">security</span>
                1. Giới thiệu
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Hệ thống UTH ConfMS cam kết bảo vệ quyền riêng tư và thông tin cá nhân của người dùng. 
                Chính sách bảo mật này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn 
                khi sử dụng hệ thống quản lý hội nghị khoa học.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">folder_shared</span>
                2. Thông tin chúng tôi thu thập
              </h2>
              <p className="text-slate-600 mb-4">Chúng tôi thu thập các loại thông tin sau:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Thông tin tài khoản:</strong> Họ tên, email, đơn vị công tác, chức danh khoa học</li>
                <li><strong>Thông tin bài báo:</strong> Tiêu đề, tóm tắt, từ khóa, nội dung bài báo nộp</li>
                <li><strong>Thông tin phản biện:</strong> Nhận xét, điểm đánh giá, khuyến nghị của phản biện</li>
                <li><strong>Dữ liệu kỹ thuật:</strong> Địa chỉ IP, thông tin trình duyệt, thời gian truy cập</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">data_usage</span>
                3. Mục đích sử dụng thông tin
              </h2>
              <p className="text-slate-600 mb-4">Thông tin thu thập được sử dụng cho các mục đích:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Quản lý tài khoản và xác thực người dùng</li>
                <li>Xử lý quy trình nộp bài và phản biện</li>
                <li>Gửi thông báo về trạng thái bài báo và hội nghị</li>
                <li>Phân công phản biện phù hợp dựa trên chuyên môn</li>
                <li>Thống kê và cải thiện chất lượng dịch vụ</li>
                <li>Phát hiện và ngăn chặn hành vi gian lận</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">share</span>
                4. Chia sẻ thông tin
              </h2>
              <p className="text-slate-600 mb-4">Chúng tôi có thể chia sẻ thông tin trong các trường hợp:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Với phản biện:</strong> Thông tin bài báo (không bao gồm thông tin tác giả trong quy trình phản biện kín)</li>
                <li><strong>Với ban tổ chức:</strong> Thông tin cần thiết để quản lý hội nghị</li>
                <li><strong>Theo yêu cầu pháp luật:</strong> Khi có yêu cầu từ cơ quan có thẩm quyền</li>
              </ul>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-green-800 text-sm">
                  <strong>Lưu ý:</strong> Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba vì mục đích thương mại.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">lock</span>
                5. Bảo mật thông tin
              </h2>
              <p className="text-slate-600 mb-4">
                Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn công nghiệp để bảo vệ thông tin:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Mã hóa dữ liệu truyền tải bằng HTTPS/TLS</li>
                <li>Mã hóa mật khẩu bằng thuật toán hash an toàn</li>
                <li>Kiểm soát truy cập dựa trên vai trò (RBAC)</li>
                <li>Sao lưu dữ liệu định kỳ</li>
                <li>Giám sát và phát hiện xâm nhập</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">person</span>
                6. Quyền của người dùng
              </h2>
              <p className="text-slate-600 mb-4">Bạn có các quyền sau đối với thông tin cá nhân:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Quyền truy cập:</strong> Xem thông tin cá nhân đã cung cấp</li>
                <li><strong>Quyền chỉnh sửa:</strong> Cập nhật thông tin không chính xác</li>
                <li><strong>Quyền xóa:</strong> Yêu cầu xóa tài khoản và dữ liệu liên quan</li>
                <li><strong>Quyền phản đối:</strong> Từ chối nhận email marketing (nếu có)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">cookie</span>
                7. Cookie và công nghệ theo dõi
              </h2>
              <p className="text-slate-600">
                Hệ thống sử dụng cookie để duy trì phiên đăng nhập và cải thiện trải nghiệm người dùng. 
                Cookie cần thiết cho hoạt động của hệ thống bao gồm: cookie xác thực, cookie bảo mật, 
                và cookie lưu tùy chọn ngôn ngữ.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">update</span>
                8. Thay đổi chính sách
              </h2>
              <p className="text-slate-600">
                Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi sẽ được 
                thông báo qua email hoặc hiển thị trên hệ thống. Việc tiếp tục sử dụng dịch vụ sau khi 
                có thay đổi đồng nghĩa với việc bạn chấp nhận chính sách mới.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">contact_support</span>
                9. Liên hệ
              </h2>
              <p className="text-slate-600 mb-4">
                Nếu có câu hỏi về chính sách bảo mật, vui lòng liên hệ:
              </p>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-700"><strong>Email:</strong> khoahoc@uth.edu.vn</p>
                <p className="text-slate-700"><strong>Điện thoại:</strong> (028) 3899 7299</p>
                <p className="text-slate-700"><strong>Địa chỉ:</strong> 02 Võ Oanh, Phường 25, Bình Thạnh, TP.HCM</p>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
