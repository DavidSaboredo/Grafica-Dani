import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar variables de entorno (sin exponer valores sensibles)
    const envCheck = {
      GOOGLE_PROJECT_ID: !!process.env.GOOGLE_PROJECT_ID,
      GOOGLE_PRIVATE_KEY_ID: !!process.env.GOOGLE_PRIVATE_KEY_ID,
      GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
      GOOGLE_CLIENT_EMAIL: !!process.env.GOOGLE_CLIENT_EMAIL,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_SHEET_ID: !!process.env.GOOGLE_SHEET_ID,
      // Mostrar solo los primeros caracteres para verificar
      GOOGLE_PROJECT_ID_PREVIEW: process.env.GOOGLE_PROJECT_ID?.substring(0, 10) + '...',
      GOOGLE_CLIENT_EMAIL_PREVIEW: process.env.GOOGLE_CLIENT_EMAIL?.substring(0, 20) + '...',
      GOOGLE_SHEET_ID_PREVIEW: process.env.GOOGLE_SHEET_ID?.substring(0, 10) + '...',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV
    };

    return NextResponse.json({
      status: 'debug_info',
      environment_variables: envCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}