// Central types for the Global Filters feature
// These models are intentionally simple and UI-oriented so they can be used
// across Home, Tracking List, and Favorites without coupling to API DTOs.

export type HazardousFlag = 'Y' | 'N' | null;

export interface NamedItem {
  id?: string | number;
  name: string;
}

export interface CodeNameItem extends NamedItem {
  code: string;
}

export interface GlobalFiltersState {
  // Single-select
  shipmentStatus: string | null;
  hazardous: HazardousFlag;

  // Multi-selects
  modes: string[]; // Air, Ocean, Rail, Road
  originRegion: string[];
  originCountry: string[];
  destinationRegion: string[];
  destinationCountry: string[];
  carriers: string[]; // Ocean/Air carriers
  cargoTypes: string[]; // FCL, LCL, Air, FTL, LTL

  // Auto-complete (multi)
  csr: NamedItem[];
  lsp: NamedItem[]; // enabled when 4PL context
  originPorts: CodeNameItem[]; // name + IATA/UNLOCODE in code
  destinationPorts: CodeNameItem[];
  placeOfReceipt: CodeNameItem[];
  placeOfDelivery: CodeNameItem[];
  vesselNames: NamedItem[]; // ocean
  flightNumbers: NamedItem[]; // air

  // Context flags
  is4pl?: boolean; // when true, enable LSP filter
}

export const emptyGlobalFiltersState = (): GlobalFiltersState => ({
  shipmentStatus: null,
  hazardous: null,
  modes: [],
  originRegion: [],
  originCountry: [],
  destinationRegion: [],
  destinationCountry: [],
  carriers: [],
  cargoTypes: [],
  csr: [],
  lsp: [],
  originPorts: [],
  destinationPorts: [],
  placeOfReceipt: [],
  placeOfDelivery: [],
  vesselNames: [],
  flightNumbers: [],
  is4pl: false,
});
