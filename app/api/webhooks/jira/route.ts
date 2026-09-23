import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Conexión a tu base de datos Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    // 1. Recibir el paquete de datos que nos manda Jira
    const payload = await request.json();

    // 2. Extraer los datos clave del ticket de Jira
    const jiraKey = payload.issue?.key;
    const nuevoEstado = payload.issue?.fields?.status?.name;

    if (!jiraKey || !nuevoEstado) {
      return NextResponse.json(
        { error: 'Faltan datos en el envío de Jira' },
        { status: 400 }
      );
    }

    // 3. Buscar ese ticket en nuestra base de datos y actualizar su estado
    const { error } = await supabase
      .from('incidencias')
      .update({ status: nuevoEstado, updated_at: new Date().toISOString() })
      .eq('jira_key', jiraKey);

    if (error) throw error;

    // 4. Avisarle a Jira que recibimos todo correctamente
    return NextResponse.json({
      success: true,
      message: `El ticket ${jiraKey} se actualizó a ${nuevoEstado}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ocurrió un error al procesar el webhook' },
      { status: 500 }
    );
  }
}
