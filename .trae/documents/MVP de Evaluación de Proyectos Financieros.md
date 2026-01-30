# Plan de Implementación: MVP "Excel con Guardrails" (Vite + pnpm)

Este plan detalla la construcción de un simulador financiero robusto con categorías fijas y desglose flexible, optimizado para la toma de decisiones.

## 1. Base Técnica y Estructura
- **Framework**: React + TypeScript + Vite (gestión con **pnpm**).
- **Estilos**: **Tailwind CSS** para una UI tipo planilla profesional.
- **Animaciones**: **Framer Motion** para transiciones suaves (especialmente en el cambio Meses↔Años).
- **Iconografía**: **Lucide React** para iconos de ayuda `[?]`, eliminar, etc.
- **Componentes UI**: **Radix UI** o **Headless UI** para Accordions (Configuración) y Modals (Ayuda).

## 2. Motor Financiero (`src/utils/finance.ts`)
- **KPIs**: 
  - **VAN (NPV)**: Suma de flujos descontados.
  - **TIR (IRR)**: Implementación mediante bisección para garantizar convergencia.
  - **PRI (Payback)**: Tiempo de recuperación simple.
  - **B/C, PI, IVAN**: Ratios de rentabilidad sobre inversión.
- **Deuda**: Generador de cronogramas para sistemas Francés, Alemán y Bullet.
- **WACC**: Cálculo dinámico: $Ke \cdot \frac{E}{V} + Kd \cdot (1-T) \cdot \frac{D}{V}$.

## 3. Interfaz de Usuario (Componentes)
- **`SpreadsheetTable`**:
  - **Categorías Fijas**: Ingresos, Costos Var/Fijos, CAPEX, ΔCT.
  - **Desglose Flexible**: Botón "+" para añadir ítems con foco automático y etiqueta "Nuevo ítem".
  - **Guardrails**: Botón eliminar visible solo si hay >1 ítem; filas de totales read-only.
  - **Inyección de Deuda**: Filas automáticas de Intereses y Principal solo si la deuda está activa.
- **`ConfigPanel` (Accordions)**:
  - **Básico**: Toggle Meses/Años, horizonte y Ke.
  - **Taxes**: Configuración de tasa impositiva.
  - **Avanzado (Deuda)**: Parámetros D, E, plazo y tasa. Oculto por defecto.
- **`ResultsPanel`**:
  - Visualización de KPIs con iconos `[?]`.
  - Switch **Proyecto (FCFF + WACC)** vs **Equity (FCFE + Ke)** con recalculo instantáneo.
- **`HelpModal`**: Sistema de ayuda contextual para cada etiqueta `[?]`.

## 4. Lógica de Periodicidad (Meses ↔ Años)
- **Meses → Años**:
  - Colapso de 12 columnas en 1 (suma).
  - Modal de confirmación: "¿Propagar total anual a años posteriores?".
- **Años → Meses**:
  - Expansión de 1 a 12 columnas (división por 12).
  - Recalculo automático de totales y KPIs.

## 5. Gestión de Estado (`src/hooks/useFinance.ts`)
- Estado centralizado que maneja la configuración, categorías e ítems.
- Derivación de datos (computed values) para EBITDA, EBIT, Impuestos y Flujo Neto.

¿Deseas que comience con la inicialización del proyecto y la estructura de archivos?