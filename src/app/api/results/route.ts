import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 强制动态渲染，禁用所有缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('placeholder')) {
      return NextResponse.json(
        { error: '数据库未配置' },
        { status: 500 }
      );
    }

    // 关键：每次请求都创建全新的客户端，不复用任何连接
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 直接查询，不使用任何 RPC 或复杂策略
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: '获取数据失败：' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        results: data || [],
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '服务器错误：' + error.message },
      { status: 500 }
    );
  }
}
