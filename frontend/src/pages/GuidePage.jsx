import React, { useState } from 'react';

const GuidePage = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const guides = [
    {
      id: 1,
      icon: 'description',
      color: 'blue',
      title: 'Hướng dẫn nộp bài báo',
      summary: 'Quy trình chi tiết từ chuẩn bị đến nộp bài báo lên hệ thống',
      content: [
        {
          step: 'Bước 1: Chuẩn bị bài báo',
          details: [
            'Viết bài báo theo mẫu chuẩn của hội nghị (template Word hoặc LaTeX)',
            'Kiểm tra định dạng: font chữ, khoảng cách dòng, lề trang',
            'Đảm bảo bài báo có đủ các phần: Abstract, Introduction, Methods, Results, Conclusion, References',
            'Độ dài bài báo: 6-8 trang (bao gồm tài liệu tham khảo)'
          ]
        },
        {
          step: 'Bước 2: Chuyển đổi sang PDF',
          details: [
            'Xuất file sang định dạng PDF (không cho phép file Word)',
            'Kiểm tra fonts đã được nhúng (embedded fonts)',
            'Kích thước file không quá 10MB',
            'Đảm bảo PDF có thể copy text (không phải scan ảnh)'
          ]
        },
        {
          step: 'Bước 3: Điền thông tin trên hệ thống',
          details: [
            'Đăng nhập vào hệ thống UTH-ConfMS',
            'Chọn menu "Nộp bài mới"',
            'Điền đầy đủ: Tiêu đề, Tóm tắt, Từ khóa (3-5 từ)',
            'Thêm thông tin tất cả tác giả: Họ tên, Email, Đơn vị',
            'Chọn phân ban (Track) phù hợp với nội dung bài báo',
            'Chọn ít nhất 2 chủ đề (Topics) liên quan'
          ]
        },
        {
          step: 'Bước 4: Tải file và gửi',
          details: [
            'Tải file PDF lên hệ thống',
            'Kiểm tra lại toàn bộ thông tin trước khi gửi',
            'Nhấn "Nộp bài" để hoàn tất',
            'Hệ thống sẽ gửi email xác nhận trong vòng 24h'
          ]
        }
      ]
    },
    {
      id: 2,
      icon: 'rate_review',
      color: 'green',
      title: 'Phản hồi kết quả phản biện',
      summary: 'Cách đọc và trả lời ý kiến phản biện, chỉnh sửa bài báo',
      content: [
        {
          step: 'Hiểu kết quả phản biện',
          details: [
            'Bài báo sẽ được 2-3 phản biện viên đánh giá',
            'Kết quả: Accept (Chấp nhận), Revision (Sửa lại), Reject (Từ chối)',
            'Nếu "Revision", bạn có 2 tuần để chỉnh sửa và gửi lại',
            'Đọc kỹ từng nhận xét của phản biện viên'
          ]
        },
        {
          step: 'Chuẩn bị phản hồi',
          details: [
            'Tạo file "Response to Reviewers" (file riêng)',
            'Trích dẫn từng nhận xét của phản biện',
            'Giải thích cách bạn đã sửa hoặc lý do không sửa',
            'Ghi rõ vị trí đã sửa trong bài báo (ví dụ: Page 3, Section 2.1)'
          ]
        },
        {
          step: 'Chỉnh sửa bài báo',
          details: [
            'Sửa bài báo theo đúng yêu cầu của phản biện',
            'Highlight (màu vàng) các đoạn đã chỉnh sửa',
            'Kiểm tra lại lỗi chính tả, ngữ pháp',
            'Cập nhật tài liệu tham khảo nếu cần'
          ]
        },
        {
          step: 'Nộp bản sửa lại',
          details: [
            'Vào trang "Bài báo của tôi"',
            'Chọn bài báo cần sửa → Nhấn "Chỉnh sửa"',
            'Tải lên: Bản PDF mới + File Response to Reviewers',
            'Nhấn "Gửi lại" trước hạn chót'
          ]
        }
      ]
    },
    {
      id: 3,
      icon: 'event',
      color: 'orange',
      title: 'Tham dự hội nghị',
      summary: 'Quy trình đăng ký và trình bày bài báo tại hội nghị',
      content: [
        {
          step: 'Sau khi bài báo được chấp nhận',
          details: [
            'Nhận email thông báo Accept từ ban tổ chức',
            'Chuẩn bị bản Camera-Ready (bản cuối cùng)',
            'Nộp bản Camera-Ready đúng hạn (thường 2 tuần sau Accept)',
            'Đăng ký bản quyền (Copyright) nếu yêu cầu'
          ]
        },
        {
          step: 'Đăng ký tham dự',
          details: [
            'Truy cập trang đăng ký hội nghị',
            'Chọn loại vé: Author (có trình bày) hoặc Attendee (tham dự)',
            'Thanh toán phí hội nghị (Early bird rẻ hơn)',
            'Nhận xác nhận đăng ký qua email'
          ]
        },
        {
          step: 'Chuẩn bị slide thuyết trình',
          details: [
            'Tạo slide PowerPoint hoặc PDF (khuyến khích PDF)',
            'Thời gian: 15-20 phút trình bày + 5 phút Q&A',
            'Nội dung: Giới thiệu vấn đề → Phương pháp → Kết quả → Kết luận',
            'Luyện tập thuyết trình trước gương hoặc với đồng nghiệp'
          ]
        },
        {
          step: 'Tham dự hội nghị',
          details: [
            'Check-in tại quầy lễ tân để nhận thẻ và tài liệu',
            'Đến đúng phòng và giờ trình bày (kiểm tra lịch trước 30 phút)',
            'Cài đặt slide trước 10 phút, test máy chiếu',
            'Networking: Trao đổi với các nhà nghiên cứu khác, trao đổi danh thiếp'
          ]
        }
      ]
    },
    {
      id: 4,
      icon: 'help',
      color: 'purple',
      title: 'Câu hỏi thường gặp (FAQ)',
      summary: 'Giải đáp các thắc mắc phổ biến về hệ thống',
      content: [
        {
          step: 'Câu hỏi về nộp bài',
          details: [
            'Q: Tôi có thể nộp bao nhiêu bài? - A: Không giới hạn số lượng bài báo',
            'Q: Định dạng file? - A: Chỉ chấp nhận PDF, tối đa 10MB',
            'Q: Ngôn ngữ bài báo? - A: Tiếng Anh hoặc Tiếng Việt (tùy hội nghị)',
            'Q: Có thể sửa bài sau khi nộp? - A: Được, trước deadline submission'
          ]
        },
        {
          step: 'Câu hỏi về phản biện',
          details: [
            'Q: Bao lâu có kết quả? - A: 4-6 tuần sau deadline submission',
            'Q: Ai sẽ phản biện? - A: Các chuyên gia trong lĩnh vực (ẩn danh)',
            'Q: Revision có chắc chắn Accept? - A: Không, cần sửa đúng yêu cầu',
            'Q: Reject có thể appeal? - A: Có, trong vòng 7 ngày'
          ]
        },
        {
          step: 'Câu hỏi về hội nghị',
          details: [
            'Q: Phí tham dự? - A: 200-500 USD (tùy hội nghị, Early bird rẻ hơn)',
            'Q: Trình bày online được không? - A: Được, nếu hội nghị hybrid',
            'Q: Có được xuất bản không? - A: Có, trên Proceedings hoặc Journal',
            'Q: Cần visa? - A: Tùy quốc gia tổ chức, liên hệ ban tổ chức'
          ]
        }
      ]
    }
  ];

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-slate-900 text-3xl md:text-4xl font-black tracking-tight">
            Hướng dẫn sử dụng
          </h1>
          <p className="text-slate-500 text-base">
            Tìm hiểu cách sử dụng hệ thống UTH-ConfMS hiệu quả và nhanh chóng.
          </p>
        </div>

        {/* Guide Cards */}
        <div className="space-y-6">
          {guides.map((guide) => {
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600',
              green: 'bg-green-50 text-green-600',
              orange: 'bg-orange-50 text-orange-600',
              purple: 'bg-purple-50 text-purple-600'
            };

            return (
              <div key={guide.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                {/* Header */}
                <div
                  onClick={() => toggleSection(guide.id)}
                  className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${colorClasses[guide.color]} flex-shrink-0`}>
                      <span className="material-symbols-outlined text-3xl">{guide.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg mb-1">{guide.title}</h3>
                      <p className="text-sm text-slate-600">{guide.summary}</p>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedSection === guide.id ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </div>

                {/* Content */}
                {expandedSection === guide.id && (
                  <div className="px-6 pb-6 space-y-6 border-t border-slate-100">
                    {guide.content.map((section, index) => (
                      <div key={index} className="pt-6">
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                            {index + 1}
                          </span>
                          {section.step}
                        </h4>
                        <ul className="space-y-2 ml-8">
                          {section.details.map((detail, idx) => (
                            <li key={idx} className="flex gap-2 text-sm text-slate-600">
                              <span className="material-symbols-outlined text-blue-500 text-lg flex-shrink-0">check_circle</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-center text-white mt-12">
          <span className="material-symbols-outlined text-5xl mb-4 inline-block">support_agent</span>
          <h2 className="text-2xl font-bold mb-2">Cần hỗ trợ thêm?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Nếu bạn gặp vấn đề hoặc có câu hỏi chưa được giải đáp, đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">email</span>
              Email: support@uth-confms.edu.vn
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold py-3 px-6 rounded-lg transition-colors backdrop-blur-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">call</span>
              Hotline: 1900-xxxx
            </button>
          </div>
        </div>
      </main>

      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
};

export default GuidePage;
