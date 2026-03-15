import { onMounted, onBeforeUnmount } from 'vue'

/**
 * Ejecuta onClose cuando se hace clic fuera del elemento referenciado (ej. dropdown).
 * @param {import('vue').Ref<HTMLElement|null>} elementRef - Ref del contenedor
 * @param {() => void} onClose - Callback al hacer clic fuera
 */
export function useClickOutside (elementRef, onClose) {
  function handleClick (e) {
    const el = elementRef.value
    if (el && !el.contains(e.target)) onClose()
  }

  onMounted(() => document.addEventListener('click', handleClick))
  onBeforeUnmount(() => document.removeEventListener('click', handleClick))
}
