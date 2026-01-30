/**
 * OBJETIVO: Definir las interfaces y tipos de datos para el motor financiero.
 * QUÉ HACE: Centraliza la estructura de datos para categorías, ítems, configuración de deuda y resultados.
 * RETORNA: Tipos y constantes utilizados en toda la aplicación para garantizar consistencia.
 */

export type Periodicity = 'monthly' | 'yearly';

export type AmortizationSystem = 'french' | 'german' | 'bullet';

export interface Item {
  id: string;
  label: string;
  values: number[];
}

export interface Category {
  id: string;
  label: string;
  helpId: string;
  items: Item[];
}

export interface DebtParams {
  enabled: boolean;
  amount: number;
  equity: number;
  term: number;
  annualRate: number;
  rateType: 'nominal' | 'effective';
  capitalization: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  system: AmortizationSystem;
}

export interface FinancialConfig {
  periodicity: Periodicity;
  horizon: number; // en años
  ke: number; // porcentaje (TMAR)
  taxRate: number; // porcentaje de impuestos
  debt: DebtParams;
  evalMode: 'project' | 'equity';
}

export interface DebtScheduleEntry {
  period: number;
  interest: number;
  principal: number;
  totalPayment: number;
  remainingBalance: number;
}

export interface FinancialResults {
  ebitda: number[];
  ebit: number[];
  taxes: number[];
  interest: number[];
  principal: number[];
  fcff: number[]; // Flujo de Caja Libre para la Firma (Modo Proyecto)
  fcfe: number[]; // Flujo de Caja Libre para el Accionista (Modo Equity)
  wacc: number;
  totalInvestment: number; // Suma de CAPEX y Δ Capital de Trabajo
  kpis: {
    van: number;
    tir: number;
    pri: number;
    bc: number;
    pi: number;
    ivan: number;
  };
}

export interface ProjectState {
  categories: Category[];
  config: FinancialConfig;
}
