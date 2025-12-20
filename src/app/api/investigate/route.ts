import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. 直接查询所有数据
    const { data: directQuery, error: directError } = await supabaseAdmin
      .from('results')
      .select('*');

    // 2. 获取所有 ID
    const { data: idsOnly, error: idsError } = await supabaseAdmin
      .from('results')
      .select('id');

    // 3. 按不同方式排序
    const { data: byIdDesc, error: idDescError } = await supabaseAdmin
      .from('results')
      .select('*')
      .order('id', { ascending: false });

    const { data: byIdAsc, error: idAscError } = await supabaseAdmin
      .from('results')
      .select('*')
      .order('id', { ascending: true });

    const { data: byDateDesc, error: dateDescError } = await supabaseAdmin
      .from('results')
      .select('*')
      .order('calculation_date', { ascending: false });

    // 4. 使用原始 SQL 查询
    const { data: rawSql, error: rawSqlError } = await supabaseAdmin
      .rpc('get_all_results_raw');

    // 5. 检查最新的 10 个 ID
    const maxId = Math.max(...(idsOnly?.map(r => r.id) || [0]));
    const { data: latestRecords, error: latestError } = await supabaseAdmin
      .from('results')
      .select('*')
      .gte('id', maxId - 9)
      .order('id', { ascending: false });

    // 6. 计算统计信息
    const stats = {
      maxId,
      minId: Math.min(...(idsOnly?.map(r => r.id) || [0])),
      idCount: idsOnly?.length || 0,
      directCount: directQuery?.length || 0,
      byIdDescCount: byIdDesc?.length || 0,
      byIdAscCount: byIdAsc?.length || 0,
      byDateDescCount: byDateDesc?.length || 0,
      latestCount: latestRecords?.length || 0
    };

    return NextResponse.json({
      stats,
      latestRecords: latestRecords || [],
      allIds: idsOnly || [],
      errors: {
        directError,
        idsError,
        idDescError,
        idAscError,
        dateDescError,
        rawSqlError,
        latestError
      },
      // 只返回前 5 条记录作为样本
      samples: {
        direct: directQuery?.slice(0, 5),
        byIdDesc: byIdDesc?.slice(0, 5),
        byIdAsc: byIdAsc?.slice(0, 5),
        byDateDesc: byDateDesc?.slice(0, 5)
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}