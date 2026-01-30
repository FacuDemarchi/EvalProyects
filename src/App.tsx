/**
 * OBJETIVO: Punto de entrada principal de la aplicación.
 * QUÉ HACE: Orquesta los componentes de la UI y gestiona el estado global mediante el hook useFinance. Maneja modales de ayuda y transiciones con animaciones fluidas.
 * RETORNA: La estructura completa de la aplicación con un diseño premium y responsivo.
 */

import { useState } from 'react';
import { useFinance } from './hooks/useFinance';
import { SpreadsheetTable } from './components/SpreadsheetTable';
import { ConfigPanel } from './components/ConfigPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { HelpModal } from './components/HelpModal';
import { ReflectionBox } from './components/ReflectionBox';
import { CapitalStructureBox } from './components/CapitalStructureBox';
import { PropagationModal } from './components/PropagationModal';
import { WorkingCapitalModal } from './components/WorkingCapitalModal';
import { HELP_CONTENT } from './data/help';
import * as Dialog from '@radix-ui/react-dialog';
import { X, LayoutDashboard, BarChart3, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { 
    state, 
    results, 
    addItem, 
    updateItem, 
    deleteItem, 
    propagateItemValue,
    updateConfig,
    togglePeriodicity
  } = useFinance();

  const [helpId, setHelpId] = useState<string | null>(null);
  const [showPeriodicityModal, setShowPeriodicityModal] = useState(false);
  const [pendingPeriodicity, setPendingPeriodicity] = useState<'monthly' | 'yearly' | null>(null);
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

  const handleTogglePeriodicity = (newPeriodicity: 'monthly' | 'yearly') => {
    if (state.config.periodicity === 'monthly' && newPeriodicity === 'yearly') {
      setPendingPeriodicity(newPeriodicity);
      setShowPeriodicityModal(true);
    } else {
      togglePeriodicity(newPeriodicity);
    }
  };

  const confirmPeriodicity = (propagate: boolean) => {
    if (pendingPeriodicity) {
      togglePeriodicity(pendingPeriodicity, propagate);
      setPendingPeriodicity(null);
      setShowPeriodicityModal(false);
    }
  };

  const handlePropagationConfirm = (type: 'fixed' | 'proportional') => {
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
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Flujo de Caja</h2>
            
            <div className="w-px h-6 bg-slate-200 mx-2" />

            {/* BOTÓN DE CONFIGURACIÓN (RUEDITA) */}
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 group">
                  <Settings className="group-hover:rotate-90 transition-transform duration-500" size={20} />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay asChild>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" 
                  />
                </Dialog.Overlay>
                <Dialog.Content asChild>
                  <motion.div 
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className="fixed top-0 right-0 bottom-0 w-[400px] bg-white shadow-2xl z-[101] outline-none overflow-hidden"
                  >
                    <div className="absolute top-6 right-6 z-10">
                      <Dialog.Close className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
                        <X size={20} />
                      </Dialog.Close>
                    </div>
                    <ConfigPanel 
                      config={state.config}
                      totalInvestment={results.totalInvestment}
                      onUpdateConfig={(updates) => {
                        if (updates.periodicity) {
                          handleTogglePeriodicity(updates.periodicity);
                        } else {
                          updateConfig(updates);
                        }
                      }}
                      onHelp={setHelpId}
                    />
                  </motion.div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
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
              onAddItem={addItem}
              onUpdateItem={updateItem}
              onPropagate={(categoryId, itemId, index, oldValue, newValue) => {
                if (index === 0 && categoryId !== 'delta_ct') {
                  propagateItemValue(categoryId, itemId, index, newValue, 'fixed');
                } else if (index === 0 && categoryId === 'delta_ct') {
                  // No propagar capital de trabajo por defecto
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
              onDeleteItem={deleteItem}
              onHelp={setHelpId}
            />
          </motion.div>
        </div>

        {/* SECCIÓN INTERMEDIA: ESTRUCTURA Y KPIs */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 h-full">
            <CapitalStructureBox 
              config={state.config}
              onUpdateConfig={updateConfig}
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

      {/* MODAL DE TRANSICIÓN DE PERIODICIDAD */}
      <AnimatePresence>
        {showPeriodicityModal && (
          <Dialog.Root open={showPeriodicityModal} onOpenChange={setShowPeriodicityModal}>
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-slate-900/40 backdrop-blur-sm fixed inset-0 z-[100]" 
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-md bg-white rounded-[2rem] shadow-2xl p-8 z-[101] outline-none"
                >
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title className="text-xl font-black text-slate-900 tracking-tight">
                      Cambio de Escala Temporal
                    </Dialog.Title>
                    <Dialog.Close className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
                      <X size={20} />
                    </Dialog.Close>
                  </div>
                  
                  <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                    Estás colapsando la vista mensual a anual. ¿Deseas <span className="text-blue-600 font-bold">propagar el total</span> del primer año a los años posteriores o mantener la suma de los meses actuales?
                  </p>

                  <div className="space-y-3">
                    <button 
                      onClick={() => confirmPeriodicity(true)}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
                    >
                      Propagar Total Anual
                    </button>
                    <button 
                      onClick={() => confirmPeriodicity(false)}
                      className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-[0.98]"
                    >
                      Sumar Meses Actuales
                    </button>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </AnimatePresence>

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
