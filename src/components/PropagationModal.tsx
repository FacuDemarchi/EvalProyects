/**
 * OBJETIVO: Permitir al usuario decidir cómo propagar un cambio de valor hacia adelante.
 * QUÉ HACE: Muestra dos opciones: propagación fija (mismo valor) o proporcional (mismo % de cambio).
 * RETORNA: Un modal de decisión con feedback del cambio detectado.
 */

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ArrowRight, TrendingUp, Equal, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PropagationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: 'fixed' | 'proportional' | 'none') => void;
  oldValue: number;
  newValue: number;
  changePercent: number;
}

export const PropagationModal: React.FC<PropagationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  oldValue,
  newValue,
  changePercent,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
                    Propagar Cambio
                  </Dialog.Title>
                  <Dialog.Close className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
                    <X size={20} />
                  </Dialog.Close>
                </div>

                {/* RESUMEN DEL CAMBIO */}
                <div className="bg-slate-50 rounded-2xl p-4 mb-8 flex items-center justify-center gap-6 border border-slate-100">
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Anterior</span>
                    <span className="text-sm font-bold text-slate-600">${oldValue.toLocaleString()}</span>
                  </div>
                  <ArrowRight className="text-slate-300" size={20} />
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nuevo</span>
                    <span className="text-sm font-bold text-blue-600">${newValue.toLocaleString()}</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Variación</span>
                    <span className={changePercent >= 0 ? "text-emerald-600 text-sm font-bold" : "text-red-600 text-sm font-bold"}>
                      {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <p className="text-slate-500 font-medium mb-8 leading-relaxed text-sm text-center">
                  ¿Cómo deseas aplicar este cambio a los períodos siguientes?
                </p>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => onConfirm('none')}
                    className="group w-full p-4 bg-white border-2 border-slate-100 rounded-2xl flex items-center gap-4 hover:border-slate-400 hover:bg-slate-50 transition-all text-left"
                  >
                    <div className="p-3 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                      <MousePointer2 size={20} />
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-800 block">Solo este período</span>
                      <span className="text-[11px] font-medium text-slate-400">No afectar a los períodos siguientes</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => onConfirm('fixed')}
                    className="group w-full p-4 bg-white border-2 border-slate-100 rounded-2xl flex items-center gap-4 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left"
                  >
                    <div className="p-3 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <Equal size={20} />
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-800 block">Propagación Fija</span>
                      <span className="text-[11px] font-medium text-slate-400">Repetir el valor ${newValue.toLocaleString()} en adelante</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => onConfirm('proportional')}
                    className="group w-full p-4 bg-white border-2 border-slate-100 rounded-2xl flex items-center gap-4 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left"
                  >
                    <div className="p-3 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-800 block">Propagación Proporcional</span>
                      <span className="text-[11px] font-medium text-slate-400">Aplicar el {changePercent.toFixed(1)}% de variación en adelante</span>
                    </div>
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </AnimatePresence>
  );
};
