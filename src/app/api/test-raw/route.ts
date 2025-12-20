import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 尝试不同的查询方式

    // 1. 最简单的查询
    const { data: simple, error: simpleError } = await supabaseAdmin
      .from('results')
      .select('id, employee_name');

    // 2. 查询所有字段但不排序
    const { data: noSort, error: noSortError } = await supabaseAdmin
      .from('results')
      .select('*');

    // 3. 使用 RPC 调用（如果可用）
    const { data: rpcData, error: rpcError } = await supabaseAdmin
      .rpc('get_all_results');

    return NextResponse.json({
      simpleQuery: {
        data: simple,
        error: simpleError?.message,
        count: simple?.length || 0
      },
      noSortQuery: {
        data: noSort,
        error: noSortError?.message,
        count: noSort?.length || 0
      },
      rpcQuery: {
        data: rpcData,
        error: rpcError?.message,
        count: rpcData?.length || 0
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}