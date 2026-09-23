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

  // Iniciamos la lista de usuarios vacía (sin datos de prueba)
  const [usuarios, setUsuarios] = useState<any[]>([]);
  
  const [inputNombre, setInputNombre] = useState('');
  const [inputApellido, setInputApellido] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputPerfil, setInputPerfil] = useState('Médico');
  const [inputLicencia, setInputLicencia] = useState('Workspace Business Plus');

  // Estados para filtros por columna
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroApellido, setFiltroApellido] = useState('');
  const [filtroEmail, setFiltroEmail] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState('');
  const [filtroLicencia, setFiltroLicencia] = useState('');

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

  // Carga de Atenciones (Excel/CSV)
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

  // Carga Masiva de Usuarios vía Excel (Mapeo robusto de correo y propiedades)
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

      const nuevosImportados = data.map((row, idx) => {
        // Búsqueda flexible de la clave del correo sin importar mayúsculas o variaciones
        const correoEncontrado = 
          row['Email'] || row['email'] || row['EMAIL'] || 
          row['Mail'] || row['mail'] || row['MAIL'] || 
          row['Correo'] || row['correo'] || row['CORREO'] || 
          row['E-mail'] || row['e-mail'] || '';

        const nombreEncontrado = row['Nombre'] || row['nombre'] || row['NOMBRE'] || 'Sin nombre';
        const apellidoEncontrado = row['Apellido'] || row['apellido'] || row['APELLIDO'] || '';
        const perfilEncontrado = row['Perfil'] || row['perfil'] || row['PERFIL'] || row['Rol'] || row['rol'] || 'Médico';
        const licenciaEncontrada = row['Licencia'] || row['licencia'] || row['LICENCIA'] || row['Tipo de Licencia'] || 'Workspace Starter';
        const estadoEncontrado = row['Estado'] || row['estado'] || row['ESTADO'] || 'Activo';

        return {
          id: usuarios.length + idx + 1,
          nombre: String(nombreEncontrado).trim(),
          apellido: String(apellidoEncontrado).trim(),
          email: String(correoEncontrado).trim(),
          perfil: String(perfilEncontrado).trim(),
          estado: String(estadoEncontrado).trim(),
          licencia: String(licenciaEncontrada).trim()
        };
      });

      setUsuarios([...usuarios, ...nuevosImportados]);
    };
    reader.readAsBinaryString(file);
  };

  // Alta Manual
  const handleAltaManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNombre || !inputApellido || !inputEmail) return;

    const nuevoUsuario = {
      id: usuarios.length + 1,
      nombre: inputNombre.trim(),
      apellido: inputApellido.trim(),
      email: inputEmail.trim(),
      perfil: inputPerfil,
      estado: 'Activo',
      licencia: inputLicencia
    };

    setUsuarios([...usuarios, nuevoUsuario]);
    setInputNombre('');
    setInputApellido('');
    setInputEmail('');
  };

  // Filtrado de usuarios
  const usuariosFiltrados = usuarios.filter(user => {
    return (
      user.nombre.toLowerCase().includes(filtroNombre.toLowerCase()) &&
      user.apellido.toLowerCase().includes(filtroApellido.toLowerCase()) &&
      user.email.toLowerCase().includes(filtroEmail.toLowerCase()) &&
      user.perfil.toLowerCase().includes(filtroPerfil.toLowerCase()) &&
      user.licencia.toLowerCase().includes(filtroLicencia.toLowerCase())
    );
  });

  const columnas = ['En Análisis', 'En Desarrollo', 'Testing/QA', 'Desplegado'];

  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter(u => u.estado === 'Activo').length;
  const licenciasEnterprise = usuarios.filter(u => u.licencia.toLowerCase().includes('enterprise')).length;

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Cam Doctor · Dashboard Ejecutivo</h1>
        <p className="text-slate-500 mt-1">Control operativo de Usuarios, Licencias Workspace, Analítica y Tablero Jira</p>
      </header>

      {/* TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Total Usuarios</h3>
          <p className="text-3xl font-bold text-slate-800">{totalUsuarios}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Activos</h3>
          <p className="text-3xl font-bold text-emerald-600">{usuariosActivos}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Licencias Enterprise</h3>
          <p className="text-3xl font-bold text-purple-600">{licenciasEnterprise}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Pacientes Atendidos</h3>
          <p className="text-3xl font-bold text-blue-600">{totalPacientes}</p>
        </div>
      </div>

      {/* SECCIÓN 1: GESTIÓN DE USUARIOS */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">👥 Directorio de Usuarios, Mails y Licencias Workspace</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-200">
          {/* Alta Manual */}
          <form onSubmit={handleAltaManual} className="space-y-4 bg-slate-50 p-4 rounded-md border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700">Alta Manual de Usuario</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nombre"
                value={inputNombre}
                onChange={(e) => setInputNombre(e.target.value)}
                className="p-2 border border-slate-300 rounded text-sm bg-white text-slate-800"
                required
              />
              <input
                type="text"
                placeholder="Apellido"
                value={inputApellido}
                onChange={(e) => setInputApellido(e.target.value)}
                className="p-2 border border-slate-300 rounded text-sm bg-white text-slate-800"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="email"
                placeholder="Correo electrónico (Mail)"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                className="p-2 border border-slate-300 rounded text-sm bg-white text-slate-800"
                required
              />
              <select
                value={inputPerfil}
                onChange={(e) => setInputPerfil(e.target.value)}
                className="p-2 border border-slate-300 rounded text-sm bg-white text-slate-800"
              >
                <option value="Médico">Médico</option>
                <option value="Nutricionista">Nutricionista</option>
                <option value="Administrador">Administrador</option>
                <option value="Coordinador">Coordinador</option>
              </select>
            </div>
            <div>
              <select
                value={inputLicencia}
                onChange={(e) => setInputLicencia(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-sm bg-white text-slate-800"
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
              Guardar Usuario
            </button>
          </form>

          {/* Carga Masiva */}
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Carga Masiva (Excel / CSV)</h3>
              <p className="text-xs text-slate-500 mb-4">Asegúrate de que tu archivo tenga cabeceras claras como: <b>Nombre</b>, <b>Apellido</b>, <b>Email</b> (o <b>Mail</b> / <b>Correo</b>), <b>Perfil</b>, <b>Licencia</b>.</p>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleUsuariosUpload}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
            <div className="text-xs text-slate-400 mt-4">
              ✨ Se procesarán e integrarán automáticamente al listado inferior.
            </div>
          </div>
        </div>

        {/* Tabla con Filtros por Columna */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="p-3 font-semibold">Nombre</th>
                <th className="p-3 font-semibold">Apellido</th>
                <th className="p-3 font-semibold">Mail / Correo</th>
                <th className="p-3 font-semibold">Perfil</th>
                <th className="p-3 font-semibold">Licencia Workspace</th>
                <th className="p-3 font-semibold">Estado</th>
              </tr>
              {/* Fila de Filtros por Columna */}
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-2">
                  <input
                    type="text"
                    placeholder="Filtrar nombre..."
                    value={filtroNombre}
                    onChange={(e) => setFiltroNombre(e.target.value)}
                    className="w-full p-1 text-xs border border-slate-300 rounded bg-white text-slate-800 font-normal"
                  />
                </th>
                <th className="p-2">
                  <input
                    type="text"
                    placeholder="Filtrar apellido..."
                    value={filtroApellido}
                    onChange={(e) => setFiltroApellido(e.target.value)}
                    className="w-full p-1 text-xs border border-slate-300 rounded bg-white text-slate-800 font-normal"
                  />
                </th>
                <th className="p-2">
                  <input
                    type="text"
                    placeholder="Filtrar mail..."
                    value={filtroEmail}
                    onChange={(e) => setFiltroEmail(e.target.value)}
                    className="w-full p-1 text-xs border border-slate-300 rounded bg-white text-slate-800 font-normal"
                  />
                </th>
                <th className="p-2">
                  <input
                    type="text"
                    placeholder="Filtrar perfil..."
                    value={filtroPerfil}
                    onChange={(e) => setFiltroPerfil(e.target.value)}
                    className="w-full p-1 text-xs border border-slate-300 rounded bg-white text-slate-800 font-normal"
                  />
                </th>
                <th className="p-2">
                  <input
                    type="text"
                    placeholder="Filtrar licencia..."
                    value={filtroLicencia}
                    onChange={(e) => setFiltroLicencia(e.target.value)}
                    className="w-full p-1 text-xs border border-slate-300 rounded bg-white text-slate-800 font-normal"
                  />
                </th>
                <th className="p-2 text-center text-xs text-slate-400 font-normal">-</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {usuariosFiltrados.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-800">{user.nombre}</td>
                  <td className="p-3 font-semibold text-slate-800">{user.apellido}</td>
                  <td className="p-3 text-slate-600 font-medium">{user.email}</td>
                  <td className="p-3">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold border border-blue-100">
                      {user.perfil}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 font-medium">{user.licencia}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.estado === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.estado}
                    </span>
                  </td>
                </tr>
              ))}
              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                    No hay usuarios registrados. Agrega uno manualmente o sube un archivo Excel con la información.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 2: ANALÍTICA DE ATENCIONES */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">📊 Analítica de Atenciones</h2>
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Sube el archivo Excel o CSV con el reporte de consultas de pacientes:
          </label>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleAtencionesUpload}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Top Diagnósticos</h3>
          <ul className="divide-y divide-slate-200">
            {topDiagnosticos.length > 0 ? (
              topDiagnosticos.map((item, index) => {
                const [diag, count] = Object.entries(item)[0];
                return (
                  <li key={index} className="py-2 flex justify-between text-sm">
                    <span className="text-slate-700 font-medium">{index + 1}. {diag}</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">{count} casos</span>
                  </li>
                );
              })
            ) : (
              <p className="text-xs text-slate-400">Sube un archivo de atenciones para ver el ranking.</p>
            )}
          </ul>
        </div>
      </div>

      {/* SECCIÓN 3: TABLERO KANBAN */}
      <h2 className="text-xl font-bold text-slate-800 mb-4">📌 Tablero de Incidencias</h2>
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