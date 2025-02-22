export function toAsciiFriendly(url) {
  // Remove unwanted subpaths
  let friendly = url.replace(/docs_html\/|docs_raw\//gi, '');
  // Normalize to remove diacritics and remove non-ascii characters
  friendly = friendly.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  friendly = friendly.replace(/[^\x00-\x7F]/g, '');
  return friendly;
}
