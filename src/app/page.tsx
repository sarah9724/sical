import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
          五险一金计算器
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 数据上传卡片 */}
          <Link href="/upload" className="group">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-8 cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">数据上传</h2>
                <p className="text-gray-600">上传城市标准和员工工资数据</p>
                <p className="text-sm text-blue-600 mt-4 group-hover:text-blue-700">
                  点击进入 →
                </p>
              </div>
            </div>
          </Link>

          {/* 结果查询卡片 */}
          <Link href="/results" className="group">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-8 cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">结果查询</h2>
                <p className="text-gray-600">查看社保公积金计算结果</p>
                <p className="text-sm text-green-600 mt-4 group-hover:text-green-700">
                  点击进入 →
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}