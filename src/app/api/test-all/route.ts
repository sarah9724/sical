import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 获取所有记录
    const { data: all, error: allError } = await supabaseAdmin
      .from('results')
      .select('*');

    // 查看有日期的记录
    const { data: withDate, error: dateError } = await supabaseAdmin
      .from('results')
      .select('*')
      .not('calculation_date', 'is', null);

    // 查看没有日期的记录
    const { data: withoutDate, error: nullDateError } = await supabaseAdmin
      .from('results')
      .select('*')
      .is('calculation_date', null);

    return NextResponse.json({
      total: {
        count: all?.length,
        error: allError?.message
      },
      withDate: {
        count: withDate?.length,
        data: withDate,
        error: dateError?.message
      },
      withoutDate: {
        count: withoutDate?.length,
        data: withoutDate,
        error: nullDateError?.message
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}