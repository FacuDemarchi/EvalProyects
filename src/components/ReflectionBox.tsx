/**
 * OBJETIVO: Proporcionar una síntesis cualitativa del análisis financiero.
 * QUÉ HACE: Evalúa los KPIs (VAN, TIR, B/C) y genera una reflexión final sobre la viabilidad del proyecto.
 * RETORNA: Un cuadro de resumen ejecutivo con diseño premium.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Lightbulb, TrendingUp, ShieldCheck } from 'lucide-react';
import type { FinancialConfig, FinancialResults } from '../types/finance';

interface ReflectionBoxProps {
  config: FinancialConfig;
  results: FinancialResults;
}

export const ReflectionBox: React.FC<ReflectionBoxProps> = ({ config, results }) => {
  const { kpis } = results;
  const { van, tir, bc, pri } = kpis;
  const discountRate = config.evalMode === 'project' ? results.wacc : config.ke / 100;

  // Lógica de determinación de estado
  let status: 'success' | 'warning' | 'error' = 'success';
  let title = '';
  let description = '';
  let Icon = CheckCircle2;
  let colorClass = '';

  if (van > 0 && tir > discountRate) {
    status = 'success';
    title = 'Proyecto Altamente Viable';
    description = 'El análisis indica que el proyecto genera valor económico neto positivo. La rentabilidad interna supera el costo de capital, lo que sugiere una inversión sólida bajo las premisas actuales.';
    Icon = ShieldCheck;
    colorClass = 'bg-emerald-50 border-emerald-200 text-emerald-800';
  } else if (van <= 0 && tir > 0) {
    status = 'warning';
    title = 'Viabilidad Marginal / Riesgo Elevado';
    description = 'Aunque el proyecto genera retornos, estos no son suficientes para cubrir el costo de capital exigido (VAN negativo). Se recomienda revisar la estructura de costos o buscar eficiencias operativas.';
    Icon = AlertTriangle;
    colorClass = 'bg-amber-50 border-amber-200 text-amber-800';
  } else {
    status = 'error';
    title = 'Proyecto No Viable';
    description = 'Bajo las condiciones actuales, el proyecto destruye valor. Los flujos de caja proyectados no logran compensar la inversión inicial ni los costos operativos y de capital.';
    Icon = XCircle;
    colorClass = 'bg-red-50 border-red-200 text-red-800';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`rounded-[2rem] border p-8 md:p-10 shadow-xl shadow-slate-200/50 ${colorClass}`}
    >
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className={`p-4 rounded-2xl bg-white shadow-sm shrink-0`}>
          <Icon size={40} className={status === 'success' ? 'text-emerald-500' : status === 'warning' ? 'text-amber-500' : 'text-red-500'} />
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-black tracking-tight">{title}</h3>
            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-60">Reflexión Final del Análisis</p>
          </div>
          
          <p className="text-lg font-medium leading-relaxed opacity-90 max-w-4xl">
            {description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-black/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/50 rounded-lg">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">VAN vs WACC</p>
                <p className="font-black text-sm">
                  {van > 0 ? 'Excedente de Valor' : 'Déficit de Valor'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/50 rounded-lg">
                <Lightbulb size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Ratio B/C</p>
                <p className="font-black text-sm">
                  {bc.toFixed(2)} {bc > 1 ? '(Rentable)' : '(No Rentable)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/50 rounded-lg">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Recuperación</p>
                <p className="font-black text-sm">
                  {pri.toFixed(1)} años proyectados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
