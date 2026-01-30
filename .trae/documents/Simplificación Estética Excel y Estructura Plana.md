## Plan de Simplificación Estilo Excel

Transformaremos la interfaz de una estructura jerárquica compleja a una planilla plana y funcional similar a Excel, enfocándonos en la entrada directa de datos por concepto.

### 1. Simplificación del Estado (Hook useFinance)
- **Ajuste de Datos Iniciales**: Configuraremos las categorías iniciales para que contengan un único ítem principal (ej: Categoría "Ingresos" con ítem "Ingresos").
- **Restricción de Estructura**: Mantendremos la lógica interna pero limitaremos la interfaz para que cada categoría funcione como una fila única, eliminando la necesidad de añadir o borrar sub-ítems.

### 2. Rediseño de la Tabla (SpreadsheetTable)
- **Eliminación de Niveles**: Quitaremos las filas de cabecera de categoría y las filas de totales por categoría ("Total Ingresos", etc.).
- **Fila Única por Concepto**: Cada fila de la tabla representará directamente una categoría (Ingresos, Costos Variables, etc.).
- **Estética Excel**:
    - Implementaremos bordes de celda completos para crear un efecto de grilla.
    - Reduciremos el padding y eliminaremos sombras/redondeados excesivos para un look más "limpio" y denso en información.
    - Los nombres de los conceptos (Ingresos, Costos, etc.) serán etiquetas fijas o inputs directos sin sangría.

### 3. Refinamiento de Filas Calculadas
- **Consolidación**: Mantendremos únicamente las filas de resultados globales (EBITDA, Impuestos, Flujo Neto) para que el usuario vea el impacto inmediato de sus cambios en la planilla.

### 4. Estilos Globales
- **Utilidades de Grilla**: Ajustaremos `src/index.css` para asegurar que los inputs se comporten como celdas de Excel (sin bordes visibles hasta el foco, alineación perfecta).

¿Deseas que proceda con estos cambios para simplificar la interfaz?