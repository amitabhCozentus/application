import { Component, OnInit, Input, Output, EventEmitter, signal, computed, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimengModule } from '../../primeng/primeng.module';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
export interface FilterOption {
  label: string;
  value: string;
  code?: string;
}
export interface FilterCriteria {
  shipmentStatus?: string;
  modeOfTransport?: string[];
  customerServiceRep?: FilterOption[];
  lspName?: FilterOption[];
  originRegion?: FilterOption[];
  originCountry?: FilterOption[];
  originPort?: FilterOption[];
  placeOfReceipt?: FilterOption[];
  destinationRegion?: FilterOption[];
  destinationCountry?: FilterOption[];
  destinationPort?: FilterOption[];
  placeOfDelivery?: FilterOption[];
  carrier?: FilterOption[];
  vesselName?: FilterOption[];
  flightNumber?: FilterOption[];
  cargoType?: string[];
  hazardousMaterial?: string;
}
export interface SavedFilter {
  id: string;
  name: string;
  criteria: FilterCriteria;
  createdDate: Date;
}
@Component({
  selector: 'app-filter-panel',
  imports: [CommonModule, FormsModule, PrimengModule, ToastModule, ConfirmDialogModule], 
  providers: [MessageService, ConfirmationService],
   templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss'
})
export class FilterPanelComponent {
@Input() selectedCompany: string | null = null;   // company outside the panel
  @Output() filtersApplied = new EventEmitter<FilterCriteria>();
  @Output() filtersClear = new EventEmitter<void>();
  @Output() filterOutputGenerated = new EventEmitter<any>(); // Emits comprehensive filter output
 
  private toast = inject(MessageService);
  private confirm = inject(ConfirmationService);
 
  // Drawer state
  visible = signal(false);
 
  // Criteria state
  filterCriteria = signal<FilterCriteria>({});
 
  // UI state
  showSaveDialog = signal(false);
  showSavedFiltersDialog = signal(false);
  saveFilterName = signal<string>('');
  savedFilters = signal<SavedFilter[]>([]);
 
  // Options
  shipmentStatusOptions: SelectItem[] = [
    { label: 'On Time', value: 'ontime' },
    { label: 'Early', value: 'early' },
    { label: 'Late', value: 'late' },
    { label: 'Undefined', value: 'undefined' }
  ];
  modeOfTransportOptions: SelectItem[] = [
    { label: 'Air', value: 'air' },
    { label: 'Ocean', value: 'ocean' },
    { label: 'Rail', value: 'rail' },
    { label: 'Road', value: 'road' }
  ];
  cargoTypeOptions: SelectItem[] = [
    { label: 'FCL', value: 'fcl' },
    { label: 'LCL', value: 'lcl' },
    { label: 'Air', value: 'air' },
    { label: 'FTL', value: 'ftl' },
    { label: 'LTL', value: 'ltl' }
  ];
  hazardousMaterialOptions: SelectItem[] = [
    { label: 'Y', value: 'Y' },
    { label: 'N', value: 'N' }
  ];
 
  // Lookup stores (mock data now; replace with API in real app)
  csrAll: FilterOption[] = [];
  lspAll: FilterOption[] = [];
  regionAll: FilterOption[] = [];
  countryAll: FilterOption[] = [];
  portAll: FilterOption[] = [];
  porAll: FilterOption[] = [];
  podAll: FilterOption[] = [];
  carrierAll: FilterOption[] = [];
  vesselAll: FilterOption[] = [];
  flightAll: FilterOption[] = [];
 
  // Suggestions for auto-complete (kept separate to avoid extra form state)
  csrSuggestions: FilterOption[] = [];
  lspSuggestions: FilterOption[] = [];
  originPortSuggestions: FilterOption[] = [];
  destinationPortSuggestions: FilterOption[] = [];
  porSuggestions: FilterOption[] = [];
  podSuggestions: FilterOption[] = [];
  vesselSuggestions: FilterOption[] = [];
  flightSuggestions: FilterOption[] = [];
 
  // Options arrays for template binding
  get lspNameOptions() { return this.lspSuggestions; }
  get originRegionOptions() { return this.regionAll.map(r => ({ label: r.label, value: r.value })); }
  get destinationRegionOptions() { return this.regionAll.map(r => ({ label: r.label, value: r.value })); }
  get carrierOptions() { return this.carrierAll.map(c => ({ label: c.label, value: c.value })); }
 
  // Computed cascades
// Replace your current computed signal with this:
filteredOriginCountries = computed(() => {
  const regions = this.filterCriteria().originRegion ?? [];
  let countries = this.countryAll;
  
  if (regions.length) {
    const regionCodes = regions.map(r => r.value);
    countries = this.countryAll.filter(c => this.isCountryInRegions(c.value, regionCodes));
  }
  
  // Convert FilterOption[] to SelectItem[] format expected by PrimeNG
  return countries.map(country => ({
    label: country.label,
    value: country.value
  }));
});
 
  filteredDestinationCountries = computed(() => {
    const regions = this.filterCriteria().destinationRegion ?? [];
    if (!regions.length) return this.countryAll;
    const regionCodes = regions.map(r => r.value);
    return this.countryAll.filter(c => this.isCountryInRegions(c.value, regionCodes));
  });
 
  filteredOriginPorts = computed(() => {
    const countries = this.filterCriteria().originCountry ?? [];
    if (!countries.length) return this.portAll;
    const cc = countries.map(c => c.value);
    return this.portAll.filter(p => this.isPortInCountries(p.value, cc));
  });
 
  filteredDestinationPorts = computed(() => {
    const countries = this.filterCriteria().destinationCountry ?? [];
    if (!countries.length) return this.portAll;
    const cc = countries.map(c => c.value);
    return this.portAll.filter(p => this.isPortInCountries(p.value, cc));
  });
 
  // Enable/disable by MOT
  isVesselNameEnabled = computed(() => {
    const mot = this.filterCriteria().modeOfTransport ?? [];
    return !(mot.length === 1 && mot.includes('air'));
  });
  isFlightNumberEnabled = computed(() => {
    const mot = this.filterCriteria().modeOfTransport ?? [];
    return !(mot.length === 1 && mot.includes('ocean'));
  });
  isLspNameEnabled = computed(() => {
    // LSP Name field is enabled only for 4PL shipments
    // Multiple ways to determine 4PL scenario:
   
    // 1. Check if selectedCompany indicates 4PL operations
    if (this.selectedCompany) {
      const companyName = this.selectedCompany.toLowerCase();
      if (companyName.includes('4pl') ||
          companyName.includes('fourth party') ||
          companyName.includes('logistics service provider')) {
        return true;
      }
    }
   
    // 2. Check if current filter criteria suggests 4PL shipment
    const criteria = this.filterCriteria();
   
    // If LSP Name is already selected, keep field enabled
    if (criteria.lspName && criteria.lspName.length > 0) {
      return true;
    }
   
    // 3. Check shipment status or mode of transport for 4PL indicators
    // 4PL shipments often involve multiple modes or complex routing
    const mot = criteria.modeOfTransport ?? [];
    if (mot.length > 1) {
      return true; // Multi-modal shipments often indicate 4PL management
    }
   
    // 4. Check for complex routing (multiple regions/countries)
    const hasMultipleOrigins = (criteria.originRegion?.length ?? 0) > 1 ||
                               (criteria.originCountry?.length ?? 0) > 1;
    const hasMultipleDestinations = (criteria.destinationRegion?.length ?? 0) > 1 ||
                                    (criteria.destinationCountry?.length ?? 0) > 1;
   
    if (hasMultipleOrigins || hasMultipleDestinations) {
      return true; // Complex routing suggests 4PL management
    }
   
    // 5. Default behavior - DISABLED by default for proper validation
    // Field is only enabled when 4PL indicators are detected
    // In production, this would be based on:
    //    - User role/permissions
    //    - Company configuration  
    //    - API response indicating shipment type
    return false; // More restrictive default - only enable when 4PL is detected
  });
 
  // Active filters
  hasActiveFilters = computed(() => {
    const c = this.filterCriteria();
    return Object.keys(c).some(k => {
      const v = (c as any)[k];
      return Array.isArray(v) ? v.length > 0 : !!v;
    });
  });
 
  // Check if any filter criteria exists (even if just one field)
  hasAnyFilterData = computed(() => {
    const c = this.filterCriteria();
    return Object.keys(c).some(k => {
      const v = (c as any)[k];
      return Array.isArray(v) ? v.length > 0 : (v !== undefined && v !== null && v !== '');
    });
  });
 
  canSaveFilter = computed(() => this.hasAnyFilterData() && this.saveFilterName().trim().length > 0);
 
  ngOnInit() {
    this.seedMockData();
    this.loadSavedFilters();
  }
 
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCompany']) {
      this.onCompanyChanged(this.selectedCompany);
    }
  }
 
  // Drawer open
  showFilterPanel() { this.visible.set(true); }
 
  // SAVE current
showSaveFilterDialog() {
  // Close saved filters dialog if it's open
  if (this.showSavedFiltersDialog()) {
    this.showSavedFiltersDialog.set(false);
  }
  
  this.showSaveDialog.set(true);
  this.saveFilterName.set('');
}

cancelSaveFilter() {
  this.showSaveDialog.set(false);
  this.saveFilterName.set('');
} 
saveCurrentFilter() {
  const name = this.saveFilterName().trim();
  if (!name) {
    this.toast.add({ severity: 'warn', summary: 'Invalid Name', detail: 'Please enter a valid filter name' });
    return;
  }
 
  if (!this.hasAnyFilterData()) {
    this.toast.add({ severity: 'warn', summary: 'No Filter Data', detail: 'Please select at least one filter criteria before saving' });
    return;
  }
 
  // Check if name already exists
  const existingFilter = this.savedFilters().find(f => f.name.toLowerCase() === name.toLowerCase());
  if (existingFilter) {
    this.toast.add({ severity: 'warn', summary: 'Duplicate Name', detail: 'A filter with this name already exists' });
    return;
  }

  const currentCriteria = this.filterCriteria();
  const finalOutput = this.generateFilterOutput(currentCriteria);
 
  const newFilter: SavedFilter = {
    id: cryptoRandomId(),
    name,
    criteria: { ...currentCriteria },
    createdDate: new Date()
  };
 
  this.savedFilters.update(list => [...list, newFilter]);
  this.persistSaved();
 
  // Log the comprehensive filter output for debugging/API integration
  console.log('Saved Filter Output:', finalOutput);
 
  this.toast.add({
    severity: 'success',
    summary: 'Filter Saved',
    detail: `Filter '${name}' saved successfully with ${finalOutput.totalSelectedItems} items`
  });
  
  // Close save dialog and clear form
  this.showSaveDialog.set(false);
  this.saveFilterName.set('');
}

//Close all dialog
closeAllDialogs() {
  this.showSaveDialog.set(false);
  this.showSavedFiltersDialog.set(false);
  this.saveFilterName.set('');
}
 
  /**
   * Generates a comprehensive output of all selected filter data
   * This creates the final data structure for API calls or data export
   * @param criteria - The filter criteria to process
   * @returns Comprehensive filter output with all selected data
   */
  generateFilterOutput(criteria: FilterCriteria = this.filterCriteria()) {
    const output = {
      // Timestamp and metadata
      timestamp: new Date().toISOString(),
      hasData: this.hasAnyFilterData(),
      totalSelectedItems: 0,
     
      // Single selection fields
      shipmentStatus: criteria.shipmentStatus || null,
      hazardousMaterial: criteria.hazardousMaterial || null,
     
      // Multi-selection fields with counts
      modeOfTransport: {
        selected: criteria.modeOfTransport || [],
        count: (criteria.modeOfTransport || []).length,
        values: (criteria.modeOfTransport || []).join(', ') || null
      },
     
      cargoType: {
        selected: criteria.cargoType || [],
        count: (criteria.cargoType || []).length,
        values: (criteria.cargoType || []).join(', ') || null
      },
     
      // Complex object arrays with detailed info
      customerServiceRep: {
        selected: criteria.customerServiceRep || [],
        count: (criteria.customerServiceRep || []).length,
        labels: (criteria.customerServiceRep || []).map(item => item.label),
        values: (criteria.customerServiceRep || []).map(item => item.value),
        displayText: (criteria.customerServiceRep || []).map(item => item.label).join(', ') || null
      },
     
      lspName: {
        selected: criteria.lspName || [],
        count: (criteria.lspName || []).length,
        labels: (criteria.lspName || []).map(item => item.label),
        values: (criteria.lspName || []).map(item => item.value),
        displayText: (criteria.lspName || []).map(item => item.label).join(', ') || null
      },
     
      // Geographic filters
      origin: {
        regions: {
          selected: criteria.originRegion || [],
          count: (criteria.originRegion || []).length,
          labels: (criteria.originRegion || []).map(item => item.label),
          values: (criteria.originRegion || []).map(item => item.value),
          displayText: (criteria.originRegion || []).map(item => item.label).join(', ') || null
        },
        countries: {
          selected: criteria.originCountry || [],
          count: (criteria.originCountry || []).length,
          labels: (criteria.originCountry || []).map(item => item.label),
          values: (criteria.originCountry || []).map(item => item.value),
          displayText: (criteria.originCountry || []).map(item => item.label).join(', ') || null
        },
        ports: {
          selected: criteria.originPort || [],
          count: (criteria.originPort || []).length,
          labels: (criteria.originPort || []).map(item => item.label),
          values: (criteria.originPort || []).map(item => item.value),
          codes: (criteria.originPort || []).map(item => item.code).filter(Boolean),
          displayText: (criteria.originPort || []).map(item => item.label).join(', ') || null
        }
      },
     
      destination: {
        regions: {
          selected: criteria.destinationRegion || [],
          count: (criteria.destinationRegion || []).length,
          labels: (criteria.destinationRegion || []).map(item => item.label),
          values: (criteria.destinationRegion || []).map(item => item.value),
          displayText: (criteria.destinationRegion || []).map(item => item.label).join(', ') || null
        },
        countries: {
          selected: criteria.destinationCountry || [],
          count: (criteria.destinationCountry || []).length,
          labels: (criteria.destinationCountry || []).map(item => item.label),
          values: (criteria.destinationCountry || []).map(item => item.value),
          displayText: (criteria.destinationCountry || []).map(item => item.label).join(', ') || null
        },
        ports: {
          selected: criteria.destinationPort || [],
          count: (criteria.destinationPort || []).length,
          labels: (criteria.destinationPort || []).map(item => item.label),
          values: (criteria.destinationPort || []).map(item => item.value),
          codes: (criteria.destinationPort || []).map(item => item.code).filter(Boolean),
          displayText: (criteria.destinationPort || []).map(item => item.label).join(', ') || null
        }
      },
     
      // Place of Receipt/Delivery
      placeOfReceipt: {
        selected: criteria.placeOfReceipt || [],
        count: (criteria.placeOfReceipt || []).length,
        labels: (criteria.placeOfReceipt || []).map(item => item.label),
        values: (criteria.placeOfReceipt || []).map(item => item.value),
        codes: (criteria.placeOfReceipt || []).map(item => item.code).filter(Boolean),
        displayText: (criteria.placeOfReceipt || []).map(item => item.label).join(', ') || null
      },
     
      placeOfDelivery: {
        selected: criteria.placeOfDelivery || [],
        count: (criteria.placeOfDelivery || []).length,
        labels: (criteria.placeOfDelivery || []).map(item => item.label),
        values: (criteria.placeOfDelivery || []).map(item => item.value),
        codes: (criteria.placeOfDelivery || []).map(item => item.code).filter(Boolean),
        displayText: (criteria.placeOfDelivery || []).map(item => item.label).join(', ') || null
      },
     
      // Transport details
      carrier: {
        selected: criteria.carrier || [],
        count: (criteria.carrier || []).length,
        labels: (criteria.carrier || []).map(item => item.label),
        values: (criteria.carrier || []).map(item => item.value),
        displayText: (criteria.carrier || []).map(item => item.label).join(', ') || null
      },
     
      vesselName: {
        selected: criteria.vesselName || [],
        count: (criteria.vesselName || []).length,
        labels: (criteria.vesselName || []).map(item => item.label),
        values: (criteria.vesselName || []).map(item => item.value),
        displayText: (criteria.vesselName || []).map(item => item.label).join(', ') || null
      },
     
      flightNumber: {
        selected: criteria.flightNumber || [],
        count: (criteria.flightNumber || []).length,
        labels: (criteria.flightNumber || []).map(item => item.label),
        values: (criteria.flightNumber || []).map(item => item.value),
        displayText: (criteria.flightNumber || []).map(item => item.label).join(', ') || null
      }
    };
   
    // Calculate total selected items
    output.totalSelectedItems =
      output.modeOfTransport.count +
      output.cargoType.count +
      output.customerServiceRep.count +
      output.lspName.count +
      output.origin.regions.count +
      output.origin.countries.count +
      output.origin.ports.count +
      output.destination.regions.count +
      output.destination.countries.count +
      output.destination.ports.count +
      output.placeOfReceipt.count +
      output.placeOfDelivery.count +
      output.carrier.count +
      output.vesselName.count +
      output.flightNumber.count +
      (output.shipmentStatus ? 1 : 0) +
      (output.hazardousMaterial ? 1 : 0);
   
    return output;
  }
 
  // SETTINGS (list/edit/delete)
 toggleSavedFilters() {
  // Close save dialog if it's open
  if (this.showSaveDialog()) {
    this.showSaveDialog.set(false);
    this.saveFilterName.set('');
  }
  
  // Toggle saved filters dialog
  this.showSavedFiltersDialog.set(!this.showSavedFiltersDialog());
}
 
showSavedFilters() {
  // Close save dialog if it's open
  if (this.showSaveDialog()) {
    this.showSaveDialog.set(false);
    this.saveFilterName.set('');
  }
  
  this.showSavedFiltersDialog.set(true);
}
 
  editSavedFilter(f: SavedFilter) {
    this.filterCriteria.set({ ...f.criteria });
    this.saveFilterName.set(f.name);
    this.showSaveDialog.set(true);
  }
 
  confirmDelete(f: SavedFilter) {
    this.confirm.confirm({
      message: `Delete saved filter '${f.name}'?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.savedFilters.update(list => list.filter(x => x.id !== f.id));
        this.persistSaved();
        this.toast.add({ severity: 'info', summary: 'Filter Deleted', detail: `Filter '${f.name}' has been deleted successfully` });
      }
    });
  }
 
  applySavedFilter(f: SavedFilter) {
    // Set the currently applied saved filter ID
    this.currentlyAppliedSavedFilterId.set(f.id);
    
    // Apply the saved filter criteria
    this.filterCriteria.set({ ...f.criteria });
    const output = this.generateFilterOutput(f.criteria);
   
    // Log the loaded filter output for debugging
    console.log('Loaded Filter Output:', output);
   
    this.toast.add({
      severity: 'success',
      summary: 'Filter Loaded',
      detail: `Filter '${f.name}' loaded with ${output.totalSelectedItems} items`
    });
   
    // Close the saved filters dialog
    this.showSavedFiltersDialog.set(false);
    
    this.applyFilters();
  }
 
  /**
   * Gets the current filter output without saving
   * Useful for real-time API calls or data export
   */
  getCurrentFilterOutput() {
    return this.generateFilterOutput();
  }
 
  /**
   * Exports current filter data as JSON
   * Useful for debugging or external integrations
   */
  exportCurrentFilterData() {
    const output = this.generateFilterOutput();
    const jsonString = JSON.stringify(output, null, 2);
    console.log('Current Filter Export:', jsonString);
    return jsonString;
  }
 
  private validateSavedFilterState() {
    const savedFilterId = this.currentlyAppliedSavedFilterId();
    if (!savedFilterId) return;

    const savedFilter = this.savedFilters().find(f => f.id === savedFilterId);
    if (!savedFilter) {
      this.currentlyAppliedSavedFilterId.set(null);
      return;
    }
     const currentCriteria = this.filterCriteria();
    const savedCriteria = savedFilter.criteria;

    // Deep comparison of filter criteria
    if (!this.areFilterCriteriaEqual(currentCriteria, savedCriteria)) {
      this.currentlyAppliedSavedFilterId.set(null);
    }
  }

  private areFilterCriteriaEqual(criteria1: FilterCriteria, criteria2: FilterCriteria): boolean {
    // Helper function to compare arrays
    const arraysEqual = (a: any[], b: any[]) => {
      if (a.length !== b.length) return false;
      return a.every((val, index) => {
        if (typeof val === 'object' && val !== null) {
          return JSON.stringify(val) === JSON.stringify(b[index]);
        }
        return val === b[index];
      });
    };

    // Compare each property
    const keys = new Set([...Object.keys(criteria1), ...Object.keys(criteria2)]);
    
    for (const key of keys) {
      const val1 = (criteria1 as any)[key];
      const val2 = (criteria2 as any)[key];

      if (Array.isArray(val1) && Array.isArray(val2)) {
        if (!arraysEqual(val1, val2)) return false;
      } else if (val1 !== val2) {
        return false;
      }
    }

    return true;
  }

  private clearSavedFilterState() {
    this.currentlyAppliedSavedFilterId.set(null);
  }
  // Apply / Clear
   applyFilters() {
    const criteria = this.filterCriteria();
    const comprehensiveOutput = this.generateFilterOutput(criteria);
    
    // Check if the current criteria still matches the applied saved filter
    if (this.currentlyAppliedSavedFilterId()) {
      this.validateSavedFilterState();
    }
   
    // Emit both the basic criteria and comprehensive output
    this.filtersApplied.emit(criteria);
    this.filterOutputGenerated.emit(comprehensiveOutput);
   
    this.toast.add({
      severity: 'success',
      summary: 'Filters Applied',
      detail: `Filters applied with ${comprehensiveOutput.totalSelectedItems} selected items`
    });
    this.closePanel();
  }

  
  clearFilters() {
    // Clear the currently applied saved filter ID
    this.currentlyAppliedSavedFilterId.set(null);
    
    this.filterCriteria.set({});
    this.filtersClear.emit();
    this.toast.add({ severity: 'info', summary: 'Filters Cleared', detail: 'All filters have been cleared' });
  }
closePanel() {
  this.visible.set(false);
  // Close any open dialogs when panel closes
  this.closeAllDialogs();
} 
  // Updates (domino clears + prune invalid selections)
updateShipmentStatus(v: string) { 
    this.filterCriteria.update(c => ({ ...c, shipmentStatus: v }));
    // Clear saved filter state since user is manually changing filters
    if (this.currentlyAppliedSavedFilterId()) {
      this.validateSavedFilterState();
    }
  }
    updateModeOfTransport(v: string[]) { this.filterCriteria.update(c => ({ ...c, modeOfTransport: v })); }
  updateCustomerServiceRep(v: FilterOption[]) { this.filterCriteria.update(c => ({ ...c, customerServiceRep: v })); }
  updateLspName(v: FilterOption[]) { this.filterCriteria.update(c => ({ ...c, lspName: v })); }
 
  updateOriginRegion(v: FilterOption[]) {
    this.filterCriteria.update(c => ({ ...c, originRegion: v, originCountry: [], originPort: [] }));
  }
  updateOriginCountry(v: FilterOption[]) {
    this.filterCriteria.update(c => {
      const newPorts = (c.originPort ?? []).filter(p => this.isPortInCountries(p.value, v.map(x => x.value)));
      return { ...c, originCountry: v, originPort: newPorts };
    });
  }
  updateOriginPort(v: FilterOption[]) { this.filterCriteria.update(c => ({ ...c, originPort: v })); }
  updatePlaceOfReceipt(v: FilterOption[]) { this.filterCriteria.update(c => ({ ...c, placeOfReceipt: v })); }
 
  updateDestinationRegion(v: FilterOption[]) {
    this.filterCriteria.update(c => ({ ...c, destinationRegion: v, destinationCountry: [], destinationPort: [] }));
  }
  updateDestinationCountry(v: FilterOption[]) {
    this.filterCriteria.update(c => {
      const newPorts = (c.destinationPort ?? []).filter(p => this.isPortInCountries(p.value, v.map(x => x.value)));
      return { ...c, destinationCountry: v, destinationPort: newPorts };
    });
  }
  updateDestinationPort(v: FilterOption[]) { this.filterCriteria.update(c => ({ ...c, destinationPort: v })); }
  updatePlaceOfDelivery(v: FilterOption[]) { this.filterCriteria.update(c => ({ ...c, placeOfDelivery: v })); }
 
  updateCarrier(v: FilterOption[]) { this.filterCriteria.update(c => ({ ...c, carrier: v })); }
  updateVesselName(v: FilterOption[]) { this.filterCriteria.update(c => ({ ...c, vesselName: v })); }
  updateFlightNumber(v: FilterOption[]) { this.filterCriteria.update(c => ({ ...c, flightNumber: v })); }
  updateCargoType(v: string[]) { this.filterCriteria.update(c => ({ ...c, cargoType: v })); }
  updateHazardousMaterial(v: string) { this.filterCriteria.update(c => ({ ...c, hazardousMaterial: v })); }
 
  // CSR selection helpers
  removeCSRSelection(option: FilterOption): void {
    const current = this.filterCriteria().customerServiceRep || [];
    const updated = current.filter(item => item.value !== option.value);
    this.updateCustomerServiceRep(updated);
  }
 
  getSelectedCSRText(): string {
    const selected = this.filterCriteria().customerServiceRep || [];
    return selected.map(item => item.label).join(', ');
  }
 
  // LSP selection helpers
  removeLSPSelection(option: FilterOption): void {
    const current = this.filterCriteria().lspName || [];
    const updated = current.filter(item => item.value !== option.value);
    this.updateLspName(updated);
  }
 
  getSelectedLSPText(): string {
    const selected = this.filterCriteria().lspName || [];
    return selected.map(item => item.label).join(', ');
  }
 
  // Auto-complete completeMethods (simple client-side filtering)
  filterCustomerServiceRep(e: any) {
    const query = (e.query || '').toLowerCase().trim();
    if (query.length < 3) {
      this.csrSuggestions = [];
      return;
    }
   
    try {
      this.csrSuggestions = this.csrAll.filter(csr => {
        if (!csr || !csr.label) return false;
        return csr.label.toLowerCase().includes(query);
      }).slice(0, 10); // Limit to 10 results to prevent performance issues
    } catch (error) {
      console.error('Error filtering CSR suggestions:', error);
      this.csrSuggestions = [];
    }
  }
  completeLSP(e: any) { this.lspSuggestions = filterByQuery(this.lspAll, e.query); }
  filterLspName(e: any) {
    const query = (e.query || '').toLowerCase().trim();
    if (query.length < 3) {
      this.lspSuggestions = [];
      return;
    }
   
    try {
      this.lspSuggestions = this.lspAll.filter(lsp => {
        if (!lsp || !lsp.label) return false;
        return lsp.label.toLowerCase().includes(query);
      }).slice(0, 10); // Limit to 10 results to prevent performance issues
    } catch (error) {
      console.error('Error filtering LSP suggestions:', error);
      this.lspSuggestions = [];
    }
  }
  completeOriginPort(e: any) { this.originPortSuggestions = filterByQuery(this.filteredOriginPorts(), e.query); }
  completeDestinationPort(e: any) { this.destinationPortSuggestions = filterByQuery(this.filteredDestinationPorts(), e.query); }
  completePoR(e: any) { this.porSuggestions = filterByQuery(this.porAll, e.query); }
  completePoD(e: any) { this.podSuggestions = filterByQuery(this.podAll, e.query); }
  completeVessel(e: any) { this.vesselSuggestions = filterByQuery(this.vesselAll, e.query); }
  completeFlight(e: any) { this.flightSuggestions = filterByQuery(this.flightAll, e.query); }
 
  // Company-driven refresh (top-level domino)
  private onCompanyChanged(company: string | null) {
    // In real app: call backend with company to fetch scoped lookups.
    // Here: re-seed mocks and clear dependent fields.
    this.seedMockData(company || undefined);
   
    // Clear all dependent filter selections
    this.filterCriteria.update(c => ({
      ...c,
      customerServiceRep: [],
      lspName: [], // Always clear LSP when company changes
      carrier: [],
      flightNumber: [],
      vesselName: [],
      originPort: [],
      destinationPort: [],
      placeOfReceipt: [],
      placeOfDelivery: []
    }));
   
    // If the new company doesn't support 4PL, ensure LSP field is cleared
    // This will be reactive due to the computed signal
    if (company && !this.is4PLCompany(company)) {
      this.filterCriteria.update(c => ({ ...c, lspName: [] }));
    }
  }
 
  // Helper method to determine if company supports 4PL operations
  private is4PLCompany(company: string): boolean {
    const companyName = company.toLowerCase();
    return companyName.includes('4pl') ||
           companyName.includes('fourth party') ||
           companyName.includes('logistics service provider');
  }
 
  // Data relationships (mock)
  private isCountryInRegions(countryCode: string, regionCodes: string[]): boolean {
    const regionMap: Record<string, string[]> = {
      na: ['us', 'ca', 'mx'],
      eu: ['de', 'gb', 'fr', 'it'],
      apac: ['cn', 'jp', 'kr', 'in'],
      me: ['ae', 'sa', 'qa'],
      latam: ['br', 'ar', 'cl', 'pe'],
      africa: ['za', 'ng', 'eg', 'ma']
    };
    return regionCodes.some(r => regionMap[r]?.includes(countryCode));
  }

  // Currently applied saved filter ID (for UI highlighting)
    private currentlyAppliedSavedFilterId = signal<string | null>(null);

  hasSavedFiltersApplied(): boolean {
    return this.currentlyAppliedSavedFilterId() !== null;
  }

  private isPortInCountries(portCode: string, countryCodes: string[]): boolean {
    const map: Record<string, string[]> = {
      us: ['lax', 'jfk', 'ord', 'mia', 'lgb'],
      ca: ['yyz', 'yvr'],
      mx: ['mex'],
      de: ['ham', 'bre', 'fra'],
      gb: ['lhr', 'lgw'],
      fr: ['cdg'],
      it: ['mxp'],
      cn: ['pvg', 'pek', 'can'],
      hk: ['hkg'],
      jp: ['nrt', 'kix'],
      kr: ['icn'],
      in: ['bom'],
      sg: ['sin'],
      ae: ['dxb', 'auh'],
      qa: ['doh']
    };
    return countryCodes.some(cc => map[cc]?.includes(portCode));
  }
 
  // Persistence
  private loadSavedFilters() {
    const raw = localStorage.getItem('savedFilters');
    if (raw) this.savedFilters.set(JSON.parse(raw));
  }
  private persistSaved() {
    localStorage.setItem('savedFilters', JSON.stringify(this.savedFilters()));
  }
 
  // Mock data (replace with API wiring)
  private seedMockData(company?: string) {
    // Customer Service Representatives - Enhanced mock data
    // TODO: Replace with actual API call - getCustomerServiceRepresentatives(company)
    this.csrAll = this.generateMockCSRData(company);
   
    this.lspAll = [
      { label: 'DHL Supply Chain', value: 'dhl' },
      { label: 'FedEx Logistics', value: 'fedex' },
      { label: 'UPS Supply Chain', value: 'ups' },
      { label: 'DB Schenker', value: 'schenker' },
      { label: 'C.H. Robinson', value: 'chr' },
      { label: 'Expeditors', value: 'expeditors' }
    ];
   
    // ... rest of existing code ...
   
    this.regionAll = [
      { label: 'North America', value: 'na' },
      { label: 'Europe', value: 'eu' },
      { label: 'Asia Pacific', value: 'apac' },
      { label: 'Middle East', value: 'me' },
      { label: 'Latin America', value: 'latam' },
      { label: 'Africa', value: 'africa' }
    ];
   
    this.countryAll = [
      // North America
      { label: 'United States', value: 'us' },
      { label: 'Canada', value: 'ca' },
      { label: 'Mexico', value: 'mx' },
     
      // Europe
      { label: 'Germany', value: 'de' },
      { label: 'United Kingdom', value: 'gb' },
      { label: 'France', value: 'fr' },
      { label: 'Italy', value: 'it' },
     
      // Asia Pacific
      { label: 'China', value: 'cn' },
      { label: 'Japan', value: 'jp' },
      { label: 'South Korea', value: 'kr' },
      { label: 'India', value: 'in' },
     
      // Middle East
      { label: 'United Arab Emirates', value: 'ae' },
      { label: 'Saudi Arabia', value: 'sa' },
      { label: 'Qatar', value: 'qa' },
     
      // Latin America
      { label: 'Brazil', value: 'br' },
      { label: 'Argentina', value: 'ar' },
      { label: 'Chile', value: 'cl' },
      { label: 'Peru', value: 'pe' },
     
      // Africa
      { label: 'South Africa', value: 'za' },
      { label: 'Nigeria', value: 'ng' },
      { label: 'Egypt', value: 'eg' },
      { label: 'Morocco', value: 'ma' }
    ];
   
    // Ports with IATA codes as specified in requirements
    this.portAll = [
      // North America
      { label: 'Los Angeles (LAX)', value: 'lax', code: 'LAX' },
      { label: 'New York (JFK)', value: 'jfk', code: 'JFK' },
      { label: 'Chicago (ORD)', value: 'ord', code: 'ORD' },
      { label: 'Miami (MIA)', value: 'mia', code: 'MIA' },
      { label: 'Long Beach (LGB)', value: 'lgb', code: 'LGB' },
      { label: 'Toronto (YYZ)', value: 'yyz', code: 'YYZ' },
      { label: 'Vancouver (YVR)', value: 'yvr', code: 'YVR' },
     
      // Europe
      { label: 'Hamburg (HAM)', value: 'ham', code: 'HAM' },
      { label: 'Bremen (BRE)', value: 'bre', code: 'BRE' },
      { label: 'Rotterdam (RTM)', value: 'rtm', code: 'RTM' },
      { label: 'London Heathrow (LHR)', value: 'lhr', code: 'LHR' },
      { label: 'London Gatwick (LGW)', value: 'lgw', code: 'LGW' },
      { label: 'Frankfurt (FRA)', value: 'fra', code: 'FRA' },
      { label: 'Paris (CDG)', value: 'cdg', code: 'CDG' },
     
      // Asia Pacific
      { label: 'Shanghai Pudong (PVG)', value: 'pvg', code: 'PVG' },
      { label: 'Beijing Capital (PEK)', value: 'pek', code: 'PEK' },
      { label: 'Guangzhou (CAN)', value: 'can', code: 'CAN' },
      { label: 'Hong Kong (HKG)', value: 'hkg', code: 'HKG' },
      { label: 'Tokyo Narita (NRT)', value: 'nrt', code: 'NRT' },
      { label: 'Osaka Kansai (KIX)', value: 'kix', code: 'KIX' },
      { label: 'Seoul Incheon (ICN)', value: 'icn', code: 'ICN' },
      { label: 'Singapore (SIN)', value: 'sin', code: 'SIN' },
      { label: 'Mumbai (BOM)', value: 'bom', code: 'BOM' },
     
      // Middle East
      { label: 'Dubai (DXB)', value: 'dxb', code: 'DXB' },
      { label: 'Abu Dhabi (AUH)', value: 'auh', code: 'AUH' },
      { label: 'Doha (DOH)', value: 'doh', code: 'DOH' }
    ];
   
    // Use ports for place of receipt and delivery
    this.porAll = [...this.portAll];
    this.podAll = [...this.portAll];
   
    this.carrierAll = [
      // Ocean carriers
      { label: 'Maersk Line', value: 'maersk' },
      { label: 'Mediterranean Shipping Company (MSC)', value: 'msc' },
      { label: 'CMA CGM', value: 'cmacgm' },
      { label: 'COSCO Shipping', value: 'cosco' },
      { label: 'Hapag-Lloyd', value: 'hapag' },
      { label: 'ONE (Ocean Network Express)', value: 'one' },
     
      // Air carriers
      { label: 'Lufthansa Cargo', value: 'lufthansa' },
      { label: 'Emirates SkyCargo', value: 'emirates' },
      { label: 'FedEx Express', value: 'fedex' },
      { label: 'UPS Airlines', value: 'ups' },
      { label: 'DHL Aviation', value: 'dhl' },
      { label: 'Qatar Airways Cargo', value: 'qatar' }
    ];
   
    this.vesselAll = [
      { label: 'MSC Gulsun', value: 'msc-gulsun' },
      { label: 'Ever Ace', value: 'ever-ace' },
      { label: 'HMM Algeciras', value: 'hmm-algeciras' },
      { label: 'OOCL Hong Kong', value: 'oocl-hong-kong' },
      { label: 'Madrid Maersk', value: 'madrid-maersk' },
      { label: 'CMA CGM Antoine De Saint Exupery', value: 'cma-cgm-antoine' }
    ];
   
    this.flightAll = [
      { label: 'LH441 (Lufthansa)', value: 'lh441' },
      { label: 'EK201 (Emirates)', value: 'ek201' },
      { label: 'QR8141 (Qatar Airways)', value: 'qr8141' },
      { label: 'FX5023 (FedEx)', value: 'fx5023' },
      { label: 'UPS902 (UPS)', value: 'ups902' },
      { label: 'DHL611 (DHL)', value: 'dhl611' },
      { label: 'AF447 (Air France)', value: 'af447' },
      { label: 'BA100 (British Airways)', value: 'ba100' }
    ];
  }
 
  /**
   * Generates mock Customer Service Representative data
   * TODO: Replace this with actual API service call
   * @param company - Optional company filter to scope CSRs
   * @returns Array of FilterOption representing CSRs
   */
  private generateMockCSRData(company?: string): FilterOption[] {
    // Base CSR data - can be extended or filtered by company
    const allCSRs: FilterOption[] = [
      // Senior CSRs
      { label: 'John Smith - Senior CSR', value: 'john.smith' },
      { label: 'Sarah Johnson - Team Lead', value: 'sarah.johnson' },
      { label: 'Michael Chen - Regional Manager', value: 'michael.chen' },
      { label: 'Emily Davis - Account Manager', value: 'emily.davis' },
     
      // Regular CSRs
      { label: 'Robert Wilson', value: 'robert.wilson' },
      { label: 'Lisa Anderson', value: 'lisa.anderson' },
      { label: 'James Rodriguez', value: 'james.rodriguez' },
      { label: 'Maria Garcia', value: 'maria.garcia' },
      { label: 'David Thompson', value: 'david.thompson' },
      { label: 'Jennifer Lee', value: 'jennifer.lee' },
     
      // Specialized CSRs
      { label: 'Alex Kumar - Air Freight Specialist', value: 'alex.kumar' },
      { label: 'Rachel O\'Connor - Ocean Freight Expert', value: 'rachel.oconnor' },
      { label: 'Tom Zhang - Customs Specialist', value: 'tom.zhang' },
      { label: 'Sophie Martin - Dangerous Goods Expert', value: 'sophie.martin' },
      { label: 'Carlos Mendoza - Latin America Specialist', value: 'carlos.mendoza' },
     
      // International CSRs
      { label: 'Hiroshi Tanaka - APAC Region', value: 'hiroshi.tanaka' },
      { label: 'Anna Müller - EMEA Region', value: 'anna.mueller' },
      { label: 'Pierre Dubois - Europe Specialist', value: 'pierre.dubois' },
      { label: 'Priya Sharma - India Operations', value: 'priya.sharma' },
      { label: 'Mohammed Al-Rashid - Middle East', value: 'mohammed.alrashid' }
    ];
   
    // If company is specified, you can filter CSRs specific to that company
    if (company) {
      // Example: Filter CSRs based on company
      // In real implementation, this would be handled by the API
      switch (company.toLowerCase()) {
        case 'company-a':
          return allCSRs.filter(csr =>
            ['john.smith', 'sarah.johnson', 'michael.chen', 'alex.kumar', 'rachel.oconnor']
              .includes(csr.value)
          );
        case 'company-b':
          return allCSRs.filter(csr =>
            ['emily.davis', 'robert.wilson', 'lisa.anderson', 'tom.zhang', 'sophie.martin']
              .includes(csr.value)
          );
        default:
          return allCSRs;
      }
    }
   
    return allCSRs;
  }
}
 
/* helpers */
function filterByQuery(list: FilterOption[] | SelectItem[], q: string): any[] {
  const query = (q ?? '').toLowerCase();
  return (list ?? []).filter((o: any) => (o.label || '').toLowerCase().includes(query));
}
function cryptoRandomId(): string {
  try { return crypto.getRandomValues(new Uint32Array(1))[0].toString(36); }
  catch { return Math.random().toString(36).slice(2); }
}