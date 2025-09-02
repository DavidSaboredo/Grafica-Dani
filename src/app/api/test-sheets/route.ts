import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    // Verificar que todas las variables estén presentes
    const requiredEnvVars = [
      'GOOGLE_PROJECT_ID',
      'GOOGLE_PRIVATE_KEY_ID', 
      'GOOGLE_PRIVATE_KEY',
      'GOOGLE_CLIENT_EMAIL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_SHEET_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return NextResponse.json({
        status: 'error',
        message: 'Variables de entorno faltantes',
        missing_variables: missingVars
      }, { status: 500 });
    }

    // Configurar credenciales
    const credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
    };

    // Crear instancia de autenticación
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    // Crear instancia de Sheets API
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = process.env.GOOGLE_SHEET_ID;

    // Intentar leer datos de la hoja
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Hoja 1!A1:F10', // Leer las primeras 10 filas para prueba
    });

    const rows = response.data.values;

    return NextResponse.json({
      status: 'success',
      message: 'Conexión exitosa con Google Sheets',
      data: {
        rows_count: rows?.length || 0,
        first_few_rows: rows?.slice(0, 3) || [], // Solo las primeras 3 filas para debug
        sheet_id_used: sheetId?.substring(0, 10) + '...'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en test-sheets:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Error al conectar con Google Sheets',
      error_details: {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}