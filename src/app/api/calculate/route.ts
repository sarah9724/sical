import { NextRequest, NextResponse } from 'next/server';
import { calculateContributions } from '@/lib/calculations';

export async function POST(request: NextRequest) {
  try {
    const results = await calculateContributions();

    return NextResponse.json({
      message: '计算完成',
      count: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Calculation error:', error);
    return NextResponse.json(
      { error: error.message || '计算失败' },
      { status: 500 }
    );
  }
}