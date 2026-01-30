/**
 * OBJETIVO: Proveer ayuda contextual a través de un modal.
 * QUÉ HACE: Muestra una explicación del concepto y un placeholder de video tutorial con un diseño premium.
 * RETORNA: Un modal (Dialog) con información educativa y visualmente atractiva.
 */

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, PlayCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HelpModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onOpenChange, title, description }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-900/40 backdrop-blur-md fixed inset-0 z-[100]" 
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-xl bg-white rounded-[2rem] shadow-2xl p-8 z-[101] outline-none overflow-hidden"
              >
                {/* Decoración de fondo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-1">Centro de Ayuda</span>
                        <Dialog.Title className="text-2xl font-black text-slate-900 tracking-tight">
                          {title}
                        </Dialog.Title>
                      </div>
                    </div>
                    <Dialog.Close className="p-2.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all outline-none">
                      <X size={20} />
                    </Dialog.Close>
                  </div>

                  <div className="space-y-8">
                    <div className="text-slate-600 leading-relaxed text-lg font-medium">
                      {description}
                    </div>

                    <div className="relative group cursor-pointer">
                      <div className="absolute inset-0 bg-blue-600 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                      <div className="bg-slate-50 rounded-3xl aspect-video flex flex-col items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-blue-300 transition-all duration-500 overflow-hidden">
                        <div className="bg-white p-4 rounded-full shadow-xl group-hover:scale-110 transition-transform duration-500">
                          <PlayCircle size={48} className="text-blue-600" />
                        </div>
                        <p className="mt-4 text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Ver Video Tutorial</p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Dialog.Close asChild>
                        <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:shadow-slate-300 active:scale-95">
                          Entendido
                        </button>
                      </Dialog.Close>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};
