import { PrimengModule } from './../../../shared/primeng/primeng.module';
import { Component, OnInit, ViewChild,computed,inject } from "@angular/core";
import { RoleService } from "../../../shared/service/role-control/role.service";
import { ROLE_TABLE_HEADERS, RoleConfigData, TableHeaders } from "../../../shared/lib/constants";
import { CommonTableSearchComponent } from '../../../shared/component/table-search/common-table-search.component';
import { RoleConfigurationComponent } from '../role-configuration/role-configuration.component';
import Aura from '@primeng/themes/aura';
import { $t, updatePreset, updateSurfacePalette } from '@primeng/themes';
import { LayoutService } from 'src/app/shared/service/layout/layout.service';
import {appConfig, AppConfig} from '../../../app.config';

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
    imports: [PrimengModule, CommonTableSearchComponent, RoleConfigurationComponent],
    templateUrl: "./role-control.component.html",
    styleUrls: ["./role-control.component.scss"],
})
export class RoleControlComponent implements OnInit {
    canEdit: boolean = true; // set from auth context
    pageSize: number = 10;
    layoutService: LayoutService = inject(LayoutService);
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
    allPrivileges: string[] = [
        "List view",
        "Port master data management",
        "Data Management",
        "Tracking list",
        "No KPIs",
        "No Map",
        "Shipment details",
        "Scheduling",
        "Routing",
        "3PL Analytics",
    ];
    @ViewChild(RoleConfigurationComponent, { static: true }) roleConfig!: RoleConfigurationComponent;

    constructor(private roleService: RoleService) {}

    ngOnInit() {
        this.loadRoles(0, this.pageSize);
        console.log('Primary Colors:', this.primaryColors());
    }

    /** Load one page from server */
    loadRoles(pageIndex: number, pageSize: number) {
        this.loading = true;
        this.roleService
            .getActiveRoles(pageIndex, pageSize, this.searchTerm)
            .subscribe((res) => {
                this.roles = res.data;
                this.totalRecords = res.total;
                this.loading = false;
            });
    }

    /** Pagination callback */
    onPage(event: { page: number; rows: number }) {
        this.loadRoles(event.page, event.rows);
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

    /** Search on Enter (min 3 chars) */
    onSearch() {
        if (this.searchTerm.length >= 3) {
            this.loadRoles(0, this.pageSize);
        }
    }

    resetSearch() {
        this.searchTerm = "";
        this.loadRoles(0, this.pageSize);
    }

    refresh() {
        this.loadRoles(0, this.pageSize);
    }

    selectedPrimaryColor = computed(() => {
        return this.layoutService.layoutConfig().primary;
    });

    /** Open configuration dialog prefilled for editing */
    editRole(role: RoleConfigData): void {
        this.roleConfig.open(role);
    }

    openAddRoleDialog() {
        this.roleConfig.open();
    }
}
