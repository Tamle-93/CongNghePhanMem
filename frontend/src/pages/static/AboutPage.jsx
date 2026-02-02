import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-6">
            <span className="material-symbols-outlined text-5xl">school</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">UTH ConfMS</h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Hệ thống Quản lý Hội nghị Khoa học - Đại học Giao thông Vận tải TP.HCM
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        {/* Giới thiệu */}
        <section className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-green-700">info</span>
            Giới thiệu
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong>UTH Conference Management System (UTH ConfMS)</strong> là hệ thống quản lý hội nghị khoa học 
              trực tuyến được phát triển bởi Đại học Giao thông Vận tải TP.HCM (UTH). Hệ thống hỗ trợ toàn bộ 
              quy trình tổ chức hội nghị khoa học từ việc nộp bài, phản biện đến công bố kết quả.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Với mục tiêu số hóa và tự động hóa quy trình quản lý hội nghị, UTH ConfMS giúp các nhà nghiên cứu, 
              phản biện và ban tổ chức tiết kiệm thời gian, nâng cao hiệu quả công việc và đảm bảo tính minh bạch 
              trong quá trình đánh giá bài báo khoa học.
            </p>
          </div>
        </section>

        {/* Tính năng */}
        <section className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-green-700">stars</span>
            Tính năng chính
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-green-700">upload_file</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Nộp bài trực tuyến</h3>
                <p className="text-sm text-slate-600">Tác giả dễ dàng nộp bài báo, theo dõi trạng thái và nhận phản hồi trực tiếp.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-green-700">rate_review</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Phản biện kín</h3>
                <p className="text-sm text-slate-600">Quy trình phản biện double-blind đảm bảo tính khách quan và công bằng.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-green-700">smart_toy</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Hỗ trợ AI</h3>
                <p className="text-sm text-slate-600">Tích hợp AI hỗ trợ gợi ý từ khóa, tóm tắt và đánh giá sơ bộ bài báo.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-green-700">assignment_ind</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Phân công tự động</h3>
                <p className="text-sm text-slate-600">Thuật toán thông minh tự động phân công phản biện dựa trên chuyên môn.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-green-700">notifications</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Thông báo realtime</h3>
                <p className="text-sm text-slate-600">Cập nhật thông báo tức thì qua email và trong hệ thống.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-green-700">analytics</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Thống kê chi tiết</h3>
                <p className="text-sm text-slate-600">Dashboard trực quan với các báo cáo thống kê chi tiết cho ban tổ chức.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Đơn vị phát triển */}
        <section className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-green-700">apartment</span>
            Đơn vị phát triển
          </h2>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-green-700 text-5xl">school</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Đại học Giao thông Vận tải TP.HCM (UTH)</h3>
              <p className="text-slate-600 mb-3">
                Trường Đại học Giao thông Vận tải Thành phố Hồ Chí Minh (UTH) là một trong những trường đại học 
                hàng đầu về đào tạo và nghiên cứu trong lĩnh vực giao thông vận tải, xây dựng và công nghệ thông tin.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-700">location_on</span>
                  <span>02 Võ Oanh, Phường 25, Bình Thạnh, TP.HCM</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-700">language</span>
                  <a href="https://www.uth.edu.vn" target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">
                    www.uth.edu.vn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Liên hệ */}
        <section className="bg-gradient-to-br from-green-700 to-green-800 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="material-symbols-outlined">mail</span>
            Liên hệ hỗ trợ
          </h2>
          <p className="text-green-100 mb-6">
            Nếu bạn có câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi qua các kênh sau:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">email</span>
                <div>
                  <p className="text-sm text-green-200">Email hỗ trợ</p>
                  <a href="mailto:khoahoc@uth.edu.vn" className="font-semibold hover:underline">khoahoc@uth.edu.vn</a>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">call</span>
                <div>
                  <p className="text-sm text-green-200">Hotline</p>
                  <a href="tel:02838997299" className="font-semibold hover:underline">(028) 3899 7299</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;
