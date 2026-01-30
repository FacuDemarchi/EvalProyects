# Implementación de Slider de Porcentaje para Equity

## Objetivo
Transformar la entrada de capital propio (Equity) de un campo numérico absoluto a un slider de porcentaje intuitivo, permitiendo al usuario definir la estructura de capital (Deuda vs. Capital Propio) de forma visual.

## Pasos de Implementación

### 1. Preparación de Dependencias
- Instalar `@radix-ui/react-slider` para garantizar un componente de slider accesible, robusto y consistente con el resto de la UI.

### 2. Rediseño de la Sección de Financiamiento en ConfigPanel.tsx
- **Campo de Inversión Total**: Cambiar el input de "Monto (D)" por uno llamado "Inversión Total (V)". Este representará el 100% del capital necesario.
- **Slider de Equity %**: Reemplazar el input de "Equity (E)" por un slider que vaya de 0% a 100%.
- **Lógica de Cálculo**:
    - Al cambiar la **Inversión Total**, se recalcularán automáticamente `debt.amount` y `debt.equity` manteniendo el porcentaje actual.
    - Al mover el **Slider**, se recalcularán `debt.amount` y `debt.equity` basándose en la Inversión Total fija.
- **Visualización en Tiempo Real**: Mostrar debajo del slider los montos calculados en moneda (ej: "Deuda: $80,000" | "Equity: $20,000") para que el usuario siempre tenga la referencia absoluta.

### 3. Actualización de Ayuda
- Modificar la descripción en `help.ts` para explicar que el Equity se define ahora como una proporción de la inversión total.

## Verificación
- Confirmar que al mover el slider al 100%, la deuda (`amount`) sea 0 y el modo de deuda se desactive.
- Verificar que los cálculos de WACC y flujos de caja sigan siendo correctos utilizando los valores derivados del porcentaje.
