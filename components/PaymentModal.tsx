
import React from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const PaymentModal: React.FC<Props> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-8 pb-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Acceso Enterprise</h2>
                        <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mt-1">Escaneos ilimitados & Infraestructura Global</p>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-8 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* WEBPAY - CHILE */}
                    <div className="group relative bg-slate-800/50 border border-white/5 p-6 rounded-3xl hover:border-indigo-500/50 transition-all">
                        <div className="absolute top-4 right-4 bg-indigo-500/10 text-indigo-400 text-[8px] px-2 py-0.5 rounded font-black uppercase">Local (CL)</div>
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-2xl">🇨🇱</div>
                        <h3 className="text-xl font-bold text-white italic">Webpay Plus</h3>
                        <p className="text-slate-400 text-xs mt-2 leading-relaxed">Pago seguro en CLP mediante cuenta rut, débito o crédito bancario.</p>
                        <div className="mt-6 flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white">$19.990</span>
                            <span className="text-[10px] text-slate-500 font-mono">/mes</span>
                        </div>
                        <button
                            onClick={() => { alert("Redirigiendo a Pasarela Transbank..."); window.location.href = "https://www.transbank.cl"; }}
                            className="w-full mt-4 py-3 bg-white text-black font-black text-[10px] uppercase rounded-xl hover:bg-indigo-400 hover:text-white transition-all tracking-widest"
                        >
                            Pagar con Webpay
                        </button>
                    </div>

                    {/* STRIPE - GLOBAL */}
                    <div className="group relative bg-indigo-600 p-6 rounded-3xl hover:scale-[1.02] transition-all shadow-xl shadow-indigo-500/10">
                        <div className="absolute top-4 right-4 bg-white/20 text-white text-[8px] px-2 py-0.5 rounded font-black uppercase">Global (USD)</div>
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 text-2xl">🌎</div>
                        <h3 className="text-xl font-bold text-white italic">Stripe / PayPal</h3>
                        <p className="text-white/70 text-xs mt-2 leading-relaxed">International access via Credit Card, Apple Pay or Google Pay.</p>
                        <div className="mt-6 flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white">$25.00</span>
                            <span className="text-[10px] text-white/50 font-mono">/mo</span>
                        </div>
                        <button
                            onClick={() => { alert("Opening Stripe Checkout..."); window.location.href = "https://stripe.com"; }}
                            className="w-full mt-4 py-3 bg-black text-white font-black text-[10px] uppercase rounded-xl hover:bg-slate-900 transition-all tracking-widest border border-white/10"
                        >
                            Pay with Stripe
                        </button>
                    </div>
                </div>

                <div className="p-8 pt-0 flex flex-wrap gap-2 justify-center">
                    {['Escaneos desde USA/EU', 'Reportes PDF Ilimitados', 'Soporte 24/7 API', 'Multi-usuario'].map(feature => (
                        <span key={feature} className="text-[9px] font-mono text-slate-500 bg-black/20 px-3 py-1 rounded-full border border-white/5 uppercase">
                            ✅ {feature}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
