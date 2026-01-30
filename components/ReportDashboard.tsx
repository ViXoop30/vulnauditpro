
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { VulnerabilityReport } from '../types.ts';

interface Props {
  report: VulnerabilityReport;
}

export const ReportDashboard: React.FC<Props> = ({ report }) => {
  const severityCounts = (report.vulnerabilidades || []).reduce((acc, v) => {
    let severity = v.severidad.trim();
    // Normalize common variations
    if (severity.match(/cr[ií]tica/i) || severity.match(/critical/i)) severity = 'Crítica';
    else if (severity.match(/alta/i) || severity.match(/high/i)) severity = 'Alta';
    else if (severity.match(/media/i) || severity.match(/medium/i)) severity = 'Media';
    else if (severity.match(/baja/i) || severity.match(/low/i)) severity = 'Baja';

    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = [
    { name: 'Crítica', value: severityCounts['Crítica'] || 0, color: '#ef4444' },
    { name: 'Alta', value: severityCounts['Alta'] || 0, color: '#f97316' },
    { name: 'Media', value: severityCounts['Media'] || 0, color: '#eab308' },
    { name: 'Baja', value: severityCounts['Baja'] || 0, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-500/20">
          <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Hallazgos Totales</p>
          <p className="text-5xl font-black text-white mt-1 italic">{report.resumen_ejecutivo.total_hallazgos}</p>
        </div>
        <div className="bg-slate-800 border border-white/5 p-6 rounded-3xl md:col-span-3 flex flex-col justify-center">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Puntuación de Riesgo Global</p>
          <p className={`text-2xl font-black mt-1 italic ${report.resumen_ejecutivo.riesgo_global.toLowerCase().includes('alto') ? 'text-red-400' : 'text-emerald-400'}`}>
            {report.resumen_ejecutivo.riesgo_global}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-white/5 p-8 rounded-3xl h-80">
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">Criticidad de Infraestructura</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#1e293b' }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900/80 border border-white/5 p-8 rounded-3xl h-80 flex flex-col">
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">Composición de Amenazas</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
