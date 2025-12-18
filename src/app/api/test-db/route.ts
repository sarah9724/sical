import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // 测试数据库连接
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .in('tablename', ['cities', 'salaries', 'results']);

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return NextResponse.json(
        {
          error: 'Failed to check database tables',
          details: tablesError.message,
          code: tablesError.code
        },
        { status: 500 }
      );
    }

    // 检查每个表是否存在
    const tableNames = tables?.map(t => t.tablename) || [];
    const citiesExists = tableNames.includes('cities');
    const salariesExists = tableNames.includes('salaries');
    const resultsExists = tableNames.includes('results');

    // 尝试查询每个表
    const testResults: any = {};

    if (citiesExists) {
      const { data: citiesData, error: citiesError } = await supabase
        .from('cities')
        .select('count')
        .limit(1);
      testResults.cities = {
        success: !citiesError,
        error: citiesError?.message,
        count: citiesData?.length || 0
      };
    }

    if (salariesExists) {
      const { data: salariesData, error: salariesError } = await supabase
        .from('salaries')
        .select('count')
        .limit(1);
      testResults.salaries = {
        success: !salariesError,
        error: salariesError?.message,
        count: salariesData?.length || 0
      };
    }

    if (resultsExists) {
      const { data: resultsData, error: resultsError } = await supabase
        .from('results')
        .select('count')
        .limit(1);
      testResults.results = {
        success: !resultsError,
        error: resultsError?.message,
        count: resultsData?.length || 0
      };
    }

    return NextResponse.json({
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set',
      },
      tables: {
        cities: citiesExists,
        salaries: salariesExists,
        results: resultsExists,
        foundTables: tableNames
      },
      testResults,
      success: citiesExists && salariesExists && resultsExists
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        error: 'Database connection failed',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}