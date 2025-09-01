import { PrimengModule } from '../../../../shared/primeng/primeng.module';
import { Component, OnInit, ViewChild, computed, effect, inject } from "@angular/core";
import { Table } from 'primeng/table';
import { RoleService } from "../../../../shared/service/role-control/role.service";
import { buildColumnFiltersFromEvent } from '../../../../shared/lib/column-filter.util';
import { ColumnFilterDescriptor, PagedResult, ROLE_TABLE_HEADERS, RoleConfigData, TableHeaders } from "../../../../shared/lib/constants";
import { ROLE_STATUS, CUSTOM_LANDING, DATE_TIME_FORMAT } from '../../../../shared/lib/constants';
import { CommonTableSearchComponent } from '../../../../shared/component/table-search/common-table-search.component';
import { RoleConfigurationComponent } from '../role-configuration/role-configuration.component';
import Aura from '@primeng/themes/aura';
import { updatePreset, updateSurfacePalette } from '@primeng/themes';
import { LayoutService } from '../../../../shared/service/layout/layout.service';
import { MessageService } from 'primeng/api';
import { CommonTableFilterComponent } from '../../../../shared/component/common-table-filter/common-table-filter.component';
import { FilterPanelComponent } from '../../../../shared/component/filter-panel/filter-panel.component';
import { FilterService } from '../../../../shared/service/filter/filter.service';
import { SavedFiltersService } from '../../../../shared/service/filter/saved-filters.service';
import { DataTableLazyLoadEvent, handleLazyLoad, handleRefresh, handleSearch } from '../../../../shared/lib/common-utils';

declare type KeyOfType<T> = keyof T extends infer U ? U : never;
const presets = {
    Aura
} as const;
declare type SurfacesType = {
    name?: string;
    palette?: {
        0?: string;
        50?: string;
        100?: string;
        200?: string;
        300?: string;
        400?: string;
        500?: string;
        600?: string;
        700?: string;
        800?: string;
        900?: string;
        950?: string;
    };
}

@Component({
    selector: "app-role-control",
    standalone: true,
    imports: [PrimengModule, CommonTableSearchComponent, RoleConfigurationComponent, CommonTableFilterComponent, FilterPanelComponent],
    providers: [MessageService],
    templateUrl: "./role-control.component.html",
    styleUrls: ["./role-control.component.scss"],
})
export class RoleControlComponent implements OnInit {

    canEdit: boolean = true;
    pageSize: number = 10;
    currentPage: number = 0;
    public layoutService: LayoutService = inject(LayoutService);
    private roleService: RoleService = inject(RoleService);
    darkTheme = computed(() => this.layoutService.layoutConfig().darkTheme);
    menuThemeOptions: { name: string; value: string }[] = [];
    primaryColors = computed<SurfacesType[]>(() => {
        const presetPalette = presets[this.layoutService.layoutConfig().preset as KeyOfType<typeof presets>].primitive;
        const colors = ['emerald', 'green', 'lime', 'orange', 'amber', 'yellow', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
        const palettes: SurfacesType[] = [{ name: 'noir', palette: {} }];

        colors.forEach((color) => {
            palettes.push({
                name: color,
                palette: presetPalette?.[color as KeyOfType<typeof presetPalette>] as SurfacesType['palette']
            });
        });

        return palettes;
    });

    roleTableHeaders: TableHeaders[] = ROLE_TABLE_HEADERS;
    roles: RoleConfigData[] = [];
    totalRecords: number = 0;
    loading: boolean = false;
    searchTerm: string = "";
    allPrivileges: string[] = []; // Add this to prevent template errors
    private lastColumnFilters: ColumnFilterDescriptor[] = [];
    statuses = ROLE_STATUS;
    customLanding = CUSTOM_LANDING;
    dateTimeFormat = DATE_TIME_FORMAT;
    @ViewChild(RoleConfigurationComponent, { static: true }) roleConfig!: RoleConfigurationComponent;
    @ViewChild('roleTable') roleTable?: Table;
    private suppressNextLazyLoad = false;

    // Global Filters side panel state
    filtersVisible = false;
    private filterService = inject(FilterService);
    private savedFilters = inject(SavedFiltersService);
    filtersActive = false; // any active criteria in current session
    savedApplied = false;  // highlight only when a saved filter is applied
    #filtersEff = effect(() => {
        this.filtersActive = this.filterService.hasActiveFilters();
        this.savedApplied = this.savedFilters.appliedSavedId() !== null;
    });

    ngOnInit() {
        // Let PrimeNG handle the initial lazy load naturally
    }

    /** Load one page from server */
    loadRoles(pageIndex: number, pageSize: number, searchTerm: string, columnFilters: ColumnFilterDescriptor[] = this.lastColumnFilters) {
        this.loading = true;
        const trimmedSearchTerm = searchTerm.trim();
        // persist last used filters for pagination/refresh
        this.lastColumnFilters = columnFilters || [];
        this.roleService
            .getActiveRoles(pageIndex, pageSize, trimmedSearchTerm, this.lastColumnFilters)
            .subscribe({
                next: (res:PagedResult<RoleConfigData>) => {
                    if (res && res.data) {
                        this.roles = res.data;
                        this.totalRecords = res.total;
                    } else {
                        this.roles = [];
                        this.totalRecords = 0;
                    }
                    this.loading = false;

                },
                error: (error) => {
                    this.loading = false;
                    console.error("Error loading roles:", error);
                }
            });
    }

    /** Pagination callback */
    onPage(event: { page: number; rows: number; first: number }) {
        this.currentPage = event.page;
        this.pageSize = event.rows;
        this.loadRoles(event.page, event.rows, this.searchTerm, this.lastColumnFilters);
    }

    /** Lazy loading callback for PrimeNG table */
    onLazyLoad(event: DataTableLazyLoadEvent) {
        handleLazyLoad({
            event,
            suppressNextLazyLoad: this.suppressNextLazyLoad,
            setSuppressNextLazyLoad: (v) => (this.suppressNextLazyLoad = v),
            setCurrentPage: (p) => (this.currentPage = p),
            setPageSize: (s) => (this.pageSize = s),
            buildColumnFilters: (e) => this.buildColumnFiltersFromEvent(e),
            searchTerm: this.searchTerm,
            loadPage: (page, size, term, filters) => this.loadRoles(page, size, term, filters)
        });
    }

    /** Search on Enter (min 3 chars) */
    onSearch() {
        handleSearch({
            searchTerm: this.searchTerm,
            minLength: 3,
            pageSize: this.pageSize,
            setCurrentPage: (p) => (this.currentPage = p),
            clearFilters: () => { this.lastColumnFilters = []; },
            setSuppressNextLazyLoad: (v) => (this.suppressNextLazyLoad = v),
            clearTable: () => this.roleTable?.clear(),
            loadPage: (page, size, term, filters) => this.loadRoles(page, size, term, filters)
        });
    }

    refresh() {
        handleRefresh({
            setSearchTerm: (v) => (this.searchTerm = v),
            setCurrentPage: (p) => (this.currentPage = p),
            clearFilters: () => { this.lastColumnFilters = []; },
            clearTable: () => this.roleTable?.clear()
        });
    }

    getSeverity(statusValue: boolean): "status-active" | "status-inactive"  {
        return statusValue ? "status-active" : "status-inactive";
    }

    /** Map UI field to API column name */
    private toApiField(uiField: string): string {
        const map: Record<string, string> = {
            roleName: 'name',
            roleDescription: 'description',
            status: 'isActive',
            createdOn: 'createdOn',
            updatedOn: 'updatedOn',
            createdBy: 'createdBy',
            updatedBy: 'updatedBy',
            defaultLanding: 'landingPage.name',
            customLanding: 'landingPage',
            skin: 'skin.name',
            rolePrivileges: 'featureName'
        };
        return map[uiField] || uiField;
    }
    // Use shared util for building column filter descriptors
    private buildColumnFiltersFromEvent(event: any): ColumnFilterDescriptor[] {
        return buildColumnFiltersFromEvent(event, (f) => this.toApiField(f));
    }

    updateColors(event: any, type: string, color: any) {
        if (type === 'primary') {
            this.layoutService.layoutConfig.update((state) => ({
                ...state,
                primary: color.name
            }));
        }
        this.applyTheme(type, color);
        this.layoutService.updateBodyBackground(color.name);
        event.stopPropagation();
    }

    applyTheme(type: string, color: any) {
        if (type === 'primary') {
            updatePreset(this.getPresetExt());
        } else if (type === 'surface') {
            updateSurfacePalette(color.palette);
        }
    }

    getPresetExt() {
        const color: SurfacesType = this.primaryColors().find((c) => c.name === this.selectedPrimaryColor()) || {};

        if (color.name === 'noir') {
            return {
                semantic: {
                    primary: {
                        50: '{zinc.50}',
                        100: '{zinc.100}',
                        200: '{zinc.200}',
                        300: '{zinc.300}',
                        400: '{zinc.400}',
                        500: '{zinc.500}',
                        600: '{zinc.600}',
                        700: '{zinc.700}',
                        800: '{zinc.800}',
                        900: '{zinc.900}',
                        950: '{zinc.950}'
                    },
                    colorScheme: {
                        light: {
                            primary: {
                                color: '{primary.950}',
                                contrastColor: '#ffffff',
                                hoverColor: '{primary.800}',
                                activeColor: '{primary.700}'
                            },
                            highlight: {
                                background: '{primary.950}',
                                focusBackground: '{primary.700}',
                                color: '#ffffff',
                                focusColor: '#ffffff'
                            },
                            surface: {
                                0: '#ffffff',
                                50: '{zinc.50}',
                                100: '{zinc.100}',
                                200: '{zinc.200}',
                                300: '{zinc.300}',
                                400: '{zinc.400}',
                                500: '{zinc.500}',
                                600: '{zinc.600}',
                                700: '{zinc.700}',
                                800: '{zinc.800}',
                                900: '{zinc.900}',
                                950: '{zinc.950}'
                            }
                        },
                        dark: {
                            primary: {
                                color: '{primary.50}',
                                contrastColor: '{primary.950}',
                                hoverColor: '{primary.200}',
                                activeColor: '{primary.300}'
                            },
                            highlight: {
                                background: '{primary.50}',
                                focusBackground: '{primary.300}',
                                color: '{primary.950}',
                                focusColor: '{primary.950}'
                            },
                            surface: {
                                0: '#ffffff',
                                50: '{zinc.50}',
                                100: '{zinc.100}',
                                200: '{zinc.200}',
                                300: '{zinc.300}',
                                400: '{zinc.400}',
                                500: '{zinc.500}',
                                600: '{zinc.600}',
                                700: '{zinc.700}',
                                800: '{zinc.800}',
                                900: '{zinc.900}',
                                950: '{zinc.950}'
                            }
                        }
                    }
                }
            };
        } else {
            return {
                semantic: {
                    primary: color.palette,
                    colorScheme: {
                        light: {
                            primary: {
                                color: '{primary.500}',
                                contrastColor: '#ffffff',
                                hoverColor: '{primary.600}',
                                activeColor: '{primary.700}'
                            },
                            highlight: {
                                background: '{primary.50}',
                                focusBackground: '{primary.100}',
                                color: '{primary.700}',
                                focusColor: '{primary.800}'
                            },
                            surface: {
                                0: 'color-mix(in srgb, {primary.900}, white 100%)',
                                50: 'color-mix(in srgb, {primary.900}, white 95%)',
                                100: 'color-mix(in srgb, {primary.900}, white 90%)',
                                200: 'color-mix(in srgb, {primary.900}, white 80%)',
                                300: 'color-mix(in srgb, {primary.900}, white 70%)',
                                400: 'color-mix(in srgb, {primary.900}, white 60%)',
                                500: 'color-mix(in srgb, {primary.900}, white 50%)',
                                600: 'color-mix(in srgb, {primary.900}, white 40%)',
                                700: 'color-mix(in srgb, {primary.900}, white 30%)',
                                800: 'color-mix(in srgb, {primary.900}, white 20%)',
                                900: 'color-mix(in srgb, {primary.900}, white 10%)',
                                950: 'color-mix(in srgb, {primary.900}, white 0%)'
                            }
                        },
                        dark: {
                            primary: {
                                color: '{primary.400}',
                                contrastColor: '{surface.900}',
                                hoverColor: '{primary.300}',
                                activeColor: '{primary.200}'
                            },
                            highlight: {
                                background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
                                focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                                color: 'rgba(255,255,255,.87)',
                                focusColor: 'rgba(255,255,255,.87)'
                            },
                            surface: {
                                0: 'color-mix(in srgb, var(--surface-ground), white 100%)',
                                50: 'color-mix(in srgb, var(--surface-ground), white 95%)',
                                100: 'color-mix(in srgb, var(--surface-ground), white 90%)',
                                200: 'color-mix(in srgb, var(--surface-ground), white 80%)',
                                300: 'color-mix(in srgb, var(--surface-ground), white 70%)',
                                400: 'color-mix(in srgb, var(--surface-ground), white 60%)',
                                500: 'color-mix(in srgb, var(--surface-ground), white 50%)',
                                600: 'color-mix(in srgb, var(--surface-ground), white 40%)',
                                700: 'color-mix(in srgb, var(--surface-ground), white 30%)',
                                800: 'color-mix(in srgb, var(--surface-ground), white 20%)',
                                900: 'color-mix(in srgb, var(--surface-ground), white 10%)',
                                950: 'color-mix(in srgb, var(--surface-ground), white 5%)'
                            }
                        }
                    }
                }
            };
        }
    }

    selectedPrimaryColor = computed(() => {
        return this.layoutService.layoutConfig().primary;
    });

    /** Open configuration dialog prefilled for editing */
    editRole(role: RoleConfigData): void {
        this.roleConfig.openDialog(role);
    }

    openAddRoleDialog() {
        this.roleConfig.openDialog();
    }

    // Filters panel
    openFilters() { this.filtersVisible = true; }
    onFiltersApplied() {
    this.filtersActive = this.filterService.hasActiveFilters();
    this.refresh();
    }

    onFiltersCleared() {
    this.filtersActive = this.filterService.hasActiveFilters();
    this.refresh();
    }
}
