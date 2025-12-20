import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 获取最新的 5 条记录，按 id 降序
    const { data, error } = await supabaseAdmin
      .from('results')
      .select('*')
      .order('id', { ascending: false })
      .limit(10);

    // 检查每条记录的 calculation_date
    const recordsWithDateCheck = (data || []).map(record => ({
      ...record,
      hasCalculationDate: !!record.calculation_date,
      calculationDateType: typeof record.calculation_date,
      calculationDateValue: record.calculation_date
    }));

    return NextResponse.json({
      totalRecords: data?.length || 0,
      records: recordsWithDateCheck,
      error: error?.message
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}