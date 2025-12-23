/**
 * Tutorial Steps - Defines all tutorial steps
 */

export const tutorialSteps = [
  {
    id: 'welcome',
    title: '👋 Bienvenido al Editor DragNDrop',
    description: 'Aprende a usar el editor en solo 2 minutos. Te guiaremos paso a paso.',
    position: 'center',
    showSkip: true,
    buttons: [
      { text: 'Comenzar', action: 'next', primary: true },
      { text: 'Saltar Tutorial', action: 'skip' },
    ],
  },
  {
    id: 'components-panel',
    title: '🧩 Panel de Componentes',
    description:
      'Aquí encontrarás todos los componentes disponibles organizados por categorías: Layout, Texto, Medios, Formularios, UI y Avanzados.',
    target: '.components-panel',
    position: 'right',
    highlight: true,
    buttons: [
      { text: 'Anterior', action: 'prev' },
      { text: 'Siguiente', action: 'next', primary: true },
    ],
  },
  {
    id: 'drag-component',
    title: '🖱️ Arrastra Componentes',
    description:
      'Arrastra cualquier componente desde el panel izquierdo hacia el canvas central para agregarlo a tu página.',
    target: '.component-item',
    position: 'right',
    highlight: true,
    action: {
      type: 'drag',
      from: '.component-item[data-type="h1"]',
      to: '#canvas',
    },
    buttons: [
      { text: 'Anterior', action: 'prev' },
      { text: 'Siguiente', action: 'next', primary: true },
    ],
  },
  {
    id: 'canvas',
    title: '🎨 Canvas de Diseño',
    description: 'Este es tu lienzo de trabajo. Aquí verás y editarás tu página en tiempo real.',
    target: '#canvas',
    position: 'left',
    highlight: true,
    buttons: [
      { text: 'Anterior', action: 'prev' },
      { text: 'Siguiente', action: 'next', primary: true },
    ],
  },
  {
    id: 'select-element',
    title: '🎯 Seleccionar Elementos',
    description:
      'Haz clic en cualquier elemento del canvas para seleccionarlo y ver sus propiedades.',
    target: '#canvas .canvas-element',
    position: 'left',
    highlight: true,
    action: {
      type: 'click',
      target: '#canvas .canvas-element',
    },
    buttons: [
      { text: 'Anterior', action: 'prev' },
      { text: 'Siguiente', action: 'next', primary: true },
    ],
  },
  {
    id: 'properties-panel',
    title: '⚙️ Panel de Propiedades',
    description:
      'Aquí puedes modificar todas las propiedades del elemento seleccionado: estilos, dimensiones, colores, y más.',
    target: '.properties-panel',
    position: 'left',
    highlight: true,
    buttons: [
      { text: 'Anterior', action: 'prev' },
      { text: 'Siguiente', action: 'next', primary: true },
    ],
  },
  {
    id: 'responsive-views',
    title: '📱 Vistas Responsivas',
    description:
      'Prueba cómo se ve tu diseño en diferentes dispositivos: escritorio, tablet y móvil.',
    target: '#btnDesktop',
    position: 'bottom',
    highlight: true,
    buttons: [
      { text: 'Anterior', action: 'prev' },
      { text: 'Siguiente', action: 'next', primary: true },
    ],
  },
  {
    id: 'undo-redo',
    title: '↶↷ Deshacer y Rehacer',
    description: 'Usa estos botones o los atajos Ctrl+Z y Ctrl+Y para deshacer y rehacer cambios.',
    target: '#undoBtn',
    position: 'bottom',
    highlight: true,
    buttons: [
      { text: 'Anterior', action: 'prev' },
      { text: 'Siguiente', action: 'next', primary: true },
    ],
  },
  {
    id: 'export',
    title: '📥 Exportar tu Proyecto',
    description:
      'Cuando termines, exporta tu proyecto como HTML o despliégalo directamente a Vercel.',
    target: '.toolbar-btn.primary',
    position: 'bottom',
    highlight: true,
    buttons: [
      { text: 'Anterior', action: 'prev' },
      { text: 'Siguiente', action: 'next', primary: true },
    ],
  },
  {
    id: 'complete',
    title: '🎉 ¡Tutorial Completado!',
    description:
      'Ya conoces lo básico. Ahora puedes empezar a crear páginas increíbles. ¡Diviértete!',
    position: 'center',
    buttons: [{ text: 'Finalizar', action: 'complete', primary: true }],
  },
];

/**
 * Get tutorial step by ID
 * @param {string} id - Step ID
 * @returns {Object|null} Tutorial step
 */
export function getTutorialStep(id) {
  return tutorialSteps.find(step => step.id === id) || null;
}

/**
 * Get tutorial step by index
 * @param {number} index - Step index
 * @returns {Object|null} Tutorial step
 */
export function getTutorialStepByIndex(index) {
  return tutorialSteps[index] || null;
}

/**
 * Get total number of steps
 * @returns {number} Total steps
 */
export function getTotalSteps() {
  return tutorialSteps.length;
}

/**
 * Get step index
 * @param {string} id - Step ID
 * @returns {number} Step index (-1 if not found)
 */
export function getStepIndex(id) {
  return tutorialSteps.findIndex(step => step.id === id);
}

export default tutorialSteps;
