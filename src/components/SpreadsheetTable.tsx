/**
 * OBJETIVO: Renderizar la tabla principal de flujo de caja estilo Excel.
 * QUÉ HACE: Muestra una grilla plana donde cada fila es un concepto financiero directo (Ingresos, Costos, etc.).
 * RETORNA: Una tabla simplificada y funcional con estética de planilla de cálculo.
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';
import type { Category, FinancialConfig, FinancialResults, Item } from '../types/finance';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SpreadsheetTableProps {
  categories: Category[];
  config: FinancialConfig;
  results: FinancialResults;
  onAddItem: (catId: string) => void;
  onUpdateItem: (catId: string, itemId: string, updates: Partial<Item>) => void;
  onPropagate: (catId: string, itemId: string, index: number, oldValue: number, newValue: number) => void;
  onDeleteItem: (catId: string, itemId: string) => void;
  onHelp: (id: string) => void;
}

export const SpreadsheetTable: React.FC<SpreadsheetTableProps> = ({
  categories,
  config,
  results,
  onUpdateItem,
  onPropagate,
  onHelp,
}) => {
  const [editingValue, setEditingValue] = React.useState<{ catId: string; index: number; value: string } | null>(null);
  const periods = Array.from({ length: config.horizon }, (_, i) => i + 1);
  const periodLabel = config.periodicity === 'monthly' ? 'Mes' : 'Año';

  const handleBlur = (catId: string, itemId: string, index: number, currentValue: number, newValue: number, prevPeriodValue: number) => {
    setEditingValue(null);
    
    // Auto-negativo para salidas de dinero (si el usuario pone positivo, lo convertimos)
    let finalValue = newValue;
    if (['costos_var', 'costos_fijos', 'capex', 'delta_ct'].includes(catId) && newValue > 0) {
      // Para Capital de Trabajo en períodos posteriores, permitimos positivo (recuperación)
      if (catId === 'delta_ct' && index > 0) {
        finalValue = newValue;
      } else {
        finalValue = -newValue;
      }
    }

    if (finalValue !== currentValue) {
      onPropagate(catId, itemId, index, prevPeriodValue, finalValue);
    }
  };

  return (
    <div className="overflow-x-auto bg-white border border-slate-300 shadow-sm transition-all duration-300">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-300">
            <th className="p-2 text-left font-bold text-slate-700 w-64 border-r border-slate-300 sticky left-0 bg-slate-100 z-10">
              Concepto
            </th>
            {periods.map(p => (
              <th key={p} className="p-2 text-right font-bold text-slate-700 min-w-[120px] border-r border-slate-300 last:border-r-0">
                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">{periodLabel}</span>
                  <span className="text-sm">{p}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map(category => {
            const mainItem = category.items[0]; // Estructura plana: tomamos el primer ítem
            return (
              <tr key={category.id} className="border-b border-slate-200 group hover:bg-slate-50 transition-colors">
                <td className="p-2 border-r border-slate-300 sticky left-0 bg-white group-hover:bg-slate-50 z-10 flex items-center gap-2">
                  <button 
                    onClick={() => onHelp(category.helpId)}
                    className="text-slate-400 hover:text-blue-600 transition-all"
                  >
                    <HelpCircle size={14} />
                  </button>
                  <span className="font-medium text-slate-700">{category.label}</span>
                </td>
                {periods.map((_, i) => {
                  const isEditing = editingValue?.catId === category.id && editingValue?.index === i;
                  const value = mainItem?.values[i] || 0;
                  
                  // Formateador contable para mostrar mientras se escribe
                  const formatAccounting = (valStr: string) => {
                    if (!valStr) return "";
                    // Limpiar todo lo que no sea número o coma
                    const clean = valStr.replace(/[^\d,]/g, "");
                    const parts = clean.split(",");
                    // Formatear la parte entera con puntos
                    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                    return parts.join(",");
                  };

                  const displayValue = isEditing 
                    ? editingValue.value 
                    : value.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                  return (
                    <td key={i} className="p-0 border-r border-slate-300 last:border-r-0">
                      <input
                        type="text"
                        value={displayValue}
                        onFocus={(e) => {
                          // Al seleccionar, dejamos la celda en blanco para escribir de cero
                          setEditingValue({ catId: category.id, index: i, value: "" });
                        }}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          // Aplicamos el formato contable dinámico mientras escribe
                          const formatted = formatAccounting(rawValue);
                          setEditingValue({ catId: category.id, index: i, value: formatted });
                        }}
                        onBlur={(e) => {
                          // Si el usuario no escribió nada (dejó en blanco), mantenemos el valor anterior
                          if (editingValue?.value === "") {
                            setEditingValue(null);
                            return;
                          }
                          
                          // Obtener el valor formateado del input
                          const rawValue = e.target.value;
                          // Limpiar puntos y convertir coma a punto para parsear
                          const cleanValue = rawValue.replace(/\./g, "").replace(",", ".");
                          const newValue = parseFloat(cleanValue) || 0;
                          
                          const currentValue = mainItem!.values[i];
                          const prevPeriodValue = i > 0 ? mainItem!.values[i - 1] : 0;
                          
                          handleBlur(category.id, mainItem!.id, i, currentValue, newValue, prevPeriodValue);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            const newValue = parseFloat(input.value.replace(/\./g, "").replace(",", ".")) || 0;
                            const currentValue = mainItem!.values[i];
                            const prevPeriodValue = i > 0 ? mainItem!.values[i - 1] : 0;
                            
                            setEditingValue(null);
                            if (newValue !== currentValue) {
                              onPropagate(category.id, mainItem!.id, i, prevPeriodValue, newValue);
                            }
                            input.blur();
                          }
                        }}
                        className={cn(
                          "spreadsheet-input w-full h-full p-2 outline-none border-none text-right bg-transparent focus:bg-blue-50 focus:ring-2 focus:ring-blue-400 transition-all font-semibold",
                          value < 0 && "text-red-500"
                        )}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}

          <tr className="bg-slate-50 font-bold border-t-2 border-slate-400">
            <td className="p-2 border-r border-slate-300 sticky left-0 bg-slate-50 z-10 uppercase tracking-widest text-[11px] text-slate-900 flex items-center gap-2">
              <button 
                onClick={() => onHelp('ebitda')}
                className="text-slate-400 hover:text-blue-600 transition-all"
              >
                <HelpCircle size={14} />
              </button>
              EBITDA
            </td>
            {results.ebitda.map((val, i) => (
              <td key={i} className={cn(
                "p-2 text-right border-r border-slate-300 last:border-r-0 font-black",
                val < 0 ? "text-red-500" : "text-slate-900"
              )}>
                {val.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            ))}
          </tr>

          <tr className="bg-white text-slate-500 font-medium">
            <td className="p-2 border-r border-slate-300 sticky left-0 bg-white z-10 italic">
              Impuestos ({config.taxRate}%)
            </td>
            {results.taxes.map((val, i) => (
              <td key={i} className={cn(
                "p-2 text-right border-r border-slate-300 last:border-r-0",
                val < 0 ? "text-red-500" : "text-slate-900"
              )}>
                {val.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            ))}
          </tr>

          {config.debt.enabled && (
            <>
              <tr className="bg-white text-slate-500 font-medium border-t border-slate-200">
                <td className="p-2 border-r border-slate-300 sticky left-0 bg-white z-10 italic">Intereses</td>
                {results.interest.map((val, i) => (
                  <td key={i} className={cn(
                    "p-2 text-right border-r border-slate-300 last:border-r-0",
                    val < 0 ? "text-red-500" : "text-slate-900"
                  )}>
                    {val.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>
              <tr className="bg-white text-slate-500 font-medium">
                <td className="p-2 border-r border-slate-300 sticky left-0 bg-white z-10 italic">Principal (Amortización)</td>
                {results.principal.map((val, i) => (
                  <td key={i} className={cn(
                    "p-2 text-right border-r border-slate-300 last:border-r-0",
                    val < 0 ? "text-red-500" : "text-slate-900"
                  )}>
                    {val.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                ))}
              </tr>
            </>
          )}

          <tr className={cn(
            "font-black border-t-2 transition-all duration-500",
            config.evalMode === 'project' 
              ? "bg-blue-100 text-blue-900 border-blue-300" 
              : "bg-emerald-100 text-emerald-900 border-emerald-300"
          )}>
            <td className="p-2 border-r border-slate-300 sticky left-0 bg-inherit z-10 uppercase tracking-widest text-[11px]">
              {config.evalMode === 'project' ? 'Flujo Proyecto (FCFF)' : 'Flujo Accionista (FCFE)'}
            </td>
            {(config.evalMode === 'project' ? results.fcff : results.fcfe).map((val, i) => (
                  <td key={i} className={cn(
                    "p-2 text-right border-r border-slate-300 last:border-r-0",
                    val < 0 ? "text-red-600" : "text-inherit"
                  )}>
                    <motion.span
                      key={`${config.evalMode}-${val}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {val.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </motion.span>
                  </td>
                ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
