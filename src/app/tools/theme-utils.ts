export function isDarkThemePreferred(): boolean {
  return localStorage.getItem('theme') ?
    localStorage.getItem('theme') === 'dark' :
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}
