
import React, { useState, useEffect } from 'react';
import { Icons, SAMPLE_DATA } from './constants.tsx'; // .tsx agregado
import { VulnerabilityReport, User } from './types.ts'; // .ts agregado
import { analyzeVulnerabilities } from './services/openaiService.ts';
import { VulnerabilityDetails } from './components/VulnerabilityDetails.tsx'; // .tsx agregado
import { ReportDashboard } from './components/ReportDashboard.tsx'; // .tsx agregado

const MASTER_USER = "ADMIN_PRO";
const MASTER_KEY = "VULN-PRO-2025-SECURE-KEY-99";
const API_URL = "api.php";

const App: React.FC = () => {
  // Auto-login: Skip authentication screen
  const [currentUser, setCurrentUser] = useState<any>({ id: '1', username: MASTER_USER, role: 'admin', status: 'active' });
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [targetUrl, setTargetUrl] = useState(SAMPLE_DATA.url);
  const [inputData, setInputData] = useState(SAMPLE_DATA.logs);
  const [report, setReport] = useState<VulnerabilityReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.user === MASTER_USER && loginForm.pass === MASTER_KEY) {
      setCurrentUser({ id: '1', username: MASTER_USER, role: 'admin', status: 'active' });
      setError(null);
    } else {
      setError("ACCESO DENEGADO: Credenciales maestras inválidas.");
    }
  };

  const handleProcess = async () => {
    if (!inputData.trim()) return setError("TELEMETRÍA REQUERIDA.");
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeVulnerabilities(inputData, targetUrl);
      setReport(result);
    } catch (err: any) {
      setError("Error de IA: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToDatabase = async () => {
    if (!report) return;
    try {
      const res = await fetch(`${API_URL}?action=save_report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: targetUrl, report, userId: currentUser.id })
      });
      const data = await res.json();
      if (data.success) alert("Guardado en MySQL correctamente.");
    } catch (e) {
      alert("Error de conexión con api.php");
    }
  };

  const exportToPDF = () => {
    window.print();
    setShowExportMenu(false);
  };

  const exportToJSON = () => {
    if (!report) return;
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vuln-audit-${targetUrl.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportToText = () => {
    if (!report) return;
    let text = `INFORME DE AUDITORÍA DE SEGURIDAD\n`;
    text += `======================================\n\n`;
    text += `Objetivo: ${targetUrl}\n`;
    text += `Fecha: ${new Date().toLocaleString()}\n`;
    text += `Total de Hallazgos: ${report.resumen_ejecutivo.total_hallazgos}\n`;
    text += `Riesgo Global: ${report.resumen_ejecutivo.riesgo_global}\n\n`;
    text += `VULNERABILIDADES DETECTADAS\n`;
    text += `======================================\n\n`;
    report.vulnerabilidades.forEach((v, i) => {
      text += `${i + 1}. ${v.tipo} [${v.severidad}]\n`;
      text += `   CWE: ${v.cwe_id}\n`;
      text += `   Endpoint: ${v.endpoint_afectado}\n`;
      text += `   Descripción: ${v.descripcion}\n`;
      text += `   Remediación: ${v.remediacion_tecnica.explicacion}\n\n`;
    });
    const dataBlob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vuln-audit-${targetUrl.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-slate-900 p-8 rounded-[2rem] border border-white/5 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-black text-white italic flex items-center justify-center gap-2">
              <Icons.Lock /> VULN_AUDIT PRO
            </h1>
            <p className="text-slate-500 text-[10px] uppercase font-mono tracking-widest mt-2">XAMPP Local Node</p>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="USUARIO MAESTRO" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-indigo-400 focus:outline-none focus:border-indigo-500" value={loginForm.user} onChange={e => setLoginForm({ ...loginForm, user: e.target.value })} />
            <input type="password" placeholder="LLAVE DE ACCESO" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-indigo-400 focus:outline-none focus:border-indigo-500" value={loginForm.pass} onChange={e => setLoginForm({ ...loginForm, pass: e.target.value })} />
          </div>
          {error && <p className="text-red-500 text-[10px] text-center font-bold">{error}</p>}
          <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl uppercase tracking-widest text-xs transition-colors">Entrar al Sistema</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Icons.Shield />
          <h1 className="font-black italic text-xl tracking-tighter">VULN_AUDIT</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">ONLINE: {currentUser.username}</span>
          <button onClick={() => setCurrentUser(null)} className="text-[10px] text-red-500 font-bold uppercase hover:underline">Cerrar Sesión</button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {!report ? (
          <div className="max-w-4xl mx-auto space-y-6 animate-in">
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 space-y-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Configuración de Auditoría</h2>
              <input type="text" placeholder="URL del Objetivo (ej: https://empresa.com)" className="w-full bg-slate-950 border border-white/10 p-4 rounded-xl text-indigo-400 focus:outline-none focus:border-indigo-500 font-mono" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} />
              <textarea placeholder="Pega aquí los logs de Nmap, Nuclei o JSON de vulnerabilidades..." className="w-full h-80 bg-slate-950 border border-white/10 p-4 rounded-xl text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500" value={inputData} onChange={e => setInputData(e.target.value)} />
              <button onClick={handleProcess} disabled={isLoading} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-lg transition-all transform active:scale-[0.98]">
                {isLoading ? "PROCESANDO TELEMETRÍA CON IA..." : "GENERAR INFORME TÉCNICO"}
              </button>
            </div>
            <div className="text-center">
              <button onClick={() => { setInputData(SAMPLE_DATA.logs); setTargetUrl(SAMPLE_DATA.url); }} className="text-sm text-indigo-400 font-bold uppercase hover:text-indigo-300 bg-indigo-500/10 px-6 py-2 rounded-lg border border-indigo-500/30 hover:border-indigo-400">🔄 Recargar Datos de Ejemplo</button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-3xl font-black italic text-white">{targetUrl || "Análisis de Red"}</h2>
                <p className="text-slate-500 text-xs font-mono uppercase">Auditoría generada por Gemini AI</p>
              </div>
              <div className="flex gap-3">
                <button onClick={saveToDatabase} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl text-xs font-bold uppercase transition-colors">
                  <Icons.Save /> Guardar en MySQL
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl text-xs font-bold uppercase transition-colors"
                  >
                    📥 Exportar
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-xl border border-white/10 overflow-hidden z-50">
                      <button
                        onClick={exportToPDF}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-slate-700 transition-colors flex items-center gap-3"
                      >
                        <span className="text-xl">📄</span>
                        <div>
                          <div className="font-bold text-white">Exportar como PDF</div>
                          <div className="text-[10px] text-slate-400">Abrir diálogo de impresión</div>
                        </div>
                      </button>
                      <button
                        onClick={exportToJSON}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-slate-700 transition-colors flex items-center gap-3 border-t border-white/5"
                      >
                        <span className="text-xl">📊</span>
                        <div>
                          <div className="font-bold text-white">Descargar JSON</div>
                          <div className="text-[10px] text-slate-400">Formato estructurado</div>
                        </div>
                      </button>
                      <button
                        onClick={exportToText}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-slate-700 transition-colors flex items-center gap-3 border-t border-white/5"
                      >
                        <span className="text-xl">📝</span>
                        <div>
                          <div className="font-bold text-white">Descargar TXT</div>
                          <div className="text-[10px] text-slate-400">Texto plano legible</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <ReportDashboard report={report} />

            <div className="space-y-6">
              <h3 className="text-xl font-bold italic flex items-center gap-2">
                <Icons.FileText /> Detalle de Hallazgos
              </h3>
              {report.vulnerabilidades.map((v, i) => <VulnerabilityDetails key={i} vuln={v} />)}
            </div>

            <button onClick={() => setReport(null)} className="w-full py-8 text-slate-500 hover:text-white uppercase text-[10px] tracking-widest transition-all">
              ← Iniciar nuevo escaneo
            </button>
          </div>
        )}
      </main>

      <footer className="p-8 border-t border-white/5 text-center">
        <p className="text-slate-600 text-[10px] uppercase font-mono tracking-tighter">
          VulnAudit Pro v2.5 • Senior Pentesting Tool • XAMPP Build 2025
        </p>
      </footer>
    </div>
  );
};

export default App;
