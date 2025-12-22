import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { localStorageCities } from '@/lib/local-storage';
import { parseCitiesExcel } from '@/lib/excel';

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
    const { data: citiesData, errors } = parseCitiesExcel(buffer);

    if (citiesData.length === 0) {
      return NextResponse.json(
        { error: 'Excel 文件中没有找到有效数据' },
        { status: 400 }
      );
    }

    // 如果有校验错误，返回错误信息
    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: '数据校验失败',
          validationErrors: errors.slice(0, 10), // 最多返回10条错误
          totalErrors: errors.length,
        },
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
          .from('cities')
          .upsert(citiesData, {
            onConflict: 'city_name,year',
            ignoreDuplicates: false
          });

        if (error) {
          // 如果 upsert 失败，尝试普通插入
          console.log('Upsert failed, trying insert:', error);
          const { error: insertError } = await supabaseAdmin
            .from('cities')
            .insert(citiesData);

          if (insertError) {
            throw insertError;
          }
        }
      } catch (error: any) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          {
            error: '数据插入失败',
            details: error.message,
            code: error.code,
            hint: error.hint
          },
          { status: 500 }
        );
      }
    } else {
      // 使用本地存储
      const { error } = await localStorageCities.insert(citiesData);
      if (error) {
        return NextResponse.json(
          { error: '数据保存失败：' + error },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: '城市标准数据上传成功',
      count: citiesData.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: '文件处理失败' },
      { status: 500 }
    );
  }
}