
import React, { useState, useEffect } from 'react';
import { Icons, SAMPLE_DATA } from './constants.tsx'; // .tsx agregado
import { VulnerabilityReport, User } from './types.ts'; // .ts agregado
import { analyzeVulnerabilities } from './services/groqService.ts';
import { VulnerabilityDetails } from './components/VulnerabilityDetails.tsx'; // .tsx agregado
import { ReportDashboard } from './components/ReportDashboard.tsx'; // .tsx agregado
import { PaymentModal } from './components/PaymentModal.tsx'; // .tsx agregado
import { TacticalTerminal } from './components/TacticalTerminal.tsx'; // .tsx agregado

const API_URL = "api.php";

const App: React.FC = () => {
  const [currentUser] = useState({ id: '1', username: 'AUDITOR_PRO', role: 'admin', status: 'active' });
  const [targetUrl, setTargetUrl] = useState(SAMPLE_DATA.url);
  const [inputData, setInputData] = useState(SAMPLE_DATA.logs);
  const [report, setReport] = useState<VulnerabilityReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [scanLocation, setScanLocation] = useState('LOCAL');
  const [workMode, setWorkMode] = useState<'MANUAL' | 'AI'>('MANUAL');
  const [isPremium, setIsPremium] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Icons.Shield />
          <h1 className="font-black italic text-xl tracking-tighter uppercase">VulnAudit_Pro</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-600 px-4 py-1.5 rounded-full uppercase tracking-tighter hover:scale-105 transition-transform"
          >
            ⭐ Upgrade to Enterprise
          </button>
          <div className="h-6 w-[1px] bg-white/10 mx-2" />
          <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
            SYSTEM_ACTIVE
          </span>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {!report ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Auditoría Táctica
                    </h2>
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                      <button
                        onClick={() => setWorkMode('MANUAL')}
                        className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all flex items-center gap-2 ${workMode === 'MANUAL' ? 'bg-slate-800 text-white border border-white/10 shadow-lg shadow-black/50' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        <Icons.Code /> MODO_MANUAL
                      </button>
                      <button
                        onClick={() => setWorkMode('AI')}
                        className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all flex items-center gap-2 ${workMode === 'AI' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {isPremium ? <Icons.Shield /> : '💎'} MODO_AI_PRO
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-white/5">
                    <button
                      onClick={() => setScanLocation('LOCAL')}
                      className={`px-3 py-1 text-[9px] font-black rounded-lg transition-all ${scanLocation === 'LOCAL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      🇨🇱 LOCAL_NODE
                    </button>
                    <button
                      onClick={() => {
                        alert("⚠️ CARACTERÍSTICA ENTERPRISE\n\nEl escaneo desde USA requiere una suscripción activa.");
                        setShowPaymentModal(true);
                      }}
                      className={`px-3 py-1 text-[9px] font-black rounded-lg transition-all ${scanLocation === 'USA' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      🇺🇸 USA_NODE (PRO)
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-indigo-500/50 group-focus-within:text-indigo-400">
                      <span className="text-xs font-mono">TARGET_URL://</span>
                    </div>
                    <input
                      type="text"
                      placeholder="empresa.com"
                      className="w-full bg-slate-950 border border-white/10 p-4 pl-24 rounded-2xl text-indigo-400 focus:outline-none focus:border-indigo-500/50 font-mono text-sm transition-all"
                      value={targetUrl}
                      onChange={e => setTargetUrl(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={() => setInputData('')} className="text-[9px] font-black text-slate-600 hover:text-red-400 uppercase tracking-widest">Clear</button>
                    </div>
                    <textarea
                      placeholder="Pega aquí logs de Nmap, Nuclei, Nikto o telemetría bruta..."
                      className="w-full h-96 bg-slate-950 border border-white/10 p-6 rounded-3xl text-[11px] font-mono text-indigo-300/80 focus:outline-none focus:border-indigo-500/50 resize-none custom-scrollbar"
                      value={inputData}
                      onChange={e => setInputData(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={handleProcess}
                  disabled={isLoading}
                  className={`w-full py-6 rounded-2xl font-black text-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 ${isLoading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-500/20 hover:from-indigo-500 hover:to-indigo-400'}`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      ANALIZANDO INFRAESTRUCTURA...
                    </>
                  ) : (
                    <>
                      <Icons.Shield /> GENERAR INFORME TÉCNICO
                    </>
                  )}
                </button>
              </div>
              <div className="text-center">
                <button onClick={() => { setInputData(SAMPLE_DATA.logs); setTargetUrl(SAMPLE_DATA.url); }} className="text-[10px] text-slate-500 font-black uppercase hover:text-indigo-400 transition-colors tracking-widest flex items-center justify-center gap-2 mx-auto">
                  🔄 Recargar Datos de Ejemplo
                </button>
              </div>
            </div>

            {/* Tactical Sidebar */}
            <div className="lg:col-span-1">
              <TacticalTerminal targetUrl={targetUrl} />
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/30 p-8 rounded-[3rem] border border-white/5 backdrop-blur-sm">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <h2 className="text-3xl font-black italic text-white tracking-tighter">{targetUrl || "AUDITORÍA_GENERAL"}</h2>
                </div>
                <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">AI_ANALYSIS_COMPLETED • ENGINE: GROQ_LLAMA3_70B</p>
              </div>
              <div className="flex gap-3">
                <button onClick={saveToDatabase} className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 px-6 py-4 rounded-2xl text-[10px] font-black uppercase transition-all hover:translate-y-[-2px] active:translate-y-0 border border-white/5">
                  <Icons.Save /> Guardar
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
              {report.vulnerabilidades?.map((v, i) => <VulnerabilityDetails key={i} vuln={v} />)}
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

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => setIsPremium(true)}
      />
    </div>
  );
};

export default App;
