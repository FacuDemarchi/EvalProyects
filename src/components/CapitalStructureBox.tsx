/**
 * OBJETIVO: Visualizar la estructura de capital (Deuda vs Equity) de forma gráfica.
 * QUÉ HACE: Muestra los porcentajes y montos de financiamiento en un cuadro de resumen.
 * RETORNA: Un componente visual con el desglose de capital.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Landmark, Wallet, HelpCircle, Zap, Calculator } from 'lucide-react';
import type { FinancialConfig, AmortizationSystem } from '../types/finance';

interface CapitalStructureBoxProps {
  config: FinancialConfig;
  totalInvestment: number;
  onUpdateConfig: (updates: Partial<FinancialConfig>) => void;
  onOptimize: () => void;
  onHelp: (id: string) => void;
}

export const CapitalStructureBox: React.FC<CapitalStructureBoxProps> = ({ config, totalInvestment, onUpdateConfig, onOptimize, onHelp }) => {
  const totalV = totalInvestment;
  const equityP = totalV > 0 ? (config.debt.equity / totalV) * 100 : 100;
  const debtP = 100 - equityP;

  const handleEquityChange = (newP: number) => {
    const newE = Math.round(totalV * (newP / 100));
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

  const handleDebtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newD = Math.round(parseFloat(e.target.value) || 0);
    const newE = Math.max(0, totalV - newD);
    onUpdateConfig({
      debt: {
        ...config.debt,
        amount: newD,
        equity: newE,
        enabled: newD > 0
      }
    });
  };

  const handleSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateConfig({
      debt: {
        ...config.debt,
        system: e.target.value as AmortizationSystem
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-xl shadow-slate-200/50 flex flex-col h-full relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 text-slate-600 shadow-sm border border-slate-100">
            <Landmark size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-slate-800">Estructura de Capital</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Mix Deuda vs Equity</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOptimize}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all group"
        >
          <Zap size={14} className="group-hover:animate-pulse" />
          Calcular Óptimo
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-8 relative z-10">
        {/* SELECTOR DE SISTEMA DE AMORTIZACIÓN */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sistema Amortización</span>
            </div>
            <button onClick={() => onHelp('debt_system')} className="text-slate-300 hover:text-slate-500 transition-colors">
              <HelpCircle size={14} />
            </button>
          </div>
          <select 
            value={config.debt.system}
            onChange={handleSystemChange}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
          >
            <option value="french">Francés (Cuota Fija)</option>
            <option value="german">Alemán (Amortización Fija)</option>
            <option value="bullet">Bullet (Interés Solo)</option>
          </select>
        </div>

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
              step="5"
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
            <div className="flex items-center">
              <span className="text-lg font-black text-slate-800">$</span>
              <input 
                type="number"
                value={config.debt.amount.toFixed(0)}
                onChange={handleDebtChange}
                className="w-full bg-transparent text-lg font-black text-slate-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Aporte Propio</span>
            </div>
            <p className="text-lg font-black text-slate-800">${config.debt.equity.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        {/* NUEVA FILA: PLAZO Y TASA */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plazo (Años)</span>
            </div>
            <input 
              type="number"
              value={config.debt.term}
              onChange={(e) => onUpdateConfig({ debt: { ...config.debt, term: parseInt(e.target.value) || 1 } })}
              className="w-full bg-transparent text-lg font-black text-slate-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tasa Anual (%)</span>
            </div>
            <div className="flex items-center">
              <input 
                type="number"
                value={config.debt.annualRate}
                onChange={(e) => onUpdateConfig({ debt: { ...config.debt, annualRate: parseFloat(e.target.value) || 0 } })}
                className="w-full bg-transparent text-lg font-black text-slate-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-lg font-black text-slate-800">%</span>
            </div>
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

