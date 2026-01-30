# Simplificación de la Activación de Deuda

## Objetivo
Eliminar el interruptor manual de "Activar Deuda" y automatizar su activación basada en el monto ingresado por el usuario, mejorando la fluidez de la interfaz.

## Pasos de Implementación

### 1. Modificación de ConfigPanel.tsx
- **Eliminación del Switch**: Se quitará el componente `Switch.Root` y su etiqueta "Activar Deuda".
- **Visibilidad Permanente**: Los campos de financiamiento (Monto, Equity, Sistema de Amortización, Plazo, Tasa) se mostrarán siempre, eliminando el renderizado condicional `{config.debt.enabled && ...}`.
- **Lógica de Auto-activación**: 
    - Al actualizar el campo **Monto (D)**, si el valor es mayor a 0, se establecerá automáticamente `debt.enabled: true`.
    - Si el usuario vuelve a poner 0 en el monto, se establecerá `debt.enabled: false`.
- **Estética**: Se ajustarán los espacios y márgenes para que la sección de financiamiento se vea integrada de forma natural sin el interruptor.

### 2. Verificación
- Confirmar que al escribir un monto de deuda, los cálculos financieros (intereses, principal, escudos fiscales) se activen automáticamente en la tabla y KPIs.
- Asegurar que si el monto es 0, la deuda se considere desactivada para los cálculos del flujo de caja.
