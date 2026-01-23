// Frontend/src/pages/chair/ChairEmailTemplatesPage.jsx
// ✅ Email Templates Management

import React, { useState, useEffect } from 'react';
import aiService from '../../services/aiService';

const ChairEmailTemplatesPage = ({ onNavigate }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    variables: []
  });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    // Mock templates
    const mockTemplates = [
      {
        id: 1,
        name: 'Acceptance Email',
        subject: 'Congratulations! Your paper has been accepted',
        body: `Dear {{author_name}},

We are pleased to inform you that your paper "{{paper_title}}" has been accepted for {{conference_name}}.

Acceptance Rate: {{acceptance_rate}}%
Decision: {{decision}}

Please submit the camera-ready version by {{camera_ready_deadline}}.

Congratulations and best regards,
{{chair_name}}
{{conference_name}} Program Committee`,
        variables: ['author_name', 'paper_title', 'conference_name', 'acceptance_rate', 'decision', 'camera_ready_deadline', 'chair_name'],
        usage_count: 15,
        last_used: '2026-01-15T10:30:00'
      },
      {
        id: 2,
        name: 'Rejection Email',
        subject: 'Paper Decision - {{paper_title}}',
        body: `Dear {{author_name}},

Thank you for submitting "{{paper_title}}" to {{conference_name}}.

After careful review by our program committee, we regret to inform you that your paper was not selected for acceptance this time.

We received {{total_submissions}} submissions and could only accept {{accepted_count}} papers ({{acceptance_rate}}% acceptance rate).

We encourage you to consider the reviewers' feedback and submit to future conferences.

Best regards,
{{chair_name}}`,
        variables: ['author_name', 'paper_title', 'conference_name', 'total_submissions', 'accepted_count', 'acceptance_rate', 'chair_name'],
        usage_count: 25,
        last_used: '2026-01-16T14:20:00'
      },
      {
        id: 3,
        name: 'Review Request',
        subject: 'Review Request - {{conference_name}}',
        body: `Dear {{reviewer_name}},

You have been assigned to review the following paper:

Title: {{paper_title}}
Track: {{track_name}}
Keywords: {{keywords}}

Review Deadline: {{review_deadline}}

Please log in to the system to access the paper and submit your review.

Thank you for your valuable contribution.

Best regards,
{{chair_name}}`,
        variables: ['reviewer_name', 'paper_title', 'track_name', 'keywords', 'review_deadline', 'chair_name'],
        usage_count: 40,
        last_used: '2026-01-18T09:00:00'
      }
    ];
    setTemplates(mockTemplates);
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      variables: template.variables
    });
    setEditing(false);
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setFormData({
      name: '',
      subject: '',
      body: '',
      variables: []
    });
    setEditing(true);
  };

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const templateType = formData.name.toLowerCase().includes('accept') ? 'acceptance' :
                          formData.name.toLowerCase().includes('reject') ? 'rejection' :
                          'review_request';
      
      const generated = await aiService.generateEmail(templateType, {
        paperTitle: '{{paper_title}}',
        authorName: '{{author_name}}',
        conferenceName: '{{conference_name}}',
        deadline: '{{deadline}}',
        chairName: '{{chair_name}}'
      });

      const lines = generated.split('\n');
      const subject = lines[0].replace('Subject: ', '');
      const body = lines.slice(2).join('\n');

      setFormData({
        ...formData,
        subject,
        body
      });
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.subject || !formData.body) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const newTemplate = {
      id: selectedTemplate ? selectedTemplate.id : Date.now(),
      ...formData,
      usage_count: selectedTemplate ? selectedTemplate.usage_count : 0,
      last_used: new Date().toISOString()
    };

    if (selectedTemplate) {
      setTemplates(templates.map(t => t.id === selectedTemplate.id ? newTemplate : t));
    } else {
      setTemplates([...templates, newTemplate]);
    }

    alert('✅ Lưu mẫu email thành công!');
    setEditing(false);
    setSelectedTemplate(newTemplate);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa mẫu email này?')) return;
    setTemplates(templates.filter(t => t.id !== id));
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null);
    }
    alert('✅ Đã xóa mẫu email!');
  };

  const extractVariables = (text) => {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    return matches ? matches.map(m => m.replace(/\{\{|\}\}/g, '')) : [];
  };

  const handleBodyChange = (value) => {
    setFormData({
      ...formData,
      body: value,
      variables: [...new Set([...extractVariables(value), ...extractVariables(formData.subject)])]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Mẫu Email</h2>
          <p className="text-sm text-gray-600 mt-1">Tạo và quản lý các mẫu email tự động</p>
        </div>
        <button
          onClick={() => onNavigate('chair')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Quay lại
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Mẫu email</h3>
            <button
              onClick={handleCreateNew}
              className="text-blue-600 hover:text-blue-800"
              title="Tạo mẫu mới"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {templates.map(template => (
              <div
                key={template.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedTemplate?.id === template.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1" onClick={() => handleSelectTemplate(template)}>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{template.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">{template.subject}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>Dùng {template.usage_count} lần</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          {selectedTemplate || editing ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">
                  {editing ? (selectedTemplate ? 'Chỉnh sửa mẫu' : 'Tạo mẫu mới') : 'Xem mẫu'}
                </h3>
                <div className="flex space-x-2">
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Chỉnh sửa
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleGenerateAI}
                        disabled={generating}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300"
                      >
                        {generating ? 'Đang tạo...' : '✨ AI Generate'}
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Hủy
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên mẫu</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  disabled={!editing}
                  placeholder="Ví dụ: Acceptance Email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề email</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  disabled={!editing}
                  placeholder="Subject: ..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung email</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => handleBodyChange(e.target.value)}
                  rows="12"
                  className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                  disabled={!editing}
                  placeholder="Dear {{author_name}}..."
                />
              </div>

              {formData.variables.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Biến có sẵn:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.variables.map((variable, idx) => (
                      <code key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {`{{${variable}}}`}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Chọn một mẫu email để xem hoặc tạo mẫu mới
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChairEmailTemplatesPage;