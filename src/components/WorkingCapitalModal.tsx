/**
 * OBJETIVO: Advertir al usuario que el Capital de Trabajo en el flujo de caja es incremental.
 * QUÉ HACE: Explica que no debe re-ingresar el monto total si solo quiere ajustar la inversión existente.
 * RETORNA: Un modal de advertencia con opciones para confirmar o corregir el valor.
 */

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkingCapitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  newValue: number;
}

export const WorkingCapitalModal: React.FC<WorkingCapitalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  newValue,
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
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                      <AlertTriangle size={24} />
                    </div>
                    <Dialog.Title className="text-xl font-black text-slate-900 tracking-tight">
                      Aviso Importante
                    </Dialog.Title>
                  </div>
                  <Dialog.Close className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
                    <X size={20} />
                  </Dialog.Close>
                </div>

                <div className="space-y-4 mb-8">
                  <p className="text-slate-600 font-medium leading-relaxed text-sm">
                    {newValue > 0 
                      ? <>Estás <span className="text-emerald-600 font-bold">recuperando ${newValue.toLocaleString()}</span> del capital de trabajo.</>
                      : <>Estás <span className="text-amber-600 font-bold">invirtiendo ${Math.abs(newValue).toLocaleString()}</span> adicionales en capital de trabajo.</>
                    }
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                    <Info className="text-blue-500 shrink-0" size={20} />
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                      {newValue > 0 
                        ? 'Al ingresar un valor positivo, el sistema asume que estás liberando capital de trabajo para este período.'
                        : 'En el flujo de caja, el **Capital de Trabajo** debe reflejar solo la variación (delta). Si ingresas el monto total de nuevo, el sistema entenderá que estás invirtiendo esa cantidad adicional.'
                      }
                    </p>
                  </div>

                  <p className="text-slate-500 text-xs text-center italic">
                    ¿Deseas confirmar este movimiento o prefieres corregirlo?
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={onConfirm}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98]"
                  >
                    {newValue > 0 ? 'Confirmar Recuperación' : 'Confirmar Inversión Adicional'}
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-[0.98]"
                  >
                    Volver y Corregir
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
