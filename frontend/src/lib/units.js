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

const DEPARTMENTS = [
  'IT', 'Nurse', 'F&B', 'Project', 'Billing', 'AD Office',
  'AOC', 'Purchase', 'Estate Manager', 'Patient Service',
  'Volunteer', 'Doctor', 'Electricians', 'Data Science',
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

  const code = buildingCode.toUpperCase()
  const prefix = code === 'NT2' ? 'NTA2' : 'NTA1'
  const hasSuffix = code === 'NT2' // NT2 uses A/B sub-units

  const units = []
  for (let f = 1; f <= 17; f++) {
    for (let u = 1; u <= 6; u++) {
      const roomBase = `${f}${String(u).padStart(2, '0')}`

      if (hasSuffix) {
        // NT2: generate A and B sub-units
        for (const suffix of ['A', 'B']) {
          const roomNo = `${prefix}-${roomBase}${suffix}`
          const isOccupied = rng() > 0.3
          const residentName = isOccupied ? pick(RESIDENTS, rng) : '-'
          const furniture = genFurniture(rng)
          const dept = isOccupied ? pick(DEPARTMENTS, rng) : ''
          const count = isOccupied ? Math.floor(rng() * 4) + 1 : 0

          units.push({
            floor: f,
            roomNo,
            occupancy: isOccupied ? 'Occupied' : 'Vacant',
            residentName,
            deptt: dept,
            occupantCount: count,
            furniture,
          })
        }
      } else {
        // NT1: single unit per room
        const roomNo = `${prefix}-${roomBase}`
        const isOccupied = rng() > 0.3
        const residentName = isOccupied ? pick(RESIDENTS, rng) : '-'
        const furniture = genFurniture(rng)
        const dept = isOccupied ? pick(DEPARTMENTS, rng) : ''
        const count = isOccupied ? Math.floor(rng() * 4) + 1 : 0

        units.push({
          floor: f,
          roomNo,
          occupancy: isOccupied ? 'Occupied' : 'Vacant',
          residentName,
          deptt: dept,
          occupantCount: count,
          furniture,
        })
      }
    }
  }
  return units
}
