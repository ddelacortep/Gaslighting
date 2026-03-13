/**
 * Parse a Spanish decimal price string to a float.
 * e.g. "1,629" → 1.629, "" → null
 */
export function parseSpanishPrice(str) {
  if (!str || str.trim() === '') return null
  const parsed = parseFloat(str.trim().replace(',', '.'))
  return isNaN(parsed) ? null : parsed
}

/**
 * Format a price float to 3 decimal places string.
 * e.g. 1.629 → "1.629"
 */
export function formatPrice(num) {
  if (num == null) return '—'
  return num.toFixed(3)
}

/**
 * Calculate the cost to fill a tank of given capacity at a given price per liter.
 * e.g. calcTankCost(1.629, 50) → "81.45"
 */
export function calcTankCost(pricePerLiter, liters) {
  if (pricePerLiter == null || liters == null) return null
  return (pricePerLiter * liters).toFixed(2)
}

/**
 * Calculate the fuel cost for a round trip.
 * distanceKm: one-way distance
 * consumptionPer100km: liters per 100 km
 * pricePerLiter: price in euros
 */
export function calcRoundTripCost(distanceKm, consumptionPer100km, pricePerLiter) {
  if (!distanceKm || !consumptionPer100km || !pricePerLiter) return null
  const liters = (distanceKm * 2 * consumptionPer100km) / 100
  return (liters * pricePerLiter).toFixed(2)
}
