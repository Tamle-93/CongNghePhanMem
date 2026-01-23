import React, { useState } from 'react';
import { School, Search, BookOpen, Upload, Calendar, CheckCircle, Menu, MapPin, Clock, Users, FileText, TrendingUp } from 'lucide-react';

const UTHHomepage = () => {
  const [darkMode, setDarkMode] = useState(false);

  const conferences = [
    {
      id: 1,
      category: 'CNTT & Truyền thông',
      categoryColor: 'blue',
      location: 'TP. Hồ Chí Minh',
      title: 'Hội nghị Khoa học Quốc tế về Công nghệ Thông tin (UTH-ICT 2024)',
      description: 'Diễn đàn trao đổi học thuật về các xu hướng mới trong AI, Big Data và IoT.',
      date: '20/10/2024',
      deadline: '15/08',
      status: 'deadline',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'
    },
    {
      id: 2,
      category: 'Giao thông Vận tải',
      categoryColor: 'orange',
      location: 'Đà Nẵng',
      title: 'Hội thảo Khoa học Quốc gia về Giao thông Thông minh (UTH-TRANS)',
      description: 'Tập trung vào các giải pháp giao thông xanh, hệ thống giao thông thông minh.',
      date: '15/11/2024',
      status: 'accepting',
      image: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=400'
    }
  ];

  const timeline = [
    { date: '15/05/2024', title: 'Hạn nộp tóm tắt (Abstract)', conf: 'Hội nghị UTH-ICT 2024', status: 'urgent', daysLeft: '3 ngày' },
    { date: '01/06/2024', title: 'Thông báo chấp nhận bài', conf: 'Hội nghị UTH-TRANS', status: 'upcoming' },
    { date: '20/06/2024', title: 'Hạn nộp bài toàn văn', conf: 'Hội nghị UTH-ICT 2024', status: 'future' },
    { date: '15/07/2024', title: 'Đăng ký tham dự sớm', conf: 'Tất cả hội nghị', status: 'future' }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-10 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <School className="w-8 h-8 text-blue-500" />
            <h2 className="text-xl font-bold">UTH-ConfMS</h2>
          </div>

          <nav className="hidden md:flex items-center gap-8 ml-8 flex-1">
            <a href="#" className="text-blue-500 font-bold text-sm">Trang chủ</a>
            <a href="#" className="text-gray-600 hover:text-blue-500 text-sm font-medium transition">Hội nghị</a>
            <a href="#" className="text-gray-600 hover:text-blue-500 text-sm font-medium transition">Bài báo của tôi</a>
            <a href="#" className="text-gray-600 hover:text-blue-500 text-sm font-medium transition">Hướng dẫn</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="hidden md:flex px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold border transition">
              Nguyễn Văn A (Tác giả)
            </button>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-200"></div>
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            <button className="md:hidden">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 lg:p-8 flex flex-col gap-8">
        {/* Hero Section */}
        <section className="rounded-2xl overflow-hidden relative min-h-80 flex items-center shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700 z-0"></div>
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(255,255,255,0.1) 50px, rgba(255,255,255,0.1) 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.1) 50px, rgba(255,255,255,0.1) 51px)'
          }}></div>

          <div className="relative z-20 px-6 lg:px-12 py-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 text-white text-xs font-medium mb-4">
              <CheckCircle className="w-4 h-4" />
              <span>Hệ thống Quản lý Hội nghị Khoa học</span>
            </div>
            <h1 className="text-white text-3xl md:text-5xl font-black mb-4">
              Chào mừng bạn đến với UTH-ConfMS
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl">
              Nền tảng hỗ trợ nộp bài, phản biện và quản lý hội nghị chuyên nghiệp. Theo dõi tiến độ bài báo và cập nhật thông tin mới nhất.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="h-12 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg transition">
                <Search className="w-5 h-5" />
                Tìm hội nghị
              </button>
              <button className="h-12 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg font-bold backdrop-blur-sm transition">
                Xem hướng dẫn
              </button>
            </div>
          </div>
        </section>

        {/* Stats & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-5 rounded-xl border shadow-sm hover:border-blue-400 transition-all cursor-pointer`}>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">+2 mới</span>
              </div>
              <p className="text-gray-500 text-sm font-medium">Hội nghị đang mở</p>
              <p className="text-3xl font-bold mt-1">12</p>
            </div>

            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-5 rounded-xl border shadow-sm hover:border-blue-400 transition-all cursor-pointer`}>
              <div className="p-2 bg-orange-100 rounded-lg mb-2 w-fit">
                <FileText className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Bài báo hệ thống</p>
              <p className="text-3xl font-bold mt-1">500+</p>
            </div>

            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-5 rounded-xl border shadow-sm hover:border-blue-400 transition-all cursor-pointer`}>
              <div className="p-2 bg-purple-100 rounded-lg mb-2 w-fit">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Thành viên tham gia</p>
              <p className="text-3xl font-bold mt-1">1,200</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-all">
              <Upload className="w-10 h-10" />
              <div className="text-center">
                <h3 className="font-bold text-sm">Nộp bài ngay</h3>
                <p className="text-xs opacity-80 mt-1">Bắt đầu quy trình</p>
              </div>
            </button>
            <button className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border hover:border-blue-400 transition-all`}>
              <BookOpen className="w-10 h-10 text-gray-500" />
              <div className="text-center">
                <h3 className="font-bold text-sm">Xem hướng dẫn</h3>
                <p className="text-xs text-gray-500 mt-1">Quy định và mẫu</p>
              </div>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-500" />
                Hội nghị đang diễn ra
              </h3>
              <a href="#" className="text-sm font-medium text-blue-500 hover:underline">Xem tất cả</a>
            </div>

            <div className="flex flex-col gap-4">
              {conferences.map(conf => (
                <div key={conf.id} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-5 border shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-5`}>
                  <div className="w-full md:w-48 h-32 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${conf.image})` }}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`${conf.categoryColor === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'} text-xs font-semibold px-2.5 py-0.5 rounded`}>
                        {conf.category}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {conf.location}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold mb-1">{conf.title}</h4>
                    <p className="text-sm text-gray-500 mb-4">{conf.description}</p>
                    <div className="flex items-center gap-4 pt-4 border-t text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="w-5 h-5" />
                        <span>{conf.date}</span>
                      </div>
                      {conf.status === 'deadline' ? (
                        <div className="flex items-center gap-1 text-red-500 font-medium ml-auto">
                          <Clock className="w-5 h-5" />
                          <span>Hạn nộp: {conf.deadline}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600 font-medium ml-auto">
                          <CheckCircle className="w-5 h-5" />
                          <span>Đang nhận bài</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-bold mb-4">📢 Tin tức mới nhất</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 rounded-lg border hover:border-blue-400 cursor-pointer transition`}>
                  <span className="text-xs text-gray-500">12/05/2024</span>
                  <h5 className="font-bold text-sm mt-1">Thông báo gia hạn nộp bài tóm tắt cho hội nghị UTH-ICT 2024 đến hết tháng 8.</h5>
                </div>
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 rounded-lg border hover:border-blue-400 cursor-pointer transition`}>
                  <span className="text-xs text-gray-500">10/05/2024</span>
                  <h5 className="font-bold text-sm mt-1">Cập nhật mẫu định dạng bài báo IEEE mới cho các tác giả.</h5>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm overflow-hidden`}>
              <div className={`p-5 border-b ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <h3 className="font-bold">⏱️ Mốc thời gian quan trọng</h3>
                <p className="text-xs text-gray-500 mt-1">Các sự kiện sắp tới cần chú ý</p>
              </div>
              <div className="p-5">
                <div className="relative pl-4 border-l-2 border-gray-200 space-y-8">
                  {timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white ${
                        item.status === 'urgent' ? 'bg-red-500' :
                        item.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            item.status === 'urgent' ? 'text-red-500 bg-red-50' :
                            item.status === 'upcoming' ? 'text-blue-500 bg-blue-50' : 'text-gray-500 bg-gray-100'
                          }`}>
                            {item.date}
                          </span>
                          {item.daysLeft && <span className="text-xs text-gray-500">Còn {item.daysLeft}</span>}
                        </div>
                        <h4 className="text-sm font-bold">{item.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{item.conf}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-8 text-sm text-blue-500 font-medium hover:bg-blue-50 px-4 py-2 rounded-lg w-full transition">
                  Xem toàn bộ lịch trình
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t mt-12 py-8`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <School className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-500">© 2024 UTH Conference Management System</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-blue-500 transition">Điều khoản</a>
            <a href="#" className="hover:text-blue-500 transition">Bảo mật</a>
            <a href="#" className="hover:text-blue-500 transition">Liên hệ hỗ trợ</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UTHHomepage;