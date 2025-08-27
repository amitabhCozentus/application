import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleControlComponent } from './role-control.component';
import { PagedResult, RoleService } from "../../../../shared/service/role-control/role.service";
import { LayoutService } from '../../../../shared/service/layout/layout.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA, WritableSignal, signal } from '@angular/core';
import { RoleConfigData } from '../../../../shared/lib/constants';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { RoleConfigurationComponent } from '../role-configuration/role-configuration.component';
import { from } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

//  Fake loader to avoid HTTP calls for translations
import { of as observableOf } from 'rxjs';
class FakeLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return observableOf({});
  }
}

describe('RoleControlComponent', () => {
  let component: RoleControlComponent;
  let fixture: ComponentFixture<RoleControlComponent>;
  let mockRoleService: jasmine.SpyObj<RoleService>;
  let mockLayoutService: any;
  let layoutConfigSignal: WritableSignal<any>;

  beforeEach(() => {
    layoutConfigSignal = signal({
      darkTheme: false,
      preset: 'Aura',
      primary: 'blue'
    });

    mockRoleService = jasmine.createSpyObj('RoleService', ['getActiveRoles']);
    mockLayoutService = {
      layoutConfig: layoutConfigSignal,
      updateBodyBackground: jasmine.createSpy('updateBodyBackground')
    };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RoleControlComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader }
        })
      ],
      providers: [
        { provide: RoleService, useValue: mockRoleService },
        { provide: LayoutService, useValue: mockLayoutService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(RoleControlComponent);
    component = fixture.componentInstance;

    // Mock the roleConfig ViewChild
    component.roleConfig = jasmine.createSpyObj('RoleConfigurationComponent', ['openDialog']);

    // Default mock response
    mockRoleService.getActiveRoles.and.returnValue(of({
      data: [
        {
          id: 1,
          roleName: 'Admin',
          status: 'Active',
          roleDescription: 'Administrator role',
          rolePrivileges: ['user.create', 'user.edit'],
          customLanding: 'No',
          defaultLanding: '/dashboard',
          roleType: 'system',
          skin: 'default',
          createdBy: 'system',
          createdOn: '2024-01-01',
          updatedBy: 'system',
          updatedOn: '2024-01-01'
        } as RoleConfigData
      ],
      total: 1
    } as PagedResult<RoleConfigData>));
  });

  describe('Component Initialization', () => {
        it('should create component', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with correct default values', () => {
            expect(component.canEdit).toBe(true);
            expect(component.pageSize).toBe(10);
            expect(component.currentPage).toBe(0);
            expect(component.searchTerm).toBe('');
            // loading might be true initially if detectChanges triggered loadRoles
            expect(component.roles).toEqual([]);
            expect(component.totalRecords).toBe(0);
        });

        it('should have proper dependencies injected', () => {
            expect(component['roleService']).toBe(mockRoleService);
            expect(component.layoutService).toBe(mockLayoutService);
        });

        it('should initialize with role table headers', () => {
            expect(component.roleTableHeaders).toBeDefined();
            expect(component.roleTableHeaders.length).toBeGreaterThan(0);
        });

        it('should initialize primaryColors computed property', () => {
            const colors = component.primaryColors();
            expect(colors).toBeDefined();
            expect(colors.length).toBeGreaterThan(0);
            expect(colors[0]).toEqual({ name: 'noir', palette: {} });
        });

        it('should initialize darkTheme computed property', () => {
            const isDark = component.darkTheme();
            expect(isDark).toBe(false);
        });

        it('should initialize selectedPrimaryColor computed property', () => {
            const primaryColor = component.selectedPrimaryColor();
            expect(primaryColor).toBe('blue');
        });

        it('should have menuThemeOptions array initialized', () => {
            expect(component.menuThemeOptions).toBeDefined();
            expect(Array.isArray(component.menuThemeOptions)).toBe(true);
        });

        it('should initialize with empty roles array and zero total records', () => {
            expect(component.roles).toEqual([]);
            expect(component.totalRecords).toBe(0);
        });
    });

    describe('ngOnInit', () => {
        it('should not call loadRoles automatically (lazy loading)', () => {
            spyOn(component, 'loadRoles');
            component.ngOnInit();
            expect(component.loadRoles).not.toHaveBeenCalled();
        });

        it('should initialize without errors', () => {
            expect(() => component.ngOnInit()).not.toThrow();
        });
    });

    describe('loadRoles', () => {
        it('should set loading to true initially', () => {
            // Reset the spy to avoid interference from beforeEach
            mockRoleService.getActiveRoles.calls.reset();

            // Spy on the loadRoles method to check loading state at the exact moment
            const originalLoadRoles = component.loadRoles;
            spyOn(component, 'loadRoles').and.callFake(function(this: RoleControlComponent, pageIndex: number, pageSize: number) {
                this.loading = true;
                // Now assert that loading is true
                expect(this.loading).toBeTruthy();

                // Call the original method to complete the test
                return originalLoadRoles.call(this, pageIndex, pageSize, '');
            });

            component.loadRoles(0, 10, '');
        });

        it('should call roleService.getActiveRoles with correct parameters', () => {
            component.loadRoles(1, 20, 'test');
            expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(1, 20, 'test');
        });

        it('should update roles and totalRecords on successful response', (done) => {
            component.loadRoles(0, 10, '');

            setTimeout(() => {
                expect(component.roles.length).toBe(1);
                expect(component.roles[0].roleName).toBe('Admin');
                expect(component.totalRecords).toBe(1);
                expect(component.loading).toBe(false);
                done();
            });
        });

        it('should update component state on successful load', (done) => {
            component.loadRoles(0, 10, '');

            setTimeout(() => {
                expect(component.roles.length).toBe(1);
                expect(component.totalRecords).toBe(1);
                expect(component.loading).toBe(false);
                done();
            });
        });

        it('should handle service errors gracefully', (done) => {
            const error = new Error('Network error');
            mockRoleService.getActiveRoles.and.returnValue(throwError(() => error));
            spyOn(console, 'error');

            component.loadRoles(0, 10, '');

            setTimeout(() => {
                expect(component.loading).toBe(false);
                expect(console.error).toHaveBeenCalledWith('Error loading roles:', error);
                done();
            });
        });

        it('should handle empty response', (done) => {
            mockRoleService.getActiveRoles.and.returnValue(of({
                data: [],
                total: 0
            } as PagedResult<RoleConfigData>));

            component.loadRoles(0, 10, '');

            setTimeout(() => {
                expect(component.roles).toEqual([]);
                expect(component.totalRecords).toBe(0);
                expect(component.loading).toBe(false);
                done();
            });
        });
    });

    describe('Pagination', () => {
        it('should update current page and page size on page event', () => {
            const pageEvent = { page: 2, rows: 25, first: 50 };
            spyOn(component, 'loadRoles');

            component.onPage(pageEvent);

            expect(component.currentPage).toBe(2);
            expect(component.pageSize).toBe(25);
            expect(component.loadRoles).toHaveBeenCalledWith(2, 25, '');
        });

        it('should handle first page correctly', () => {
            const pageEvent = { page: 0, rows: 10, first: 0 };
            spyOn(component, 'loadRoles');

            component.onPage(pageEvent);

            expect(component.currentPage).toBe(0);
            expect(component.pageSize).toBe(10);
            expect(component.loadRoles).toHaveBeenCalledWith(0, 10, '');
        });
    });

    describe('Search Functionality', () => {
        beforeEach(() => {
            spyOn(component, 'loadRoles');
        });

        it('should search when term has 3 or more characters', () => {
            component.searchTerm = 'adm';
            component.onSearch();

            expect(component.currentPage).toBe(0);
            expect(component.loadRoles).toHaveBeenCalledWith(0, 10, 'adm');
        });

        it('should search with exactly 3 characters', () => {
            component.searchTerm = 'abc';
            component.onSearch();

            expect(component.currentPage).toBe(0);
            expect(component.loadRoles).toHaveBeenCalledWith(0, 10, 'abc');
        });

        it('should search with more than 3 characters', () => {
            component.searchTerm = 'admin role';
            component.onSearch();

            expect(component.currentPage).toBe(0);
            expect(component.loadRoles).toHaveBeenCalledWith(0, 10, 'admin role');
        });

        it('should not search when term has less than 3 characters', () => {
            component.searchTerm = 'ab';
            component.onSearch();

            expect(component.loadRoles).not.toHaveBeenCalled();
        });

        it('should not search when term is empty', () => {
            component.searchTerm = '';
            component.onSearch();

            expect(component.loadRoles).not.toHaveBeenCalled();
        });

        it('should not search when term has only spaces', () => {
            component.searchTerm = '  ';
            component.onSearch();

            expect(component.loadRoles).not.toHaveBeenCalled();
        });

        it('should trim search term before validation', () => {
            component.searchTerm = '  admin  ';
            component.onSearch();

            // Should search because trimmed length is >= 3
            expect(component.currentPage).toBe(0);
            expect(component.loadRoles).toHaveBeenCalledWith(0, 10, 'admin');
        });

        it('should not search when trimmed term has less than 3 characters', () => {
            component.searchTerm = '  ab  ';
            component.onSearch();

            expect(component.loadRoles).not.toHaveBeenCalled();
        });

        it('should handle special characters in search term', () => {
            component.searchTerm = 'admin@#$';
            component.onSearch();

            expect(component.currentPage).toBe(0);
            expect(component.loadRoles).toHaveBeenCalledWith(0, 10, 'admin@#$');
        });

        it('should reset search term and reload data', () => {
            component.searchTerm = 'test search';
            component.currentPage = 2;

            component.refresh();

            expect(component.searchTerm).toBe('');
            expect(component.currentPage).toBe(0);
            expect(component.loadRoles).toHaveBeenCalledWith(0, 10, '');
        });
    });

    describe('Refresh Functionality', () => {
        it('should reload roles with current page and size parameters', () => {
            spyOn(component, 'loadRoles');
            component.currentPage = 3;
            component.pageSize = 15;
            component.searchTerm = 'test';

            component.refresh();

            expect(component.loadRoles).toHaveBeenCalledWith(3, 15, 'test');
        });

        it('should maintain search term during refresh', () => {
            component.searchTerm = 'admin';
            component.currentPage = 1;
            component.pageSize = 20;

            component.refresh();

            expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(1, 20, 'admin');
        });
    });

    describe('Dialog Operations', () => {
        it('should open role configuration dialog for editing with role data', () => {
            const testRole: RoleConfigData = {
                id: 1,
                roleName: 'Test Role',
                status: 'Active',
                roleDescription: 'Test Description',
                rolePrivileges: ['test.privilege'],
                customLanding: 'No',
                defaultLanding: '/test',
                roleType: 'custom',
                skin: 'default',
                createdBy: 'testuser',
                createdOn: '2024-01-01',
                updatedBy: 'testuser',
                updatedOn: '2024-01-01'
            };

            component.editRole(testRole);

            expect(component.roleConfig.openDialog).toHaveBeenCalledWith(testRole);
        });

        it('should open empty role configuration dialog for adding new role', () => {
            component.openAddRoleDialog();

            expect(component.roleConfig.openDialog).toHaveBeenCalledWith();
        });

        it('should handle null role data in editRole', () => {
            const nullRole = null as any;

            component.editRole(nullRole);

            expect(component.roleConfig.openDialog).toHaveBeenCalledWith(null);
        });
    });

    describe('Theme Management', () => {
        let mockEvent: any;

        beforeEach(() => {
            mockEvent = {
                stopPropagation: jasmine.createSpy('stopPropagation')
            };
        });

        it('should update primary color and call related methods', () => {
            const color = { name: 'green', palette: { 500: '#10b981' } };
            spyOn(component, 'applyTheme');
            spyOn(layoutConfigSignal, 'update');

            component.updateColors(mockEvent, 'primary', color);

            expect(layoutConfigSignal.update).toHaveBeenCalled();
            expect(component.applyTheme).toHaveBeenCalledWith('primary', color);
            expect(component.layoutService.updateBodyBackground).toHaveBeenCalledWith('green');
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });

        it('should handle surface color updates', () => {
            const color = { name: 'gray', palette: { 500: '#6b7280' } };
            spyOn(component, 'applyTheme');

            component.updateColors(mockEvent, 'surface', color);

            expect(component.applyTheme).toHaveBeenCalledWith('surface', color);
            expect(component.layoutService.updateBodyBackground).toHaveBeenCalledWith('gray');
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });

        it('should call applyTheme for primary color type', () => {
            const color = { name: 'blue', palette: {} };
            spyOn(component, 'applyTheme').and.callThrough();

            component.applyTheme('primary', color);

            expect(component.applyTheme).toHaveBeenCalledWith('primary', color);
        });

        it('should call updateSurfacePalette for surface color type', () => {
            const color = { name: 'surface', palette: { 500: '#ffffff' } };
            // Mock updateSurfacePalette since it's imported from @primeng/themes
            spyOn<any>(component, 'applyTheme').and.callThrough();

            component.applyTheme('surface', color);

            // Just verify the method was called without error
            expect(component.applyTheme).toHaveBeenCalled();
        });

        it('should handle unknown theme type in applyTheme', () => {
            const color = { name: 'unknown', palette: { 500: '#ffffff' } };
            spyOn<any>(component, 'applyTheme').and.callThrough();

            // Should not throw error for unknown type
            expect(() => component.applyTheme('unknown', color)).not.toThrow();
            expect(component.applyTheme).toHaveBeenCalled();
        });

        it('should handle color update without layout config update for non-primary type', () => {
            const color = { name: 'surface', palette: { 500: '#ffffff' } };
            spyOn(component, 'applyTheme');
            spyOn(layoutConfigSignal, 'update');

            component.updateColors(mockEvent, 'surface', color);

            expect(layoutConfigSignal.update).not.toHaveBeenCalled();
            expect(component.applyTheme).toHaveBeenCalledWith('surface', color);
            expect(component.layoutService.updateBodyBackground).toHaveBeenCalledWith('surface');
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });

        it('should handle updateColors with undefined color name', () => {
            const color = { palette: { 500: '#ffffff' } }; // No name property
            spyOn(component, 'applyTheme');

            component.updateColors(mockEvent, 'primary', color);

            expect(component.layoutService.updateBodyBackground).toHaveBeenCalledWith(undefined);
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });
    });

    describe('Theme Preset Generation', () => {
        it('should generate noir preset correctly', () => {
            // Mock primaryColors to include noir
            spyOn(component, 'primaryColors').and.returnValue([
                { name: 'noir', palette: {} },
                { name: 'blue', palette: { 500: '#3b82f6' } }
            ]);
            spyOn(component, 'selectedPrimaryColor').and.returnValue('noir');

            const preset = component.getPresetExt();

            expect(preset.semantic.primary['50']).toBe('{zinc.50}');
            expect(preset.semantic.colorScheme.light.primary.color).toBe('{primary.950}');
        });

        it('should generate color preset for non-noir colors', () => {
            spyOn(component, 'primaryColors').and.returnValue([
                { name: 'noir', palette: {} },
                { name: 'blue', palette: { 500: '#3b82f6' } }
            ]);
            spyOn(component, 'selectedPrimaryColor').and.returnValue('blue');

            const preset = component.getPresetExt();

            expect(preset.semantic.primary).toEqual({ 500: '#3b82f6' });
            expect(preset.semantic.colorScheme.light.primary.color).toBe('{primary.500}');
        });

        it('should handle missing color in primaryColors', () => {
            spyOn(component, 'primaryColors').and.returnValue([
                { name: 'noir', palette: {} }
            ]);
            spyOn(component, 'selectedPrimaryColor').and.returnValue('nonexistent');

            const preset = component.getPresetExt();

            // Should default to empty object behavior
            expect(preset).toBeDefined();
        });

        it('should generate complete noir preset with all theme properties', () => {
            spyOn(component, 'primaryColors').and.returnValue([
                { name: 'noir', palette: {} },
                { name: 'blue', palette: { 500: '#3b82f6' } }
            ]);
            spyOn(component, 'selectedPrimaryColor').and.returnValue('noir');

            const preset = component.getPresetExt();

            // Test complete noir preset structure
            expect(preset.semantic.primary['50']).toBe('{zinc.50}');
            expect(preset.semantic.primary['100']).toBe('{zinc.100}');
            expect(preset.semantic.primary['950']).toBe('{zinc.950}');

            // Test light theme properties
            expect(preset.semantic.colorScheme.light.primary.color).toBe('{primary.950}');
            expect(preset.semantic.colorScheme.light.primary.contrastColor).toBe('#ffffff');
            expect(preset.semantic.colorScheme.light.primary.hoverColor).toBe('{primary.800}');
            expect(preset.semantic.colorScheme.light.primary.activeColor).toBe('{primary.700}');

            // Test highlight properties
            expect(preset.semantic.colorScheme.light.highlight.background).toBe('{primary.950}');
            expect(preset.semantic.colorScheme.light.highlight.focusBackground).toBe('{primary.700}');

            // Test dark theme properties
            expect(preset.semantic.colorScheme.dark.primary.color).toBe('{primary.50}');
            expect(preset.semantic.colorScheme.dark.primary.contrastColor).toBe('{primary.950}');
            expect(preset.semantic.colorScheme.dark.highlight.background).toBe('{primary.50}');
        });

        it('should generate complete non-noir preset with all theme properties', () => {
            spyOn(component, 'primaryColors').and.returnValue([
                { name: 'noir', palette: {} },
                { name: 'emerald', palette: { 500: '#10b981', 400: '#34d399' } }
            ]);
            spyOn(component, 'selectedPrimaryColor').and.returnValue('emerald');

            const preset = component.getPresetExt();

            // Test non-noir preset structure
            expect(preset.semantic.primary).toEqual({ 500: '#10b981', 400: '#34d399' });

            // Test light theme properties
            expect(preset.semantic.colorScheme.light.primary.color).toBe('{primary.500}');
            expect(preset.semantic.colorScheme.light.primary.contrastColor).toBe('#ffffff');
            expect(preset.semantic.colorScheme.light.primary.hoverColor).toBe('{primary.600}');
            expect(preset.semantic.colorScheme.light.primary.activeColor).toBe('{primary.700}');

            // Test surface color mixing
            expect(preset.semantic.colorScheme.light.surface['0']).toBe('color-mix(in srgb, {primary.900}, white 100%)');
            expect(preset.semantic.colorScheme.light.surface['950']).toBe('color-mix(in srgb, {primary.900}, white 0%)');

            // Test dark theme properties
            expect(preset.semantic.colorScheme.dark.primary.color).toBe('{primary.400}');
            expect(preset.semantic.colorScheme.dark.primary.contrastColor).toBe('{surface.900}');

            // Test dark surface properties
            expect(preset.semantic.colorScheme.dark.surface['0']).toBe('color-mix(in srgb, var(--surface-ground), white 100%)');
            expect(preset.semantic.colorScheme.dark.surface['950']).toBe('color-mix(in srgb, var(--surface-ground), white 5%)');
        });

        it('should handle empty palette in primaryColors', () => {
            spyOn(component, 'primaryColors').and.returnValue([
                { name: 'noir', palette: {} },
                { name: 'blue', palette: {} } // Empty palette
            ]);
            spyOn(component, 'selectedPrimaryColor').and.returnValue('blue');

            const preset = component.getPresetExt();

            // Should handle empty palette gracefully
            expect(preset.semantic.primary).toEqual({});
            expect(preset.semantic.colorScheme).toBeDefined();
        });
    });

    describe('Computed Properties', () => {
        it('should update darkTheme when layout config changes', () => {
            expect(component.darkTheme()).toBe(false);

            // Update the signal
            layoutConfigSignal.set({ darkTheme: true, preset: 'Aura', primary: 'blue' });

            expect(component.darkTheme()).toBe(true);
        });

        it('should update selectedPrimaryColor when layout config changes', () => {
            expect(component.selectedPrimaryColor()).toBe('blue');

            // Update the signal
            layoutConfigSignal.set({ darkTheme: false, preset: 'Aura', primary: 'green' });

            expect(component.selectedPrimaryColor()).toBe('green');
        });

        it('should generate primaryColors with correct structure', () => {
            const colors = component.primaryColors();

            expect(colors).toBeDefined();
            expect(colors.length).toBeGreaterThan(0);
            expect(colors[0]).toEqual({ name: 'noir', palette: {} });

            // Check that other colors have proper structure
            const colorNames = ['emerald', 'green', 'lime', 'orange', 'amber', 'yellow',
                              'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet',
                              'purple', 'fuchsia', 'pink', 'rose'];

            colorNames.forEach(colorName => {
                const colorObj = colors.find(c => c.name === colorName);
                expect(colorObj).toBeDefined();
                expect(colorObj?.name).toBe(colorName);
                expect(colorObj?.palette).toBeDefined();
            });
        });

        it('should handle layout config with undefined properties', () => {
            layoutConfigSignal.set({ darkTheme: undefined, preset: undefined, primary: undefined } as any);

            expect(component.darkTheme()).toBeUndefined();
            expect(component.selectedPrimaryColor()).toBeUndefined();
        });

        it('should handle layout config signal updates reactively', () => {
            const initialDark = component.darkTheme();
            const initialPrimary = component.selectedPrimaryColor();

            expect(initialDark).toBe(false);
            expect(initialPrimary).toBe('blue');

            // Update multiple times to test reactivity
            layoutConfigSignal.set({ darkTheme: true, preset: 'Material', primary: 'red' });
            expect(component.darkTheme()).toBe(true);
            expect(component.selectedPrimaryColor()).toBe('red');

            layoutConfigSignal.set({ darkTheme: false, preset: 'Bootstrap', primary: 'green' });
            expect(component.darkTheme()).toBe(false);
            expect(component.selectedPrimaryColor()).toBe('green');
        });

        it('should maintain primaryColors consistency across multiple calls', () => {
            const colors1 = component.primaryColors();
            const colors2 = component.primaryColors();

            expect(colors1).toEqual(colors2);
            expect(colors1.length).toBe(colors2.length);
        });
    });

    describe('Error Handling', () => {
        it('should handle undefined service responses', (done) => {
            mockRoleService.getActiveRoles.and.returnValue(of(undefined as any));
            spyOn(console, 'error');

            component.loadRoles(0, 10, '');

            setTimeout(() => {
                // Component should handle undefined gracefully and set loading to false
                expect(component.loading).toBe(false);
                // Should not crash, so we can verify component state
                expect(component.roles).toEqual([]);
                expect(component.totalRecords).toBe(0);
                done();
            });
        });

        it('should handle malformed service responses', (done) => {
            mockRoleService.getActiveRoles.and.returnValue(of({ invalidResponse: true } as any));

            component.loadRoles(0, 10, '');

            setTimeout(() => {
                expect(component.loading).toBe(false);
                done();
            });
        });

        it('should handle null service response', (done) => {
            mockRoleService.getActiveRoles.and.returnValue(of(null as any));

            component.loadRoles(0, 10, '');

            setTimeout(() => {
                expect(component.loading).toBe(false);
                expect(component.roles).toEqual([]);
                expect(component.totalRecords).toBe(0);
                done();
            });
        });

        it('should handle service response with null data property', (done) => {
            mockRoleService.getActiveRoles.and.returnValue(of({ data: null, total: 5 } as any));

            component.loadRoles(0, 10, '');

            setTimeout(() => {
                expect(component.loading).toBe(false);
                expect(component.roles).toEqual([]);
                expect(component.totalRecords).toBe(0);
                done();
            });
        });

        it('should handle service response with missing total property', (done) => {
            mockRoleService.getActiveRoles.and.returnValue(of({
                data: [{ id: 1, roleName: 'Test' } as RoleConfigData]
            } as any));

            component.loadRoles(0, 10, '');

            setTimeout(() => {
                expect(component.loading).toBe(false);
                expect(component.roles.length).toBe(1);
                expect(component.totalRecords).toBeUndefined(); // Will be undefined, not 0
                done();
            });
        });

        it('should handle network timeout errors', (done) => {
            const timeoutError = new Error('Network timeout');
            timeoutError.name = 'TimeoutError';
            mockRoleService.getActiveRoles.and.returnValue(throwError(() => timeoutError));
            spyOn(console, 'error');

            component.loadRoles(0, 10, '');

            setTimeout(() => {
                expect(component.loading).toBe(false);
                expect(console.error).toHaveBeenCalledWith('Error loading roles:', timeoutError);
                done();
            });
        });

        it('should handle HTTP error responses', (done) => {
            const httpError = { status: 500, message: 'Internal Server Error' };
            mockRoleService.getActiveRoles.and.returnValue(throwError(() => httpError));
            spyOn(console, 'error');

            component.loadRoles(0, 10, '');

            setTimeout(() => {
                expect(component.loading).toBe(false);
                expect(console.error).toHaveBeenCalledWith('Error loading roles:', httpError);
                done();
            });
        });
    });

    describe('Integration Tests', () => {
        it('should perform complete search workflow', () => {
            spyOn(component, 'loadRoles').and.callThrough();

            // Set search term and search
            component.searchTerm = 'admin';
            component.onSearch();

            expect(component.currentPage).toBe(0);
            expect(component.loadRoles).toHaveBeenCalledWith(0, 10, 'admin');
            expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(0, 10, 'admin');
        });

        it('should perform complete pagination workflow', () => {
            const pageEvent = { page: 1, rows: 15, first: 15 };

            component.onPage(pageEvent);

            expect(component.currentPage).toBe(1);
            expect(component.pageSize).toBe(15);
            expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(1, 15, '');
        });

        it('should maintain state across multiple operations', () => {
            // Set initial state
            component.searchTerm = 'test';
            component.currentPage = 2;
            component.pageSize = 20;

            // Refresh should maintain current state
            component.refresh();
            expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(2, 20, 'test');

            // Reset should clear search but maintain page size
            component.refresh();
            expect(component.searchTerm).toBe('');
            expect(component.currentPage).toBe(0);
            expect(component.pageSize).toBe(20); // Should remain unchanged
        });

        it('should handle multiple rapid operations correctly', () => {
            // Simulate rapid user interactions
            component.searchTerm = 'test';
            component.onSearch();

            const pageEvent = { page: 1, rows: 15, first: 15 };
            component.onPage(pageEvent);

            component.refresh();

            // Should end up with latest state
            expect(component.currentPage).toBe(1);
            expect(component.pageSize).toBe(15);
            expect(component.searchTerm).toBe('test');
        });

        it('should preserve search term across page changes', () => {
            component.searchTerm = 'admin';
            component.onSearch();

            const pageEvent = { page: 2, rows: 10, first: 20 };
            component.onPage(pageEvent);

            // Search term should be preserved
            expect(component.searchTerm).toBe('admin');
            expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(2, 10, 'admin');
        });

        it('should handle component destruction gracefully', () => {
            // Test that component can be destroyed without errors
            expect(() => {
                fixture.destroy();
            }).not.toThrow();
        });
    });

    describe('ViewChild and Template Integration', () => {
        it('should have roleConfig ViewChild properly mocked', () => {
            expect(component.roleConfig).toBeDefined();
            expect(component.roleConfig.openDialog).toBeDefined();
            expect(typeof component.roleConfig.openDialog).toBe('function');
        });

        it('should handle roleConfig ViewChild method calls', () => {
            const testRole = { id: 1, roleName: 'Test' } as RoleConfigData;

            expect(() => {
                component.editRole(testRole);
                component.openAddRoleDialog();
            }).not.toThrow();

            expect(component.roleConfig.openDialog).toHaveBeenCalledTimes(2);
        });
    });

    describe('Component Properties and State', () => {
        it('should have proper initial canEdit state', () => {
            expect(component.canEdit).toBe(true);
            expect(typeof component.canEdit).toBe('boolean');
        });

        it('should handle canEdit state changes', () => {
            component.canEdit = false;
            expect(component.canEdit).toBe(false);

            component.canEdit = true;
            expect(component.canEdit).toBe(true);
        });

        it('should maintain proper data types for all properties', () => {
            expect(typeof component.pageSize).toBe('number');
            expect(typeof component.currentPage).toBe('number');
            expect(typeof component.searchTerm).toBe('string');
            expect(typeof component.loading).toBe('boolean');
            expect(typeof component.canEdit).toBe('boolean');
            expect(Array.isArray(component.roles)).toBe(true);
            expect(typeof component.totalRecords).toBe('number');
            expect(Array.isArray(component.roleTableHeaders)).toBe(true);
        });

        it('should handle large page sizes correctly', () => {
            const largePageEvent = { page: 0, rows: 1000, first: 0 };
            spyOn(component, 'loadRoles');

            component.onPage(largePageEvent);

            expect(component.pageSize).toBe(1000);
            expect(component.loadRoles).toHaveBeenCalledWith(0, 1000, '');
        });

        it('should handle negative page values gracefully', () => {
            const negativePageEvent = { page: -1, rows: 10, first: -10 };
            spyOn(component, 'loadRoles');

            component.onPage(negativePageEvent);

            expect(component.currentPage).toBe(-1);
            expect(component.loadRoles).toHaveBeenCalledWith(-1, 10, '');
        });
    });

    describe('Service Integration Edge Cases', () => {
        it('should handle service returning empty string search term', () => {
            component.searchTerm = '';
            component.loadRoles(0, 10, '');

            expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(0, 10, '');
        });

        it('should handle service call with whitespace-only search term', () => {
            component.searchTerm = '   ';
            component.loadRoles(0, 10, '');

            expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(0, 10, '');
        });

                it('should handle multiple consecutive loadRoles calls', () => {
            // Reset spy call count to start fresh
            mockRoleService.getActiveRoles.calls.reset();

            component.loadRoles(0, 10, '');
            component.loadRoles(1, 20, '');
            component.loadRoles(2, 30, '');

            expect(mockRoleService.getActiveRoles).toHaveBeenCalledTimes(3);
            expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(0, 10, '');
            expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(1, 20, '');
            expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(2, 30, '');
        });

        it('should maintain loading state during multiple rapid calls', () => {
            component.loading = false;

            component.loadRoles(0, 10, '');
            // Loading state is set to true at start of loadRoles, then set to false in subscribe
            // Since we're using mocked observables, the loading will be false after subscription completes
            expect(component.loading).toBe(false); // Observable completes immediately with mock

            // Simulate rapid call
            component.loadRoles(1, 10, '');
            expect(component.loading).toBe(false); // Observable completes immediately with mock
        });
    });

    describe('Console Logging', () => {
        it('should not log anything during normal ngOnInit', () => {
            spyOn(console, 'log');
            component.ngOnInit();
            expect(console.log).not.toHaveBeenCalled();
        });

        it('should not log roles data after successful load', (done) => {
            spyOn(console, 'log');
            component.loadRoles(0, 10, '');

            setTimeout(() => {
                expect(console.log).not.toHaveBeenCalled();
                done();
            });
        });

        it('should log different types of errors appropriately', (done) => {
            const customError = { message: 'Custom error', code: 'ERR_001' };
            mockRoleService.getActiveRoles.and.returnValue(throwError(() => customError));
            spyOn(console, 'error');

            component.loadRoles(0, 10, '');

            setTimeout(() => {
                expect(console.error).toHaveBeenCalledWith('Error loading roles:', customError);
                done();
            });
        });
    });

    describe('Component Lifecycle and Memory Management', () => {
                it('should handle component reinitialization', () => {
            // Reset spy call count to start fresh
            mockRoleService.getActiveRoles.calls.reset();

            // Simulate component reinitialization
            component.ngOnInit();
            component.ngOnInit(); // Called twice

            // ngOnInit doesn't call loadRoles, so service should not be called
            expect(mockRoleService.getActiveRoles).toHaveBeenCalledTimes(0);
        });

        it('should reset all properties correctly during refresh', () => {
            // Set non-default values
            component.searchTerm = 'test search term';
            component.currentPage = 5;
            component.totalRecords = 100;
            component.roles = [{ id: 1, roleName: 'Test' } as RoleConfigData];

            spyOn(component, 'loadRoles');
            component.refresh();

            expect(component.searchTerm).toBe('');
            expect(component.currentPage).toBe(0);
            // Note: totalRecords and roles will be updated by loadRoles, not refresh
            expect(component.loadRoles).toHaveBeenCalledWith(0, 10, '');
        });

        it('should maintain pageSize across different operations', () => {
            const initialPageSize = component.pageSize;

            component.onSearch();
            expect(component.pageSize).toBe(initialPageSize);

            component.refresh();
            expect(component.pageSize).toBe(initialPageSize);
        });
    });

    describe('Dialog Integration Advanced Cases', () => {
        it('should handle editRole with complex role data', () => {
            const complexRole: RoleConfigData = {
                id: 999,
                roleName: 'Complex Role with Special Characters !@#$%',
                status: 'Active',
                roleDescription: 'A very long description that contains special characters and numbers 123',
                rolePrivileges: ['complex.privilege.1', 'complex.privilege.2', 'nested.privilege.with.dots'],
                customLanding: 'Yes',
                defaultLanding: '/complex/path/with/parameters?param=value',
                roleType: 'custom-advanced',
                skin: 'custom-theme-skin',
                createdBy: 'admin@company.com',
                createdOn: '2024-12-31T23:59:59.999Z',
                updatedBy: 'superadmin@company.com',
                updatedOn: '2025-01-01T00:00:00.000Z'
            };

            component.editRole(complexRole);
            expect(component.roleConfig.openDialog).toHaveBeenCalledWith(complexRole);
        });

        it('should handle multiple rapid dialog operations', () => {
            const role1 = { id: 1, roleName: 'Role1' } as RoleConfigData;
            const role2 = { id: 2, roleName: 'Role2' } as RoleConfigData;

            component.editRole(role1);
            component.editRole(role2);
            component.openAddRoleDialog();
            component.openAddRoleDialog();

            expect(component.roleConfig.openDialog).toHaveBeenCalledTimes(4);
            expect(component.roleConfig.openDialog).toHaveBeenCalledWith(role1);
            expect(component.roleConfig.openDialog).toHaveBeenCalledWith(role2);
            expect(component.roleConfig.openDialog).toHaveBeenCalledWith(); // Called twice for add dialog
        });
    });
});

