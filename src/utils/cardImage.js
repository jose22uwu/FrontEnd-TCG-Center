/**
 * URL de imagen de carta (API TCG). Si ya es un enlace a imagen, se devuelve tal cual;
 * si no, se añade /high.png.
 */
export function cardImageSrc (url) {
  if (!url) return ''
  if (/\.(png|webp|jpg|jpeg|gif)(\?|$)/i.test(url)) return url
  return url.replace(/\/?$/, '') + '/high.png'
}
