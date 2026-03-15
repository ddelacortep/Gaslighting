const API_URL =
  import.meta.env.VITE_GASOLINERAS_URL ||
  'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/'

/**
 * Fetch all gas stations from the Spanish Ministry of Energy API.
 * Returns the raw array of station objects (ListaEESSPrecio).
 */
export async function fetchAllStations() {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error(`Gasolineras API error: ${res.status}`)
  const data = await res.json()
  return data.ListaEESSPrecio ?? []
}
