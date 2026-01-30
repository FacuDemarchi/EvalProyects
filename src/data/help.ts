export const HELP_CONTENT: Record<string, { title: string; description: string }> = {
  help_ingresos: {
    title: 'Ingresos',
    description: 'Representa todas las entradas de dinero derivadas de la actividad principal del proyecto, como ventas de productos o servicios.',
  },
  help_costos_var: {
    title: 'Costos Variables',
    description: 'Costos que cambian en proporción directa al volumen de producción o ventas (ej: materias primas, comisiones).',
  },
  help_costos_fijos: {
    title: 'Costos Fijos',
    description: 'Gastos que permanecen constantes independientemente del nivel de producción (ej: alquiler, salarios administrativos).',
  },
  help_capex: {
    title: 'CAPEX / Inversión',
    description: 'Gastos de capital destinados a adquirir, mantener o mejorar activos fijos como maquinaria, edificios o tecnología.',
  },
  help_delta_ct: {
    title: 'Δ Capital de Trabajo',
    description: 'Variación en los activos y pasivos corrientes necesarios para la operación diaria (Inventarios + CxC - CxP).',
  },
  van: {
    title: 'VAN (Valor Actual Neto)',
    description: 'Es el valor de los flujos de caja proyectados, descontados a la tasa actual, menos la inversión inicial. Si es > 0, el proyecto es rentable.',
  },
  tir: {
    title: 'TIR (Tasa Interna de Retorno)',
    description: 'Es la tasa de descuento que hace que el VAN sea igual a cero. Representa la rentabilidad intrínseca del proyecto.',
  },
  pri: {
    title: 'PRI (Periodo de Recuperación)',
    description: 'Indica el tiempo necesario para que el inversionista recupere su inversión inicial a través de los flujos de caja.',
  },
  bc: {
    title: 'B/C (Relación Beneficio/Costo)',
    description: 'Muestra cuántos pesos se obtienen por cada peso invertido, en términos de valor presente.',
  },
  periodicidad: {
    title: 'Periodicidad',
    description: 'Permite alternar entre una vista mensual (detalle fino) y anual (resumen estratégico). Los datos se convierten automáticamente mediante suma o división.',
  },
  ke: {
    title: 'Ke / TMAR',
    description: 'Tasa Mínima Aceptable de Rendimiento. Es la rentabilidad mínima que el inversionista exige para llevar a cabo el proyecto.',
  },
  equity: {
    title: 'Equity (Capital Propio)',
    description: 'Es el porcentaje de la inversión total (CAPEX + Capital de Trabajo) que es aportado por los accionistas o dueños. El resto se financia mediante deuda externa.',
  },
};
