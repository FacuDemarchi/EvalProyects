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

  // Lógica de optimización y apalancamiento
  const totalCapital = config.debt.amount + config.debt.equity;
  const debtRatio = totalCapital > 0 ? (config.debt.amount / totalCapital) * 100 : 0;
  
  let leverageTitle = config.evalMode === 'project' ? 'Optimización del WACC' : 'Efecto del Apalancamiento';
  let leverageText = '';
  
  if (config.evalMode === 'project') {
    leverageText = `Al evaluar por Proyecto, el uso de un ${debtRatio.toFixed(0)}% de deuda optimiza el WACC (Costo Promedio Ponderado de Capital). Dado que el costo de la deuda después de impuestos (${(config.debt.annualRate * (1 - config.taxRate/100)).toFixed(1)}%) es menor al costo del capital propio (${config.ke}%), la estructura actual permite descontar los flujos a una tasa más baja, maximizando el valor intrínseco del negocio.`;
  } else {
    leverageText = `En el modo Accionista, el apalancamiento del ${debtRatio.toFixed(0)}% potencia tu rentabilidad interna (TIR). Al financiar parte de la inversión con capital de terceros a una tasa (${config.debt.annualRate}%) que es menor al retorno esperado del proyecto, el excedente generado por cada dólar prestado fluye directamente hacia ti como accionista, incrementando el VAN de tu aporte propio.`;
  }

  const systemExplanation = {
    french: "Se ha seleccionado el sistema Francés (Cuota Fija) porque ofrece estabilidad en los egresos financieros, permitiendo una planificación de tesorería más predecible sin comprometer la liquidez inicial excesivamente.",
    german: "El sistema Alemán (Amortización Fija) es la opción elegida para reducir la carga de intereses más rápidamente. Al amortizar capital de forma constante, el ahorro fiscal es mayor en los primeros años, lo cual es beneficioso si el proyecto tiene flujos fuertes al inicio.",
    bullet: "El sistema Bullet (Solo Intereses) es el óptimo estratégico para este escenario de liquidez. Al diferir la devolución del capital al final del horizonte, liberas flujo de caja operativo durante la vida del proyecto, maximizando el valor presente neto al mantener el dinero trabajando en el negocio por más tiempo."
  }[config.debt.system];

  const ceilingNote = "Nota Estratégica: Si tu entidad financiera impone un límite de crédito (Techo de Deuda), puedes ajustar manualmente el monto en el panel de configuración para recalcular la viabilidad bajo esa restricción específica.";

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

          {/* NUEVA SECCIÓN DE ANÁLISIS DETALLADO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-black/5 mt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-60">
                <TrendingUp size={14} />
                {leverageTitle}
              </div>
              <p className="text-sm leading-relaxed font-medium opacity-80 italic">
                "{leverageText}"
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-60">
                <ShieldCheck size={14} />
                Estrategia de Amortización
              </div>
              <p className="text-sm leading-relaxed font-medium opacity-80">
                {systemExplanation}
              </p>
            </div>
          </div>

          <div className="py-4 px-6 bg-white/40 rounded-2xl border border-black/5">
            <p className="text-[11px] leading-relaxed font-bold opacity-70 italic">
              {ceilingNote}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-6">
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
