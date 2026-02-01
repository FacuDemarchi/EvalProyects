/**
 * OBJETIVO: Renderizar la tabla principal de flujo de caja estilo Excel.
 * QUÉ HACE: Muestra una grilla plana donde cada fila es un concepto financiero directo (Ingresos, Costos, etc.).
 * RETORNA: Una tabla simplificada y funcional con estética de planilla de cálculo.
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';
import type { Category, FinancialConfig, FinancialResults } from '../types/finance';
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
  onPropagate: (catId: string, itemId: string, index: number, oldValue: number, newValue: number) => void;
  onUpdateConfig: (updates: Partial<FinancialConfig>) => void;
  onHelp: (id: string) => void;
}

export const SpreadsheetTable: React.FC<SpreadsheetTableProps> = ({
  categories,
  config,
  results,
  onPropagate,
  onUpdateConfig,
  onHelp,
}) => {
  const [editingValue, setEditingValue] = React.useState<{ catId: string; index: number; value: string } | null>(null);
  const [isEditingTax, setIsEditingTax] = React.useState(false);
  const [taxInputValue, setTaxInputValue] = React.useState(config.taxRate.toString());
  const periods = Array.from({ length: config.horizon + 1 }, (_, i) => i);

  const handleBlur = (catId: string, itemId: string, index: number, oldValue: number, newValue: number) => {
    setEditingValue(null);
    
    // Auto-negativo para salidas de dinero (si el usuario pone positivo, lo convertimos)
    let finalValue = newValue;
    if (['costos_var', 'costos_fijos', 'capex', 'delta_ct'].includes(catId) && newValue > 0) {
      if (catId === 'delta_ct' && index > 0) {
        finalValue = newValue;
      } else {
        finalValue = -newValue;
      }
    }

    if (finalValue !== oldValue) {
      // Pasamos el valor que tenía la celda ANTES de editar para que App.tsx sepa si cambió
      onPropagate(catId, itemId, index, oldValue, finalValue);
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
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    {p === 0 ? 'Inicio' : 'Año'}
                  </span>
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
                    const isNegative = valStr.startsWith("-");
                    // Limpiar todo lo que no sea número o coma
                    const clean = valStr.replace(/[^\d,]/g, "");
                    const parts = clean.split(",");
                    // Formatear la parte entera con puntos
                    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                    return (isNegative ? "-" : "") + parts.join(",");
                  };

                  const displayValue = isEditing 
                    ? editingValue.value 
                    : value.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                  return (
                    <td key={i} className="p-0 border-r border-slate-300 last:border-r-0">
                      <input
                        type="text"
                        value={displayValue}
                        onFocus={() => {
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
                            // Si ya no estamos editando (porque se manejó en Enter), no hacer nada
                            if (!editingValue) return;

                            const rawValue = e.target.value;
                            const cleanValue = rawValue.replace(/\./g, "").replace(",", ".");
                            const newValue = parseFloat(cleanValue) || 0;
                            const oldValue = mainItem!.values[i];
                            
                            handleBlur(category.id, mainItem!.id, i, oldValue, newValue);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const rawValue = e.currentTarget.value;
                              const cleanValue = rawValue.replace(/\./g, "").replace(",", ".");
                              const newValue = parseFloat(cleanValue) || 0;
                              const oldValue = mainItem!.values[i];
                              
                              // Quitamos el foco primero para asegurar que el estado se limpie correctamente
                              // handleBlur se encargará de disparar el modal
                              handleBlur(category.id, mainItem!.id, i, oldValue, newValue);
                              e.currentTarget.blur();
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
            <td className="p-2 border-r border-slate-300 sticky left-0 bg-white z-10 italic group/tax cursor-pointer" onClick={() => {
              setIsEditingTax(true);
              setTaxInputValue(config.taxRate.toString());
            }}>
              {isEditingTax ? (
                <div className="flex items-center gap-1">
                  <span>Impuestos (</span>
                  <input
                    autoFocus
                    type="number"
                    value={taxInputValue}
                    onChange={(e) => setTaxInputValue(e.target.value)}
                    onBlur={() => {
                      setIsEditingTax(false);
                      onUpdateConfig({ taxRate: parseFloat(taxInputValue) || 0 });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsEditingTax(false);
                        onUpdateConfig({ taxRate: parseFloat(taxInputValue) || 0 });
                      }
                    }}
                    className="w-10 bg-blue-50 border-none outline-none text-blue-600 font-bold p-0 rounded"
                  />
                  <span>%)</span>
                </div>
              ) : (
                <span className="group-hover/tax:text-blue-600 transition-colors">
                  Impuestos ({config.taxRate}%)
                </span>
              )}
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
