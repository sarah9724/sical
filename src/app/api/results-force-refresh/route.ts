import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    console.log('FORCE REFRESH: Getting results at:', new Date().toISOString());
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);

    // 策略1: 执行一个无害的数据库操作来触发缓存刷新
    // 使用WITH子查询确保每次查询都不同
    const { data, error } = await supabaseAdmin
      .from('results')
      .select(`
        *,
        _query_ts:${timestamp}::text,
        _random_id:${randomId}::text
      `)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error in force refresh:', error);

      // 策略2: 如果主查询失败，尝试另一种方式
      const { data: fallbackData, error: fallbackError } = await supabaseAdmin
        .from('results')
        .select('*')
        .order('calculation_date', { ascending: false });

      if (fallbackError) {
        return NextResponse.json(
          { error: 'All query strategies failed' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        results: fallbackData || [],
        method: 'fallback_order_by_date',
        timestamp: new Date().toISOString(),
        forceRefresh: true
      }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, private, max-age=0, s-maxage=0, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store, no-cache, must-revalidate',
          'Last-Modified': new Date().toUTCString(),
          'ETag': `"${timestamp}-${randomId}"`
        }
      });
    }

    // 策略3: 执行计数查询来验证数据一致性
    const { count, error: countError } = await supabaseAdmin
      .from('results')
      .select('id', { count: 'exact', head: true });

    console.log(`FORCE REFRESH: Got ${data?.length || 0} records, count=${count}`);

    return NextResponse.json({
      results: data || [],
      count: data?.length || 0,
      totalCount: count,
      timestamp: new Date().toISOString(),
      randomId,
      forceRefresh: true,
      cacheHeaders: 'max-force'
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, private, max-age=0, s-maxage=0, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store, no-cache, must-revalidate',
        'Last-Modified': new Date().toUTCString(),
        'ETag': `"${timestamp}-${randomId}"`,
        'X-Force-Refresh': timestamp.toString(),
        'X-Random-ID': randomId
      }
    });

  } catch (error: any) {
    console.error('Force refresh error:', error);
    return NextResponse.json(
      {
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // POST请求用于强制清除缓存
    console.log('CLEARING CACHE at:', new Date().toISOString());

    // 执行一个无害的更新操作来触发缓存失效
    const { error } = await supabaseAdmin
      .from('results')
      .select('id')
      .limit(1);

    return NextResponse.json({
      message: 'Cache cleared',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private'
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}