const RESIDENTS = [
  'John Doe',
  'Jane Smith',
  'Michael Ross',
  'Sarah Connor',
  'David Miller',
  'Emma Wilson',
  'Robert Brown',
  'Emily Davis',
]

const FURNITURE = ['Bed', 'AC', 'Study Table', 'Wardrobe', 'Chair']

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)]
}

function createRng(seed) {
  // Mulberry32
  let a = seed >>> 0
  return function rng() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function genFurniture(rng) {
  if (rng() > 0.8) return 'NIL'
  const count = Math.floor(rng() * 3) + 1
  const shuffled = [...FURNITURE].sort(() => 0.5 - rng())
  return shuffled.slice(0, count).join(', ')
}

export function generateUnits({ buildingCode = 'NT1', seed = 12345 } = {}) {
  const rng = createRng(
    seed +
      buildingCode
        .split('')
        .reduce((acc, ch) => acc + ch.charCodeAt(0), 0),
  )

  const units = []
  for (let f = 17; f >= 1; f--) {
    for (let u = 1; u <= 6; u++) {
      const roomNo = `${f}${String(u).padStart(2, '0')}`
      const isOccupied = rng() > 0.3
      const residentName = isOccupied ? pick(RESIDENTS, rng) : '-'
      const furniture = genFurniture(rng)

      units.push({
        floor: f,
        roomNo,
        occupancy: isOccupied ? 'Occupied' : 'Vacant',
        residentName,
        furniture,
      })
    }
  }
  return units
}
