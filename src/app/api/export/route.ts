import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    // 获取计算结果
    const { data: results, error } = await supabaseAdmin
      .from('results')
      .select('*')
      .order('calculation_date', { ascending: false });

    if (error) {
      console.error('Error fetching results:', error);
      return NextResponse.json(
        { error: '获取计算结果失败', details: error.message },
        { status: 500 }
      );
    }

    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: '没有可导出的数据' },
        { status: 404 }
      );
    }

    // 准备导出数据
    const exportData = results.map(item => ({
      '员工姓名': item.employee_name,
      '平均工资': item.avg_salary,
      '缴费基数': item.contribution_base,
      '公司缴纳金额': item.company_fee,
      '计算时间': new Date(item.calculation_date).toLocaleString('zh-CN')
    }));

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // 设置列宽
    const colWidths = [
      { wch: 15 }, // 员工姓名
      { wch: 15 }, // 平均工资
      { wch: 15 }, // 缴费基数
      { wch: 18 }, // 公司缴纳金额
      { wch: 25 }  // 计算时间
    ];
    ws['!cols'] = colWidths;

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '社保计算结果');

    // 生成文件名（包含时间戳）
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `社保计算结果_${timestamp}.xlsx`;

    // 生成 Excel 文件
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 返回文件响应
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: '导出过程中发生错误', details: error.message },
      { status: 500 }
    );
  }
}