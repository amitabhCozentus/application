import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolbarModule } from 'primeng/toolbar';
import { MenubarModule } from 'primeng/menubar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenuItem, SelectItem } from 'primeng/api';
import { PrimengModule } from '../../primeng/primeng.module';
import Aura from '@primeng/themes/aura';
import { $t, updatePreset, updateSurfacePalette } from '@primeng/themes';
import { LayoutService } from '../../service/layout/layout.service';
import { TopbarsService } from '../../service/topbars/topbars.service';
import { TranslationService } from '../../service/translationService/translation.service';
import { CommonService } from '../../service/common/common.service';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
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
    standalone: true,
    selector: 'app-topbar',
    imports: [CommonModule, FormsModule, ToolbarModule, MenubarModule, DropdownModule, ButtonModule, AvatarModule, TieredMenuModule, PrimengModule],
    templateUrl: './topbar.component.html',
    styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {
    applicationTitle = 'SMART + NAVIGATOR';
    currentSection = 'MARITIME + INSIGHTS';
    fenchLanguage: any[] = [];
    englishLanguage: any[] = [];

    layoutService: LayoutService = inject(LayoutService);
    topbarService: TopbarsService = inject(TopbarsService);
    translationService: TranslationService = inject(TranslationService);
    auth0Service: Auth0Service = inject(Auth0Service);
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
    companyItems: SelectItem[] = [
        { label: 'Saved Companies', value: null }
    ];
    selectedCompany: any;
    languageOptions: SelectItem[] = [
        { label: 'English', value: 'en' },
        { label: 'French', value: 'fr' }
    ];
    navMenuItems: MenuItem[] = [];
    userMenuItems: MenuItem[] = [];

    userName = 'Solution User';
    get userInitials(): string {
        return this.userName
            .split(' ')
            .map((n) => n.charAt(0))
            .join('');
    }

    updateColors(event: any, type: string) {
        if (type === 'primary') {
            this.layoutService.layoutConfig.update((state) => ({
                ...state,
                primary: event.value.name
            }));
        }
        this.applyTheme(type, event.value);
        this.layoutService.updateBodyBackground(event.value.name);
        event.stopPropagation();
    }

    applyTheme(type: string, color: any) {
        if (type === 'primary') {
            updatePreset(this.getPresetExt());
        } else if (type === 'surface') {
            updateSurfacePalette(color.palette);
        }
    }

    buildNavMenu() {
        const t = (key: string) => this.translationService.translate(key);

        this.navMenuItems = [
            { label: t('LIT.LBL.MENU.HOME'), icon: 'pi pi-home', routerLink: '/home' },
            { label: t('LIT.LBL.MENU.TRACKING_LIST'), icon: 'pi pi-list', routerLink: '/tracking-list' },
            { label: t('LIT.LBL.MENU.FAVORITES'), icon: 'pi pi-star', routerLink: '/favorites' },
            { label: t('LIT.LBL.MENU.ALERTS'), icon: 'pi pi-bell', routerLink: '/alerts' },
            { label: t('LIT.LBL.MENU.REPORTING'), icon: 'pi pi-chart-line', routerLink: '/reporting' },
            { label: t('LIT.LBL.MENU.3PL'), icon: 'pi pi-refresh', items: [] },
            { label: t('LIT.LBL.MENU.DATA_MANAGEMENT'), icon: 'pi pi-database', items: [] },
            { label: t('LIT.LBL.MENU.USER_MANAGEMENT'), icon: 'pi pi-users', items: [] },
            { label: t('LIT.LBL.MENU.MASTER_DATA'), icon: 'pi pi-cog', items: [] }
        ];
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
    onLanguageChange(event: any) {
        const selectedLanguage = event.value;
        selectedLanguage === 'en' ? this.translationService.setLanguage(selectedLanguage, this.englishLanguage) : this.translationService.setLanguage(selectedLanguage, this.fenchLanguage);
        this.buildNavMenu();
    }
    public logoutRedirect() {
         this.auth0Service.logout({ returnTo: window.location.origin }
    );
        }

    ngOnInit(): void {
        this.navMenuItems = [
            { label: 'Home', icon: 'pi pi-home', routerLink: '/home' },
            { label: 'Tracking List', icon: 'pi pi-list', routerLink: '/tracking-list' },
            { label: 'Favorites', icon: 'pi pi-star', routerLink: '/favorites' },
            { label: 'Alerts', icon: 'pi pi-bell', routerLink: '/alerts' },
            { label: 'Reporting', icon: 'pi pi-chart-line', routerLink: '/reporting' },
            { label: '3PL', icon: 'pi pi-refresh', items: [] },
            { label: 'Data Management', icon: 'pi pi-database', items: [] },
            { label: 'User Management', icon: 'pi pi-users', items: [] },
            { label: 'Master Data', icon: 'pi pi-cog', items: [] }
        ];

        this.userMenuItems = [
            { label: 'Profile', icon: 'pi pi-user' },
            { label: 'Settings', icon: 'pi pi-cog' },
            { separator: true },
            { label: 'Logout', icon: 'pi pi-sign-out', command: (event) => this.logoutRedirect() }
        ];

        this.topbarService.getFrenchItemTranslation('topbar.company').subscribe((translation: any) => {
            if (translation && translation.success && translation.data) {
                this.fenchLanguage = translation.data[0];
            }
        });




        this.topbarService.getEnglishItemTranslation('topbar.company').subscribe((translation: any) => {
            if (translation && translation.success && translation.data) {
                this.englishLanguage = translation.data[0];
                this.translationService.setLanguage(this.englishLanguage[0].languageCode, this.englishLanguage);
                this.buildNavMenu();

            }
        });


    }
}
