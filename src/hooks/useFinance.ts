/**
 * OBJETIVO: Gestionar el estado global de la aplicación y la lógica de negocio.
 * QUÉ HACE: Centraliza el estado de las categorías, ítems y configuración. Calcula valores derivados (totales, impuestos, flujos) y KPIs en tiempo real. Maneja transiciones de periodicidad.
 * RETORNA: El estado actual, los resultados calculados y funciones para manipular los datos.
 */

import { useState, useMemo } from 'react';
import type { Category, FinancialConfig, Item, ProjectState, FinancialResults, Periodicity } from '../types/finance';
import { generateDebtSchedule, calculateWACC, calculateKPIs } from '../utils/finance';

const INITIAL_CATEGORIES: Category[] = [
  { id: 'ingresos', label: 'Ingresos', helpId: 'help_ingresos', items: [{ id: '1', label: '', values: [0, 0, 0, 0, 0] }] },
  { id: 'costos_var', label: 'Costos variables', helpId: 'help_costos_var', items: [{ id: '1', label: '', values: [0, 0, 0, 0, 0] }] },
  { id: 'costos_fijos', label: 'Costos fijos', helpId: 'help_costos_fijos', items: [{ id: '1', label: '', values: [0, 0, 0, 0, 0] }] },
  { id: 'capex', label: 'CAPEX / Inversión', helpId: 'help_capex', items: [{ id: '1', label: '', values: [0, 0, 0, 0, 0] }] },
  { id: 'delta_ct', label: 'Δ Capital de trabajo', helpId: 'help_delta_ct', items: [{ id: '1', label: '', values: [0, 0, 0, 0, 0] }] },
];

const INITIAL_CONFIG: FinancialConfig = {
  periodicity: 'yearly',
  horizon: 5,
  ke: 15,
  taxRate: 35,
  debt: {
    enabled: false,
    amount: 100000,
    equity: 50000,
    term: 5,
    annualRate: 10,
    rateType: 'effective',
    capitalization: 'annual',
    system: 'french',
  },
  evalMode: 'project',
};

export const useFinance = () => {
  const [state, setState] = useState<ProjectState>({
    categories: INITIAL_CATEGORIES,
    config: INITIAL_CONFIG,
  });

  const updateConfig = (newConfig: Partial<FinancialConfig>) => {
    setState(prev => {
      const updatedConfig = { ...prev.config, ...newConfig };
      
      // Si cambia el horizonte, ajustar los arrays de valores
      if (newConfig.horizon && newConfig.horizon !== prev.config.horizon) {
        return {
          ...prev,
          config: updatedConfig,
          categories: prev.categories.map(cat => ({
            ...cat,
            items: cat.items.map(item => {
              const newValues = new Array(updatedConfig.horizon).fill(0);
              item.values.forEach((v, i) => {
                if (i < newValues.length) newValues[i] = v;
              });
              return { ...item, values: newValues };
            })
          }))
        };
      }
      
      return { ...prev, config: updatedConfig };
    });
  };

  const togglePeriodicity = (newPeriodicity: Periodicity, propagate: boolean = false) => {
    setState(prev => {
      const oldPeriodicity = prev.config.periodicity;
      if (oldPeriodicity === newPeriodicity) return prev;

      const newHorizon = newPeriodicity === 'monthly' 
        ? prev.config.horizon * 12 
        : Math.ceil(prev.config.horizon / 12);

      const newCategories = prev.categories.map(cat => ({
        ...cat,
        items: cat.items.map(item => {
          let newValues: number[] = [];
          if (newPeriodicity === 'monthly') {
            // Expandir Año -> Meses
            item.values.forEach(yearVal => {
              const monthVal = yearVal / 12;
              newValues.push(...new Array(12).fill(monthVal));
            });
          } else {
            // Colapsar Meses -> Año
            for (let i = 0; i < item.values.length; i += 12) {
              const yearChunk = item.values.slice(i, i + 12);
              const yearSum = yearChunk.reduce((a, b) => a + b, 0);
              newValues.push(yearSum);
            }
            if (propagate && newValues.length > 0) {
              const firstYear = newValues[0];
              newValues = new Array(newHorizon).fill(firstYear);
            }
          }
          return { ...item, values: newValues };
        })
      }));

      return {
        ...prev,
        config: { ...prev.config, periodicity: newPeriodicity, horizon: newHorizon },
        categories: newCategories
      };
    });
  };

  const addItem = (categoryId: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(cat => {
        if (cat.id === categoryId) {
          const newItem: Item = {
            id: Math.random().toString(36).substr(2, 9),
            label: 'Nuevo ítem',
            values: new Array(prev.config.horizon).fill(0),
          };
          return { ...cat, items: [...cat.items, newItem] };
        }
        return cat;
      }),
    }));
  };

  const updateItem = (categoryId: string, itemId: string, updates: Partial<Item>) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.map(item => (item.id === itemId ? { ...item, ...updates } : item)),
          };
        }
        return cat;
      }),
    }));
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(cat => {
        if (cat.id === categoryId && cat.items.length > 1) {
          return { ...cat, items: cat.items.filter(item => item.id !== itemId) };
        }
        return cat;
      }),
    }));
  };

  const results = useMemo((): FinancialResults => {
    const { config, categories } = state;
    const horizon = config.horizon;
    
    const getTotals = (catId: string) => {
      const cat = categories.find(c => c.id === catId);
      const totals = new Array(horizon).fill(0);
      cat?.items.forEach(item => {
        item.values.forEach((val, i) => {
          if (i < horizon) totals[i] += val;
        });
      });
      return totals;
    };

    const ingresos = getTotals('ingresos');
    const costosVar = getTotals('costos_var');
    const costosFijos = getTotals('costos_fijos');
    const capex = getTotals('capex');
    const deltaCt = getTotals('delta_ct');

    const ebitda = ingresos.map((ing, i) => ing - costosVar[i] - costosFijos[i]);
    const ebit = [...ebitda];

    const debtSchedule = config.debt.enabled ? generateDebtSchedule(config.debt) : [];
    const interest = new Array(horizon).fill(0);
    const principal = new Array(horizon).fill(0);

    if (config.debt.enabled) {
      debtSchedule.forEach(entry => {
        if (entry.period <= horizon) {
          interest[entry.period - 1] = entry.interest;
          principal[entry.period - 1] = entry.principal;
        }
      });
    }

    const taxes = ebit.map((eb, i) => {
      const base = config.evalMode === 'project' ? eb : eb - interest[i];
      return Math.max(0, base) * (config.taxRate / 100);
    });

    const fcff = ebit.map((eb, i) => eb - taxes[i] - capex[i] - deltaCt[i]);
    const fcfe = fcff.map((f, i) => f - interest[i] - principal[i]);

    const activeCashFlow = config.evalMode === 'project' ? fcff : fcfe;
    const wacc = calculateWACC(config);
    const discountRate = config.evalMode === 'project' ? wacc : config.ke / 100;

    const totalInvestment = capex.reduce((a, b) => a + b, 0) + deltaCt.reduce((a, b) => a + b, 0);

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
  }, [state]);

  return {
    state,
    results,
    addItem,
    updateItem,
    deleteItem,
    updateConfig,
    togglePeriodicity,
  };
};
