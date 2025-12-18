import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { localStorageSalaries } from '@/lib/local-storage';
import { parseSalariesExcel } from '@/lib/excel';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '请选择要上传的文件' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const salariesData = parseSalariesExcel(buffer);

    if (salariesData.length === 0) {
      return NextResponse.json(
        { error: 'Excel 文件中没有找到有效数据' },
        { status: 400 }
      );
    }

    // 尝试使用 Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
      // 使用 Supabase - 使用 upsert 来避免重复数据
      try {
        const { error } = await supabaseAdmin
          .from('salaries')
          .upsert(salariesData, {
            onConflict: 'employee_id,month',
            ignoreDuplicates: false
          });

        if (error) {
          // 如果 upsert 失败，尝试普通插入
          console.log('Upsert failed, trying insert:', error);
          const { error: insertError } = await supabaseAdmin
            .from('salaries')
            .insert(salariesData);

          if (insertError) {
            throw insertError;
          }
        }
      } catch (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: '数据插入失败：' + (error as any).message },
          { status: 500 }
        );
      }
    } else {
      // 使用本地存储
      const { error } = await localStorageSalaries.insert(salariesData);
      if (error) {
        return NextResponse.json(
          { error: '数据保存失败：' + error },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: '员工工资数据上传成功',
      count: salariesData.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: '文件处理失败' },
      { status: 500 }
    );
  }
}