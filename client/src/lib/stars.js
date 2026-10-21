export const stars = (n) => { const k = Math.max(0, Math.min(5, Number(n) || 0)); return '★'.repeat(k) + '☆'.repeat(5 - k); };
