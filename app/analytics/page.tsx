'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function AnalyticsDashboard() {
  const [totalPacientes, setTotalPacientes] = useState<number>(0);
  const [topDiagnosticos, setTopDiagnosticos] = useState<{ [key: string]: number }[]>([]);
  const [horariosPico, setHorariosPico] = useState<{ [key: string]: number }[]>([]);

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

      // 1. Número total de pacientes atendidos
      setTotalPacientes(data.length);

      // 2. Calcular Top 10 de Diagnósticos
      const diagCounts: { [key: string]: number } = {};
      // 3. Calcular Horarios de Consulta
      const horaCounts: { [key: string]: number } = {};

      data.forEach((row) => {
        // Asumiendo columnas llamadas 'Diagnostico' y 'Hora' en tu archivo
        const diag = row['Diagnostico'] || row['diagnostico'] || 'Desconocido';
        diagCounts[diag] = (diagCounts[diag] || 0) + 1;

        const hora = row['Hora'] || row['hora'] || 'Sin registrar';
        horaCounts[hora] = (horaCounts[hora] || 0) + 1;
      });

      const sortedDiag = Object.entries(diagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([诊断, count]) => ({ [诊断]: count }));

      const sortedHoras = Object.entries(horaCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([hora, count]) => ({ [hora]: count }));

      setTopDiagnosticos(sortedDiag);
      setHorariosPico(sortedHoras);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Cam Doctor · Analítica de Datos</h1>
        <p className="text-slate-500 mt-1">Carga tu reporte para visualizar métricas clave de atención</p>
      </header>

      {/* Selector de archivos */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
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

      {/* Resultados y Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Pacientes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Total de Pacientes Atendidos</h3>
          <p className="text-4xl font-bold text-blue-600">{totalPacientes}</p>
        </div>

        {/* Top Diagnósticos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 md:col-span-2">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Top Diagnósticos</h3>
          <ul className="divide-y divide-slate-100">
            {topDiagnosticos.length > 0 ? (
              topDiagnosticos.map((item, index) => {
                const [diag, count] = Object.entries(item)[0];
                return (
                  <li key={index} className="py-2 flex justify-between text-sm">
                    <span className="text-slate-700 font-medium">{index + 1}. {diag}</span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">{count} casos</span>
                  </li>
                );
              })
            ) : (
              <p className="text-sm text-slate-400">Sube un archivo para ver el ranking.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}