import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    noStore();
    // 添加强制刷新提示，避免 Supabase 查询缓存
    const forceRefresh = new Date().getTime();

    // 使用 RPC 方式获取数据（如果可用）以绕过缓存
    // 或者使用不同的查询策略

    // 策略1: 直接查询，使用不同的查询方式
    const { data: data1, error: error1 } = await supabaseAdmin
      .from('results')
      .select('*', { count: 'exact' })
      .order('id', { ascending: false });

    // 策略2: 使用头部强制不缓存
    const { data: data2, error: error2 } = await supabaseAdmin
      .from('results')
      .select('*')
      .order('id', { ascending: false });

    // 获取记录总数 - 使用 distinct 来强制重新计算
    const { count, error: countError } = await supabaseAdmin
      .from('results')
      .select('id', { count: 'exact', head: true });

    // 获取所有 ID 列表
    const { data: allIds, error: idsError } = await supabaseAdmin
      .from('results')
      .select('id')
      .order('id', { ascending: false });

    // 使用 data2 作为主要数据源，因为它是最直接的查询
    const data = data2;
    const error = error2;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        {
          error: '获取数据失败：' + error.message,
          debug: {
            totalRecords: count || 0,
            data1Count: data1?.length || 0,
            data2Count: data2?.length || 0,
            idsCount: allIds?.length || 0,
            error1: error1?.message,
            error2: error2?.message,
            idsError: idsError?.message
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      results: data || [],
      debug: {
        totalRecords: count,
        data1Count: data1?.length || 0,
        data2Count: data2?.length || 0,
        idsCount: allIds?.length || 0,
        timestamp: new Date().toISOString(),
        // 显示最新的几个 ID
        latestIds: allIds?.slice(0, 10) || []
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
