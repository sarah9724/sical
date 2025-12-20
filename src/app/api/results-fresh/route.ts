import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    console.log('Fetching fresh results at:', new Date().toISOString());

    // 使用最简单的查询方式，获取所有记录
    const { data, error } = await supabaseAdmin
      .from('results')
      .select('*')
      .order('id', { ascending: false })
      .limit(100); // 设置一个合理的限制

    if (error) {
      console.error('Error fetching results:', error);
      return NextResponse.json(
        {
          error: error.message,
          details: error
        },
        { status: 500 }
      );
    }

    console.log('Fetched records count:', data?.length || 0);

    return NextResponse.json({
      results: data || [],
      count: data?.length || 0,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}