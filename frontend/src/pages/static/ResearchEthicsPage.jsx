import React from 'react';
import { Link } from 'react-router-dom';

const ResearchEthicsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <Link to="/home" className="inline-flex items-center gap-2 text-green-200 hover:text-white mb-4 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            Quay lại trang chủ
          </Link>
          <h1 className="text-3xl md:text-4xl font-black">Đạo đức khoa học</h1>
          <p className="text-green-100 mt-2">Tiêu chuẩn đạo đức trong nghiên cứu và xuất bản</p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <div className="prose prose-slate max-w-none">
            
            {/* Intro */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <p className="text-green-800 text-lg font-medium mb-0">
                UTH ConfMS cam kết duy trì các tiêu chuẩn cao nhất về đạo đức trong nghiên cứu khoa học. 
                Tất cả các bên tham gia - tác giả, phản biện và ban tổ chức - đều có trách nhiệm tuân thủ 
                các nguyên tắc đạo đức được nêu dưới đây.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">edit_note</span>
                1. Trách nhiệm của Tác giả
              </h2>
              
              <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">1.1. Tính nguyên bản</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Bài báo phải là công trình nghiên cứu nguyên bản của tác giả</li>
                <li>Không được sao chép, đạo văn từ nguồn khác</li>
                <li>Tự đạo văn (self-plagiarism) cũng không được chấp nhận</li>
                <li>Tất cả nguồn tham khảo phải được trích dẫn đầy đủ và chính xác</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">1.2. Tính trung thực của dữ liệu</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Dữ liệu nghiên cứu phải được thu thập và xử lý trung thực</li>
                <li>Không được bịa đặt, giả mạo hoặc thao túng dữ liệu</li>
                <li>Phương pháp nghiên cứu phải được mô tả đầy đủ để có thể tái hiện</li>
                <li>Dữ liệu gốc nên được lưu giữ để xác minh khi cần</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">1.3. Đồng tác giả</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Tất cả những người có đóng góp đáng kể cần được ghi nhận là đồng tác giả</li>
                <li>Không được ghi nhận người không có đóng góp (tác giả danh nghĩa)</li>
                <li>Thứ tự tác giả phải phản ánh mức độ đóng góp</li>
                <li>Tác giả liên hệ (corresponding author) chịu trách nhiệm liên lạc với ban tổ chức</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">1.4. Xung đột lợi ích</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Khai báo tất cả nguồn tài trợ cho nghiên cứu</li>
                <li>Công bố mọi xung đột lợi ích có thể ảnh hưởng đến kết quả</li>
                <li>Xung đột lợi ích bao gồm: tài chính, quan hệ cá nhân, cạnh tranh học thuật</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">rate_review</span>
                2. Trách nhiệm của Phản biện
              </h2>

              <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">2.1. Tính khách quan</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Đánh giá bài báo dựa trên chất lượng khoa học, không phải quan điểm cá nhân</li>
                <li>Không để định kiến về giới tính, quốc tịch, tôn giáo ảnh hưởng đến đánh giá</li>
                <li>Nhận xét phải mang tính xây dựng và chuyên nghiệp</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">2.2. Bảo mật</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Giữ bí mật tuyệt đối nội dung bài báo được giao phản biện</li>
                <li>Không thảo luận về bài báo với người khác</li>
                <li>Không sử dụng thông tin từ bài báo cho nghiên cứu của mình</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">2.3. Xung đột lợi ích</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Từ chối phản biện nếu có xung đột lợi ích với tác giả</li>
                <li>Xung đột bao gồm: đồng nghiệp, đối thủ cạnh tranh, quan hệ cá nhân</li>
                <li>Thông báo ngay cho ban tổ chức nếu nhận ra xung đột</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">2.4. Thời hạn</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Hoàn thành phản biện đúng thời hạn quy định</li>
                <li>Thông báo sớm nếu không thể hoàn thành đúng hạn</li>
                <li>Từ chối lời mời nếu không có đủ thời gian hoặc chuyên môn</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">admin_panel_settings</span>
                3. Trách nhiệm của Ban tổ chức
              </h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Đảm bảo quy trình phản biện công bằng và minh bạch</li>
                <li>Bảo mật danh tính tác giả và phản biện trong quy trình phản biện kín</li>
                <li>Xử lý khiếu nại một cách nghiêm túc và khách quan</li>
                <li>Có biện pháp xử lý vi phạm đạo đức rõ ràng</li>
                <li>Lưu trữ hồ sơ phản biện để giải quyết tranh chấp</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">science</span>
                4. Đạo đức nghiên cứu với con người và động vật
              </h2>
              <p className="text-slate-600 mb-4">
                Nghiên cứu liên quan đến con người hoặc động vật phải tuân thủ:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Được phê duyệt bởi Hội đồng đạo đức nghiên cứu</li>
                <li>Có sự đồng ý tham gia của đối tượng nghiên cứu (informed consent)</li>
                <li>Bảo vệ quyền riêng tư và dữ liệu cá nhân của người tham gia</li>
                <li>Tuân thủ Tuyên bố Helsinki (cho nghiên cứu y sinh)</li>
                <li>Đảm bảo phúc lợi động vật trong nghiên cứu</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">warning</span>
                5. Xử lý vi phạm đạo đức
              </h2>
              <p className="text-slate-600 mb-4">Khi phát hiện vi phạm đạo đức:</p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Vi phạm nhẹ</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Yêu cầu chỉnh sửa</li>
                    <li>• Cảnh cáo bằng văn bản</li>
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Vi phạm nghiêm trọng</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Từ chối/rút lại bài báo</li>
                    <li>• Cấm tham gia hội nghị</li>
                    <li>• Thông báo cho cơ quan chủ quản</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-700">contact_support</span>
                6. Báo cáo vi phạm
              </h2>
              <p className="text-slate-600 mb-4">
                Nếu bạn phát hiện hoặc nghi ngờ có vi phạm đạo đức, vui lòng báo cáo qua:
              </p>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-700"><strong>Email:</strong> ethics@uth.edu.vn</p>
                <p className="text-slate-700"><strong>Điện thoại:</strong> (028) 3899 7299</p>
                <p className="text-slate-600 text-sm mt-2">
                  Tất cả báo cáo sẽ được xử lý bảo mật và nghiêm túc.
                </p>
              </div>
            </section>

          </div>
        </div>

        {/* Reference Standards */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 mt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-700">menu_book</span>
            Tài liệu tham khảo
          </h2>
          <p className="text-slate-600 mb-4">
            Quy định đạo đức của UTH ConfMS được xây dựng dựa trên các tiêu chuẩn quốc tế:
          </p>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
              COPE (Committee on Publication Ethics) Guidelines
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
              Singapore Statement on Research Integrity
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
              Declaration of Helsinki (cho nghiên cứu y sinh)
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
              IEEE Publication Ethics Guidelines
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default ResearchEthicsPage;
