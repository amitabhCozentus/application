import { Injectable, inject, signal, computed } from '@angular/core';
import { debounceTime, map, of } from 'rxjs';
import { GlobalFiltersState, emptyGlobalFiltersState, CodeNameItem, NamedItem, HazardousFlag } from '../../model/filters.model';
import {
  SHIPMENT_STATUSES,
  MODES_OF_TRANSPORT,
  CARGO_TYPES,
  HAZARDOUS_OPTIONS,
  CSR_DIRECTORY,
  LSP_DIRECTORY,
  REGIONS,
  COUNTRIES,
  PORTS,
  CITIES,
  CARRIERS,
  VESSELS,
  FLIGHTS,
} from './filters.mock-data';

@Injectable({ providedIn: 'root' })
export class FilterService {
  // Global state for filters using Angular signals for lightweight reactivity
  readonly state = signal<GlobalFiltersState>(emptyGlobalFiltersState());

  // Derived/computed helpers
  readonly hasActiveFilters = computed(() => {
    const s = this.state();
    const primitives = [s.shipmentStatus, s.hazardous];
    const arrays: any[] = [
      s.modes,
      s.originRegion,
      s.originCountry,
      s.destinationRegion,
      s.destinationCountry,
      s.carriers,
      s.cargoTypes,
      s.csr,
      s.lsp,
      s.originPorts,
      s.destinationPorts,
      s.placeOfReceipt,
      s.placeOfDelivery,
      s.vesselNames,
      s.flightNumbers,
    ];
    return (
      primitives.some((p) => p !== null && p !== undefined) ||
      arrays.some((a) => Array.isArray(a) && a.length > 0)
    );
  });

  // Static option lists
  shipmentStatuses = SHIPMENT_STATUSES;
  modesOfTransport = MODES_OF_TRANSPORT;
  cargoTypes = CARGO_TYPES;
  hazardousOptions = HAZARDOUS_OPTIONS;

  regions = REGIONS;
  countries = COUNTRIES;
  carriers = CARRIERS;

  // Commands
  set4pl(enabled: boolean) {
    this.patch({ is4pl: enabled });
    if (!enabled) this.patch({ lsp: [] });
  }

  apply(partial: Partial<GlobalFiltersState>) {
    this.patch(partial);
    // In a real app, emit to a global bus or call data refresh.
  }

  clear() {
    const { is4pl } = this.state();
    this.state.set({ ...emptyGlobalFiltersState(), is4pl });
  }

  private patch(partial: Partial<GlobalFiltersState>) {
    this.state.update((s) => ({ ...s, ...partial }));
  }

  // Suggestion methods — simulate API with simple filtering
  suggestCsr = (q: string) => this.filterByName(CSR_DIRECTORY, q, 3);
  suggestLsp = (q: string) => this.filterByName(LSP_DIRECTORY, q, 3);
  suggestPorts = (q: string) => this.filterByName(PORTS, q, 3) as any;
  suggestPlaces = (q: string) => this.filterByName(CITIES, q, 3) as any;
  suggestVessels = (q: string) => this.filterByName(VESSELS, q, 3);
  suggestFlights = (q: string) => this.filterByName(FLIGHTS, q, 2);

  private filterByName<T extends { name: string }>(arr: T[], q: string, min = 0) {
    const query = (q ?? '').trim();
    if (query.length < min) return of<T[]>([]).pipe(debounceTime(0));
    const ql = query.toLowerCase();
    return of(
      arr.filter((x) => x.name.toLowerCase().includes(ql)).slice(0, 25)
    ).pipe(debounceTime(100));
  }
}
