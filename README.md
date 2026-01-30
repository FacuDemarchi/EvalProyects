# EvalPro MVP - Simulador de Evaluación de Proyectos Financieros

EvalPro es una herramienta avanzada de simulación financiera diseñada para evaluar la viabilidad de proyectos de inversión. Ofrece una interfaz intuitiva tipo planilla con "guardrails" para garantizar la integridad de los cálculos financieros, permitiendo a los usuarios modelar escenarios complejos con facilidad.

## 🚀 Características Principales

### 1. Motor Financiero Robusto
*   **KPIs en Tiempo Real**: Cálculo instantáneo de indicadores clave de rendimiento:
    *   **VAN (NPV)**: Valor Actual Neto.
    *   **TIR (IRR)**: Tasa Interna de Retorno (implementada mediante bisección).
    *   **PRI (Payback)**: Periodo de Recuperación de la Inversión.
    *   **Ratios de Rentabilidad**: B/C (Beneficio/Costo), PI (Índice de Rentabilidad) e IVAN.
*   **WACC Dinámico**: Cálculo automático del Costo Promedio Ponderado de Capital basado en la estructura de capital (Equity vs Deuda).

### 2. Gestión de Deuda y Capital
*   **Estructura de Capital**: Control deslizante para ajustar la proporción de Equity y Deuda.
*   **Sistemas de Amortización**: Soporte para sistemas Francés, Alemán y Bullet.
*   **Cronograma Automático**: Generación de flujos de intereses y principal integrados directamente en el flujo de caja.

### 3. Interfaz de Usuario Premium
*   **SpreadsheetTable**: Una tabla dinámica con categorías fijas (Ingresos, Costos, CAPEX, CT) y la posibilidad de añadir ítems personalizados.
*   **Periodicidad Flexible**: Switch para alternar entre vistas mensuales y anuales con lógica de propagación o consolidación de datos.
*   **Panel de Configuración**: Acordeones organizados para ajustar parámetros básicos, impuestos y detalles avanzados de deuda.
*   **Sistema de Ayuda Contextual**: Explicaciones detalladas para cada concepto financiero mediante modales informativos.

### 4. Experiencia de Usuario (UX)
*   **Diseño Responsivo**: Optimizado para diferentes tamaños de pantalla con Tailwind CSS.
*   **Animaciones Fluidas**: Transiciones suaves entre estados y vistas utilizando Framer Motion.
*   **Visualización de Resultados**: Paneles claros que diferencian entre la rentabilidad del Proyecto (FCFF) y del Accionista (FCFE).

## 🛠️ Stack Tecnológico

*   **Framework**: [React 19](https://react.dev/)
*   **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
*   **Bundler**: [Vite](https://vitejs.dev/)
*   **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
*   **Componentes UI**: [Radix UI](https://www.radix-ui.com/)
*   **Iconos**: [Lucide React](https://lucide.dev/)
*   **Animaciones**: [Framer Motion](https://www.framer.com/motion/)

## 📂 Estructura del Proyecto

```text
src/
├── components/     # Componentes de la interfaz (Tabla, Paneles, Modales)
├── data/           # Datos estáticos y contenido de ayuda
├── hooks/          # Lógica de estado y cálculos (useFinance)
├── types/          # Definiciones de tipos TypeScript
├── utils/          # Utilidades y lógica financiera pura
├── App.tsx         # Orquestador principal de la aplicación
└── main.tsx        # Punto de entrada de React
```

## ⚙️ Instalación y Desarrollo

1.  **Clonar el repositorio**:
    ```bash
    git clone <url-del-repositorio>
    cd EvalProyects
    ```

2.  **Instalar dependencias**:
    ```bash
    pnpm install
    ```

3.  **Iniciar servidor de desarrollo**:
    ```bash
    pnpm dev
    ```

4.  **Construir para producción**:
    ```bash
    pnpm build
    ```

---
Desarrollado como un MVP para la toma de decisiones financieras estratégicas.
