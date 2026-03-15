const BASE = import.meta.env.VITE_APP_URL_BASE ?? ''

async function request(method, path, body) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? `HTTP ${res.status}`)
  }

  return res.status === 204 ? null : res.json()
}

export const userApi = {
  init: (data) => request('POST', '/users/init', data),
  updateActivity: (id) => request('PUT', `/users/${id}/activity`),
}

export const favoritesApi = {
  getByUser: (userId) => request('GET', `/favorites/${userId}`),
  add: (payload) => request('POST', '/favorites', payload),
  update: (id, data) => request('PUT', `/favorites/${id}`, data),
  remove: (id) => request('DELETE', `/favorites/${id}`),
}
