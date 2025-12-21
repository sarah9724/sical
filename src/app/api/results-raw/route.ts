import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    console.log('RAW QUERY: Starting raw database query at:', new Date().toISOString());

    // 每次都创建全新的客户端连接，避免连接池缓存
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const freshSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      // 添加额外的连接配置来绕过缓存
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'Cache-Control': 'no-cache',
          'X-Custom-Header': `bypass-${Date.now()}-${Math.random()}`
        }
      }
    });

    // 方法1: 使用原生SQL查询，绕过所有可能的缓存
    const { data: rawData, error: rawError } = await freshSupabase
      .rpc('get_latest_results', {
        limit_count: 1000
      });

    if (rawError) {
      console.warn('RPC failed, trying direct SQL:', rawError.message);

      // 方法2: 使用直接的SQL查询
      const { data, error } = await freshSupabase
        .from('results')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Direct query failed:', error);
        return NextResponse.json(
          {
            error: 'All query methods failed',
            details: {
              rpcError: rawError.message,
              directError: error.message
            }
          },
          { status: 500 }
        );
      }

      console.log(`DIRECT QUERY: Retrieved ${data?.length || 0} records`);

      return NextResponse.json({
        results: data || [],
        method: 'direct_query',
        count: data?.length || 0,
        timestamp: new Date().toISOString(),
        connectionId: Math.random().toString(36).substring(7)
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0, s-maxage=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'Last-Modified': new Date().toUTCString(),
          'ETag': `"raw-${Date.now()}"`,
          'X-Query-Method': 'direct',
          'X-Connection-ID': Math.random().toString(36).substring(7)
        }
      });
    }

    console.log(`RPC QUERY: Retrieved ${rawData?.length || 0} records`);

    return NextResponse.json({
      results: rawData || [],
      method: 'rpc_query',
      count: rawData?.length || 0,
      timestamp: new Date().toISOString(),
      connectionId: Math.random().toString(36).substring(7)
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0, s-maxage=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'Last-Modified': new Date().toUTCString(),
        'ETag': `"rpc-${Date.now()}"`,
        'X-Query-Method': 'rpc',
        'X-Connection-ID': Math.random().toString(36).substring(7)
      }
    });

  } catch (error: any) {
    console.error('RAW QUERY ERROR:', error);
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
    // POST请求用于强制刷新连接
    console.log('POST: Refreshing database connection at:', new Date().toISOString());

    // 执行一个简单的查询来"唤醒"数据库连接
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const tempSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 执行一个简单的计数查询
    const { count } = await tempSupabase
      .from('results')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      message: 'Connection refreshed',
      currentCount: count,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}