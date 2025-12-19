import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    environment: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set',
    },
    url_length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    anon_key_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    service_key_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
  });
}