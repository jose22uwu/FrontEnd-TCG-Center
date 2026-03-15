/**
 * Normaliza la respuesta de la API ({ success, data }) a un array.
 * Soporta data como array o como { data: [] }.
 * @param {object} data - Respuesta de api.get/post
 * @param {Array} defaultVal - Valor si no hay datos
 */
export function normalizeApiList (data, defaultVal = []) {
  if (!data?.success || data.data == null) return defaultVal
  const d = data.data
  if (Array.isArray(d)) return d
  if (d?.data && Array.isArray(d.data)) return d.data
  return defaultVal
}
