/**
 * OBJETIVO: Visualizar la estructura de capital (Deuda vs Equity) de forma gráfica.
 * QUÉ HACE: Muestra los porcentajes y montos de financiamiento en un cuadro de resumen.
 * RETORNA: Un componente visual con el desglose de capital.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Landmark, Wallet, HelpCircle } from 'lucide-react';
import type { FinancialConfig } from '../types/finance';

interface CapitalStructureBoxProps {
  config: FinancialConfig;
  onUpdateConfig: (updates: Partial<FinancialConfig>) => void;
  onHelp: (id: string) => void;
}

export const CapitalStructureBox: React.FC<CapitalStructureBoxProps> = ({ config, onUpdateConfig, onHelp }) => {
  const totalV = config.debt.amount + config.debt.equity;
  const equityP = totalV > 0 ? (config.debt.equity / totalV) * 100 : 100;
  const debtP = 100 - equityP;

  const handleEquityChange = (newP: number) => {
    const newE = totalV * (newP / 100);
    const newD = totalV - newE;
    onUpdateConfig({
      debt: {
        ...config.debt,
        amount: newD,
        equity: newE,
        enabled: newD > 0
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-xl shadow-slate-200/50 flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-slate-50 text-slate-600 shadow-sm border border-slate-100">
          <Landmark size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tight text-slate-800">Estructura de Capital</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Mix Deuda vs Equity</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-8">
        {/* GRÁFICO DE BARRA DE ESTRUCTURA CON SLIDER INTEGRADO */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest mb-1">
            <span className="text-amber-600">Deuda {debtP.toFixed(0)}%</span>
            <div className="flex items-center gap-1.5">
              <span className="text-blue-600">Equity {equityP.toFixed(0)}%</span>
              <button onClick={() => onHelp('equity')} className="text-slate-300 hover:text-blue-500 transition-colors">
                <HelpCircle size={14} />
              </button>
            </div>
          </div>
          
          <div className="relative pt-2 pb-6">
            <input 
              type="range"
              min="0"
              max="100"
              step="1"
              value={equityP}
              onChange={(e) => handleEquityChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600 z-10 relative"
            />
            {/* FONDO DE PROGRESO DUAL */}
            <div className="absolute top-2 left-0 right-0 h-2 bg-slate-100 rounded-full overflow-hidden flex shadow-inner border border-slate-200/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${debtP}%` }}
                className="h-full bg-amber-500/30"
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${equityP}%` }}
                className="h-full bg-blue-600/30"
              />
            </div>
          </div>
        </div>

        {/* DETALLES NUMÉRICOS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
            <div className="flex items-center gap-2 mb-1">
              <Landmark size={14} className="text-amber-500" />
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Monto Deuda</span>
            </div>
            <p className="text-lg font-black text-slate-800">${config.debt.amount.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Aporte Propio</span>
            </div>
            <p className="text-lg font-black text-slate-800">${config.debt.equity.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inversión Total</span>
          <span className="text-xl font-black text-slate-900">${totalV.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</span>
        </div>
      </div>
    </motion.div>
  );
};
