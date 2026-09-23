export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const jiraKey = payload.issue?.key;
    const nuevoEstado = payload.issue?.fields?.status?.name;

    if (!jiraKey || !nuevoEstado) {
      return NextResponse.json({ error: 'Faltan datos en el envío de Jira' }, { status: 400 });
    }

    const { error } = await supabase
      .from('incidencias')
      .update({ status: nuevoEstado, updated_at: new Date().toISOString() })
      .eq('jira_key', jiraKey);

    if (error) throw error;

    return NextResponse.json({ success: true, message: `El ticket ${jiraKey} se actualizó a ${nuevoEstado}` });
    
  } catch (error) {
    return NextResponse.json({ error: 'Ocurrió un error al procesar el webhook' }, { status: 500 });
  }
}