import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    noStore();
    console.log('Fetching fresh results at:', new Date().toISOString());
    const requestId = Math.random().toString(36).substring(7);

    // 方案1: 使用PostgreSQL函数来强制刷新缓存
    const { data: freshData, error: freshError } = await supabaseAdmin
      .rpc('get_fresh_results', {
        request_id: requestId
      });

    // 如果RPC调用失败，回退到直接查询
    if (freshError) {
      console.warn('RPC failed, falling back to direct query:', freshError);

      // 方案2: 使用多重查询策略来绕过缓存
      const timestamp = Date.now();

      // 先执行一个写操作来触发缓存失效（但立即回滚）
      await supabaseAdmin.rpc('invalidate_cache');

      // 然后立即查询
      const { data, error } = await supabaseAdmin
        .from('results')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error fetching results:', error);
        return NextResponse.json(
          {
            error: error.message,
            debug: {
              requestId,
              timestamp,
              fallback: true
            }
          },
          { status: 500 }
        );
      }

      console.log(`[FALLBACK] Fetched records count: ${data?.length || 0} at ${new Date().toISOString()}`);

      return NextResponse.json({
        results: data || [],
        count: data?.length || 0,
        timestamp: new Date().toISOString(),
        requestId,
        method: 'fallback',
        cacheBusting: true
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0, s-maxage=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'Vary': '*'
        }
      });
    }

    console.log(`[RPC] Fetched records count: ${freshData?.length || 0} at ${new Date().toISOString()}`);

    return NextResponse.json({
      results: freshData || [],
      count: freshData?.length || 0,
      timestamp: new Date().toISOString(),
      requestId,
      method: 'rpc',
      cacheBusting: true
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0, s-maxage=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'Vary': '*'
      }
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
