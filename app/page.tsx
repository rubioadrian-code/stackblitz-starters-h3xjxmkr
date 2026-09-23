export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wnpheggynkhftsnhhejc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InducGhlZ2d5bmtoZnRzbmhqZWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNTczNjUsImV4cCI6MjA1NjkzMzM2NX0.eyJleHBpcmF0aW9uIjoiY20yOTIzcy1vY2لrLWVybGUtb2luZC1lcmxlaW5kZXYyMDI2In0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InducGhlZ2d5bmtoZnRzbmhqZWpjIn0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function Dashboard() {
  let tickets: any[] = [];
  
  try {
    const { data, error } = await supabase.from('incidencias').select('*');
    if (!error && data) {
      tickets = data;
    }
  } catch (err) {
    console.error('Error al conectar con Supabase:', err);
  }

  const columnas = ['En Análisis', 'En Desarrollo', 'Testing/QA', 'Desplegado'];

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Cam Doctor · Tracker</h1>
        <p className="text-slate-500 mt-1">Sincronizado con Jira - Vista de Solo Lectura</p>
      </header>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {columnas.map((columna) => (
          <div key={columna} className="bg-slate-200 rounded-lg p-4 min-w-[320px] w-[320px] shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex justify-between items-center">
              {columna}
              <span className="bg-slate-300 text-slate-600 px-2 py-0.5 rounded-full text-sm">
                {tickets?.filter(t => t.status === columna).length || 0}
              </span>
            </h2>
            
            <div className="flex flex-col gap-3">
              {tickets?.filter(t => t.status === columna).map(ticket => (
                <div key={ticket.id} className="bg-white p-4 rounded-md shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                      {ticket.jira_key}
                    </span>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-700">
                      {ticket.priority || 'Normal'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm mb-2 leading-tight">{ticket.title}</h3>
                  <p className="text-slate-500 text-xs mb-4 line-clamp-3">{ticket.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}