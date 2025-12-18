import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { localStorageResults } from '@/lib/local-storage';

export async function GET(request: NextRequest) {
  try {
    // 检查是否使用本地存储
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const useLocalStorage = !supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder');

    let results: any[] = [];

    if (useLocalStorage) {
      results = localStorageResults.getAll();
    } else {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .order('calculation_date', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: '获取数据失败：' + error.message },
          { status: 500 }
        );
      }
      results = data || [];
    }

    return NextResponse.json({
      results: results || [],
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}