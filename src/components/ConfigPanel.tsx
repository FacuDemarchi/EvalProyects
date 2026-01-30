/**
 * OBJETIVO: Panel de configuración lateral con secciones colapsables.
 * QUÉ HACE: Permite ajustar la periodicidad, el horizonte, las tasas y la deuda del proyecto con un diseño limpio y moderno.
 * RETORNA: Un panel con secciones fijas y acordeones para una configuración organizada.
 */

import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, HelpCircle, Settings2, Percent, Landmark } from 'lucide-react';
import type { FinancialConfig } from '../types/finance';
import * as Switch from '@radix-ui/react-switch';
import { motion } from 'framer-motion';

interface ConfigPanelProps {
  config: FinancialConfig;
  totalInvestment: number;
  onUpdateConfig: (updates: Partial<FinancialConfig>) => void;
  onHelp: (id: string) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, totalInvestment, onUpdateConfig, onHelp }) => {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* CABECERA */}
      <div className="p-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Settings2 size={20} />
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-800">Configuración</h2>
        </div>
        <p className="text-xs font-medium text-slate-400 pl-11">Ajustes generales del proyecto</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* CONFIGURACIÓN BÁSICA (FIJA) */}
        <section className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                Periodicidad
                <button onClick={() => onHelp('periodicidad')} className="text-slate-300 hover:text-blue-500 transition-colors">
                  <HelpCircle size={14} />
                </button>
              </label>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                <button
                  onClick={() => onUpdateConfig({ periodicity: 'monthly' })}
                  className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                    config.periodicity === 'monthly' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'
                  }`}
                >
                  MESES
                </button>
                <button
                  onClick={() => onUpdateConfig({ periodicity: 'yearly' })}
                  className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                    config.periodicity === 'yearly' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'
                  }`}
                >
                  AÑOS
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Horizonte (Años)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.horizon}
                    onChange={(e) => onUpdateConfig({ horizon: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  Ke / TMAR (%)
                  <button onClick={() => onHelp('ke')} className="text-slate-300 hover:text-blue-500 transition-colors">
                    <HelpCircle size={14} />
                  </button>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={config.ke}
                    onChange={(e) => onUpdateConfig({ ke: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIONES DESPLEGABLES (ACORDEÓN) */}
        <Accordion.Root type="multiple" className="space-y-2 pt-4">
          {/* FINANCIAMIENTO */}
          <Accordion.Item value="debt" className="border-t border-slate-100">
            <Accordion.Header>
              <Accordion.Trigger className="w-full py-5 flex items-center justify-between font-bold text-slate-700 hover:text-slate-900 transition-colors group outline-none">
                <div className="flex items-center gap-3">
                  <Landmark size={18} className="text-amber-500" />
                  <span className="tracking-tight text-sm">Financiamiento</span>
                </div>
                <ChevronDown size={18} className="text-slate-400 group-data-[state=open]:rotate-180 transition-transform duration-300" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="pb-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inversión Total (V)</label>
                      <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Sincronizado con Tabla</span>
                    </div>
                    <div className="relative group">
                      <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 flex justify-between items-center cursor-default">
                        <span>${totalInvestment.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Automático</span>
                      </div>
                      <div className="absolute left-0 -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="bg-slate-800 text-white text-[9px] px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap font-medium">
                          Suma de CAPEX + Δ Capital de Trabajo en la tabla
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Deuda (D)</span>
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600">
                        ${config.debt.amount.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Equity (E)</span>
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600">
                        ${config.debt.equity.toLocaleString('es-CL', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sistema de Amortización</label>
                    <select
                      value={config.debt.system}
                      onChange={(e) => onUpdateConfig({ debt: { ...config.debt, system: e.target.value as any } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none cursor-pointer transition-all"
                    >
                      <option value="french">Sist. Francés (Cuota Fija)</option>
                      <option value="german">Sist. Alemán (Amort. Fija)</option>
                      <option value="bullet">Sist. Bullet (Final)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plazo (Años)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={config.debt.term}
                          onChange={(e) => onUpdateConfig({ debt: { ...config.debt, term: parseInt(e.target.value) || 1 } })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tasa Anual (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={config.debt.annualRate}
                          onChange={(e) => onUpdateConfig({ debt: { ...config.debt, annualRate: parseFloat(e.target.value) || 0 } })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Accordion.Content>
          </Accordion.Item>

          {/* IMPUESTOS */}
          <Accordion.Item value="taxes" className="border-t border-slate-100">
            <Accordion.Header>
              <Accordion.Trigger className="w-full py-5 flex items-center justify-between font-bold text-slate-700 hover:text-slate-900 transition-colors group outline-none">
                <div className="flex items-center gap-3">
                  <Percent size={18} className="text-emerald-500" />
                  <span className="tracking-tight text-sm">Impuestos</span>
                </div>
                <ChevronDown size={18} className="text-slate-400 group-data-[state=open]:rotate-180 transition-transform duration-300" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="pb-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tasa Efectiva (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={config.taxRate}
                      onChange={(e) => onUpdateConfig({ taxRate: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Módulo Avanzado</span>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                      Arrastre de pérdidas (NOLs)
                    </li>
                    <li className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                      Escudo fiscal detallado
                    </li>
                  </ul>
                </div>
              </motion.div>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </div>
    </div>
  );
};
