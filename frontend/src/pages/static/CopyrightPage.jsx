import React from 'react';
import { Link } from 'react-router-dom';

const CopyrightPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <Link to="/home" className="inline-flex items-center gap-2 text-green-200 hover:text-white mb-4 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            Quay lại trang chủ
          </Link>
          <h1 className="text-3xl md:text-4xl font-black">Quy định bản quyền</h1>
          <p className="text-green-100 mt-2">Hướng dẫn về bản quyền và sở hữu trí tuệ</p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <div className="prose prose-slate max-w-none">
            
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">copyright</span>
                1. Nguyên tắc chung
              </h2>
              <p className="text-slate-600 leading-relaxed">
                UTH ConfMS tôn trọng và bảo vệ quyền sở hữu trí tuệ của tác giả. Tất cả bài báo được nộp 
                vào hệ thống vẫn thuộc quyền sở hữu của tác giả, trừ khi có thỏa thuận khác bằng văn bản.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">edit_document</span>
                2. Quyền của tác giả
              </h2>
              <p className="text-slate-600 mb-4">Tác giả có các quyền sau đối với bài báo của mình:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Quyền tác giả:</strong> Được ghi nhận là tác giả của công trình</li>
                <li><strong>Quyền công bố:</strong> Quyết định việc công bố bài báo</li>
                <li><strong>Quyền bảo vệ sự toàn vẹn:</strong> Phản đối việc sửa đổi làm ảnh hưởng đến danh dự</li>
                <li><strong>Quyền tái sử dụng:</strong> Sử dụng lại bài báo cho mục đích cá nhân và học thuật</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">assignment</span>
                3. Giấy phép xuất bản
              </h2>
              <p className="text-slate-600 mb-4">
                Khi bài báo được chấp nhận, tác giả cấp cho hội nghị giấy phép không độc quyền để:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Xuất bản bài báo trong kỷ yếu hội nghị</li>
                <li>Lưu trữ và phân phối bản điện tử</li>
                <li>Đưa vào các cơ sở dữ liệu học thuật</li>
                <li>Cho phép truy cập mở (Open Access) nếu được yêu cầu</li>
              </ul>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-green-800 text-sm">
                  <strong>Lưu ý:</strong> Tác giả vẫn giữ quyền tái sử dụng bài báo cho các mục đích phi thương mại, 
                  bao gồm đăng trên trang cá nhân, kho lưu trữ của tổ chức, hoặc nộp cho các ấn phẩm khác.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">verified_user</span>
                4. Cam kết nguyên bản
              </h2>
              <p className="text-slate-600 mb-4">Khi nộp bài, tác giả cam kết:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Bài báo là công trình nghiên cứu nguyên bản</li>
                <li>Chưa được xuất bản hoặc đang xem xét ở nơi khác</li>
                <li>Tất cả nguồn tham khảo đã được trích dẫn đúng cách</li>
                <li>Không chứa nội dung đạo văn hoặc tự đạo văn</li>
                <li>Đã có sự cho phép sử dụng tài liệu của bên thứ ba (nếu có)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">content_copy</span>
                5. Sử dụng tài liệu bên thứ ba
              </h2>
              <p className="text-slate-600 mb-4">
                Nếu bài báo sử dụng tài liệu có bản quyền của bên thứ ba (hình ảnh, bảng biểu, đoạn trích...), 
                tác giả phải:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Xin phép chủ sở hữu bản quyền trước khi sử dụng</li>
                <li>Cung cấp bằng chứng về việc được cấp phép (nếu yêu cầu)</li>
                <li>Ghi nguồn đầy đủ theo yêu cầu của chủ sở hữu</li>
                <li>Tuân thủ các điều kiện sử dụng được quy định</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">report</span>
                6. Xử lý vi phạm bản quyền
              </h2>
              <p className="text-slate-600 mb-4">
                Trong trường hợp phát hiện vi phạm bản quyền:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Bài báo sẽ bị từ chối hoặc rút lại (nếu đã xuất bản)</li>
                <li>Tác giả có thể bị cấm tham gia các hội nghị trong tương lai</li>
                <li>Thông tin có thể được báo cáo cho cơ quan chủ quản của tác giả</li>
                <li>Các biện pháp pháp lý có thể được áp dụng theo quy định pháp luật</li>
              </ul>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-800 text-sm">
                  <strong>Cảnh báo:</strong> Đạo văn là hành vi vi phạm nghiêm trọng đạo đức học thuật. 
                  Hệ thống sử dụng công cụ kiểm tra đạo văn để phát hiện nội dung không nguyên bản.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">public</span>
                7. Truy cập mở (Open Access)
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Một số hội nghị có thể yêu cầu hoặc khuyến khích xuất bản theo mô hình Truy cập mở. 
                Trong trường hợp này, bài báo được xuất bản dưới giấy phép Creative Commons, cho phép 
                người đọc tự do truy cập, tải về và chia sẻ với điều kiện ghi nhận tác giả.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">help</span>
                8. Liên hệ về bản quyền
              </h2>
              <p className="text-slate-600 mb-4">
                Nếu bạn có câu hỏi về bản quyền hoặc muốn báo cáo vi phạm, vui lòng liên hệ:
              </p>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-700"><strong>Email:</strong> copyright@uth.edu.vn</p>
                <p className="text-slate-700"><strong>Điện thoại:</strong> (028) 3899 7299</p>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};

export default CopyrightPage;
