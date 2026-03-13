export const MADRID_CENTER = { lat: 40.4168, lng: -3.7038 }

/**
 * Haversine formula — returns distance in km between two lat/lng points.
 */
export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Estimate drive time in minutes given a distance in km.
 * Uses 30 km/h as average urban speed.
 */
export function estimateMinutes(distKm, speedKmh = 30) {
  return Math.round((distKm / speedKmh) * 60)
}

/**
 * Parse Spanish schedule string to determine if currently open.
 * Returns true (open), false (closed), or null (unknown/unparseable).
 */
export function computeIsOpen(horario) {
  if (!horario) return null
  const h = horario.toUpperCase().trim()

  if (h === '24H' || h.includes('00:00-23:59') || h.includes('00:00-00:00')) return true

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const timeRangeMatch = h.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/)
  if (timeRangeMatch) {
    const openMin = parseInt(timeRangeMatch[1]) * 60 + parseInt(timeRangeMatch[2])
    let closeMin = parseInt(timeRangeMatch[3]) * 60 + parseInt(timeRangeMatch[4])
    if (closeMin === 0) closeMin = 24 * 60 // midnight closing
    return currentMinutes >= openMin && currentMinutes < closeMin
  }

  return null
}
