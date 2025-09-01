// Hardcoded values for pre-filling dropdowns/autocomplete suggestions.
// Replace these with API calls later.

export const SHIPMENT_STATUSES = ['Ontime', 'Early', 'Late', 'Undefined'] as const;
export const MODES_OF_TRANSPORT = ['Air', 'Ocean', 'Rail', 'Road'] as const;
export const CARGO_TYPES = ['FCL', 'LCL', 'Air', 'FTL', 'LTL'] as const;
export const HAZARDOUS_OPTIONS = ['Y', 'N'] as const;

// Searchable demo datasets
export const CSR_DIRECTORY = [
  { id: 1, name: 'Alice Johnson' },
  { id: 2, name: 'Bob Smith' },
  { id: 3, name: 'Carlos Diaz' },
  { id: 4, name: 'Diana Peters' },
  { id: 5, name: 'Elena Fischer' },
];

export const LSP_DIRECTORY = [
  { id: 'l1', name: 'TransGlobal Logistics' },
  { id: 'l2', name: 'BlueShip Partners' },
  { id: 'l3', name: '4PL Nexus' },
  { id: 'l4', name: 'CargoBridge' },
];

export const REGIONS = [
  'North America',
  'South America',
  'Europe',
  'Africa',
  'Middle East',
  'Asia',
  'Oceania',
];

export const COUNTRIES = [
  'United States',
  'Canada',
  'Germany',
  'France',
  'United Kingdom',
  'India',
  'China',
  'Japan',
  'Brazil',
  'Mexico',
  'South Africa',
  'UAE',
  'Australia',
];

export const PORTS = [
  { code: 'LAX', name: 'Los Angeles International' },
  { code: 'JFK', name: 'John F. Kennedy International' },
  { code: 'SFO', name: 'San Francisco International' },
  { code: 'HKG', name: 'Hong Kong International' },
  { code: 'SHA', name: 'Shanghai Pudong' },
  { code: 'AMS', name: 'Amsterdam Schiphol' },
  { code: 'SIN', name: 'Singapore Changi' },
  { code: 'RTM', name: 'Rotterdam Port' },
  { code: 'HAM', name: 'Hamburg Port' },
];

export const CITIES = [
  { code: 'DAL', name: 'Dallas' },
  { code: 'CHI', name: 'Chicago' },
  { code: 'BER', name: 'Berlin' },
  { code: 'LON', name: 'London' },
  { code: 'MUM', name: 'Mumbai' },
  { code: 'DXB', name: 'Dubai' },
  { code: 'SYD', name: 'Sydney' },
];

export const CARRIERS = [
  'Maersk',
  'MSC',
  'CMA CGM',
  'Hapag-Lloyd',
  'Lufthansa',
  'Emirates',
  'United Airlines',
];

export const VESSELS = [
  { id: 'v1', name: 'Ever Given' },
  { id: 'v2', name: 'MSC Oscar' },
  { id: 'v3', name: 'CMA CGM Benjamin Franklin' },
];

export const FLIGHTS = [
  { id: 'f1', name: 'LH712' },
  { id: 'f2', name: 'EK215' },
  { id: 'f3', name: 'UA857' },
];
