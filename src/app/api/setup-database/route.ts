import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
  try {
    console.log('Setting up database functions at:', new Date().toISOString());

    // 创建必要的PostgreSQL函数
    const sqlStatements = `
      -- 创建获取最新结果的函数
      CREATE OR REPLACE FUNCTION get_latest_results(limit_count INTEGER DEFAULT 1000)
      RETURNS TABLE (
          id BIGINT,
          employee_name TEXT,
          avg_salary DOUBLE PRECISION,
          contribution_base DOUBLE PRECISION,
          company_fee DOUBLE PRECISION,
          calculation_date TIMESTAMPTZ
      ) LANGUAGE plpgsql AS $$
      BEGIN
          RETURN QUERY
          SELECT
              r.id,
              r.employee_name,
              r.avg_salary,
              r.contribution_base,
              r.company_fee,
              r.calculation_date
          FROM
              results r
          ORDER BY
              r.id DESC
          LIMIT limit_count;
      END;
      $$;

      -- 创建缓存失效函数
      CREATE OR REPLACE FUNCTION invalidate_cache()
      RETURNS BOOLEAN LANGUAGE plpgsql AS $$
      BEGIN
          PERFORM pg_stat_reset();
          PERFORM pg_notify('cache_invalidate', now()::text);
          RETURN TRUE;
      END;
      $$;

      -- 创建获取记录总数的函数
      CREATE OR REPLACE FUNCTION get_results_count()
      RETURNS BIGINT LANGUAGE plpgsql AS $$
      DECLARE
          result_count BIGINT;
      BEGIN
          SELECT COUNT(*) INTO result_count FROM results;
          RETURN result_count;
      END;
      $$;
    `;

    // 执行SQL语句
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql: sqlStatements });

    if (error) {
      console.warn('Could not exec SQL via RPC, trying individual function creation');

      // 如果RPC失败，尝试直接创建单个函数
      const functions = [
        `CREATE OR REPLACE FUNCTION get_latest_results(limit_count INTEGER DEFAULT 1000)
         RETURNS TABLE(id BIGINT, employee_name TEXT, avg_salary DOUBLE PRECISION,
                      contribution_base DOUBLE PRECISION, company_fee DOUBLE PRECISION,
                      calculation_date TIMESTAMPTZ) AS $$
         BEGIN RETURN QUERY SELECT * FROM results ORDER BY id DESC LIMIT limit_count; END; $$ LANGUAGE plpgsql;`,

        `CREATE OR REPLACE FUNCTION invalidate_cache() RETURNS BOOLEAN AS $$
         BEGIN PERFORM pg_stat_reset(); RETURN TRUE; END; $$ LANGUAGE plpgsql;`
      ];

      for (const funcSql of functions) {
        try {
          await supabaseAdmin.rpc('exec_sql', { sql: funcSql });
        } catch (e) {
          console.log('Function creation may need manual setup:', e);
        }
      }
    }

    return NextResponse.json({
      message: 'Database functions setup completed',
      note: 'If functions were not created via RPC, please manually execute the SQL in src/lib/database-functions.sql',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        note: 'Please manually execute the SQL in src/lib/database-functions.sql in your Supabase SQL editor'
      },
      { status: 500 }
    );
  }
}