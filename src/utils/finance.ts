/**
 * OBJETIVO: Implementar las funciones de cálculo financiero (Motor).
 * QUÉ HACE: Realiza cálculos de VAN, TIR, PRI, cronogramas de amortización de deuda y WACC.
 * RETORNA: Valores numéricos y estructuras de datos (como el cronograma) para ser usados en la UI.
 */

import type { DebtParams, DebtScheduleEntry, FinancialConfig } from '../types/finance';

/**
 * Calcula el VAN (NPV - Net Present Value)
 */
export const calculateNPV = (rate: number, cashFlows: number[]): number => {
  return cashFlows.reduce((acc, val, i) => acc + val / Math.pow(1 + rate, i), 0);
};

/**
 * Calcula la TIR (IRR - Internal Rate of Return) usando el método de bisección
 */
export const calculateIRR = (cashFlows: number[], guess = 0.1): number => {
  const maxIterations = 100;
  const precision = 0.00001;
  let low = -0.9999;
  let high = 1.0;

  // Encontrar un límite superior si el guess no es suficiente
  while (calculateNPV(high, cashFlows) > 0 && high < 100) {
    high *= 2;
  }

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const npv = calculateNPV(mid, cashFlows);

    if (Math.abs(npv) < precision) return mid;

    if (npv > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return (low + high) / 2;
};

/**
 * Calcula el PRI (Payback Period / Periodo de Recuperación de Inversión)
 */
export const calculatePayback = (cashFlows: number[]): number => {
  let cumulative = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    const prevCumulative = cumulative;
    cumulative += cashFlows[i];
    if (cumulative >= 0 && i > 0) {
      if (prevCumulative < 0) {
        return i - 1 + Math.abs(prevCumulative) / cashFlows[i];
      }
      return i;
    }
  }
  return Infinity;
};

/**
 * Genera el cronograma de deuda (Amortización)
 */
export const generateDebtSchedule = (params: DebtParams): DebtScheduleEntry[] => {
  const { amount, term, annualRate, system } = params;
  const rate = annualRate / 100;
  const schedule: DebtScheduleEntry[] = [];
  let remainingBalance = amount;

  if (system === 'french') {
    const cuota = (amount * rate) / (1 - Math.pow(1 + rate, -term));
    for (let i = 1; i <= term; i++) {
      const interest = remainingBalance * rate;
      const principal = cuota - interest;
      remainingBalance -= principal;
      schedule.push({
        period: i,
        interest,
        principal,
        totalPayment: cuota,
        remainingBalance: Math.max(0, remainingBalance),
      });
    }
  } else if (system === 'german') {
    const principalConst = amount / term;
    for (let i = 1; i <= term; i++) {
      const interest = remainingBalance * rate;
      remainingBalance -= principalConst;
      schedule.push({
        period: i,
        interest,
        principal: principalConst,
        totalPayment: interest + principalConst,
        remainingBalance: Math.max(0, remainingBalance),
      });
    }
  } else if (system === 'bullet') {
    for (let i = 1; i < term; i++) {
      const interest = remainingBalance * rate;
      schedule.push({
        period: i,
        interest,
        principal: 0,
        totalPayment: interest,
        remainingBalance,
      });
    }
    const interest = remainingBalance * rate;
    schedule.push({
      period: term,
      interest,
      principal: remainingBalance,
      totalPayment: interest + remainingBalance,
      remainingBalance: 0,
    });
  }

  return schedule;
};

/**
 * Calcula el WACC (Weighted Average Cost of Capital)
 */
export const calculateWACC = (config: FinancialConfig): number => {
  const { ke, taxRate, debt } = config;
  if (!debt.enabled) return ke / 100;

  const D = debt.amount;
  const E = debt.equity;
  const V = D + E;
  const Ke = ke / 100;
  const Kd = debt.annualRate / 100;
  const T = taxRate / 100;

  return Ke * (E / V) + Kd * (1 - T) * (D / V);
};

/**
 * Calcula los KPIs financieros consolidados
 */
export const calculateKPIs = (cashFlows: number[], discountRate: number) => {
  const van = calculateNPV(discountRate, cashFlows);
  const tir = calculateIRR(cashFlows);
  const pri = calculatePayback(cashFlows);
  
  const initialInvestment = Math.abs(cashFlows[0]) || 1;
  const benefits = cashFlows.slice(1).reduce((acc, val, i) => acc + val / Math.pow(1 + discountRate, i + 1), 0);
  
  const bc = benefits / initialInvestment;
  const pi = van / initialInvestment + 1;
  const ivan = van / initialInvestment;

  return { van, tir, pri, bc, pi, ivan };
};
