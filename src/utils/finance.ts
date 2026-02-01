/**
 * OBJETIVO: Implementar las funciones de cálculo financiero (Motor).
 * QUÉ HACE: Realiza cálculos de VAN, TIR, PRI, cronogramas de amortización de deuda y WACC.
 * RETORNA: Valores numéricos y estructuras de datos (como el cronograma) para ser usados en la UI.
 */

import type { Category, DebtParams, DebtScheduleEntry, FinancialConfig, FinancialResults } from '../types/finance';

/**
 * Calcula el VAN (NPV - Net Present Value)
 */
export const calculateNPV = (rate: number, cashFlows: number[]): number => {
  return cashFlows.reduce((acc, val, i) => acc + val / Math.pow(1 + rate, i), 0);
};

/**
 * Calcula la TIR (IRR - Internal Rate of Return) usando el método de bisección
 */
export const calculateIRR = (cashFlows: number[]): number => {
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

  if (V === 0) return Ke;

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

  // Calcular VAE (Valor Anual Equivalente)
  // Fórmula: VAN * [ i / (1 - (1+i)^-n) ]
  let vae = 0;
  if (discountRate > 0) {
    vae = van * (discountRate / (1 - Math.pow(1 + discountRate, -cashFlows.length + 1)));
  } else {
    vae = van / (cashFlows.length - 1);
  }

  return { van, tir, pri, bc, pi, ivan, vae };
};

/**
 * Ejecuta el cálculo completo de flujos y KPIs (Motor de simulación)
 */
export const calculateFullResults = (config: FinancialConfig, categories: Category[]): FinancialResults => {
  const horizon = config.horizon;
  const numPeriods = horizon + 1;
  
  const getTotals = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    const totals = new Array(numPeriods).fill(0);
    cat?.items.forEach(item => {
      item.values.forEach((val, i) => {
        if (i < numPeriods) totals[i] += val;
      });
    });
    return totals;
  };

  const ingresos = getTotals('ingresos');
  const costosVar = getTotals('costos_var');
  const costosFijos = getTotals('costos_fijos');
  const capex = getTotals('capex');
  const deltaCt = getTotals('delta_ct');

  // EBITDA = Ingresos - ABS(Costos Variables) - ABS(Costos Fijos)
  const ebitda = ingresos.map((ing, i) => ing - Math.abs(costosVar[i]) - Math.abs(costosFijos[i]));
  const ebit = [...ebitda];

  // Preparar parámetros de deuda
  const adjustedDebtParams = {
    ...config.debt,
    term: config.debt.term,
    annualRate: config.debt.annualRate
  };

  const debtSchedule = config.debt.enabled ? generateDebtSchedule(adjustedDebtParams) : [];
  const interest = new Array(numPeriods).fill(0);
  const principal = new Array(numPeriods).fill(0);

  if (config.debt.enabled) {
    debtSchedule.forEach(entry => {
      if (entry.period < numPeriods) {
        interest[entry.period] = entry.interest;
        principal[entry.period] = entry.principal;
      }
    });
  }

  const taxes = ebit.map((eb, i) => {
    // Los intereses reducen la base imponible (Escudo Fiscal)
    const base = config.evalMode === 'project' ? eb : eb - Math.abs(interest[i]);
    return Math.max(0, base) * (config.taxRate / 100);
  });

  // FCFF (Flujo Proyecto) = EBITDA - Impuestos - ABS(CAPEX) + Δ Capital de Trabajo
  // Nota: Δ Capital de Trabajo es positivo si es recuperación y negativo si es inversión
  const fcff = ebit.map((eb, i) => eb - Math.max(0, taxes[i]) - Math.abs(capex[i]) + deltaCt[i]);

  // FCFE (Flujo Inversionista) = FCFF + Desembolso Deuda - Intereses - Principal
  const fcfe = fcff.map((f, i) => {
    let flow = f;
    if (config.debt.enabled) {
      if (i === 0) {
        // En el periodo 0, el accionista pone menos plata porque entra el préstamo
        flow += config.debt.amount;
      }
      flow -= (Math.abs(interest[i]) + Math.abs(principal[i]));
    }
    return flow;
  });

  const activeCashFlow = config.evalMode === 'project' ? fcff : fcfe;
  const wacc = calculateWACC(config);
  
  const discountRate = config.evalMode === 'project' ? wacc : config.ke / 100;
  
  const totalInvestment = Math.abs(capex.reduce((a, b) => a + b, 0) + deltaCt.reduce((a, b) => a + b, 0));
  const kpis = calculateKPIs(activeCashFlow, discountRate);

  return {
    ebitda,
    ebit,
    taxes,
    interest,
    principal,
    fcff,
    fcfe,
    wacc,
    totalInvestment,
    kpis,
  };
};

