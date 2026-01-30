
import React, { useState } from 'react';
import { Icons } from '../constants';

interface Props {
    targetUrl: string;
}

type CommandCategory = 'RECON' | 'DISCOVERY' | 'VULN' | 'OWASP';

export const TacticalTerminal: React.FC<Props> = ({ targetUrl }) => {
    const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<CommandCategory>('RECON');

    const domain = targetUrl.replace(/https?:\/\//, '').split('/')[0] || 'target.com';
    const url = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;

    const commandCategories: Record<CommandCategory, { name: string; icon: any; commands: any[] }> = {
        RECON: {
            name: 'Reconnaissance',
            icon: Icons.Search,
            commands: [
                {
                    name: 'Subfinder + Httpx',
                    cmd: `subfinder -d ${domain} -silent | httpx -title -tech-detect -status-code`,
                    desc: 'Identifica subdominios activos y tecnologías (Fast & Silent).'
                },
                {
                    name: 'Nmap - Aggressive Scan',
                    cmd: `nmap -p- --min-rate=1000 -T4 -A -v ${domain}`,
                    desc: 'Escaneo completo de puertos a alta velocidad con detección de versiones.'
                },
                {
                    name: 'Amass Enum',
                    cmd: `amass enum -d ${domain} -active -brute -w /path/to/wordlist.txt`,
                    desc: 'Enumeración profunda de DNS (OWASP Amass).'
                }
            ]
        },
        DISCOVERY: {
            name: 'Discovery',
            icon: Icons.FileText,
            commands: [
                {
                    name: 'FFuf - Directory Fuzzing',
                    cmd: `ffuf -u ${url}/FUZZ -w seclists/Discovery/Web-Content/raft-medium-directories.txt -mc 200,301,403`,
                    desc: 'Fuzzing de directorios usando wordlists estándar (Seclists).'
                },
                {
                    name: 'Gau - URL Discovery',
                    cmd: `gau ${domain} | httpx -mc 200`,
                    desc: 'Recupera URLs conocidas de Wayback Machine y AlienVault.'
                }
            ]
        },
        VULN: {
            name: 'Vulnerability',
            icon: Icons.Shield,
            commands: [
                {
                    name: 'Nuclei - Critical & High',
                    cmd: `nuclei -u ${url} -t nuclei-templates/ -s critical,high -as`,
                    desc: 'Escaneo de vulnerabilidades conocidas con templates comunitarios.'
                },
                {
                    name: 'Nikto',
                    cmd: `nikto -h ${url} -Tuning x 6`,
                    desc: 'Escaneo clásico de servidores web (obsoleto pero útil para headers/path traversal).'
                }
            ]
        },
        OWASP: {
            name: 'OWASP ZAP',
            icon: Icons.Lock,
            commands: [
                {
                    name: 'ZAP - Baseline Scan (Docker)',
                    cmd: `docker run -t owasp/zap2docker-stable zap-baseline.py -t ${url}`,
                    desc: 'Auditoría rápida no intrusiva contra el top 10 OWASP.'
                },
                {
                    name: 'ZAP - Full Scan (Docker)',
                    cmd: `docker run -t owasp/zap2docker-stable zap-full-scan.py -t ${url}`,
                    desc: 'Escaneo completo incluyendo ataques activos (¡CUIDADO!).'
                }
            ]
        }
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(id);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="bg-slate-950 border border-slate-800/50 rounded-3xl overflow-hidden h-full flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-slate-900/50 border-b border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 bg-red-500/20 rounded-full border border-red-500/50" />
                            <div className="w-2.5 h-2.5 bg-amber-500/20 rounded-full border border-amber-500/50" />
                            <div className="w-2.5 h-2.5 bg-emerald-500/20 rounded-full border border-emerald-500/50" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">
                            Terminal_Táctica_v3.0
                        </span>
                    </div>
                    <div className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                        TARGET: {domain}
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {(Object.keys(commandCategories) as CommandCategory[]).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-2 transition-all border ${activeCategory === cat
                                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                                    : 'bg-slate-900 text-slate-500 border-white/5 hover:text-slate-300 hover:bg-slate-800'
                                }`}
                        >
                            <span className="text-xs">{React.createElement(commandCategories[cat].icon || Icons.Code)}</span>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Commands List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-950/50">
                {commandCategories[activeCategory].commands.map((c, i) => (
                    <div key={i} className="group relative bg-slate-900/40 border border-white/5 p-4 rounded-xl hover:border-indigo-500/20 hover:bg-slate-900/60 transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <span className="w-1 h-4 bg-indigo-500 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                                <span className="text-[10px] font-black text-indigo-100 uppercase tracking-wider">{c.name}</span>
                            </div>
                            <button
                                onClick={() => handleCopy(c.cmd, `${activeCategory}-${i}`)}
                                className="text-[9px] font-bold text-slate-500 hover:text-emerald-400 uppercase transition-colors flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded"
                            >
                                {copiedIndex === `${activeCategory}-${i}` ? (
                                    <>✓ COPIADO</>
                                ) : (
                                    <>📋 COPIAR</>
                                )}
                            </button>
                        </div>

                        <div className="relative group/code">
                            <pre className="text-[10px] text-emerald-400/90 font-mono bg-black/40 p-3 rounded-lg border border-white/5 overflow-x-auto selection:bg-indigo-500/30">
                                {c.cmd}
                            </pre>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                            <Icons.Info className="w-3 h-3 text-slate-600" />
                            <p className="text-[9px] text-slate-500 font-medium italic">
                                {c.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Insight Footer */}
            <div className="p-4 bg-gradient-to-t from-indigo-900/20 to-transparent border-t border-white/5">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-indigo-500/10 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                            <Icons.Cpu className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-wider mb-1">
                                ¿Importa qué IA usas?
                            </h4>
                            <p className="text-[9px] text-slate-400 leading-relaxed">
                                <strong className="text-slate-300">Sí.</strong> Modelos como <span className="text-white">Llama 3</span> son excelentes para resumir grandes logs, mientras que <span className="text-white">GPT-4</span> destaca en razonamiento complejo.
                                El "riesgo" es subjetivo: una IA puede ver una alerta como "Informational" y otra como "Critical" basándose en el contexto.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
