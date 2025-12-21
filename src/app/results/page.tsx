'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { CalculationResult } from '@/types';

export default function ResultsPage() {
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    setError('');

    try {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const requestId = `${timestamp}-${randomId}`;

      console.log(`[${requestId}] 开始强制刷新数据...`);

      // 步骤1: 先使用POST请求刷新连接
      console.log(`[${requestId}] 步骤1: 刷新数据库连接...`);
      await fetch(`/api/results-raw`, {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'X-Request-ID': requestId
        }
      });

      // 步骤2: 等待一小段时间确保连接刷新
      await new Promise(resolve => setTimeout(resolve, 100));

      // 步骤3: 使用原始查询API获取最新数据
      console.log(`[${requestId}] 步骤2: 执行原始查询...`);
      const response = await fetch(`/api/results-raw?t=${timestamp}&r=${randomId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Request-ID': requestId,
          'X-Bypass-Cache': 'true'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
        console.log(`[${requestId}] ✅ 原始查询成功:`, {
          记录数: data.results?.length || 0,
          查询方法: data.method,
          时间戳: data.timestamp,
          连接ID: data.connectionId
        });
      } else {
        console.warn(`[${requestId}] 原始查询失败，尝试强制刷新方案:`, data.error);

        // 步骤4: 如果原始查询失败，尝试之前的强制刷新方案
        const forceRefreshResponse = await fetch(`/api/results-force-refresh?_t=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'X-Request-ID': requestId
          }
        });

        const forceRefreshData = await forceRefreshResponse.json();

        if (forceRefreshResponse.ok) {
          setResults(forceRefreshData.results || []);
          console.log(`[${requestId}] ✅ 强制刷新成功:`, {
            记录数: forceRefreshData.results?.length || 0,
            刷新方式: forceRefreshData.method
          });
        } else {
          // 步骤5: 最后的备用方案
          console.warn(`[${requestId}] 所有方案都失败了，使用最后的备用方案`);
          const fallbackResponse = await fetch(`/api/results-fresh?_t=${Date.now()}&backup=true`, {
            cache: 'no-store'
          });
          const fallbackData = await fallbackResponse.json();

          if (fallbackResponse.ok) {
            setResults(fallbackData.results || []);
            console.log(`[${requestId}] ✅ 备用方案成功:`, {
              记录数: fallbackData.results?.length || 0
            });
          } else {
            setError(`无法获取最新数据: ${data.error || forceRefreshData.error || fallbackData.error || '未知错误'}`);
            console.error(`[${requestId}] ❌ 所有方案都失败了`);
          }
        }
      }
    } catch (error) {
      setError('获取数据时发生网络错误');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      console.log(`[${requestId}] 刷新请求完成`);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    setError('');

    try {
      const response = await fetch('/api/export');

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || '导出失败');
        return;
      }

      // 获取文件名
      const contentDisposition = response.headers.get('Content-Disposition');
      const fileNameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
      const fileName = fileNameMatch ? fileNameMatch[1] : '社保计算结果.xlsx';

      // 创建下载链接
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('导出过程中发生错误');
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">
            ← 返回主页
          </Link>
          <div className="flex space-x-4">
            {results.length > 0 && (
              <button
                onClick={handleExport}
                disabled={exporting || loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {exporting ? '导出中...' : '导出 Excel'}
              </button>
            )}
            <button
              onClick={fetchResults}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? '刷新中...' : '刷新数据'}
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">计算结果查询</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无计算结果</h3>
            <p className="text-gray-500">
              请先前往上传页面导入数据并执行计算
            </p>
            <Link
              href="/upload"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              前往上传
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      员工姓名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      平均工资
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      缴费基数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      公司缴纳金额
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.employee_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ¥{result.avg_salary.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ¥{result.contribution_base.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ¥{result.company_fee.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-3">
              <p className="text-sm text-gray-700">
                共 {results.length} 条记录
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}