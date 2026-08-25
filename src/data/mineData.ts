import type { Mine } from '@/types';

export const MINES: Mine[] = [
  {
    id: 'MX-001',
    name: 'Balaghat Alpha',
    location: 'Balaghat, Madhya Pradesh',
    lat: 21.83,
    lng: 80.19,
    totalArea: 847,
    activeZones: 6,
    estimatedReserves: 12.4,
    annualCapacity: 450,
    status: 'active',
  },
  {
    id: 'MX-002',
    name: 'Vizag Coastal Block',
    location: 'Visakhapatnam, Andhra Pradesh',
    lat: 17.69,
    lng: 83.22,
    totalArea: 512,
    activeZones: 4,
    estimatedReserves: 8.7,
    annualCapacity: 320,
    status: 'active',
  },
  {
    id: 'MX-003',
    name: 'Odisha Eastern Reserve',
    location: 'Keonjhar, Odisha',
    lat: 21.63,
    lng: 85.58,
    totalArea: 1200,
    activeZones: 8,
    estimatedReserves: 21.2,
    annualCapacity: 680,
    status: 'active',
  },
];

export const ACTIVE_MINE = MINES[0];
