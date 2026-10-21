// Tiny fetch wrapper. The custom header is required by the server's CSRF guard on writes.
export class ApiError extends Error {
  constructor(message, status, data) { super(message); this.status = status; this.data = data; }
}

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = { 'X-Requested-With': 'esspology' };
  let payload;
  if (form) payload = form;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  const res = await fetch('/api' + path, { method, headers, body: payload, credentials: 'same-origin' });
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON */ }
  if (!res.ok) throw new ApiError(data?.error || 'Something went wrong. Please try again.', res.status, data);
  return data;
}
