'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

const supabaseUrl = 'https://wnpheggynkhftsnhhejc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InducGhlZ2d5bmtoZnRzbmhqZWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNTczNjUsImV4cCI6MjA1NjkzMzM2NX0.eyJleHBpcmF0aW9uIjoiY20yOTIzcy1vY2لrLWVybGUtb2luZC1lcmxlaW5kZXYyMDI2In0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InducGhlZ2d5bmtoZnRzbmhqZWpjIn0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Dashboard() {
  // Estados para Incidencias (Tablero)
  const [tickets, setTickets] = useState<any[]>([]);

  // Estados para Analítica de Atenciones
  const [totalPacientes, setTotalPacientes] = useState<number>(0);
  const [topDiagnosticos, setTopDiagnosticos] = useState<{ [key: string]: number }[]>([]);

  // Estados para Gestión de Usuarios y Licencias
  const [usuarios, setUsuarios] = useState<any[]>([
    { id: 1, nombre: 'Dr. Roberto Gómez', email: 'roberto.gomez@camdoctor.com', rol: 'Médico', estado: 'Activo', licencia: 'Workspace Business Plus' },
    { id: 2, nombre: 'Dra. María Laura Pérez', email: 'marialaura@camdoctor.com', rol: 'Médica', estado: 'Activo', licencia: 'Workspace Enterprise' },
    { id: 3, nombre: 'Lic. Carlos Ruiz', email: 'carlos.ruiz@camdoctor.com', rol: 'Nutricionista', estado: 'Inactivo', licencia: 'Workspace Starter' },
    { id: 4, nombre: 'Ana Sofía Admin', email: 'ana.admin@camdoctor.com', rol: 'Administrador', estado: 'Activo', licencia: 'Workspace Enterprise' }
  ]);
  
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoRol, setNuevoRol] = useState('Médico');
  const [nuevaLicencia, setNuevaLicencia] = useState('Workspace Business Plus');

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

  // Manejador para Analítica de Atenciones
  const handleAtencionesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Manejador para Carga Masiva de Usuarios por Excel
  const handleUsuariosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data: any[] = XLSX.utils.sheet_to_json(ws);

      const nuevosCargados = data.map((row, idx) => ({
        id: usuarios.length + idx + 1,
        nombre: row['Nombre'] || row['nombre'] || 'Sin nombre',
        email: row['Email'] || row['email'] || 'sin-correo@camdoctor.com',
        rol: row['Rol'] || row['rol'] || 'Médico',
        estado: row['Estado'] || row['estado'] || 'Activo',
        licencia: row['Licencia'] || row['licencia'] || 'Workspace Starter'
      }));

      setUsuarios([...usuarios, ...nuevosCargados]);
    };
    reader.readAsBinaryString(file);
  };

  // Alta manual de usuario
  const handleAltaManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoEmail) return;

    const nuevoUsuario = {
      id: usuarios.length + 1,
      nombre: nuevoNombre,
      email: nuevoEmail,
      rol: nuevoRol,
      estado: 'Activo',
      licencia: nuevaLicencia
    };

    setUsuarios([...usuarios, nuevoUsuario]);
    setNuevoNombre('');
    setNuevoEmail('');
  };

  // Cambio de estado (Alta/Baja lógica)
  const toggleEstado = (id: number) => {
    setUsuarios(usuarios.map(u => {
      if (u.id === id) {
        return { ...u, estado: u.estado === 'Activo' ? 'Inactivo' : 'Activo' };
      }
      return u;
    }));
  };

  const columnas = ['En Análisis', 'En Desarrollo', 'Testing/QA', 'Desplegado'];

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Cam Doctor · Panel de Control General</h1>
        <p className="text-slate-500 mt-1">Gestión de Usuarios, Licencias, Analítica y Tablero de Incidencias</p>
      </header>

      {/* SECCIÓN 1: GESTIÓN DE MÉDICOS Y USUARIOS */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">👥 Registro y Control de Usuarios & Licencias Workspace</h2>
        
        {/* Controles: Alta manual y Carga masiva */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-200">
          
          {/* Formulario de Alta Manual */}
          <form onSubmit={handleAltaManual} className="space-y-4 bg-slate-50 p-4 rounded-md border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700">Alta Manual de Profesional / Usuario</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nombre y Apellido"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                className="p-2 border border-slate-300 rounded text-sm bg-white"
                required
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={nuevoEmail}
                onChange={(e) => setNuevoEmail(e.target.value)}
                className="p-2 border border-slate-300 rounded text-sm bg-white"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={nuevoRol}
                onChange={(e) => setNuevoRol(e.target.value)}
                className="p-2 border border-slate-300 rounded text-sm bg-white"
              >
                <option value="Médico">Médico</option>
                <option value="Nutricionista">Nutricionista</option>
                <option value="Administrador">Administrador</option>
                <option value="Coordinador">Coordinador</option>
              </select>
              <select
                value={nuevaLicencia}
                onChange={(e) => setNuevaLicencia(e.target.value)}
                className="p-2 border border-slate-300 rounded text-sm bg-white"
              >
                <option value="Workspace Business Plus">Workspace Business Plus</option>
                <option value="Workspace Enterprise">Workspace Enterprise</option>
                <option value="Workspace Starter">Workspace Starter</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Registrar Usuario
            </button>
          </form>

          {/* Carga Masiva Excel */}
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Carga Masiva (Excel / CSV)</h3>
              <p className="text-xs text-slate-500 mb-4">Sube un archivo con columnas: Nombre, Email, Rol, Estado, Licencia.</p>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleUsuariosUpload}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
            <div className="text-xs text-slate-400 mt-4">
              💡 Tip: Ideal para actualizar altas y bajas masivas del personal médico de Cam Doctor.
            </div>
          </div>
        </div>

        {/* Tabla de Usuarios Registrados */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="p-3 font-semibold">Nombre</th>
                <th className="p-3 font-semibold">Email</th>
                <th className="p-3 font-semibold">Rol</th>
                <th className="p-3 font-semibold">Licencia Workspace</th>
                <th className="p-3 font-semibold">Estado</th>
                <th className="p-3 font-semibold text-center">Acciones (Altas / Bajas)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">{user.nombre}</td>
                  <td className="p-3 text-slate-600">{user.email}</td>
                  <td className="p-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold">
                      {user.rol}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 font-medium">{user.licencia}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.estado === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.estado}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleEstado(user.id)}
                      className={`px-3 py-1 rounded text-xs font-semibold text-white transition-colors ${
                        user.estado === 'Activo' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                      }`}
                    >
                      {user.estado === 'Activo' ? 'Dar de Baja' : 'Reactivar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 2: ANALÍTICA DE ATENCIONES */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">📊 Analítica de Atenciones y Consultas</h2>
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Sube tu archivo Excel o CSV de reporte de atenciones de pacientes:
          </label>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleAtencionesUpload}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Total de Pacientes Atendidos</h3>
            <p className="text-4xl font-bold text-blue-600">{totalPacientes}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 md:col-span-2">
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
                <p className="text-xs text-slate-400">Sube un reporte de atenciones para visualizar el ranking.</p>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: TABLERO KANBAN DE INCIDENCIAS */}
      <h2 className="text-xl font-bold text-slate-800 mb-4">📌 Tablero de Incidencias (Sincronizado con Jira / Supabase)</h2>
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