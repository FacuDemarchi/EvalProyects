/**
 * OBJETIVO: Gestionar el estado global de la aplicación y la lógica de negocio.
 * QUÉ HACE: Centraliza el estado de las categorías, ítems y configuración. Calcula valores derivados (totales, impuestos, flujos) y KPIs en tiempo real. Maneja transiciones de periodicidad.
 * RETORNA: El estado actual, los resultados calculados y funciones para manipular los datos.
 */

import { useState, useMemo, useEffect } from 'react';
import type { Category, FinancialConfig, Item, ProjectState, FinancialResults, Periodicity, AmortizationSystem } from '../types/finance';
import { calculateFullResults } from '../utils/finance';

const STORAGE_KEY = 'evalpro_project_state';

const INITIAL_CATEGORIES: Category[] = [
  { id: 'ingresos', label: 'Ingresos', helpId: 'help_ingresos', items: [{ id: '1', label: '', values: [0, 0, 0, 0, 0] }] },
  { id: 'costos_var', label: 'Costos variables', helpId: 'help_costos_var', items: [{ id: '1', label: '', values: [0, 0, 0, 0, 0] }] },
  { id: 'costos_fijos', label: 'Costos fijos', helpId: 'help_costos_fijos', items: [{ id: '1', label: '', values: [0, 0, 0, 0, 0] }] },
  { id: 'capex', label: 'CAPEX / Inversión', helpId: 'help_capex', items: [{ id: '1', label: '', values: [0, 0, 0, 0, 0] }] },
  { id: 'delta_ct', label: 'Capital de trabajo', helpId: 'help_delta_ct', items: [{ id: '1', label: '', values: [0, 0, 0, 0, 0] }] },
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
  const [state, setState] = useState<ProjectState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading state from localStorage', e);
      }
    }
    return {
      categories: INITIAL_CATEGORIES,
      config: INITIAL_CONFIG,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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

  const propagateItemValue = (
    categoryId: string, 
    itemId: string, 
    index: number, 
    newValue: number, 
    type: 'fixed' | 'proportional'
  ) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            items: cat.items.map(item => {
              if (item.id === itemId) {
                const newValues = [...item.values];
                newValues[index] = newValue;

                if (type === 'fixed') {
                  // Propagar el mismo valor hacia adelante
                  for (let i = index + 1; i < newValues.length; i++) {
                    newValues[i] = newValue;
                  }
                } else if (type === 'proportional') {
                  // Propagar el mismo % de cambio hacia adelante
                  const prevValue = index > 0 ? item.values[index - 1] : 0;
                  if (prevValue !== 0) {
                    const ratio = newValue / prevValue;
                    for (let i = index + 1; i < newValues.length; i++) {
                      newValues[i] = newValues[i - 1] * ratio;
                    }
                  } else {
                    // Si el previo es 0, hacemos fija por defecto
                    for (let i = index + 1; i < newValues.length; i++) {
                      newValues[i] = newValue;
                    }
                  }
                }
                return { ...item, values: newValues };
              }
              return item;
            }),
          };
        }
        return cat;
      }),
    }));
  };

  const results = useMemo((): FinancialResults => {
    return calculateFullResults(state.config, state.categories);
  }, [state]);

  const optimizeCapitalStructure = () => {
    const { config, categories } = state;
    const totalV = results.totalInvestment;
    const systems: AmortizationSystem[] = ['french', 'german', 'bullet'];
    
    let bestVan = -Infinity;
    let bestConfig = { 
      amount: config.debt.amount, 
      equity: config.debt.equity, 
      system: config.debt.system 
    };

    // Probar diferentes niveles de deuda (0% a 95% para dejar algo de equity)
    // Usamos pasos del 5% para encontrar un balance razonable
    for (let debtRatio = 0; debtRatio <= 0.95; debtRatio += 0.05) {
      const currentDebtAmount = totalV * debtRatio;
      const currentEquityAmount = totalV - currentDebtAmount;

      for (const system of systems) {
        const testConfig: FinancialConfig = {
          ...config,
          debt: {
            ...config.debt,
            enabled: currentDebtAmount > 0,
            amount: currentDebtAmount,
            equity: currentEquityAmount,
            system: system,
          }
        };

        const testResults = calculateFullResults(testConfig, categories);
        if (testResults.kpis.van > bestVan) {
          bestVan = testResults.kpis.van;
          bestConfig = { 
            amount: currentDebtAmount, 
            equity: currentEquityAmount, 
            system: system 
          };
        }
      }
    }

    updateConfig({
      debt: {
        ...config.debt,
        enabled: bestConfig.amount > 0,
        amount: bestConfig.amount,
        equity: bestConfig.equity,
        system: bestConfig.system as AmortizationSystem,
      }
    });
  };

  return {
    state,
    results,
    addItem,
    updateItem,
    deleteItem,
    propagateItemValue,
    updateConfig,
    togglePeriodicity,
    optimizeCapitalStructure,
  };
};

