export default function Dashboard() {
  const columnas = ['En Análisis', 'En Desarrollo', 'Testing/QA', 'Desplegado'];

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Cam Doctor · Tracker</h1>
        <p className="text-slate-500 mt-1">Sincronizado con Jira - Vista en Línea</p>
      </header>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {columnas.map((columna) => (
          <div key={columna} className="bg-slate-200 rounded-lg p-4 min-w-[320px] w-[320px] shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex justify-between items-center">
              {columna}
              <span className="bg-slate-300 text-slate-600 px-2 py-0.5 rounded-full text-sm">0</span>
            </h2>
            <div className="text-slate-400 text-sm text-center py-6 border-2 border-dashed border-slate-300 rounded-md">
              Tablero listo
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}