export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    return NextResponse.json({ success: true, received: payload });
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wnpheggynkhftsnhhejc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InducGhlZ2d5bmtoZnRzbmhqZWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNTczNjUsImV4cCI6MjA1NjkzMzM2NX0.eyJleHBpcmF0aW9uIjoiY20yOTIzcy1vY2لrLWVybGUtb2luZC1lcmxlaW5kZXYyMDI2In0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InducGhlZ2d5bmtoZnRzbmhqZWpjIn0';

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
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