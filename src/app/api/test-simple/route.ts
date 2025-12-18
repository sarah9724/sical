import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const results: any = {
    environment: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...' || 'Not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set',
    },
    tables: {}
  };

  // 测试 cities 表
  try {
    const { data, error } = await supabaseAdmin
      .from('cities')
      .select('count')
      .limit(1);

    results.tables.cities = {
      exists: true,
      error: error?.message || null,
      success: !error
    };
  } catch (e: any) {
    results.tables.cities = {
      exists: false,
      error: e.message,
      success: false
    };
  }

  // 测试 salaries 表
  try {
    const { data, error } = await supabaseAdmin
      .from('salaries')
      .select('count')
      .limit(1);

    results.tables.salaries = {
      exists: true,
      error: error?.message || null,
      success: !error
    };
  } catch (e: any) {
    results.tables.salaries = {
      exists: false,
      error: e.message,
      success: false
    };
  }

  // 测试 results 表
  try {
    const { data, error } = await supabaseAdmin
      .from('results')
      .select('count')
      .limit(1);

    results.tables.results = {
      exists: true,
      error: error?.message || null,
      success: !error
    };
  } catch (e: any) {
    results.tables.results = {
      exists: false,
      error: e.message,
      success: false
    };
  }

  // 计算总体成功状态
  results.overallSuccess = Object.values(results.tables).every((t: any) => t.success);

  return NextResponse.json(results);
}