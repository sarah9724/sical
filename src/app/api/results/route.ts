import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 获取所有记录，不排序
    const { data: allData, error: allError } = await supabaseAdmin
      .from('results')
      .select('*');

    // 获取排序后的记录 - 改为按 id 降序排序，确保所有记录都能返回
    const { data, error } = await supabaseAdmin
      .from('results')
      .select('*')
      .order('id', { ascending: false });

    // 获取记录总数
    const { count, error: countError } = await supabaseAdmin
      .from('results')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        {
          error: '获取数据失败：' + error.message,
          debug: {
            totalRecords: count || 0,
            allRecordsCount: Array.isArray(allData) ? allData.length : 0,
            sortedRecordsCount: Array.isArray(data) ? data.length : 0,
            countError: countError?.message,
            allError: allError?.message
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      results: data || [],
      debug: {
        totalRecords: count,
        allRecordsCount: Array.isArray(allData) ? allData.length : 0,
        sortedRecordsCount: Array.isArray(data) ? data.length : 0
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