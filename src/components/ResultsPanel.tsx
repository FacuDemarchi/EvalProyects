/**
 * OBJETIVO: Mostrar los indicadores clave de desempeño (KPIs) y permitir el cambio de modo de evaluación.
 * QUÉ HACE: Visualiza VAN, TIR, PRI, B/C, PI e IVAN con tarjetas de alto impacto visual y un switch refinado.
 * RETORNA: Un panel de resultados dinámico y profesional.
 */

import React from 'react';
import type { FinancialConfig, FinancialResults } from '../types/finance';
import { HelpCircle, TrendingUp, Clock, BarChart3, PieChart, Info } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';
import { motion, AnimatePresence } from 'framer-motion';

interface ResultsPanelProps {
  config: FinancialConfig;
  results: FinancialResults;
  onUpdateConfig: (updates: Partial<FinancialConfig>) => void;
  onHelp: (id: string) => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ config, results, onUpdateConfig, onHelp }) => {
  const { kpis } = results;

  const KpiCard = ({ id, label, value, icon: Icon, colorClass, format = 'number' }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none ${colorClass.split(' ')[0]}`} />
      
      <div className="flex items-center justify-between text-slate-500 mb-2 relative z-10">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
          <Icon size={16} className={colorClass} />
          {label}
        </div>
        <button 
          onClick={() => onHelp(id)}
          className="text-slate-300 hover:text-slate-500 transition-colors p-1"
        >
          <HelpCircle size={16} />
        </button>
      </div>

      <div className="text-2xl font-black text-slate-900 tracking-tight">
        {format === 'currency' && `$${value.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        {format === 'percent' && `${(value * 100).toFixed(2)}%`}
        {format === 'number' && value.toFixed(2)}
        {format === 'years' && (
          <span className="flex items-baseline gap-1">
            {value.toFixed(1)} <span className="text-xs font-medium text-slate-400">años</span>
          </span>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {/* MODO DE EVALUACIÓN (Switch refinado) */}
      <AnimatePresence mode="wait">
        {config.debt.enabled && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 rounded-3xl p-4 text-white shadow-2xl shadow-slate-300/50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Modo de Evaluación</span>
              <div className="flex items-center gap-3 bg-slate-800/50 p-1 rounded-full border border-white/5">
                <button 
                  onClick={() => onUpdateConfig({ evalMode: 'project' })}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${config.evalMode === 'project' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Proyecto
                </button>
                <button 
                  onClick={() => onUpdateConfig({ evalMode: 'equity' })}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${config.evalMode === 'equity' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Accionista
                </button>
              </div>
            </div>

            <div className="flex gap-3 items-start relative z-10">
              <div className={`p-2 rounded-xl bg-white/10 ${config.evalMode === 'project' ? 'text-blue-400' : 'text-emerald-400'}`}>
                <Info size={16} />
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                {config.evalMode === 'project' 
                  ? 'Calculando el rendimiento del negocio completo (FCFF) utilizando WACC como tasa de descuento.' 
                  : 'Calculando el rendimiento para el inversionista (FCFE) considerando el servicio de deuda y usando Ke.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TASA ACTUAL (Badge refinado) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between shadow-sm">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tasa de Descuento</span>
          <span className="text-xs font-semibold text-slate-600">
            {config.evalMode === 'project' ? 'WACC' : 'Ke'}
          </span>
        </div>
        <div className={`px-3 py-1.5 rounded-xl font-black text-lg ${config.evalMode === 'project' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {(config.evalMode === 'project' ? results.wacc * 100 : config.ke).toFixed(2)}%
        </div>
      </div>

      {/* GRID DE KPIs */}
      <div className="grid grid-cols-1 gap-3">
        <div className="grid grid-cols-2 gap-3">
          <KpiCard 
            id="van"
            label="VAN (VPN)" 
            value={kpis.van} 
            icon={TrendingUp} 
            colorClass="text-emerald-500" 
            format="currency" 
          />
          <KpiCard 
            id="tir"
            label="TIR" 
            value={kpis.tir} 
            icon={BarChart3} 
            colorClass="text-blue-500" 
            format="percent" 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <KpiCard 
            id="pri"
            label="Payback" 
            value={kpis.pri} 
            icon={Clock} 
            colorClass="text-amber-500" 
            format="years" 
          />
          <KpiCard 
            id="bc"
            label="B/C Ratio" 
            value={kpis.bc} 
            icon={PieChart} 
            colorClass="text-indigo-500" 
            format="number" 
          />
        </div>
      </div>

      {/* RATIOS SECUNDARIOS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center text-center relative group">
          <button 
            onClick={() => onHelp('pi')}
            className="absolute top-2 right-2 text-slate-300 hover:text-slate-500 transition-colors p-1"
          >
            <HelpCircle size={14} />
          </button>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">PI (Índice Rent.)</span>
          <span className="text-xl font-black text-slate-700">{kpis.pi.toFixed(2)}</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center text-center relative group">
          <button 
            onClick={() => onHelp('ivan')}
            className="absolute top-2 right-2 text-slate-300 hover:text-slate-500 transition-colors p-1"
          >
            <HelpCircle size={14} />
          </button>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">IVAN</span>
          <span className="text-xl font-black text-slate-700">{kpis.ivan.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
