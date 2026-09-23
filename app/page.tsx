'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

const supabaseUrl = 'https://wnpheggynkhftsnhhejc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InducGhlZ2d5bmtoZnRzbmhqZWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNTczNjUsImV4cCI6MjA1NjkzMzM2NX0.eyJleHBpcmF0aW9uIjoiY20yOTIzcy1vY2لrLWVybGUtb2luZC1lcmxlaW5kZXYyMDI2In0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InducGhlZ2d5bmtoZnRzbmhqZWpjIn0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Dashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [totalPacientes, setTotalPacientes] = useState<number>(0);
  const [topDiagnosticos, setTopDiagnosticos] = useState<{ [key: string]: number }[]>([]);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const { data, error } = await supabase.from('incidencias').select('*');
        if (!error && data) {
          setTickets(data);
        }
      } catch (err) {
        console.error('Error al conectar con Supabase:', err);
      }
    }
    fetchTickets();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data: any[] = XLSX.utils.sheet_to_json(ws);

      setTotalPacientes(data.length);

      const diagCounts: { [key: string]: number } = {};
      data.forEach((row) => {
        const diag = row['Diagnostico'] || row['diagnostico'] || row['Diagnóstico'] || 'Desconocido';
        diagCounts[diag] = (diagCounts[diag] || 0) + 1;
      });

      const sortedDiag = Object.entries(diagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([diag, count]) => ({ [diag]: count }));

      setTopDiagnosticos(sortedDiag);
    };
    reader.readAsBinaryString(file);
  };

  const columnas = ['En Análisis', 'En Desarrollo', 'Testing/QA', 'Desplegado'];

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Cam Doctor · Panel General</h1>
        <p className="text-slate-500 mt-1">Tablero de Incidencias y Analítica de Atenciones</p>
      </header>

      {/* Sección de Carga de Archivos y Analítica */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Carga de Reportes para Métricas</h2>
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Sube tu archivo Excel o CSV de atenciones:
          </label>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Pacientes Atendidos (Archivo)</h3>
            <p className="text-3xl font-bold text-blue-600">{totalPacientes}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 md:col-span-2">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Top Diagnósticos</h3>
            <ul className="divide-y divide-slate-200">
              {topDiagnosticos.length > 0 ? (
                topDiagnosticos.map((item, index) => {
                  const [diag, count] = Object.entries(item)[0];
                  return (
                    <li key={index} className="py-1.5 flex justify-between text-sm">
                      <span className="text-slate-700 font-medium">{index + 1}. {diag}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">{count} casos</span>
                    </li>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400">Sube un reporte para visualizar el ranking de diagnósticos.</p>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Tablero Kanban de Incidencias */}
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
              
              {tickets?.filter(t => t.status === columna).length === 0 && (
                <div className="text-slate-400 text-sm text-center py-6 border-2 border-dashed border-slate-300 rounded-md">
                  Sin incidencias
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}