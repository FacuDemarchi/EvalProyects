/**
 * OBJETIVO: Gestionar el estado global de la aplicación y la lógica de negocio.
 * QUÉ HACE: Centraliza el estado de las categorías, ítems y configuración. Calcula valores derivados (totales, impuestos, flujos) y KPIs en tiempo real. Maneja transiciones de periodicidad.
 * RETORNA: El estado actual, los resultados calculados y funciones para manipular los datos.
 */

import { useState, useMemo, useEffect } from 'react';
import type { Category, FinancialConfig, Item, ProjectState, FinancialResults, AmortizationSystem } from '../types/finance';
import { calculateFullResults } from '../utils/finance';

const STORAGE_KEY = 'evalpro_project_state';

const INITIAL_CATEGORIES: Category[] = [
  { id: 'ingresos', label: 'Ingresos', helpId: 'help_ingresos', items: [{ id: '1', label: '', values: new Array(6).fill(0) }] },
  { id: 'costos_var', label: 'Costos variables', helpId: 'help_costos_var', items: [{ id: '1', label: '', values: new Array(6).fill(0) }] },
  { id: 'costos_fijos', label: 'Costos fijos', helpId: 'help_costos_fijos', items: [{ id: '1', label: '', values: new Array(6).fill(0) }] },
  { id: 'capex', label: 'CAPEX / Inversión', helpId: 'help_capex', items: [{ id: '1', label: '', values: new Array(6).fill(0) }] },
  { id: 'delta_ct', label: 'Capital de trabajo', helpId: 'help_delta_ct', items: [{ id: '1', label: '', values: new Array(6).fill(0) }] },
];

const INITIAL_CONFIG: FinancialConfig = {
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
              const newValues = new Array(updatedConfig.horizon + 1).fill(0);
              const lastValue = item.values.length > 0 ? item.values[item.values.length - 1] : 0;
              
              newValues.forEach((_, i) => {
                if (i < item.values.length) {
                  newValues[i] = item.values[i];
                } else {
                  // Si estamos expandiendo, propagamos el último valor conocido para Ingresos y Costos
                  // Para CAPEX y Capital de Trabajo (delta_ct), mantenemos en 0 por defecto
                  if (['ingresos', 'costos_var', 'costos_fijos'].includes(cat.id)) {
                    newValues[i] = lastValue;
                  } else {
                    newValues[i] = 0;
                  }
                }
              });
              return { ...item, values: newValues };
            })
          }))
        };
      }
      
      return { ...prev, config: updatedConfig };
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
    type: 'fixed' | 'proportional' | 'none'
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
                // Si type === 'none', no hacemos nada más, solo se actualiza el índice actual
                
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
    
    let bestVae = -Infinity;
    let bestConfig = { 
      amount: config.debt.amount, 
      equity: config.debt.equity, 
      system: config.debt.system,
      horizon: config.horizon
    };

    // Probamos horizontes de 3 a 15 años
    const minH = 3;
    const maxH = 15;
    const stepH = 1;

    for (let h = minH; h <= maxH; h += stepH) {
      // Simular propagación de valores para el horizonte h
      const tempCategories = categories.map(cat => ({
        ...cat,
        items: cat.items.map(item => {
          const newValues = new Array(h + 1).fill(0);
          const lastValue = item.values.length > 0 ? item.values[item.values.length - 1] : 0;
          newValues.forEach((_, i) => {
            if (i < item.values.length) {
              newValues[i] = item.values[i];
            } else {
              if (['ingresos', 'costos_var', 'costos_fijos'].includes(cat.id)) {
                newValues[i] = lastValue;
              } else {
                newValues[i] = 0;
              }
            }
          });
          return { ...item, values: newValues };
        })
      }));

      // Probar diferentes niveles de deuda (0% a 100%)
      for (let debtRatio = 0; debtRatio <= 1.0; debtRatio += 0.05) {
        const currentDebtAmount = Math.round(totalV * debtRatio);
        const currentEquityAmount = totalV - currentDebtAmount;

        for (const system of systems) {
          const testConfig: FinancialConfig = {
            ...config,
            horizon: h,
            debt: {
              ...config.debt,
              enabled: currentDebtAmount > 0,
              amount: currentDebtAmount,
              equity: currentEquityAmount,
              system: system,
            }
          };

          const testResults = calculateFullResults(testConfig, tempCategories);
          
          // RESTRICCIÓN DE LIQUIDEZ: FCFE no debe ser negativo en los años de operación
          const isSustainable = testResults.fcfe.slice(1).every(val => val >= -0.01);

          if (isSustainable && testResults.kpis.vae > bestVae) {
            bestVae = testResults.kpis.vae;
            bestConfig = { 
              amount: currentDebtAmount, 
              equity: currentEquityAmount, 
              system: system,
              horizon: h
            };
          }
        }
      }
    }

    updateConfig({
      horizon: bestConfig.horizon,
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
    optimizeCapitalStructure,
    loadDemoData: () => {
      const horizon = 10;
      const numPeriods = horizon + 1;
      const baseSales = 1000000;
      const growth = 1.07;
      const taxRate = 35;
      
      const ingresos = new Array(numPeriods).fill(0).map((_, i) => {
        if (i === 0) return 0; // Año 0 no hay ventas operativas
        let yearIndex = i - 1;
        let val = baseSales * Math.pow(growth, yearIndex);
        if (i === 5) val += 500000; // Venta máquina 1 (Fin Año 5) - Más agresivo
        if (i === 10) val += 1500000; // Valor desecho máquina 2 (Fin Año 10) - Recuperación total
        return Math.round(val);
      });

      const costosVar = ingresos.map((_, i) => {
        if (i === 0) return 0;
        let yearIndex = i - 1;
        let baseIng = baseSales * Math.pow(growth, yearIndex);
        return -Math.round(baseIng * 0.3); // Bajamos costo variable al 30%
      });

      const costosFijos = new Array(numPeriods).fill(0).map((_, i) => i === 0 ? 0 : -100000); // Bajamos fijos a 100k
      
      const capex = new Array(numPeriods).fill(0);
      capex[0] = -1000000; // Bajamos inversión inicial a 1M
      capex[5] = -1000000; // Reinversión 1M

      const deltaCt = new Array(numPeriods).fill(0);
      deltaCt[0] = -100000; // Inversión inicial CT
      // Incrementos anuales mínimos
      for (let i = 1; i < numPeriods - 1; i++) {
        deltaCt[i] = -2000; 
      }
      // Recuperación en año 10
      deltaCt[10] = 100000 + (2000 * 9);

      const newCategories: Category[] = [
        { id: 'ingresos', label: 'Ingresos', helpId: 'help_ingresos', items: [{ id: '1', label: 'Ventas y Activos', values: ingresos }] },
        { id: 'costos_var', label: 'Costos variables', helpId: 'help_costos_var', items: [{ id: '1', label: '40% s/Ventas', values: costosVar }] },
        { id: 'costos_fijos', label: 'Costos fijos', helpId: 'help_costos_fijos', items: [{ id: '1', label: 'Mantenimiento', values: costosFijos }] },
        { id: 'capex', label: 'CAPEX / Inversión', helpId: 'help_capex', items: [{ id: '1', label: 'Maquinaria', values: capex }] },
        { id: 'delta_ct', label: 'Capital de trabajo', helpId: 'help_delta_ct', items: [{ id: '1', label: 'Operativo', values: deltaCt }] },
      ];

      setState({
        config: { ...INITIAL_CONFIG, horizon, taxRate, ke: 15 },
        categories: newCategories
      });
    },
  };
};

