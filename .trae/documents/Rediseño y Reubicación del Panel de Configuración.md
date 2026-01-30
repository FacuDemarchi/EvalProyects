# Mover y Rediseñar Panel de Configuración

## Objetivo
Mover el panel de configuración a un botón de ajustes (ruedita) en la parte superior izquierda y rediseñar su interfaz para que coincida con el boceto proporcionado, integrando las secciones de Financiamiento e Impuestos como elementos desplegables.

## Pasos de Implementación

### 1. Rediseño de ConfigPanel.tsx
- **Estructura Principal**: Eliminar el acordeón externo para la configuración básica. El título "Configuración" aparecerá en la parte superior.
- **Secciones Colapsables**: Implementar un nuevo estilo para "Financiamiento" e "Impuestos" usando líneas horizontales simples y el icono `v` (ChevronDown) para indicar que son desplegables, tal como muestra la imagen.
- **Iconografía**: Mantener los iconos actuales (`Settings2`, `Landmark`, `Percent`) que el usuario mencionó que le gustan, integrándolos de forma elegante en el nuevo diseño.
- **Animaciones**: Usar `framer-motion` para asegurar que las secciones se desplieguen suavemente.

### 2. Integración en App.tsx
- **Ubicación del Trigger**: Mover el icono de `Settings` (la ruedita) de su posición actual en el header hacia el extremo izquierdo.
- **Modal de Configuración**: Implementar un componente `Dialog` de Radix UI que se active al pulsar la ruedita. Este modal contendrá el nuevo `ConfigPanel`.
- **Limpieza de Layout**: Eliminar el `ConfigPanel` de la columna derecha de la aplicación, dejando más espacio para los KPIs y resultados.

### 3. Ajustes Estéticos
- Asegurar que el diseño del modal sea "simple y fácil de entender", con bordes redondeados y una tipografía clara que se alinee con la estética premium del proyecto.
- Implementar las líneas divisorias y los disparadores de sección con el estilo minimalista solicitado.

## Verificación
- Abrir el modal desde la ruedita en la esquina superior izquierda.
- Verificar que las secciones de Impuestos y Financiamiento se desplieguen correctamente al hacer clic en ellas.
- Asegurar que todos los inputs sigan funcionando y actualizando el estado financiero en tiempo real.
