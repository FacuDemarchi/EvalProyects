# Optimización de Estructura de Capital y Amortización

## Objetivo
Integrar una funcionalidad de "Cálculo de Óptimo" directamente en la interfaz de Estructura de Capital y mejorar la reflexión final para guiar al usuario en la creación de valor.

## Cambios Propuestos

### 1. Interfaz de Estructura de Capital ([CapitalStructureBox.tsx](file:///c:/Users/Facundo/Documents/trae_projects/EvalProyects/src/components/CapitalStructureBox.tsx))
- **Botón "Calcular Óptimo"**: Se añadirá un botón sutil junto al título que, al activarse, buscará la combinación de deuda y sistema de amortización que maximice el VAN.
- **Selector de Amortización**: Se integrará un desplegable (dropdown) para elegir entre los sistemas Francés, Alemán y Bullet, permitiendo al usuario cambiarlo manualmente o dejar que el sistema lo optimice.
- **Sincronización**: Al calcular el óptimo, el slider de Equity/Deuda se moverá automáticamente a la posición más eficiente.

### 2. Motor de Optimización ([useFinance.ts](file:///c:/Users/Facundo/Documents/trae_projects/EvalProyects/src/hooks/useFinance.ts))
- **Función de Búsqueda**: Implementar una lógica que evalúe los 3 sistemas de amortización y diferentes niveles de deuda para encontrar el que maximice el valor (VAN) según el modo de evaluación seleccionado (Proyecto o Accionista).
- **Lógica de Decisión**:
    - En **Modo Proyecto**: Se priorizará el ahorro fiscal del WACC.
    - En **Modo Accionista**: Se priorizará el apalancamiento financiero y el diferimiento de pagos (Time Value of Money).

### 3. Reflexión Final Potenciada ([ReflectionBox.tsx](file:///c:/Users/Facundo/Documents/trae_projects/EvalProyects/src/components/ReflectionBox.tsx))
- **Análisis de Apalancamiento**: Se añadirá una sección detallada explicando por qué el nivel de deuda actual (o el sugerido) es el óptimo.
- **Justificación del Sistema**: Se explicará por qué el sistema de amortización elegido (Francés, Alemán o Bullet) es el más adecuado para la liquidez y rentabilidad del proyecto.
- **Nota sobre Techo de Deuda**: Se informará al usuario que puede ajustar manualmente el monto en la configuración si existe una restricción de crédito bancario.

## Consideraciones Técnicas
- El "Óptimo" se basará en los datos actuales de ingresos, costos e inversión. Si estos cambian, el usuario puede volver a calcular el óptimo.
- Se mantendrá el diseño premium y minimalista, evitando saturar al usuario con nuevas secciones.
