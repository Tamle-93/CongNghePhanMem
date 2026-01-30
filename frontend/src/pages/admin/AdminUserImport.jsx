import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getSaveErrorMessage } from '../../utils/errorHandler';

const AdminUserImport = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/)) {
        alert('Vui lòng chọn file CSV hoặc Excel (.xlsx, .xls)');
        return;
      }
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = lines.slice(1, 6).map(line => {
        const values = line.split(',');
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || '';
        });
        return row;
      });
      
      setPreview(data);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file) {
      alert('Vui lòng chọn file để nhập');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/admin/users/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        setResults(response.data.data);
      }
    } catch (error) {
      console.error('Error importing users:', error);
      alert(getSaveErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ['full_name', 'email', 'organization', 'password', 'roles'];
    const sampleData = [
      ['Nguyễn Văn A', 'nguyenvana@uth.edu.vn', 'cntt', 'Password@123', 'Author'],
      ['Trần Thị B', 'tranthib@uth.edu.vn', 'dien', 'Password@123', 'Reviewer'],
      ['Lê Văn C', 'levanc@uth.edu.vn', 'co_khi', 'Password@123', 'Author;Reviewer']
    ];
    
    const csv = [headers.join(','), ...sampleData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'user_import_template.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Nhập Người Dùng Hàng Loạt</h1>
          <p className="mt-2 text-gray-600">Tải lên file CSV hoặc Excel để nhập nhiều người dùng cùng lúc</p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined">info</span>
            Hướng dẫn
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• File phải có các cột: <strong>full_name, email, organization, password, roles</strong></li>
            <li>• Nếu có nhiều vai trò, phân cách bằng dấu chấm phẩy (;). Ví dụ: Author;Reviewer</li>
            <li>• Các vai trò hợp lệ: Author, Reviewer, Chair, Admin</li>
            <li>• Email phải là duy nhất trong hệ thống</li>
          </ul>
          <button 
            onClick={downloadTemplate}
            className="mt-4 flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Tải file mẫu
          </button>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="material-symbols-outlined text-4xl text-gray-400 mb-4">upload_file</span>
            <p className="text-gray-600 mb-2">
              {file ? file.name : 'Kéo thả file hoặc click để chọn'}
            </p>
            <p className="text-xs text-gray-400">Hỗ trợ CSV, Excel (.xlsx, .xls)</p>
          </div>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">preview</span>
              Xem trước dữ liệu (5 dòng đầu)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {Object.keys(preview[0] || {}).map(key => (
                      <th key={key} className="px-4 py-2 text-left font-semibold text-gray-700">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {preview.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="px-4 py-2 text-gray-900">{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Kết quả nhập liệu</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700">{results.success || 0}</p>
                <p className="text-sm text-green-600">Thành công</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-700">{results.failed || 0}</p>
                <p className="text-sm text-red-600">Thất bại</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-gray-700">{results.total || 0}</p>
                <p className="text-sm text-gray-600">Tổng cộng</p>
              </div>
            </div>
            {results.errors && results.errors.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Các lỗi:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {results.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-all"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">upload</span>
            {loading ? 'Đang xử lý...' : 'Nhập dữ liệu'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminUserImport;
