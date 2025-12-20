import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 获取排序后的记录 - 直接获取所有记录并按 id 降序排序
    const { data, error } = await supabaseAdmin
      .from('results')
      .select('*')
      .order('id', { ascending: false });

    // 获取记录总数
    const { count, error: countError } = await supabaseAdmin
      .from('results')
      .select('*', { count: 'exact', head: true });

    // 为了调试，获取所有记录
    const { data: allData, error: allError } = await supabaseAdmin
      .from('results')
      .select('id, employee_name');

    // 检查最大 ID
    const maxId = allData && allData.length > 0 ? Math.max(...allData.map(r => r.id)) : 0;

    // 获取最新 10 条记录
    const { data: latestData, error: latestError } = await supabaseAdmin
      .from('results')
      .select('*')
      .gte('id', Math.max(0, maxId - 9))
      .order('id', { ascending: false });

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
        sortedRecordsCount: Array.isArray(data) ? data.length : 0,
        latestCount: Array.isArray(latestData) ? latestData.length : 0,
        maxId: maxId,
        sampleIds: allData?.slice(0, 10).map(r => ({ id: r.id, name: r.employee_name })) || [],
        allEmployeeNames: allData?.map(r => r.employee_name) || []
      },
      // 添加时间戳以防止缓存
      timestamp: new Date().toISOString()
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