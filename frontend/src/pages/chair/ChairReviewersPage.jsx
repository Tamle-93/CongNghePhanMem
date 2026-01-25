import React, { useState } from 'react';

const ChairReviewersPage = () => {
  const [reviewers] = useState([
    {
      id: 1,
      name: 'GS. TS. Nguyễn Văn A',
      role: 'Hội đồng chính',
      organization: 'Đại học Bách Khoa TP.HCM',
      track: 'Khoa học máy tính, AI',
      workload: 12,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAc9lycjz2m2Vgs5yfNVJmukkrisAwUL9XiY6nz-DU2VNcS5GSHStkHVSGoZvorB-eLqo_1hDxM_8Yh6pX218BtYDETrGw3H4CJnuga9bkST9gXM3ThfTIrM_ZI9rDFCYeMSo9F8Mvhu2uH6lIHPR7lht6ISx4wq3Q2QOq3xfOWVgxppvddSCNwyO76KHmbfnb6-ahMUMX2UrZALmAQFOvjpq_WuWU5_-qpkSGpwyHPMAmIMQKaU3EyveeLpTfacKWwXxHWc8B4Ng'
    },
    {
      id: 2,
      name: 'PGS. TS. Lê Thị C',
      role: 'Phản biện viên',
      organization: 'Trường Đại học GTVT TP.HCM',
      track: 'Logistics & Chuỗi cung ứng',
      workload: 8,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDn5KeuUgzWIKqYhqGhcIjNLlfN3y9OsLqxe-AKQpvIMKB4IVYDm4jNt3GJ722ltrsdV0j_sPt36Ex5c8Ry-kVQ5VC6NAGM89440Zlg1-EInOSM6D5vQYyyu8r8-tfJ28X6vD-p8lZdInYDaE7o1Jz5iv16mRrJeyDfQ2aPR_SfteG6OZmvbTwzu_rDW1QA5jYYUUrzneUycPCnF8hNWWw8uEVTkH95At4Cq-JrrhN7G8N064BzDfz4bIbeS4hxKTkZydr1Bpf_iQ'
    },
    {
      id: 3,
      name: 'TS. Trần Văn D',
      role: 'Phản biện viên',
      organization: 'Đại học Quốc Gia TP.HCM',
      track: 'Công nghệ phần mềm',
      workload: 10,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfhbHJnerOzKpZyB3yyMQy0pDT_DksP4mTRXx1TYq479pxxdMT9ygbol00adVPrZ54HU57s-GUEXAlxD8k6yMuFxFycw1J_X2sGTwHD1fj7cqRygNEI5O9oqi35K1NvaEhVkEML5fOtn8XbqVu5I06DwcKz3170NTi8JuPCTsjLpYcEc2eraLdwVAlEb1oyCadpDMwfRAG2VelyR98cnUYmxJ406PVeqfTQzx0TwqNJS41d1vtHZNL6yca4J2pIGrP7csknd1qsQ'
    },
    {
      id: 4,
      name: 'PGS. Phạm Thị E',
      role: 'Phản biện viên',
      organization: 'Đại học Công nghệ TP.HCM',
      track: 'An toàn thông tin',
      workload: 7,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-PEDmg_SuSkJNvSXE4wtK_wPp2J-QWpFmHIrTQxl_x8TZD_-S6KYCt7fd_xTU8J6h4ofiK9fWLb5ZjvirnL_lmdXIHoBGEsqH2SIRwPLng4071GT4gm_POTbY50HMCPlBSJwvPCBODV_8Xc-X5GKkln_jBQ2E7jq8dOx02cEiXzjIp1Rcq12NEoPOC_YZfvGDtJ383MDaVhX7-a3s-g9tJw9f928p5r1Ch624rmIOenq9wl6NxljxEV3gb4Lk10AMl_zA7EtU2A'
    },
    {
      id: 5,
      name: 'TS. Hoàng Văn F',
      role: 'Phản biện viên',
      organization: 'Đại học FPT TP.HCM',
      track: 'Mạng máy tính',
      workload: 9,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAc9lycjz2m2Vgs5yfNVJmukkrisAwUL9XiY6nz-DU2VNcS5GSHStkHVSGoZvorB-eLqo_1hDxM_8Yh6pX218BtYDETrGw3H4CJnuga9bkST9gXM3ThfTIrM_ZI9rDFCYeMSo9F8Mvhu2uH6lIHPR7lht6ISx4wq3Q2QOq3xfOWVgxppvddSCNwyO76KHmbfnb6-ahMUMX2UrZALmAQFOvjpq_WuWU5_-qpkSGpwyHPMAmIMQKaU3EyveeLpTfacKWwXxHWc8B4Ng'
    },
    {
      id: 6,
      name: 'GS. Vũ Thị G',
      role: 'Hội đồng chính',
      organization: 'Đại học Tôn Đức Thắng',
      track: 'Trí tuệ nhân tạo',
      workload: 15,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDn5KeuUgzWIKqYhqGhcIjNLlfN3y9OsLqxe-AKQpvIMKB4IVYDm4jNt3GJ722ltrsdV0j_sPt36Ex5c8Ry-kVQ5VC6NAGM89440Zlg1-EInOSM6D5vQYyyu8r8-tfJ28X6vD-p8lZdInYDaE7o1Jz5iv16mRrJeyDfQ2aPR_SfteG6OZmvbTwzu_rDW1QA5jYYUUrzneUycPCnF8hNWWw8uEVTkH95At4Cq-JrrhN7G8N064BzDfz4bIbeS4hxKTkZydr1Bpf_iQ'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('');

  const filteredReviewers = reviewers.filter(reviewer => {
    const matchesSearch = reviewer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reviewer.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrack = !selectedTrack || reviewer.track.includes(selectedTrack);
    return matchesSearch && matchesTrack;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-[1440px] mx-auto px-6 py-8 md:px-10 lg:px-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">
              Quản Lý Đội Ngũ Phản Biện PC
            </h1>
            <p className="text-slate-600 text-base font-normal mt-3 leading-relaxed">
              Hệ thống quản lý và giám sát năng lực đội ngũ chuyên gia trong Hội đồng chương trình (PC Members), bao gồm mời thành viên và theo dõi khối lượng phản biện.
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 shrink-0 self-start">
            <span className="material-symbols-outlined">person_add</span>
            <span>Mời thành viên mới</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none text-sm transition-all"
              placeholder="Tìm kiếm theo tên, đơn vị, học hàm hoặc phân ban..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-600/20 outline-none"
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
            >
              <option value="">Tất cả phân ban</option>
              <option value="Khoa học máy tính">Khoa học máy tính</option>
              <option value="Công nghệ phần mềm">Công nghệ phần mềm</option>
              <option value="An toàn thông tin">An toàn thông tin</option>
              <option value="Trí tuệ nhân tạo">Trí tuệ nhân tạo</option>
            </select>
            <button className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-lg">filter_list</span>
              <span>Lọc nâng cao</span>
            </button>
          </div>
        </div>

        {/* Reviewers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviewers.map(reviewer => (
            <div key={reviewer.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 overflow-hidden ring-4 ring-blue-600/5">
                    <img alt="Avatar" className="size-full object-cover" src={reviewer.avatar} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 leading-tight">{reviewer.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        reviewer.role === 'Hội đồng chính' 
                          ? 'text-blue-600 bg-blue-600/10' 
                          : 'text-orange-500 bg-orange-50'
                      }`}>
                        {reviewer.role}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-blue-600 transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">business</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">Đơn vị công tác</span>
                    <span className="text-slate-700 font-medium">{reviewer.organization}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">category</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">Phân ban phụ trách</span>
                    <span className="text-slate-700 font-medium">{reviewer.track}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-xl">analytics</span>
                    <span className="text-xs font-bold text-slate-500 uppercase">Khối lượng:</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{reviewer.workload} bài phản biện</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <button className="flex-1 py-2.5 text-sm font-bold text-blue-600 bg-blue-600/5 hover:bg-blue-600 hover:text-white rounded-xl transition-all">
                  Xem năng lực
                </button>
                <button className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-600/5 rounded-xl transition-colors">
                  <span className="material-symbols-outlined">mail</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
            <span className="material-symbols-outlined text-4xl mb-3 opacity-80">groups</span>
            <p className="text-sm opacity-90 mb-1">Tổng số phản biện viên</p>
            <p className="text-3xl font-black">{reviewers.length}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <span className="material-symbols-outlined text-4xl mb-3 opacity-80">analytics</span>
            <p className="text-sm opacity-90 mb-1">Tổng khối lượng phản biện</p>
            <p className="text-3xl font-black">{reviewers.reduce((sum, r) => sum + r.workload, 0)} bài</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <span className="material-symbols-outlined text-4xl mb-3 opacity-80">verified</span>
            <p className="text-sm opacity-90 mb-1">Trung bình mỗi người</p>
            <p className="text-3xl font-black">{Math.round(reviewers.reduce((sum, r) => sum + r.workload, 0) / reviewers.length)} bài</p>
          </div>
        </div>
      </main>

      {/* Material Symbols Icons */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
};

export default ChairReviewersPage;
