import { Component, computed, inject, HostListener, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolbarModule } from 'primeng/toolbar';
import { MenubarModule } from 'primeng/menubar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem, SelectItem } from 'primeng/api';
import { AppMenuItem, MENU_ITEMS } from '../../lib/menu.constants';
import { PrimengModule } from '../../primeng/primeng.module';
import Aura from '@primeng/themes/aura';
import { $t, updatePreset, updateSurfacePalette } from '@primeng/themes';
import { LayoutService } from '../../service/layout/layout.service';
import { TopbarsService } from '../../service/topbars/topbars.service';
import { CommonService } from '../../service/common/common.service';
// import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';   // ngx-translate
import { TranslationService } from '../../service/translation-service/translation.service';
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
    imports: [CommonModule, FormsModule, ToolbarModule, MenubarModule, DropdownModule, ButtonModule, AvatarModule, TieredMenuModule, MenuModule, TooltipModule, PrimengModule],
    templateUrl: './topbar.component.html',
    styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit, AfterViewInit, OnDestroy {
    applicationTitle = 'SMART + NAVIGATOR';
    currentSection = 'MARITIME + INSIGHTS';
    fenchLanguage: any = {};
    englishLanguage: any = {};
    selectedLanguageLabel='English';
    selectedLanguage: string = 'en'; // Default to English
    layoutService: LayoutService = inject(LayoutService);
    router = inject(Router);
    topbarService: TopbarsService = inject(TopbarsService);
    translationService: TranslationService = inject(TranslationService);
    // auth0Service: Auth0Service = inject(Auth0Service);
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
    // Full menu set after permission filtering
    navMenuItems: AppMenuItem[] = [];
    userMenuItems: MenuItem[] = [];
    // Items rendered in the main ribbon
    visibleNavMenuItems: AppMenuItem[] = [];
    // Items moved into the overflow popup
    overflowMenuItems: AppMenuItem[] = [];
    showOverflowMenu: boolean = false;
    selectedSkin: string | null = '';

    @ViewChild('navigationBar', { static: false }) navigationBar!: ElementRef;
    @ViewChild('navContainer', { static: false }) navContainer!: ElementRef<HTMLElement>;
    private resizeObserver?: ResizeObserver;

    constructor(private translateService: TranslateService) {}


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

            // Save theme color preference to localStorage
            this.saveThemeColorPreference(event.value.name);
        }
        this.applyTheme(type, event.value);
        this.layoutService.updateBodyBackground(event.value.name);

        // Check if stopPropagation exists before calling it
        if (event && typeof event.stopPropagation === 'function') {
            event.stopPropagation();
        }
    }

    applyTheme(type: string, color: any) {
        if (type === 'primary') {
            updatePreset(this.getPresetExt());
        } else if (type === 'surface') {
            updateSurfacePalette(color.palette);
        }
    }

    /**
     * Build the navigation menu from centralized constants, applying
     * permission-based filtering so items like Home can be hidden
     * for users without access.
     */
    buildNavMenu() {
        // In a real app, wire this to your auth/roles service.
        const hasHomeAccess = this.userHasPermission('HOME_VISIBLE');

        // Filter by permission rules
        const filterByPermission = (items: AppMenuItem[] = []): AppMenuItem[] =>
            items
                .filter(i => !i.permission || (i.permission === 'HOME_VISIBLE' ? hasHomeAccess : this.userHasPermission(i.permission)))
                .map(i => ({
                    ...i,
                    items: i.items ? filterByPermission(i.items) : undefined
                }));

        this.navMenuItems = filterByPermission(MENU_ITEMS);
        this.calculateResponsiveMenu();
    }

    /**
     * Dummy permission check stub. Replace with your actual auth/role check.
     */
    private userHasPermission(_permission: string): boolean {
        // TODO: integrate with real permission checks (e.g., from JWT/roles)
        // Special case: return false here to test hiding Home.
        return true;
    }

    /**
     * Compute which items can fit on the first line and which should be moved
     * into the overflow menu. Uses container width and an average item width
     * heuristic for robust behavior across zoom/resolutions.
     */
    private calculateResponsiveMenu(): void {
        const container = this.navContainer?.nativeElement;
        const containerWidth = container?.offsetWidth || window.innerWidth;

        // Heuristic: average width per top-level item (icon + label + padding)
        const avgItemWidth = 150; // px
        const overflowButtonWidth = 48; // px for the ellipsis button

        // How many items can we show with room for the overflow button
        let maxVisibleItems = Math.floor((containerWidth - overflowButtonWidth) / avgItemWidth);
        if (maxVisibleItems < 1) maxVisibleItems = 1;

        maxVisibleItems = Math.min(maxVisibleItems, this.navMenuItems.length);

        if (maxVisibleItems >= this.navMenuItems.length) {
            this.visibleNavMenuItems = [...this.navMenuItems];
            this.overflowMenuItems = [];
            this.showOverflowMenu = false;
        } else {
            this.visibleNavMenuItems = this.navMenuItems.slice(0, maxVisibleItems);
            this.overflowMenuItems = this.navMenuItems.slice(maxVisibleItems);
            this.showOverflowMenu = this.overflowMenuItems.length > 0;
        }
    }

    @HostListener('window:resize')
    onWindowResize(): void {
        this.calculateResponsiveMenu();
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
    toggleDarkMode() {
        this.executeDarkModeToggle();
    }

    executeDarkModeToggle() {
        const newDarkTheme = !this.darkTheme();
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: newDarkTheme
        }));

        // Save dark mode preference to localStorage
        this.saveDarkModePreference(newDarkTheme);

        if (this.darkTheme()) {
            this.setMenuTheme('dark');
        }
        this.updateMenuThemeOptions();
        this.layoutService.updateBodyBackground(this.layoutService.layoutConfig().primary);
    }

    private saveDarkModePreference(isDarkMode: boolean): void {
        try {
            localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        } catch (error) {
            console.warn('Unable to save dark mode preference to localStorage:', error);
        }
    }

    private loadDarkModePreference(): boolean | null {
        try {
            const savedPreference = localStorage.getItem('darkMode');
            return savedPreference ? JSON.parse(savedPreference) : null;
        } catch (error) {
            console.warn('Unable to load dark mode preference from localStorage:', error);
            return null;
        }
    }

    private initializeDarkModePreference(): void {
        const savedDarkMode = this.loadDarkModePreference();
        if (savedDarkMode !== null) {
            // Apply the saved preference
            this.layoutService.layoutConfig.update((state) => ({
                ...state,
                darkTheme: savedDarkMode
            }));

            if (savedDarkMode) {
                this.setMenuTheme('dark');
            }
            this.updateMenuThemeOptions();
            this.layoutService.updateBodyBackground(this.layoutService.layoutConfig().primary);
        }
    }

    private saveThemeColorPreference(colorName: string): void {
        try {
            localStorage.setItem('themeColorPreference', JSON.stringify(colorName));
        } catch (error) {
            console.warn('Unable to save theme color preference to localStorage:', error);
        }
    }

    private loadThemeColorPreference(): string | null {
        try {
            const savedColor = localStorage.getItem('themeColorPreference');
            return savedColor ? JSON.parse(savedColor) : null;
        } catch (error) {
            console.warn('Unable to load theme color preference from localStorage:', error);
            return null;
        }
    }

    private initializeThemeColorPreference(): void {
        const savedColor = this.loadThemeColorPreference();
        this.selectedSkin = savedColor;
        if (savedColor !== null) {
            // Apply the saved color preference
            this.layoutService.layoutConfig.update((state) => ({
                ...state,
                primary: savedColor
            }));

            // Apply the theme with saved color
            const colorPalette = this.primaryColors().find(c => c.name === savedColor);
            if (colorPalette) {
                this.applyTheme('primary', colorPalette);
                this.layoutService.updateBodyBackground(savedColor);
            }
        }
    }

    private clearLocalStorage(): void {
        try {
            localStorage.removeItem('app-theme');
            localStorage.removeItem('darkMode');
        } catch (error) {
            console.warn('Unable to clear theme preferences from localStorage:', error);
        }
    }

    updateMenuThemeOptions() {
        if (this.darkTheme()) {
            this.menuThemeOptions = [
                { name: 'Dark', value: 'dark' },
                { name: 'Primary', value: 'primary' }
            ];
        } else {
            this.menuThemeOptions = [
                { name: 'Light', value: 'light' },
                { name: 'Dark', value: 'dark' },
                { name: 'Primary', value: 'primary' }
            ];
        }
    }

     setMenuTheme(theme: string) {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            menuTheme: theme
        }));
    }

    selectedPrimaryColor = computed(() => {
        return this.layoutService.layoutConfig().primary;
    });
   onLanguageChange(event: any) {
  const lang = event.value;
  this.translateService.use(lang);
  const selectedLanguage = event.value;

  selectedLanguage === 'en'
    ? this.translationService.setLanguage(selectedLanguage, this.englishLanguage)
    : this.translationService.setLanguage(selectedLanguage, this.fenchLanguage);

  this.buildNavMenu();
}

    public logoutRedirect() {
        // Optional: Clear theme preferences on logout
        // Uncomment the next line if you want to reset themes on logout
        // this.clearLocalStorage();

        // this.auth0Service.logout({ returnTo: window.location.origin });
        // this.auth0Service.logout();
    }

    ngAfterViewInit(): void {
        // Calculate responsive menu after view is initialized
        setTimeout(() => this.calculateResponsiveMenu(), 100);
        // Observe container size changes to avoid global resize costs
        if (typeof ResizeObserver !== 'undefined' && this.navContainer?.nativeElement) {
            let rafId: number | null = null;
            this.resizeObserver = new ResizeObserver(() => {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => this.calculateResponsiveMenu());
            });
            this.resizeObserver.observe(this.navContainer.nativeElement);
        }
    }

    ngOnDestroy(): void {
        this.resizeObserver?.disconnect();
    }

    // Ensure only one popup menu is open at a time to avoid overlay overlap
    onOverflowButtonClick(event: Event, overflowMenu: any, userMenu: any) {
        try { userMenu?.hide?.(); } catch (err) { console.error('Error hiding user menu:', err); }
        overflowMenu?.toggle?.(event);
    }

    onUserAvatarClick(event: Event, userMenu: any, overflowMenu: any) {
        try { overflowMenu?.hide?.(); } catch {}
        userMenu?.toggle?.(event);
    }

    ngOnInit(): void {
        this.initializeDarkModePreference();
        this.initializeThemeColorPreference();

    // Build from centralized menu constants
    this.buildNavMenu();

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

                // Check if englishLanguage exists and has languageCode before accessing it
                if (this.englishLanguage && this.englishLanguage.languageCode) {
                    this.translationService.setLanguage(this.englishLanguage.languageCode, this.englishLanguage);
                    this.buildNavMenu();
                } else {
                    console.warn('English language data missing languageCode, using fallback');
                    // Fallback: use default English language code
                    this.translationService.setLanguage('en', this.englishLanguage);
                    this.buildNavMenu();
                }
            } else {
                console.error('Invalid English translation response structure');
            }
        });


    }
}
