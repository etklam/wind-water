export const nineGridElements = {
  north: 'water',
  west: 'wood',
  center: 'earth',
  east: 'metal',
  south: 'fire'
}

export const nineGridCells = [
  { slot: 'northwest', kind: 'trigram', trigram: 'qian', symbol: '☰', direction: 'northwest' },
  { slot: 'north', kind: 'element', element: nineGridElements.north, direction: 'north' },
  { slot: 'northeast', kind: 'trigram', trigram: 'gen', symbol: '☶', direction: 'northeast' },
  { slot: 'west', kind: 'element', element: nineGridElements.west, direction: 'east' },
  { slot: 'center', kind: 'center', element: nineGridElements.center, direction: 'center' },
  { slot: 'east', kind: 'element', element: nineGridElements.east, direction: 'west' },
  { slot: 'southwest', kind: 'trigram', trigram: 'kun', symbol: '☷', direction: 'southwest' },
  { slot: 'south', kind: 'element', element: nineGridElements.south, direction: 'south' },
  { slot: 'southeast', kind: 'trigram', trigram: 'xun', symbol: '☴', direction: 'southeast' }
]
