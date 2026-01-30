# Sincronización de Inversión con CAPEX y Capital de Trabajo

## Objetivo
Vincular automáticamente la **Inversión Total** del panel de configuración con la suma de los montos ingresados en las categorías de **CAPEX** y **Capital de Trabajo** de la tabla, asegurando que la estructura de financiamiento sea coherente con las necesidades reales del proyecto.

## Pasos de Implementación

### 1. Actualización de useFinance.ts
- Calcular la `totalInvestment` sumando todos los valores de las categorías `capex` y `delta_ct` definidos en la tabla.
- Incluir este valor en el objeto de retorno del hook para que esté disponible en toda la aplicación.

### 2. Modificación de ConfigPanel.tsx
- **Automatización del Valor (V)**: El campo "Inversión Total (V)" dejará de ser un input manual y pasará a ser un valor calculado automáticamente desde la tabla. Se mostrará con un estilo que indique que es un valor derivado (por ejemplo, con un fondo ligeramente distinto o un icono de enlace).
- **Sincronización Dinámica**: 
    - Cada vez que el usuario cambie un valor de CAPEX o Capital de Trabajo en la tabla, la **Inversión Total** se actualizará.
    - Al actualizarse la inversión, el **Monto de Deuda (D)** y el **Aporte Propio (E)** se recalcularán instantáneamente manteniendo el porcentaje de Equity definido en el slider.
- **Feedback Visual**: Añadir una pequeña nota o icono aclarando que la inversión total se deriva de la suma de CAPEX y Capital de Trabajo.

### 3. Verificación
- Cambiar un valor de CAPEX en la tabla y verificar que el valor "Inversión Total" en el panel de configuración cambie proporcionalmente.
- Confirmar que los montos absolutos de Deuda y Equity en el slider se ajusten automáticamente.
- Asegurar que el WACC y los KPIs se actualicen correctamente con la nueva estructura de capital sincronizada.
