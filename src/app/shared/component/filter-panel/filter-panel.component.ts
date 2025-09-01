import { Component, EventEmitter, Input, Output, computed, signal, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterService } from '../../service/filter/filter.service';
import { SavedFiltersService, SavedFilter } from '../../service/filter/saved-filters.service';
import { GlobalFiltersState } from '../../model/filters.model';
import { SelectItem } from 'primeng/api';
import { PrimengModule } from '../../primeng/primeng.module';

@Component({
    selector: 'app-filter-panel',
    standalone: true,
    imports: [CommonModule, FormsModule, PrimengModule],
    providers: [],
    templateUrl: './filter-panel.component.html',
    styleUrls: ['./filter-panel.component.scss'],
})
export class FilterPanelComponent implements OnChanges {
    fs = inject(FilterService);
    saved = inject(SavedFiltersService);
    // no toast/confirm injections by request

    // Two-way bindable visibility for host pages to control the drawer
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    // Optional company selection from outside to influence 4PL (LSP enablement)
    @Input() selectedCompany: string | null = null;

    // Emit when filters applied/cleared so pages can refresh data/KPIs/Map
    @Output() applied = new EventEmitter<GlobalFiltersState>();
    @Output() cleared = new EventEmitter<void>();
    // Pseudo-API compatibility: also emit with these names and provide comprehensive output
    @Output() filtersApplied = new EventEmitter<GlobalFiltersState>();
    @Output() filtersClear = new EventEmitter<void>();
    @Output() filterOutputGenerated = new EventEmitter<any>();

    // Local working copy of the filters to allow Cancel without mutating global state
    model: GlobalFiltersState = { ...this.fs.state() };

    // Select options for PrimeNG controls
    statusOptions: SelectItem[] = this.fs.shipmentStatuses.map((v) => ({ label: v, value: v }));
    modesOptions: SelectItem[] = this.fs.modesOfTransport.map((v) => ({ label: v, value: v }));
    regionOptions: SelectItem[] = this.fs.regions.map((v) => ({ label: v, value: v }));
    countryOptions: SelectItem[] = this.fs.countries.map((v) => ({ label: v, value: v }));
    carrierOptions: SelectItem[] = this.fs.carriers.map((v) => ({ label: v, value: v }));
    cargoTypeOptions: SelectItem[] = this.fs.cargoTypes.map((v) => ({ label: v, value: v }));
    hazardousOptions: SelectItem[] = this.fs.hazardousOptions.map((v) => ({ label: v, value: v }));

        // Suggestion state
    csrSuggestions: any[] = [];
    lspSuggestions: any[] = [];
    portSuggestions: any[] = [];
    placeSuggestions: any[] = [];
    vesselSuggestions: any[] = [];
    flightSuggestions: any[] = [];

    csrQueryLength = 0;
    lspQueryLength = 0;
    portQueryLength = 0;
    placeQueryLength = 0;

    // Saved Filters UI state
    showSaveDialog = signal(false);
    showSavedFiltersDialog = signal(false);
    saveFilterName = '';

    savedFilters = computed(() => this.saved.saved());

        // Local form active state
        hasActiveFilters(): boolean {
            const s = this.model;
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
            return primitives.some((p) => p != null) || arrays.some((a) => Array.isArray(a) && a.length > 0);
        }

    // Open/close API for host
    closePanel() {
        this.visible = false;
        this.visibleChange.emit(this.visible);
    this.closeAllDialogs();
    }

    onCancel() {
        // Reset form model to current global state and close
        this.model = { ...this.fs.state() };
        this.closePanel();
    }

    onClear() {
        this.fs.clear();
        this.model = { ...this.fs.state() };
    this.cleared.emit();
    this.filtersClear.emit();
        this.closePanel();
    }

    onApply() {
            this.fs.apply({ ...this.model });
            // Validate applied saved filter still matches; if ad-hoc, clear applied id
            const appliedId = this.saved.appliedSavedId();
            if (appliedId) {
                const sf = this.saved.getById(appliedId);
                if (!sf || !this.areCriteriaEqual(this.model, sf.criteria)) {
                    this.saved.appliedSavedId.set(null);
                }
            } else {
                this.saved.appliedSavedId.set(null);
            }

            // Emit legacy and pseudo-compatible events
            this.applied.emit(this.model);
            this.filtersApplied.emit(this.model);
            const output = this.generateFilterOutput(this.model);
            this.filterOutputGenerated.emit(output);
        this.closePanel();
    }

        // Save current filter flow
        showSaveFilterDialog() {
            // Close saved filters list if open
            if (this.showSavedFiltersDialog()) this.showSavedFiltersDialog.set(false);
            this.saveFilterName = '';
            this.showSaveDialog.set(true);
        }
        cancelSaveFilter() {
            this.saveFilterName = '';
            this.showSaveDialog.set(false);
        }
        canSaveFilter() {
            return this.saveFilterName.trim().length > 0 && this.hasActiveFilters();
        }
        saveCurrentFilter() {
            const name = this.saveFilterName.trim();
            if (!name) { return; }
            if (!this.hasActiveFilters()) { return; }
            // Prevent duplicate names (case-insensitive)
            const exists = this.saved.saved().some(f => f.name.toLowerCase() === name.toLowerCase());
            if (exists) { return; }
            this.saved.save(name, this.model);
            const output = this.generateFilterOutput(this.model);
            // Close dialog
            this.showSaveDialog.set(false);
            this.saveFilterName = '';
        }

        toggleSavedFilters() {
            // Close save dialog if open
            if (this.showSaveDialog()) {
                this.showSaveDialog.set(false);
                this.saveFilterName = '';
            }
            this.showSavedFiltersDialog.set(!this.showSavedFiltersDialog());
        }
        showSavedFilters() {
            if (this.showSaveDialog()) {
                this.showSaveDialog.set(false);
                this.saveFilterName = '';
            }
            this.showSavedFiltersDialog.set(true);
        }

        applySavedFilter(f: SavedFilter) {
            // Load saved criteria into global and mark applied
            this.model = structuredClone(f.criteria);
            this.fs.apply({ ...this.model });
            this.saved.appliedSavedId.set(f.id);
            // Emit events and feedback
            this.applied.emit(this.model);
            this.filtersApplied.emit(this.model);
            const output = this.generateFilterOutput(this.model);
            this.filterOutputGenerated.emit(output);
            this.closePanel();
        }
        editSavedFilter(f: SavedFilter) {
            this.saveFilterName = f.name;
            this.showSaveDialog.set(true);
        }
    confirmDelete(f: SavedFilter) { this.saved.delete(f.id); }

    // Suggestion handlers
    onSuggestCsr(e: any) {
        const q = e?.query ?? '';
        this.csrQueryLength = (q || '').length;
        this.fs.suggestCsr(q).subscribe((r) => (this.csrSuggestions = r));
    }
    onSuggestLsp(e: any) {
        const q = e?.query ?? '';
        this.lspQueryLength = (q || '').length;
        this.fs.suggestLsp(q).subscribe((r) => (this.lspSuggestions = r));
    }
    onSuggestPorts(e: any) {
        const q = e?.query ?? '';
        this.portQueryLength = (q || '').length;
        this.fs.suggestPorts(q).subscribe((r: any[]) => (this.portSuggestions = r));
    }
    onSuggestPlaces(e: any) {
        const q = e?.query ?? '';
        this.placeQueryLength = (q || '').length;
        this.fs.suggestPlaces(q).subscribe((r: any[]) => (this.placeSuggestions = r));
    }
    onSuggestVessels(e: any) {
        this.fs.suggestVessels(e?.query ?? '').subscribe((r) => (this.vesselSuggestions = r));
    }
    onSuggestFlights(e: any) {
        this.fs.suggestFlights(e?.query ?? '').subscribe((r) => (this.flightSuggestions = r));
    }

    // Helpers from pseudo
    hasSavedFiltersApplied(): boolean {
        return this.saved.appliedSavedId() !== null;
    }

    closeAllDialogs() {
        this.showSaveDialog.set(false);
        this.showSavedFiltersDialog.set(false);
        this.saveFilterName = '';
    }

    // Compare current criteria with a saved one (simple deep compare)
    private areCriteriaEqual(a: GlobalFiltersState, b: GlobalFiltersState) {
        try {
            return JSON.stringify(a) === JSON.stringify(b);
        } catch {
            return false;
        }
    }

    // Comprehensive output generator adapted to GlobalFiltersState
    generateFilterOutput(criteria: GlobalFiltersState = this.model) {
        const c = criteria;
        const arraySummary = (arr: any[] | null | undefined, labelSel: (x: any) => string = (x) => x.name, valueSel: (x: any) => any = (x) => x) => {
            const list = Array.isArray(arr) ? arr : [];
            return {
                selected: list,
                count: list.length,
                labels: list.map(labelSel),
                values: list.map(valueSel),
                displayText: list.map(labelSel).join(', ') || null
            };
        };
        const simpleArraySummary = (arr: any[] | null | undefined) => {
            const list = Array.isArray(arr) ? arr : [];
            return {
                selected: list,
                count: list.length,
                values: list.join(', ') || null
            };
        };

        const output: any = {
            timestamp: new Date().toISOString(),
            hasData: this.hasActiveFilters(),
            totalSelectedItems: 0,
            shipmentStatus: c.shipmentStatus ?? null,
            hazardousMaterial: c.hazardous ?? null,
            modeOfTransport: simpleArraySummary(c.modes),
            cargoType: simpleArraySummary(c.cargoTypes),
            customerServiceRep: arraySummary(c.csr),
            lspName: arraySummary(c.lsp),
            origin: {
                regions: simpleArraySummary(c.originRegion),
                countries: simpleArraySummary(c.originCountry),
                ports: {
                    ...arraySummary(c.originPorts, (x) => x.name, (x) => x.code ?? x.name),
                    codes: (c.originPorts ?? []).map((x) => (x as any).code).filter(Boolean)
                }
            },
            destination: {
                regions: simpleArraySummary(c.destinationRegion),
                countries: simpleArraySummary(c.destinationCountry),
                ports: {
                    ...arraySummary(c.destinationPorts, (x) => x.name, (x) => x.code ?? x.name),
                    codes: (c.destinationPorts ?? []).map((x) => (x as any).code).filter(Boolean)
                }
            },
            placeOfReceipt: {
                ...arraySummary(c.placeOfReceipt, (x) => x.name, (x) => x.code ?? x.name),
                codes: (c.placeOfReceipt ?? []).map((x) => (x as any).code).filter(Boolean)
            },
            placeOfDelivery: {
                ...arraySummary(c.placeOfDelivery, (x) => x.name, (x) => x.code ?? x.name),
                codes: (c.placeOfDelivery ?? []).map((x) => (x as any).code).filter(Boolean)
            },
            carrier: simpleArraySummary(c.carriers),
            vesselName: arraySummary(c.vesselNames),
            flightNumber: arraySummary(c.flightNumbers)
        };

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

    // Pseudo-compatible getters
    getCurrentFilterOutput() { return this.generateFilterOutput(this.model); }
    exportCurrentFilterData() { const out = this.generateFilterOutput(this.model); const json = JSON.stringify(out, null, 2); console.log('Current Filter Export:', json); return json; }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['selectedCompany']) {
            const company = this.selectedCompany ?? '';
            const name = company.toLowerCase();
            const is4pl = name.includes('4pl') || name.includes('fourth party') || name.includes('logistics service provider');
            this.fs.set4pl(is4pl);
            // Reflect in local model as well
            this.model.is4pl = is4pl;
            if (!is4pl) {
                this.model.lsp = [];
            }
        }
    }
}
