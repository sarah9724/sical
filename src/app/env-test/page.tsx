'use client';

export default function EnvTest() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">环境变量测试</h1>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div>
            <h3 className="font-semibold">NEXT_PUBLIC_SUPABASE_URL:</h3>
            <p className="text-sm">
              {supabaseUrl ?
                `${supabaseUrl.substring(0, 20)}... (长度: ${supabaseUrl.length})` :
                '未设置'
              }
            </p>
          </div>

          <div>
            <h3 className="font-semibold">NEXT_PUBLIC_SUPABASE_ANON_KEY:</h3>
            <p className="text-sm">
              {supabaseAnon ?
                `已设置 (长度: ${supabaseAnon.length})` :
                '未设置'
              }
            </p>
          </div>

          <div>
            <h3 className="font-semibold">SUPABASE_SERVICE_ROLE_KEY:</h3>
            <p className="text-sm">
              {supabaseService ?
                `已设置 (长度: ${supabaseService.length})` :
                '未设置'
              }
            </p>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">部署信息</h2>
          <p className="text-sm">当前时间: {new Date().toLocaleString('zh-CN')}</p>
          <p className="text-sm">Git Commit: {process.env.VERCEL_GIT_COMMIT_SHA || '本地环境'}</p>
        </div>
      </div>
    </div>
  );
}