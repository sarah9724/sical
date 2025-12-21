-- 创建一个强制获取最新结果的函数
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
    -- 执行一个不使用任何缓存的查询
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

-- 创建一个缓存失效函数
CREATE OR REPLACE FUNCTION invalidate_cache()
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
    -- 执行一个简单的操作来触发PostgreSQL缓存失效
    PERFORM pg_stat_reset();

    -- 或者执行一个无害的通知
    PERFORM pg_notify('cache_invalidate', now()::text);

    RETURN TRUE;
END;
$$;

-- 创建一个获取记录总数的函数
CREATE OR REPLACE FUNCTION get_results_count()
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE
    result_count BIGINT;
BEGIN
    -- 使用 COUNT(*) 来确保获取最新的计数
    SELECT COUNT(*) INTO result_count FROM results;

    RETURN result_count;
END;
$$;