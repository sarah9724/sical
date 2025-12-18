'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleCityUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');
    setMessageType('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/cities', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`成功导入 ${result.count} 条城市标准数据`);
        setMessageType('success');
      } else {
        setMessage(result.error || '上传失败');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('上传过程中发生错误');
      setMessageType('error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSalaryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');
    setMessageType('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/salaries', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`成功导入 ${result.count} 条员工工资数据`);
        setMessageType('success');
      } else {
        setMessage(result.error || '上传失败');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('上传过程中发生错误');
      setMessageType('error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleCalculate = async () => {
    setUploading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`计算完成！共处理 ${result.count} 名员工的数据`);
        setMessageType('success');
      } else {
        setMessage(result.error || '计算失败');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('计算过程中发生错误');
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">
            ← 返回主页
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">数据上传管理</h1>

        <div className="space-y-8">
          {/* 城市标准上传 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">城市标准上传</h2>
            <p className="text-gray-600 mb-4">
              请上传包含城市社保标准的 Excel 文件。文件应包含以下列：
              city_name, year, base_min, base_max, rate
            </p>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleCityUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* 员工工资上传 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">员工工资上传</h2>
            <p className="text-gray-600 mb-4">
              请上传包含员工工资数据的 Excel 文件。文件应包含以下列：
              employee_id, employee_name, month, salary_amount
            </p>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleSalaryUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* 执行计算 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">执行计算</h2>
            <p className="text-gray-600 mb-4">
              点击下方按钮，系统将根据已上传的数据自动计算每位员工的社保公积金缴纳金额。
            </p>
            <button
              onClick={handleCalculate}
              disabled={uploading}
              className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? '处理中...' : '执行批量计算'}
            </button>
          </div>

          {/* 消息提示 */}
          {message && (
            <div
              className={`rounded-lg p-4 ${
                messageType === 'success'
                  ? 'bg-green-50 text-green-800'
                  : messageType === 'error'
                  ? 'bg-red-50 text-red-800'
                  : ''
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}