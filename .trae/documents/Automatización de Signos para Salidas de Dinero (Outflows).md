# Implementación de Signos Financieros Automáticos (Outflows)

## Objetivo
Hacer que la aplicación sea más intuitiva y profesional convirtiendo automáticamente los costos e inversiones en valores negativos, facilitando la lectura del flujo de caja.

## Pasos de Implementación

### 1. Actualización de Lógica en useFinance.ts
- Cambiar las fórmulas de `ebitda` y `fcff` para que utilicen sumas en lugar de restas para las categorías de costos e inversión.
- Asegurar que los cálculos de impuestos y deuda sigan siendo consistentes con este nuevo esquema.

### 2. Automatización en SpreadsheetTable.tsx
- **Captura de Entrada**: Al ingresar un valor en Costos Variables, Costos Fijos o CAPEX, si el número es > 0, convertirlo automáticamente a negativo.
- **Estilo Visual**: Aplicar la clase `text-red-500` a cualquier celda cuyo valor sea menor a 0.
- **Feedback de Edición**: Asegurar que al editar una celda negativa, el usuario vea el signo `-` para que sepa que está manipulando una salida de dinero.

### 3. Ajuste de Categorías Iniciales
- Modificar los valores iniciales de la aplicación (si los hubiera) para que nazcan con signo negativo en las categorías correspondientes.

## Verificación
- Ingresar "1000" en Ingresos y "500" en Costos; el EBITDA resultante debe ser "500".
- Verificar que el VAN y la TIR se calculen correctamente con la inversión inicial (CAPEX) siendo negativa.
