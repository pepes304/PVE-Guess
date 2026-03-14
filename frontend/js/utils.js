export function showMessage(text, duration = 3000) {
  const el = document.getElementById('message');
  if (!el) return;
  el.textContent = text;
  if (duration) setTimeout(() => { if (el.textContent === text) el.textContent = ''; }, duration);
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
