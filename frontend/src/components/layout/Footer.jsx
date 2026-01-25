import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">UTH-ConfMS</h3>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hệ thống quản lý hội nghị khoa học - Đại học Công nghệ TP.HCM (UTH). Nâng tầm tri thức Việt.
            </p>
          </div>

          {/* Khám phá */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Khám phá</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/home" className="text-sm hover:text-blue-400 transition-colors">
                  Về hệ thống
                </Link>
              </li>
              <li>
                <Link to="/conferences" className="text-sm hover:text-blue-400 transition-colors">
                  Tìm kiếm hội nghị
                </Link>
              </li>
              <li>
                <Link to="/author/papers" className="text-sm hover:text-blue-400 transition-colors">
                  Tạp chí khoa học
                </Link>
              </li>
              <li>
                <Link to="/guide" className="text-sm hover:text-blue-400 transition-colors">
                  Thư viện điện tử
                </Link>
              </li>
            </ul>
          </div>

          {/* Quy định */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Quy định</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/author/papers" className="text-sm hover:text-blue-400 transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/author/submit" className="text-sm hover:text-blue-400 transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/guide" className="text-sm hover:text-blue-400 transition-colors">
                  Quy định bản quyền
                </Link>
              </li>
              <li>
                <Link to="/guide" className="text-sm hover:text-blue-400 transition-colors">
                  Đạo đức khoa học
                </Link>
              </li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-blue-400 text-lg mt-0.5 flex-shrink-0">location_on</span>
                <span className="text-sm">
                  02 Võ Oanh, Phường 25, Bình Thạnh, Thành phố Hồ Chí Minh, Việt Nam
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400 text-lg flex-shrink-0">call</span>
                <a href="tel:123456789" className="text-sm hover:text-blue-400 transition-colors">
                  123456789
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400 text-lg flex-shrink-0">email</span>
                <a href="mailto:khoahoc@uth.edu.vn" className="text-sm hover:text-blue-400 transition-colors">
                  khoahoc@uth.edu.vn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © 2025 UTH-ConfMS. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors">
                <span className="material-symbols-outlined">code</span>
              </a>
              <a href="#" className="text-slate-500 hover:text-blue-400 transition-colors">
                <span className="material-symbols-outlined">language</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Material Symbols Icons */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </footer>
  );
};

export default Footer;
