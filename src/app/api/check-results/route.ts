import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 检查 results 表中的所有数据
    const { data: allResults, error: allError } = await supabaseAdmin
      .from('results')
      .select('*')
      .order('calculation_date', { ascending: false });

    // 检查最新的 10 条记录
    const { data: recentResults, error: recentError } = await supabaseAdmin
      .from('results')
      .select('*')
      .order('calculation_date', { ascending: false })
      .limit(10);

    // 获取记录总数
    const { count, error: countError } = await supabaseAdmin
      .from('results')
      .select('*', { count: 'exact', head: true });

    // 获取今天创建的记录
    const today = new Date().toISOString().split('T')[0];
    const { data: todayResults, error: todayError } = await supabaseAdmin
      .from('results')
      .select('*')
      .gte('calculation_date', today)
      .order('calculation_date', { ascending: false });

    return NextResponse.json({
      summary: {
        totalRecords: count || 0,
        todayRecords: todayResults?.length || 0,
        recentRecords: recentResults?.length || 0
      },
      allError,
      recentError,
      countError,
      todayError,
      sampleData: recentResults || [],
      todayData: todayResults || []
    });
  } catch (error: any) {
    console.error('Check results error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}