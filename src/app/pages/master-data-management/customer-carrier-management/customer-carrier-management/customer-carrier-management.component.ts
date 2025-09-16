import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrimengModule } from '../../../../shared/primeng/primeng.module';
import { CommonTableSearchComponent } from '../../../../shared/component/table-search/common-table-search.component';
import { FilterService } from 'primeng/api';
import { Table } from 'primeng/table';
import { CommonTableFilterComponent } from '../../../../shared/component/common-table-filter/common-table-filter.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOMER_CARRIER_TABLE_HEADERS, TableHeaders } from '../../../../shared/lib/constants';
import { ToastComponent } from '../../../../shared/component/toast-component/toast.component';


interface CarrierTableColumn {
  field: string;
  header: string;
  sortable: boolean;
  filter: boolean;
  type: 'text' | 'date' | 'multiselect';
}

interface CarrierConfigItem {
  carrierScac: string;
  carrierName?: string;
  carrierProvider: string;
  modeOfTransport: string; // 'Ocean', 'Air', 'Rail', 'Road', 'Ocean, Air', 'All'
  isEnabled: boolean;
  onboardedOn: string;
  updatedOn?: string;
  updatedBy?: string;
  isNewlyBoardedCarrier?: boolean;
}

interface CustomerCarrierInfo {
  customerName: string;
  customerCode: number;
  subscriptionType: 'premium' | 'standard'; // Only premium customers should show
  totalCarriersSubscribed: number;
  containerCallingEnabled: boolean;
  totalActiveShipments?: number;
  totalInactiveShipments?: number;
  totalDocumentOnlyShipments?: number;
  totalExceptionShipments?: number;
  totalOceanCarriers?: number;
  totalAirCarriers?: number;
  totalRailCarriers?: number;
  totalRoadCarriers?: number;
  setsEnabledDate?: string;
  petaEnabledDate?: string;
  petdEnabledDate?: string;
  petlEnabledDate?: string;
  customerOnboardedOn?: string;
}

interface ExpandedCustomer extends CustomerCarrierInfo {
  expanded?: boolean;
  activeTabIndex?: number;
  carrierConfig?: CarrierConfigItem[];
  customerInfo?: any;
  selectedCarriers?: CarrierConfigItem[];
  prevSelectedCarriers?: CarrierConfigItem[];
  carrierFilterText?: string;
}

@Component({
  selector: 'app-customer-carrier-management',
  imports: [PrimengModule, CommonTableSearchComponent, FormsModule, TranslateModule, CommonTableFilterComponent, ToastComponent],
  templateUrl: './customer-carrier-management.component.html',
  styleUrl: './customer-carrier-management.component.scss',
  providers: [FilterService]
})
export class CustomerCarrierManagementComponent implements OnInit {
  @ViewChild('customerList') customerList: DataView | undefined;
  @ViewChild('carrierTable') carrierTable: Table | undefined;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

  private filterService = inject(FilterService);
  private translateService = inject(TranslateService);

  // Table configuration for carrier table using translated headers
  carrierTableHeaders: TableHeaders[] = CUSTOMER_CARRIER_TABLE_HEADERS;

  // Search term for global filter
  searchTerm: string = '';

  // Table sorting
  carrierSortField: string = 'isEnabled';
  carrierSortOrder: number = -1; // -1 for descending (enabled first)

  // DataView properties
  layout: 'list' | 'grid' = 'list';
  sortField: string = 'customerName';
  sortOrder: number = 1;
  emptyMessage: string = 'No customers found';
  showInfoMessage: boolean = true;

  // Pagination properties
  pageSize: number = 10;
  first: number = 0;
  expandedCustomer: ExpandedCustomer | null = null;

  // --- paging state for Carrier Config tab ---
  carrierPageSize = 10;
  carrierFirst = 0;

  // backing lists (initialized after carrierList)
  filteredCarriers: CarrierConfigItem[] = [];
  get pagedCarriers() {
    const start = this.carrierFirst;
    const end = this.carrierFirst + this.carrierPageSize;
    return this.filteredCarriers.slice(start, end);
  }

  // Mock carrier list for configuration

  selectedCustomer: CustomerCarrierInfo | null = null;
  activeTabIndex: number = 0;
  loading: boolean = false;
  containerCallingEnabled: boolean = false;

  ngOnInit() {
    // Initialize filtered carriers
    this.filteredCarriers = [...this.carrierList];

    this.loadCustomers();
    // Start timer to hide info message after 10 seconds
    setTimeout(() => {
      this.showInfoMessage = false;
    }, 10000);
  }

  loadCustomers() {
    this.loading = true;
    // Using only mock data
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }

  // DataView layout methods
  hideInfoMessage() {
    this.showInfoMessage = false;
  }

  // Customer expansion methods
  toggleCustomerExpansion(customer: ExpandedCustomer) {
    console.log('Toggle called with customer:', customer);

    // Close any previously expanded customer
    this.expandedCustomer = null;

    // Force change detection
    setTimeout(() => {
      // Set the expanded customer to show the modal
      this.expandedCustomer = customer;

      // Default to Carrier Config tab
      customer.activeTabIndex = 0;

      // Load carrier configuration data
      this.loadCarrierConfiguration(customer);

      // Also load customer information
      this.loadCustomerInformation(customer);

      // Initialize carrier filter for this customer
      this.filteredCarriers = [...this.carrierList];
      this.carrierFirst = 0;

      console.log('Customer expanded:', customer);
      console.log('Expanded customer set:', this.expandedCustomer);
      console.log('Active tab index (Carrier Config):', customer.activeTabIndex);
    }, 0);
  }

  closeExpandedView() {
    this.expandedCustomer = null;
  }

  // Pagination methods
  onPageChange(event: any) {
    this.first = event.first;
    this.pageSize = event.rows;
  }

  getPaginatedCustomers(): ExpandedCustomer[] {
    const filtered = this.getFilteredCustomers();
    const start = this.first;
    const end = this.first + this.pageSize;
    return filtered.slice(start, end);
  }

  loadCarrierConfiguration(customer: ExpandedCustomer) {
    // Load all available carriers for this customer
    customer.carrierConfig = this.carrierList.map(carrier => ({
      ...carrier,
      // Simulate some carriers being enabled (premium customers have carrier calling on by default)
      isEnabled: Math.random() > 0.6, // About 40% enabled for demo
      // Add updated information for enabled carriers
      updatedOn: Math.random() > 0.5 ? '2025-01-22' : carrier.onboardedOn,
      updatedBy: Math.random() > 0.5 ? 'prasad.aswale@bdpint.com' : undefined
    }));

    // Sort carriers: enabled ones first (sorted by updatedOn desc), then disabled ones
    this.sortCarriersTable(customer.carrierConfig);

    // Set initially selected carriers (those that are enabled)
    customer.selectedCarriers = customer.carrierConfig.filter(c => c.isEnabled);
    customer.prevSelectedCarriers = JSON.parse(JSON.stringify(customer.selectedCarriers));

    // Update total subscribed carriers count
    customer.totalCarriersSubscribed = customer.selectedCarriers.length;

    // Reset table filters and global filter
    this.resetTableFilters();
  }

  sortCarriersTable(carriers: CarrierConfigItem[]) {
    carriers.sort((a, b) => {
      // Primary sort: enabled status (enabled first)
      if (a.isEnabled && !b.isEnabled) return -1;
      if (!a.isEnabled && b.isEnabled) return 1;

      // Secondary sort: for enabled carriers, sort by updatedOn descending
      if (a.isEnabled && b.isEnabled) {
        return new Date(b.updatedOn || b.onboardedOn).getTime() - new Date(a.updatedOn || a.onboardedOn).getTime();
      }

      // For disabled carriers, sort by onboardedOn descending
      return new Date(b.onboardedOn).getTime() - new Date(a.onboardedOn).getTime();
    });
  }

  loadCustomerInformation(customer: ExpandedCustomer) {
    // Ensure customer information data is properly structured
    customer.customerInfo = {
      activeShipments: customer.totalActiveShipments || 0,
      setsEnable: customer.setsEnabledDate || 'yes',
      onBoardedOn: customer.customerOnboardedOn || '01 Jan 2024',
      petaEnabled: customer.petaEnabledDate || 'yes ( Every 5 days)'
    };

    // Ensure the customer has the required properties for the modal
    if (!customer.containerCallingEnabled) {
      customer.containerCallingEnabled = false;
    }

  // Do not force activeTabIndex here — keep the default (Carrier Config = 0)

    console.log('Customer info loaded:', customer.customerInfo);
  }

  // Tab change handler
  onCustomerTabChange(event: any, customer: ExpandedCustomer) {
    customer.activeTabIndex = event.index;
  }

  // Container calling toggle
  toggleContainerCalling(customer: ExpandedCustomer, isEnabled: boolean) {
    customer.containerCallingEnabled = isEnabled;

    this.toastComponent.showSuccess(
      `Container tracking has been ${isEnabled ? 'enabled' : 'disabled'} for ${customer.customerName}`,
      'Success'
    );
  }

  // Carrier filtering
  filterCarriers(customer: ExpandedCustomer, event: any) {
    customer.carrierFilterText = event.target.value;
  }

  getFilteredCarriers(customer: ExpandedCustomer): CarrierConfigItem[] {
    if (!customer.carrierConfig) return [];

    if (!customer.carrierFilterText || customer.carrierFilterText.trim() === '') {
      return customer.carrierConfig;
    }

    const filterText = customer.carrierFilterText.toLowerCase();
    return customer.carrierConfig.filter(carrier =>
      carrier.carrierName?.toLowerCase().includes(filterText) ||
      carrier.carrierScac.toLowerCase().includes(filterText) ||
      carrier.carrierProvider.toLowerCase().includes(filterText)
    );
  }

  // Carrier configuration save
  saveCarrierConfiguration(customer: ExpandedCustomer) {
    if (!customer.selectedCarriers) return;

    // Simulate API call
    this.toastComponent.showSuccess(
      `Carrier configuration for ${customer.customerName} has been saved successfully`,
      'Configuration Saved'
    );

    // Update the previous selection to current selection
    customer.prevSelectedCarriers = JSON.parse(JSON.stringify(customer.selectedCarriers));

    // Update carrier config with new selections
    if (customer.carrierConfig) {
      customer.carrierConfig.forEach(carrier => {
        carrier.isEnabled = customer.selectedCarriers!.some(selected =>
          selected.carrierScac === carrier.carrierScac
        );

        if (carrier.isEnabled) {
          carrier.updatedOn = new Date().toISOString();
          carrier.updatedBy = 'current.user@example.com'; // Replace with actual user
        }
      });
    }
  }

  isSaveDisabled(customer: ExpandedCustomer): boolean {
    if (!customer.selectedCarriers || !customer.prevSelectedCarriers) {
      return true;
    }

    // Check if there are any changes
    const currentScacs = customer.selectedCarriers.map(c => c.carrierScac).sort();
    const prevScacs = customer.prevSelectedCarriers.map(c => c.carrierScac).sort();

    return JSON.stringify(currentScacs) === JSON.stringify(prevScacs);
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.loadCustomers();
    } else {
      this.resetSearch();
    }
  }

  isSearchButtonDisabled(): boolean {
    return !this.searchTerm || this.searchTerm.trim().length === 0;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadCustomers();
  }

  resetSearch() {
    this.searchTerm = '';
    this.loadCustomers();
  }

  selectCustomer(customer: CustomerCarrierInfo) {
    this.selectedCustomer = customer;
    // Reset to first tab when selecting a new customer
    this.activeTabIndex = 0;
    // Set container calling status based on customer (mock logic)
    this.containerCallingEnabled = customer.customerCode === 419; // Example: Only DOW has it enabled
  }

  onTabChange(event: any) {
    this.activeTabIndex = event.index;
  }

  // Helper method to check if field has data
  hasData(value: any): boolean {
    return value !== null && value !== undefined && value !== '' && value !== 0;
  }

  // Helper method to format numbers with commas
  formatNumber(value: number): string {
    return value.toLocaleString();
  }

  // Calculate total carriers for a customer
  getTotalCarriers(customer: CustomerCarrierInfo): number {
    return customer.totalCarriersSubscribed;
  }

  // Get filtered customers based on search term (only premium customers)
  getFilteredCustomers(): ExpandedCustomer[] {
    // Filter to show only premium customers
    const premiumCustomers = this.customers.filter(customer => customer.subscriptionType === 'premium');

    // If no search term, return all premium customers
    const raw = (this.searchTerm || '').trim();
    if (!raw) {
      return premiumCustomers;
    }

    // Split on commas to allow multiple search terms, trim and ignore empty parts
    const terms = raw.split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(t => t.toLowerCase());

    // Match any term (OR semantics) against customerName or customerCode
    return premiumCustomers.filter(customer => {
      const name = (customer.customerName || '').toLowerCase();
      const code = customer.customerCode !== undefined && customer.customerCode !== null
        ? String(customer.customerCode).toLowerCase()
        : '';

      return terms.some(term => name.includes(term) || code.includes(term));
    });
  }

  // Carrier Config Tab Methods
  applyCarrierFilter() {
    // This method is now handled by PrimeNG table's built-in filtering
    // Just reset pagination when filter changes
    this.carrierFirst = 0;
  }

  onCarrierPageChange(e: any) {
    this.carrierFirst = e.first;
    this.carrierPageSize = e.rows;
  }

  refreshCarriers() {
    // Reset all filters and reload data
    this.resetTableFilters();
    this.searchTerm = '';

    if (this.expandedCustomer) {
      this.loadCarrierConfiguration(this.expandedCustomer);
    }

    this.carrierFirst = 0;
  }

  // Table filter methods
  resetTableFilters() {
    this.searchTerm = '';

    if (this.carrierTable) {
      this.carrierTable.clear();
    }
  }

  onGlobalFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;

    if (this.carrierTable) {
      this.carrierTable.filterGlobal(this.searchTerm, 'contains');
    }
  }

  clearGlobalFilter() {
    this.searchTerm = '';
    if (this.carrierTable) {
      this.carrierTable.filterGlobal('', 'contains');
    }
  }

  // Get filter options for multiselect columns
  getFilterOptions(field: string): any[] {
    const column = this.carrierTableHeaders.find(col => col.field === field);
    return [];
  }

  // Custom sort function for enabled status
  customSortForEnabled(event: any) {
    if (this.expandedCustomer?.carrierConfig) {
      this.expandedCustomer.carrierConfig.sort((a, b) => {
        // Always prioritize enabled carriers
        if (a.isEnabled && !b.isEnabled) return -1;
        if (!a.isEnabled && b.isEnabled) return 1;

        // Secondary sort by the selected column
        if (event.field === 'updatedOn' || event.field === 'onboardedOn') {
          const dateA = new Date((a as any)[event.field] || a.onboardedOn).getTime();
          const dateB = new Date((b as any)[event.field] || b.onboardedOn).getTime();
          return event.order === 1 ? dateA - dateB : dateB - dateA;
        }

        const valueA = (a as any)[event.field] || '';
        const valueB = (b as any)[event.field] || '';

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return event.order === 1 ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        }

        return event.order === 1 ? (valueA < valueB ? -1 : 1) : (valueA > valueB ? -1 : 1);
      });
    }
  }

  saveCarrierSelection(cust: ExpandedCustomer) {
    cust.prevSelectedCarriers = [...(cust.selectedCarriers || [])];
    // Update total subscribed carriers count
    cust.totalCarriersSubscribed = cust.selectedCarriers?.length || 0;

    // Update carrier config with new selections
    if (cust.carrierConfig) {
      cust.carrierConfig.forEach(carrier => {
        const wasEnabled = carrier.isEnabled;
        carrier.isEnabled = cust.selectedCarriers!.some(selected =>
          selected.carrierScac === carrier.carrierScac
        );

        // Update metadata if status changed
        if (carrier.isEnabled !== wasEnabled) {
          carrier.updatedOn = new Date().toISOString().split('T')[0];
          carrier.updatedBy = 'current.user@example.com'; // Replace with actual user
        }
      });

      // Re-sort the table to maintain enabled carriers at top
      this.sortCarriersTable(cust.carrierConfig);
    }

    this.toastComponent.showSuccess(
      `Carrier configuration for ${cust.customerName} has been saved successfully`,
      'Configuration Saved'
    );
  }

  // Simple customer info configuration - no caching, no complex logic
  getCustomerInfoFields(customer: ExpandedCustomer) {
    const fields: { label: string, value: string }[] = [];

    // Only show fields that have actual data - using translated labels
    if (customer.totalActiveShipments) fields.push({ label: this.translateService.instant('LBL.TOTAL_ACTIVE_SHIPMENTS_LONG'), value: customer.totalActiveShipments.toLocaleString() });
    if (customer.totalInactiveShipments) fields.push({ label: this.translateService.instant('LBL.TOTAL_INACTIVE_SHIPMENTS_LONG'), value: customer.totalInactiveShipments.toLocaleString() });
    if (customer.totalDocumentOnlyShipments) fields.push({ label: this.translateService.instant('LBL.TOTAL_DOCUMENT_ONLY_SHIPMENTS_LONG'), value: customer.totalDocumentOnlyShipments.toLocaleString() });
    if (customer.totalExceptionShipments) fields.push({ label: this.translateService.instant('LBL.TOTAL_EXCEPTION_SHIPMENTS_LONG'), value: customer.totalExceptionShipments.toLocaleString() });
    if (customer.totalOceanCarriers) fields.push({ label: this.translateService.instant('LBL.TOTAL_OCEAN_CARRIERS_LONG'), value: customer.totalOceanCarriers.toLocaleString() });
    if (customer.totalAirCarriers) fields.push({ label: this.translateService.instant('LBL.TOTAL_AIR_CARRIERS_LONG'), value: customer.totalAirCarriers.toLocaleString() });
    if (customer.totalRailCarriers) fields.push({ label: this.translateService.instant('LBL.TOTAL_RAIL_CARRIERS_LONG'), value: customer.totalRailCarriers.toLocaleString() });
    if (customer.totalRoadCarriers) fields.push({ label: this.translateService.instant('LBL.TOTAL_ROAD_CARRIERS_LONG'), value: customer.totalRoadCarriers.toLocaleString() });
    if (customer.setsEnabledDate) fields.push({ label: this.translateService.instant('LBL.SETS_ENABLED_DATE_LONG'), value: customer.setsEnabledDate });
    if (customer.petaEnabledDate) fields.push({ label: this.translateService.instant('LBL.PETA_ENABLED_DATE_LONG'), value: customer.petaEnabledDate });
    if (customer.petdEnabledDate) fields.push({ label: this.translateService.instant('LBL.PETD_ENABLED_DATE_LONG'), value: customer.petdEnabledDate });
    if (customer.petlEnabledDate) fields.push({ label: this.translateService.instant('LBL.PETL_ENABLED_DATE_LONG'), value: customer.petlEnabledDate });
    if (customer.customerOnboardedOn) fields.push({ label: this.translateService.instant('LBL.CUSTOMER_ONBOARDED_ON_LONG'), value: customer.customerOnboardedOn });
    
    return fields;
  }


    carrierList: CarrierConfigItem[] = [
    {
      carrierScac: 'MSCU',
      carrierName: 'MSC Mediterranean Shipping Company',
      carrierProvider: 'RPA',
      modeOfTransport: 'Ocean',
      isEnabled: false,
      onboardedOn: '2024-01-15',
      isNewlyBoardedCarrier: false
    },
    {
      carrierScac: 'MAEU',
      carrierName: 'Maersk Line',
      carrierProvider: 'CargoSmart',
      modeOfTransport: 'Ocean',
      isEnabled: false,
      onboardedOn: '2024-02-20',
      isNewlyBoardedCarrier: true
    },
    {
      carrierScac: 'COSU',
      carrierName: 'COSCO Shipping Lines',
      carrierProvider: 'RPA',
      modeOfTransport: 'Ocean',
      isEnabled: false,
      onboardedOn: '2024-01-10',
      isNewlyBoardedCarrier: false
    },
    {
      carrierScac: 'CMDU',
      carrierName: 'CMA CGM',
      carrierProvider: 'Ecu',
      modeOfTransport: 'Ocean',
      isEnabled: false,
      onboardedOn: '2024-03-05',
      isNewlyBoardedCarrier: false
    },
    {
      carrierScac: 'HLCU',
      carrierName: 'Hapag-Lloyd',
      carrierProvider: 'CargoSmart',
      modeOfTransport: 'Ocean',
      isEnabled: false,
      onboardedOn: '2024-02-28',
      isNewlyBoardedCarrier: true
    },
    {
      carrierScac: 'ONEY',
      carrierName: 'ONE (Ocean Network Express)',
      carrierProvider: 'RPA',
      modeOfTransport: 'Ocean',
      isEnabled: false,
      onboardedOn: '2024-01-25',
      isNewlyBoardedCarrier: false
    },
    {
      carrierScac: 'EGLV',
      carrierName: 'Evergreen Line',
      carrierProvider: 'Ecu',
      modeOfTransport: 'Ocean',
      isEnabled: false,
      onboardedOn: '2024-02-10',
      isNewlyBoardedCarrier: false
    },
    {
      carrierScac: 'YMLU',
      carrierName: 'Yang Ming Line',
      carrierProvider: 'RPA',
      modeOfTransport: 'Ocean',
      isEnabled: false,
      onboardedOn: '2024-01-30',
      isNewlyBoardedCarrier: false
    },
    {
      carrierScac: '22AA',
      carrierName: 'CargoSmart Air',
      carrierProvider: 'CargoSmart',
      modeOfTransport: 'Air',
      isEnabled: false,
      onboardedOn: '2024-03-15',
      isNewlyBoardedCarrier: false
    },
    {
      carrierScac: '11QU',
      carrierName: 'RPA Multi-Modal',
      carrierProvider: 'RPA',
      modeOfTransport: 'Ocean, Air',
      isEnabled: false,
      onboardedOn: '2024-02-05',
      isNewlyBoardedCarrier: false
    },
    {
      carrierScac: 'FR24',
      carrierName: 'FlightRadar24',
      carrierProvider: 'FR24',
      modeOfTransport: 'Air',
      isEnabled: false,
      onboardedOn: '2024-03-20',
      isNewlyBoardedCarrier: true
    },
    {
      carrierScac: 'RAIL',
      carrierName: 'Rail Carrier Provider',
      carrierProvider: 'Ecu',
      modeOfTransport: 'Rail',
      isEnabled: false,
      onboardedOn: '2024-04-01',
      isNewlyBoardedCarrier: false
    },
    {
      carrierScac: 'ROAD',
      carrierName: 'Road Transport Provider',
      carrierProvider: 'Ecu',
      modeOfTransport: 'Road',
      isEnabled: false,
      onboardedOn: '2024-04-05',
      isNewlyBoardedCarrier: false
    }
  ];

  // Mock data for demonstration - only premium customers are shown
  customers: ExpandedCustomer[] = [
    {
      customerName: 'DOW',
      customerCode: 419,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 34,
      containerCallingEnabled: true,
      totalActiveShipments: 116904,
      totalInactiveShipments: 5,
      totalDocumentOnlyShipments: 2,
      totalExceptionShipments: 2,
      totalOceanCarriers: 130,
      totalAirCarriers: 40,
      totalRailCarriers: 20,
      totalRoadCarriers: 10,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 5 days)',
      petdEnabledDate: 'yes ( Every 7 days)',
      petlEnabledDate: 'yes ( Every 3 days)',
      customerOnboardedOn: '01 Jan 2024',
      expanded: false,
      activeTabIndex: 0, // Default to Carrier Config tab
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 116904
      }
    },
    {
      customerName: 'DuPont',
      customerCode: 290,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 28,
      containerCallingEnabled: true,
      totalActiveShipments: 200,
      totalInactiveShipments: 5,
      totalDocumentOnlyShipments: 2,
      totalExceptionShipments: 2,
      totalOceanCarriers: 130,
      totalAirCarriers: 40,
      totalRailCarriers: 20,
      totalRoadCarriers: 10,
      setsEnabledDate: '01 Jun 2025',
      petaEnabledDate: '06 Jun 2025',
      petdEnabledDate: '10 Jun 2025',
      petlEnabledDate: '15 Jun 2025',
      customerOnboardedOn: '28 May 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 200
      }
    },
    {
      customerName: 'Chevron Corporation',
      customerCode: 120,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 18,
      containerCallingEnabled: true,
      totalActiveShipments: 150,
      totalExceptionShipments: 3,
      totalOceanCarriers: 8,
      totalAirCarriers: 16,
      setsEnabledDate: '01 Apr 2025',
      customerOnboardedOn: '15 Mar 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 150
      }
    },
    {
      customerName: 'ExxonMobil',
      customerCode: 219,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 22,
      containerCallingEnabled: true,
      // Only basic required fields, no optional customer information fields
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 0
      }
    },
    {
      customerName: 'Shell Global',
      customerCode: 280,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 26,
      containerCallingEnabled: true,
      totalActiveShipments: 180,
      totalOceanCarriers: 8,
      totalAirCarriers: 16,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 4 days)',
      customerOnboardedOn: '20 Jan 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 180
      }
    },
    {
      customerName: 'ConocoPhillips',
      customerCode: 356,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 31,
      containerCallingEnabled: true,
      totalActiveShipments: 420,
      totalOceanCarriers: 15,
      totalAirCarriers: 12,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 3 days)',
      customerOnboardedOn: '05 Mar 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 420
      }
    },
    {
      customerName: 'BP Global',
      customerCode: 448,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 29,
      containerCallingEnabled: true,
      totalActiveShipments: 380,
      totalOceanCarriers: 14,
      totalAirCarriers: 10,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 5 days)',
      customerOnboardedOn: '12 Feb 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 380
      }
    },
    {
      customerName: 'TotalEnergies',
      customerCode: 567,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 24,
      containerCallingEnabled: true,
      totalActiveShipments: 290,
      totalOceanCarriers: 11,
      totalAirCarriers: 8,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 6 days)',
      customerOnboardedOn: '18 Jan 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 290
      }
    },
    {
      customerName: 'Valero Energy',
      customerCode: 623,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 19,
      containerCallingEnabled: true,
      totalActiveShipments: 210,
      totalOceanCarriers: 9,
      totalAirCarriers: 7,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 4 days)',
      customerOnboardedOn: '25 Feb 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 210
      }
    },
    {
      customerName: 'Marathon Petroleum',
      customerCode: 734,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 27,
      containerCallingEnabled: true,
      totalActiveShipments: 350,
      totalOceanCarriers: 13,
      totalAirCarriers: 9,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 3 days)',
      customerOnboardedOn: '08 Mar 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 350
      }
    },
    {
      customerName: 'Phillips 66',
      customerCode: 891,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 23,
      containerCallingEnabled: true,
      totalActiveShipments: 270,
      totalOceanCarriers: 10,
      totalAirCarriers: 8,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 5 days)',
      customerOnboardedOn: '14 Feb 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 270
      }
    },
    {
      customerName: 'Kinder Morgan',
      customerCode: 512,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 20,
      containerCallingEnabled: true,
      totalActiveShipments: 190,
      totalOceanCarriers: 8,
      totalAirCarriers: 6,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 7 days)',
      customerOnboardedOn: '22 Jan 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 190
      }
    },
    {
      customerName: 'Enterprise Products',
      customerCode: 645,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 25,
      containerCallingEnabled: true,
      totalActiveShipments: 320,
      totalOceanCarriers: 12,
      totalAirCarriers: 8,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 4 days)',
      customerOnboardedOn: '30 Jan 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 320
      }
    },
    {
      customerName: 'Baker Hughes',
      customerCode: 789,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 21,
      containerCallingEnabled: true,
      totalActiveShipments: 240,
      totalOceanCarriers: 9,
      totalAirCarriers: 7,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 6 days)',
      customerOnboardedOn: '16 Feb 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 240
      }
    },
    {
      customerName: 'Halliburton',
      customerCode: 923,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 28,
      containerCallingEnabled: true,
      totalActiveShipments: 390,
      totalOceanCarriers: 14,
      totalAirCarriers: 10,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 2 days)',
      customerOnboardedOn: '03 Mar 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 390
      }
    },
    {
      customerName: 'Schlumberger',
      customerCode: 156,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 32,
      containerCallingEnabled: true,
      totalActiveShipments: 460,
      totalOceanCarriers: 16,
      totalAirCarriers: 12,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 3 days)',
      customerOnboardedOn: '11 Jan 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 460
      }
    },
    {
      customerName: 'EOG Resources',
      customerCode: 278,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 18,
      containerCallingEnabled: true,
      totalActiveShipments: 160,
      totalOceanCarriers: 7,
      totalAirCarriers: 6,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 5 days)',
      customerOnboardedOn: '27 Feb 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 160
      }
    },
    {
      customerName: 'Pioneer Natural Resources',
      customerCode: 401,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 22,
      containerCallingEnabled: true,
      totalActiveShipments: 250,
      totalOceanCarriers: 10,
      totalAirCarriers: 7,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 4 days)',
      customerOnboardedOn: '19 Jan 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 250
      }
    },
    {
      customerName: 'Devon Energy',
      customerCode: 534,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 19,
      containerCallingEnabled: true,
      totalActiveShipments: 180,
      totalOceanCarriers: 8,
      totalAirCarriers: 6,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 6 days)',
      customerOnboardedOn: '09 Feb 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 180
      }
    },
    {
      customerName: 'Occidental Petroleum',
      customerCode: 667,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 26,
      containerCallingEnabled: true,
      totalActiveShipments: 310,
      totalOceanCarriers: 12,
      totalAirCarriers: 9,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 3 days)',
      customerOnboardedOn: '15 Jan 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 310
      }
    },
    {
      customerName: 'Hess Corporation',
      customerCode: 798,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 24,
      containerCallingEnabled: true,
      totalActiveShipments: 280,
      totalOceanCarriers: 11,
      totalAirCarriers: 8,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 5 days)',
      customerOnboardedOn: '23 Feb 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 280
      }
    },
    {
      customerName: 'Diamondback Energy',
      customerCode: 845,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 17,
      containerCallingEnabled: true,
      totalActiveShipments: 140,
      totalOceanCarriers: 6,
      totalAirCarriers: 5,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 7 days)',
      customerOnboardedOn: '06 Mar 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 140
      }
    },
    {
      customerName: 'Enbridge Inc',
      customerCode: 912,
      subscriptionType: 'premium',
      totalCarriersSubscribed: 30,
      containerCallingEnabled: true,
      totalActiveShipments: 440,
      totalOceanCarriers: 15,
      totalAirCarriers: 11,
      setsEnabledDate: 'yes',
      petaEnabledDate: 'yes ( Every 2 days)',
      customerOnboardedOn: '12 Jan 2025',
      expanded: false,
      activeTabIndex: 1,
      selectedCarriers: [],
      prevSelectedCarriers: [],
      carrierFilterText: '',
      customerInfo: {
        activeShipments: 440
      }
    }
  ];

  // Translation helper methods
  getEnabledStatusLabel(isEnabled: boolean): string {
    return this.translateService.instant(isEnabled ? 'LBL.ENABLED' : 'LBL.DISABLED');
  }

  getYesNoLabel(value: boolean): string {
    return this.translateService.instant(value ? 'LBL.YES' : 'LBL.NO');
  }
}
