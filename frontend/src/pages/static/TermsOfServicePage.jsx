import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <Link to="/home" className="inline-flex items-center gap-2 text-green-200 hover:text-white mb-4 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            Quay lại trang chủ
          </Link>
          <h1 className="text-3xl md:text-4xl font-black">Điều khoản sử dụng</h1>
          <p className="text-green-100 mt-2">Cập nhật lần cuối: 01/01/2026</p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <div className="prose prose-slate max-w-none">
            
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">gavel</span>
                1. Điều khoản chung
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Bằng việc truy cập và sử dụng hệ thống UTH ConfMS, bạn đồng ý tuân thủ các điều khoản và 
                điều kiện được nêu trong tài liệu này. Nếu không đồng ý với bất kỳ điều khoản nào, 
                vui lòng không sử dụng hệ thống.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">person_add</span>
                2. Đăng ký tài khoản
              </h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Bạn phải cung cấp thông tin chính xác và đầy đủ khi đăng ký</li>
                <li>Mỗi người chỉ được phép có một tài khoản</li>
                <li>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình</li>
                <li>Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép</li>
                <li>Tài khoản có thể bị khóa nếu vi phạm điều khoản sử dụng</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">upload_file</span>
                3. Quy định nộp bài
              </h2>
              <p className="text-slate-600 mb-4">Khi nộp bài báo, tác giả cam kết:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Bài báo là công trình nghiên cứu nguyên bản của tác giả</li>
                <li>Bài báo chưa được công bố hoặc đang xem xét tại nơi khác</li>
                <li>Tất cả đồng tác giả đã đồng ý nộp bài</li>
                <li>Nội dung không vi phạm quyền sở hữu trí tuệ của bên thứ ba</li>
                <li>Tuân thủ đạo đức nghiên cứu và tiêu chuẩn học thuật</li>
                <li>Khai báo đầy đủ xung đột lợi ích (nếu có)</li>
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Cảnh báo:</strong> Đạo văn, gửi bài trùng lặp, hoặc gian lận sẽ dẫn đến 
                  từ chối bài báo và có thể bị cấm tham gia các hội nghị trong tương lai.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">rate_review</span>
                4. Quy định phản biện
              </h2>
              <p className="text-slate-600 mb-4">Phản biện viên cam kết:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Đánh giá bài báo một cách khách quan và công bằng</li>
                <li>Bảo mật nội dung bài báo được giao phản biện</li>
                <li>Hoàn thành phản biện đúng thời hạn quy định</li>
                <li>Khai báo xung đột lợi ích với tác giả (nếu có)</li>
                <li>Không sử dụng thông tin từ bài báo cho mục đích cá nhân</li>
                <li>Đưa ra nhận xét mang tính xây dựng</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">block</span>
                5. Hành vi bị cấm
              </h2>
              <p className="text-slate-600 mb-4">Người dùng không được:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Cố gắng truy cập trái phép vào hệ thống hoặc dữ liệu</li>
                <li>Phát tán mã độc, virus hoặc nội dung có hại</li>
                <li>Giả mạo danh tính hoặc thông tin cá nhân</li>
                <li>Quấy rối, đe dọa hoặc xúc phạm người dùng khác</li>
                <li>Sử dụng hệ thống cho mục đích thương mại trái phép</li>
                <li>Vi phạm quyền sở hữu trí tuệ</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">copyright</span>
                6. Quyền sở hữu trí tuệ
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Tác giả giữ quyền sở hữu trí tuệ đối với bài báo của mình. Bằng việc nộp bài, 
                tác giả cấp cho ban tổ chức hội nghị quyền:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Xuất bản bài báo trong kỷ yếu hội nghị (nếu được chấp nhận)</li>
                <li>Lưu trữ bài báo trong cơ sở dữ liệu của hệ thống</li>
                <li>Hiển thị thông tin tóm tắt bài báo cho mục đích quảng bá hội nghị</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">warning</span>
                7. Giới hạn trách nhiệm
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Hệ thống được cung cấp "nguyên trạng" (as is). Chúng tôi không đảm bảo hệ thống 
                sẽ hoạt động không gián đoạn hoặc không có lỗi. Trong mọi trường hợp, UTH ConfMS 
                không chịu trách nhiệm về bất kỳ thiệt hại gián tiếp, ngẫu nhiên hoặc do hậu quả 
                phát sinh từ việc sử dụng hoặc không thể sử dụng hệ thống.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">edit_note</span>
                8. Thay đổi điều khoản
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Chúng tôi có quyền sửa đổi điều khoản sử dụng bất cứ lúc nào. Thay đổi sẽ có hiệu lực 
                ngay khi được đăng tải. Việc tiếp tục sử dụng hệ thống sau khi có thay đổi đồng nghĩa 
                với việc bạn chấp nhận điều khoản mới.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">balance</span>
                9. Luật áp dụng
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Điều khoản sử dụng này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp 
                phát sinh sẽ được giải quyết tại tòa án có thẩm quyền tại Thành phố Hồ Chí Minh.
              </p>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfServicePage;
