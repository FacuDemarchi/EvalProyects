/**
 * OBJETIVO: Punto de entrada principal de la aplicación.
 * QUÉ HACE: Orquesta los componentes de la UI y gestiona el estado global mediante el hook useFinance. Maneja modales de ayuda y transiciones con animaciones fluidas.
 * RETORNA: La estructura completa de la aplicación con un diseño premium y responsivo.
 */

import { useState, useEffect } from 'react';
import { useFinance } from './hooks/useFinance';
import { SpreadsheetTable } from './components/SpreadsheetTable';
import { ResultsPanel } from './components/ResultsPanel';
import { HelpModal } from './components/HelpModal';
import { ReflectionBox } from './components/ReflectionBox';
import { CapitalStructureBox } from './components/CapitalStructureBox';
import { PropagationModal } from './components/PropagationModal';
import { WorkingCapitalModal } from './components/WorkingCapitalModal';
import { HELP_CONTENT } from './data/help';
import { LayoutDashboard, BarChart3, ChevronUp, ChevronDown, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const { 
    state, 
    results, 
    updateItem, 
    propagateItemValue,
    updateConfig,
    optimizeCapitalStructure,
    loadDemoData
  } = useFinance();

  // Sincronizar la estructura de capital cuando cambia la inversión total en la tabla
  useEffect(() => {
    const currentDebt = state.config.debt.amount;
    const currentEquity = state.config.debt.equity;
    const currentTotalConfig = currentDebt + currentEquity;
    const actualTotal = results.totalInvestment;

    if (Math.abs(currentTotalConfig - actualTotal) > 0.01) {
      // Mantener la proporción actual si existe, si no 100% equity
      const ratio = currentTotalConfig > 0 ? currentDebt / currentTotalConfig : 0;
      
      updateConfig({
        debt: {
          ...state.config.debt,
          amount: actualTotal * ratio,
          equity: actualTotal * (1 - ratio),
        }
      });
    }
  }, [results.totalInvestment, state.config.debt.amount, state.config.debt.equity, updateConfig]);

  const [helpId, setHelpId] = useState<string | null>(null);
  const [propagationData, setPropagationData] = useState<{
    categoryId: string;
    itemId: string;
    index: number;
    oldValue: number;
    newValue: number;
    changePercent: number;
  } | null>(null);
  const [wcWarningData, setWcWarningData] = useState<{
    categoryId: string;
    itemId: string;
    index: number;
    newValue: number;
  } | null>(null);

  const handlePropagationConfirm = (type: 'fixed' | 'proportional' | 'none') => {
    if (propagationData) {
      propagateItemValue(
        propagationData.categoryId,
        propagationData.itemId,
        propagationData.index,
        propagationData.newValue,
        type
      );
      setPropagationData(null);
    }
  };

  const handleWCConfirm = () => {
    if (wcWarningData) {
      updateItem(wcWarningData.categoryId, wcWarningData.itemId, { 
        values: state.categories.find(c => c.id === wcWarningData.categoryId)!.items[0].values.map((v, i) => i === wcWarningData.index ? wcWarningData.newValue : v) 
      });
      setWcWarningData(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      {/* HEADER DE ALTO IMPACTO */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">EvalPro MVP</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Simulador Financiero</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button
              onClick={loadDemoData}
              className="px-4 py-2 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:border-blue-200 transition-all shadow-sm active:scale-95"
            >
              Cargar Ejemplo Ajustado
            </button>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Flujo de Caja</h2>
            
            <div className="w-px h-6 bg-slate-200 mx-2" />

            {/* CONTROLES DE CONFIGURACIÓN DIRECTOS */}
            <div className="flex items-center gap-4">
              {/* HORIZONTE Y PERIODICIDAD (Estilo Imagen) */}
              <div className="flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm h-10">
                {/* HORIZONTE */}
                <div className="flex items-center px-3 gap-2 h-full bg-slate-50">
                  <input 
                    type="number"
                    value={state.config.horizon}
                    onChange={(e) => updateConfig({ horizon: parseInt(e.target.value) || 1 })}
                    className="w-8 bg-transparent text-lg font-black text-slate-800 text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="flex flex-col -gap-1">
                    <button 
                      onClick={() => updateConfig({ horizon: state.config.horizon + 1 })}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button 
                      onClick={() => updateConfig({ horizon: Math.max(1, state.config.horizon - 1) })}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AÑOS</span>
                </div>
              </div>

              {/* KE / TMAR (%) */}
              <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3 h-10 shadow-sm group hover:border-blue-400 transition-all">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">KE</span>
                  <button 
                    onClick={() => setHelpId('ke')}
                    className="text-slate-300 hover:text-blue-500 transition-colors"
                  >
                    <HelpCircle size={12} />
                  </button>
                </div>
                <input 
                  type="number"
                  value={state.config.ke}
                  onChange={(e) => updateConfig({ ke: parseFloat(e.target.value) || 0 })}
                  className="w-8 bg-transparent text-sm font-black text-slate-800 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs font-bold text-slate-400">%</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-[1600px] mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-6">
          {/* TABLA DE FLUJO (Ancho Completo) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <SpreadsheetTable 
              categories={state.categories}
              config={state.config}
              results={results}
              onUpdateConfig={updateConfig}
              onPropagate={(categoryId, itemId, index, oldValue, newValue) => {
                if (index === 0 && !['delta_ct', 'capex'].includes(categoryId)) {
                  propagateItemValue(categoryId, itemId, index, newValue, 'fixed');
                } else if (index === 0 && ['delta_ct', 'capex'].includes(categoryId)) {
                  // No propagar capital de trabajo ni inversión por defecto
                  updateItem(categoryId, itemId, { values: state.categories.find(c => c.id === categoryId)!.items[0].values.map((v, i) => i === 0 ? newValue : v) });
                } else if (categoryId === 'delta_ct' && index > 0 && newValue !== 0) {
                  // Mostrar advertencia solo si la variación es significativa (> 20% del valor del periodo anterior)
                  // Esto ayuda a detectar si el usuario está poniendo el TOTAL de nuevo en lugar del DELTA
                  const prevValue = state.categories.find(c => c.id === categoryId)!.items[0].values[index - 1];
                  const isSignificantChange = Math.abs(newValue) > Math.abs(prevValue) * 0.20;
                  
                  if (isSignificantChange) {
                    setWcWarningData({ categoryId, itemId, index, newValue });
                  } else {
                    updateItem(categoryId, itemId, { 
                      values: state.categories.find(c => c.id === categoryId)!.items[0].values.map((v, i) => i === index ? newValue : v) 
                    });
                  }
                } else {
                  const changePercent = oldValue !== 0 ? ((newValue - oldValue) / Math.abs(oldValue)) * 100 : 0;
                  setPropagationData({ categoryId, itemId, index, oldValue, newValue, changePercent });
                }
              }}
              onHelp={setHelpId}
            />
          </motion.div>
        </div>

        {/* SECCIÓN INTERMEDIA: ESTRUCTURA Y KPIs */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 h-full">
            <CapitalStructureBox 
              config={state.config}
              totalInvestment={results.totalInvestment}
              onUpdateConfig={updateConfig}
              onOptimize={optimizeCapitalStructure}
              onHelp={setHelpId}
            />
          </div>
          
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600">
                <BarChart3 size={18} />
              </div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">KPIs Financieros</h2>
            </div>
            <ResultsPanel 
              config={state.config}
              results={results}
              onUpdateConfig={updateConfig}
              onHelp={setHelpId}
            />
          </div>
        </div>

        {/* SECCIÓN FINAL: REFLEXIÓN */}
        <div className="mt-6">
          <ReflectionBox 
            config={state.config}
            results={results}
          />
        </div>
      </main>

      {/* MODAL DE AYUDA CONTEXTUAL */}
      <HelpModal 
        isOpen={!!helpId}
        onOpenChange={(open) => !open && setHelpId(null)}
        title={helpId ? HELP_CONTENT[helpId]?.title : ''}
        description={helpId ? HELP_CONTENT[helpId]?.description : ''}
      />

      {/* MODAL DE PROPAGACIÓN AVANZADA */}
      <PropagationModal 
        isOpen={!!propagationData}
        onClose={() => setPropagationData(null)}
        onConfirm={handlePropagationConfirm}
        oldValue={propagationData?.oldValue || 0}
        newValue={propagationData?.newValue || 0}
        changePercent={propagationData?.changePercent || 0}
      />

      {/* MODAL DE ADVERTENCIA CAPITAL DE TRABAJO */}
      <WorkingCapitalModal 
        isOpen={!!wcWarningData}
        onClose={() => setWcWarningData(null)}
        onConfirm={handleWCConfirm}
        newValue={wcWarningData?.newValue || 0}
      />

      <footer className="mt-12 py-8 border-t border-slate-200/60 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
              <LayoutDashboard size={12} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">EvalPro MVP © 2026</span>
          </div>
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600 transition-colors">Documentación</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Soporte</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
