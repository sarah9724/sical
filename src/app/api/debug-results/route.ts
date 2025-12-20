import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 获取所有记录，不排序
    const { data: allRecords, error: allError } = await supabaseAdmin
      .from('results')
      .select('*');

    // 获取按计算日期降序排列的记录
    const { data: sortedRecords, error: sortedError } = await supabaseAdmin
      .from('results')
      .select('*')
      .order('calculation_date', { ascending: false });

    // 获取前端的原始 API 返回
    const { data: apiResults, error: apiError } = await supabaseAdmin
      .from('results')
      .select('*')
      .order('calculation_date', { ascending: false });

    // 统计信息
    const { count, error: countError } = await supabaseAdmin
      .from('results')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      summary: {
        totalRecords: count || 0,
        allRecordsCount: allRecords?.length || 0,
        sortedRecordsCount: sortedRecords?.length || 0,
        apiResultsCount: apiResults?.length || 0,
      },
      errors: {
        allError,
        sortedError,
        apiError,
        countError
      },
      allRecords,
      sortedRecords,
      apiResults
    });
  } catch (error: any) {
    console.error('Debug results error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}