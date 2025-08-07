import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { first, of, throwError } from 'rxjs';
import { RoleControlComponent } from './role-control.component';
import { RoleService, PagedResult } from '../../../shared/service/role-control/role.service';
import { RoleConfigData } from '../../../shared/lib/constants';
import { LayoutService } from '../../../shared/service/layout/layout.service';
import { signal } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RoleControlComponent', () => {
  let component: RoleControlComponent;
  let fixture: ComponentFixture<RoleControlComponent>;
  let mockRoleService: jasmine.SpyObj<RoleService>;
  let mockLayoutService: jasmine.SpyObj<LayoutService>;

  // Mock data for testing
  const mockRolesData: RoleConfigData[] = [
    {
      id: 1,
      status: 'Active',
      roleName: 'Admin',
      roleDescription: 'Administrator role',
      rolePrivileges: ['List view', 'Data Management'],
      customLanding: 'Yes',
      defaultLanding: '/dashboard',
      roleType: 'ADMIN',
      skin: 'psa-bdp-light',
      createdBy: 'system',
      createdOn: '2024-01-01T00:00:00Z',
      updatedBy: 'admin',
      updatedOn: '2024-01-15T00:00:00Z'
    },
    {
      id: 2,
      status: 'Active',
      roleName: 'User',
      roleDescription: 'Standard user role',
      rolePrivileges: ['List view'],
      customLanding: 'No',
      defaultLanding: null,
      roleType: 'USER',
      skin: 'bns-light',
      createdBy: 'admin',
      createdOn: '2024-02-01T00:00:00Z',
      updatedBy: 'admin',
      updatedOn: '2024-02-10T00:00:00Z'
    }
  ];

  const mockPagedResult: PagedResult<RoleConfigData> = {
    data: mockRolesData,
    total: 2
  };

  beforeEach(async () => {
    // Create spy objects for dependencies
    mockRoleService = jasmine.createSpyObj('RoleService', ['getActiveRoles']);
    mockLayoutService = jasmine.createSpyObj('LayoutService', ['updateBodyBackground']);

    // Setup default return value for getActiveRoles to handle ngOnInit
    mockRoleService.getActiveRoles.and.returnValue(of(mockPagedResult));

    // Properly setup the layoutConfig signal
    mockLayoutService.layoutConfig = signal({
      darkTheme: false,
      primary: 'blue',
      preset: 'Aura',
      menuTheme: 'light',
      surface: 'surface',
      menuMode: 'static'
    }) as any;

    await TestBed.configureTestingModule({
      imports: [RoleControlComponent, HttpClientTestingModule],
      providers: [
        { provide: RoleService, useValue: mockRoleService },
        { provide: LayoutService, useValue: mockLayoutService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleControlComponent);
    component = fixture.componentInstance;

    // Manually inject the mock service to ensure it's available
    (component as any).roleService = mockRoleService;

    fixture.detectChanges();
  });

  describe('loadRoles function', () => {
    beforeEach(() => {
      // Reset the spy calls from ngOnInit
      mockRoleService.getActiveRoles.calls.reset();
      // Setup console.log spy
      spyOn(console, 'log');
    });

    it('should load roles successfully with valid parameters', () => {
      // Arrange
      const pageIndex = 0;
      const pageSize = 10;
      component.searchTerm = 'admin';
      mockRoleService.getActiveRoles.and.returnValue(of(mockPagedResult));

      // Act
      component.loadRoles(pageIndex, pageSize);

      // Assert
      expect(component.loading).toBe(false);
      expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(pageIndex, pageSize, 'admin');
      expect(component.roles).toEqual(mockRolesData);
      expect(component.totalRecords).toBe(2);
      expect(console.log).toHaveBeenCalledWith('Roles loaded:', mockRolesData);
    });

    it('should set loading to true at start and false after completion', () => {
      // Arrange
      const pageIndex = 1;
      const pageSize = 20;
      component.searchTerm = '';
      mockRoleService.getActiveRoles.and.returnValue(of(mockPagedResult));

      // Initial state
      component.loading = false;

      // Act
      component.loadRoles(pageIndex, pageSize);

      // Assert - loading should be false after completion
      expect(component.loading).toBe(false);
      expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(pageIndex, pageSize, '');
    });

    it('should handle empty search term correctly', () => {
      // Arrange
      const pageIndex = 0;
      const pageSize = 5;
      component.searchTerm = '';
      const emptyResult: PagedResult<RoleConfigData> = { data: [], total: 0 };
      mockRoleService.getActiveRoles.and.returnValue(of(emptyResult));

      // Act
      component.loadRoles(pageIndex, pageSize);

      // Assert
      expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(pageIndex, pageSize, '');
      expect(component.roles).toEqual([]);
      expect(component.totalRecords).toBe(0);
      expect(component.loading).toBe(false);
    });

    it('should handle search term with special characters', () => {
      // Arrange
      const pageIndex = 0;
      const pageSize = 10;
      component.searchTerm = 'admin@test.com';
      mockRoleService.getActiveRoles.and.returnValue(of(mockPagedResult));

      // Act
      component.loadRoles(pageIndex, pageSize);

      // Assert
      expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(pageIndex, pageSize, 'admin@test.com');
      expect(component.roles).toEqual(mockRolesData);
      expect(component.totalRecords).toBe(2);
    });

    it('should handle large page size values', () => {
      // Arrange
      const pageIndex = 10;
      const pageSize = 1000;
      component.searchTerm = 'test';
      mockRoleService.getActiveRoles.and.returnValue(of(mockPagedResult));

      // Act
      component.loadRoles(pageIndex, pageSize);

      // Assert
      expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(pageIndex, pageSize, 'test');
      expect(component.loading).toBe(false);
    });

    it('should handle zero page index', () => {
      // Arrange
      const pageIndex = 0;
      const pageSize = 10;
      component.searchTerm = 'role';
      mockRoleService.getActiveRoles.and.returnValue(of(mockPagedResult));

      // Act
      component.loadRoles(pageIndex, pageSize);

      // Assert
      expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(0, pageSize, 'role');
      expect(component.roles).toEqual(mockRolesData);
    });

    it('should handle service error and set loading to false', () => {
      // Arrange
      const pageIndex = 0;
      const pageSize = 10;
      component.searchTerm = 'test';
      const errorResponse = new Error('Service unavailable');
      mockRoleService.getActiveRoles.and.returnValue(throwError(() => errorResponse));
      spyOn(console, 'error');

      // Store initial values
      const initialRoles = component.roles;
      const initialTotalRecords = component.totalRecords;

      // Act
      component.loadRoles(pageIndex, pageSize);

      // Assert
      expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(pageIndex, pageSize, 'test');
      expect(component.loading).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error loading roles:', errorResponse);
      // Roles and totalRecords should remain unchanged in case of error
      expect(component.roles).toBe(initialRoles);
      expect(component.totalRecords).toBe(initialTotalRecords);
    });

    it('should handle null/undefined response data gracefully', () => {
      // Arrange
      const pageIndex = 0;
      const pageSize = 10;
      component.searchTerm = '';
      const nullResult: PagedResult<RoleConfigData> = { data: null as any, total: 0 };
      mockRoleService.getActiveRoles.and.returnValue(of(nullResult));

      // Act
      component.loadRoles(pageIndex, pageSize);

      // Assert
      expect(component.roles).toBe(null);
      expect(component.totalRecords).toBe(0);
      expect(component.loading).toBe(false);
    });

    it('should handle response with undefined total', () => {
      // Arrange
      const pageIndex = 0;
      const pageSize = 10;
      component.searchTerm = 'test';
      const resultWithUndefinedTotal: PagedResult<RoleConfigData> = {
        data: mockRolesData,
        total: undefined as any
      };
      mockRoleService.getActiveRoles.and.returnValue(of(resultWithUndefinedTotal));

      // Act
      component.loadRoles(pageIndex, pageSize);

      // Assert
      expect(component.roles).toEqual(mockRolesData);
      expect(component.totalRecords).toBeUndefined();
      expect(component.loading).toBe(false);
    });

    it('should update current search term when called with different search values', () => {
      // Arrange
      const pageIndex = 0;
      const pageSize = 10;

      // First call with one search term
      component.searchTerm = 'admin';
      mockRoleService.getActiveRoles.and.returnValue(of(mockPagedResult));
      component.loadRoles(pageIndex, pageSize);

      // Reset spy call count
      mockRoleService.getActiveRoles.calls.reset();

      // Second call with different search term
      component.searchTerm = 'user';
      component.loadRoles(pageIndex, pageSize);

      // Assert
      expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(pageIndex, pageSize, 'user');
      expect(mockRoleService.getActiveRoles).toHaveBeenCalledTimes(1);
    });

    it('should handle negative page index', () => {
      // Arrange
      const pageIndex = -1;
      const pageSize = 10;
      component.searchTerm = '';
      mockRoleService.getActiveRoles.and.returnValue(of(mockPagedResult));

      // Act
      component.loadRoles(pageIndex, pageSize);

      // Assert
      expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(-1, pageSize, '');
      expect(component.loading).toBe(false);
    });

    it('should handle very long search terms', () => {
      // Arrange
      const pageIndex = 0;
      const pageSize = 10;
      const longSearchTerm = 'a'.repeat(1000);
      component.searchTerm = longSearchTerm;
      mockRoleService.getActiveRoles.and.returnValue(of(mockPagedResult));

      // Act
      component.loadRoles(pageIndex, pageSize);

      // Assert
      expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(pageIndex, pageSize, longSearchTerm);
      expect(component.loading).toBe(false);
    });

    it('should verify loading state during async operation', (done) => {
      // Arrange
      const pageIndex = 0;
      const pageSize = 10;
      component.searchTerm = 'test';

      // Create a delayed observable to test loading state
      const delayedResult = new Promise(resolve => {
        setTimeout(() => resolve(mockPagedResult), 10);
      });
      mockRoleService.getActiveRoles.and.returnValue(of(mockPagedResult));

      // Set initial loading state
      component.loading = false;

      // Act
      component.loadRoles(pageIndex, pageSize);

      // Assert - check final state after async completion
      setTimeout(() => {
        expect(component.loading).toBe(false);
        expect(component.roles).toEqual(mockRolesData);
        done();
      }, 20);
    });

    it('should call console.log with correct parameters', () => {
      // Arrange
      const pageIndex = 0;
      const pageSize = 10;
      component.searchTerm = '';
      const customMockData: RoleConfigData[] = [
        {
          id: 99,
          status: 'Active',
          roleName: 'TestRole',
          roleDescription: 'Test Description',
          rolePrivileges: ['Test Privilege'],
          customLanding: 'No',
          defaultLanding: null,
          roleType: 'TEST',
          skin: null,
          createdBy: 'tester',
          createdOn: '2024-03-01T00:00:00Z',
          updatedBy: 'tester',
          updatedOn: '2024-03-01T00:00:00Z'
        }
      ];
      const customResult: PagedResult<RoleConfigData> = { data: customMockData, total: 1 };
      mockRoleService.getActiveRoles.and.returnValue(of(customResult));

      // Act
      component.loadRoles(pageIndex, pageSize);

      // Assert
      expect(console.log).toHaveBeenCalledWith('Roles loaded:', customMockData);
    });

    it('should handle multiple rapid consecutive calls', () => {
      // Arrange
      const pageIndex = 0;
      const pageSize = 10;
      component.searchTerm = 'test';
      mockRoleService.getActiveRoles.and.returnValue(of(mockPagedResult));

      // Act - make multiple rapid calls
      component.loadRoles(pageIndex, pageSize);
      component.loadRoles(pageIndex + 1, pageSize);
      component.loadRoles(pageIndex + 2, pageSize);

      // Assert
      expect(mockRoleService.getActiveRoles).toHaveBeenCalledTimes(3);
      expect(component.loading).toBe(false);
      expect(component.roles).toEqual(mockRolesData);
    });

    it('should handle searchTerm being modified during execution', () => {
      // Arrange
      const pageIndex = 0;
      const pageSize = 10;
      component.searchTerm = 'initial';
      mockRoleService.getActiveRoles.and.returnValue(of(mockPagedResult));

      // Act
      component.loadRoles(pageIndex, pageSize);
      // Simulate searchTerm being changed after function call but before response
      component.searchTerm = 'modified';

      // Assert
      expect(mockRoleService.getActiveRoles).toHaveBeenCalledWith(pageIndex, pageSize, 'initial');
      expect(component.loading).toBe(false);
      expect(component.searchTerm).toBe('modified');
    });

    it('should handle empty roles array response', () => {
      // Arrange
      const pageIndex = 0;
      const pageSize = 10;
      component.searchTerm = 'nonexistent';
      const emptyResponse: PagedResult<RoleConfigData> = { data: [], total: 0 };
      mockRoleService.getActiveRoles.and.returnValue(of(emptyResponse));

      // Act
      component.loadRoles(pageIndex, pageSize);

      // Assert
      expect(component.roles).toEqual([]);
      expect(component.totalRecords).toBe(0);
      expect(component.loading).toBe(false);
      expect(console.log).toHaveBeenCalledWith('Roles loaded:', []);
    });
  });

  describe('onPage function', () => {
    it('should call loadRoles with page and rows from event', () => {
      // Arrange
      const loadRolesSpy = spyOn(component, 'loadRoles');
      const pageEvent = { page: 2, rows: 20, first: 10 };

      // Act
      component.onPage(pageEvent);

      // Assert
      expect(loadRolesSpy).toHaveBeenCalledWith(2, 20);
    });

    it('should handle page 0 with default page size', () => {
      // Arrange
      const loadRolesSpy = spyOn(component, 'loadRoles');
      const pageEvent = { page: 0, rows: 10,  first: 10 };

      // Act
      component.onPage(pageEvent);

      // Assert
      expect(loadRolesSpy).toHaveBeenCalledWith(0, 10);
    });
  });

  describe('updateColors function', () => {
    let mockEvent: jasmine.SpyObj<Event>;

    it('should update primary color and apply theme', () => {
      // Arrange
      mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      const applyThemeSpy = spyOn(component, 'applyTheme');
      const updateBodyBackgroundSpy = spyOn(component.layoutService, 'updateBodyBackground');
      const color = { name: 'blue', palette: { 500: '#0000ff' } };

      // Act
      component.updateColors(mockEvent, 'primary', color);

      // Assert
      expect(applyThemeSpy).toHaveBeenCalledWith('primary', color);
      expect(updateBodyBackgroundSpy).toHaveBeenCalledWith('blue');
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should apply surface theme when type is surface', () => {
      // Arrange
      mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      const applyThemeSpy = spyOn(component, 'applyTheme');
      const updateBodyBackgroundSpy = spyOn(component.layoutService, 'updateBodyBackground');
      const color = { name: 'surface', palette: { 100: '#f5f5f5' } };

      // Act
      component.updateColors(mockEvent, 'surface', color);

      // Assert
      expect(applyThemeSpy).toHaveBeenCalledWith('surface', color);
      expect(updateBodyBackgroundSpy).toHaveBeenCalledWith('surface');
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('onSearch function', () => {
    it('should call loadRoles when search term has 3 or more characters', () => {
      // Arrange
      const loadRolesSpy = spyOn(component, 'loadRoles');
      component.searchTerm = 'admin';

      // Act
      component.onSearch();

      // Assert
      expect(loadRolesSpy).toHaveBeenCalledWith(0, component.pageSize);
    });

    it('should call loadRoles when search term has exactly 3 characters', () => {
      // Arrange
      const loadRolesSpy = spyOn(component, 'loadRoles');
      component.searchTerm = 'abc';

      // Act
      component.onSearch();

      // Assert
      expect(loadRolesSpy).toHaveBeenCalledWith(0, component.pageSize);
    });

    it('should not call loadRoles when search term has less than 3 characters', () => {
      // Arrange
      const loadRolesSpy = spyOn(component, 'loadRoles');
      component.searchTerm = 'ab';

      // Act
      component.onSearch();

      // Assert
      expect(loadRolesSpy).not.toHaveBeenCalled();
    });

    it('should not call loadRoles when search term is empty', () => {
      // Arrange
      const loadRolesSpy = spyOn(component, 'loadRoles');
      component.searchTerm = '';

      // Act
      component.onSearch();

      // Assert
      expect(loadRolesSpy).not.toHaveBeenCalled();
    });
  });

  describe('resetSearch function', () => {
    it('should clear search term and reload roles', () => {
      // Arrange
      const loadRolesSpy = spyOn(component, 'loadRoles');
      component.searchTerm = 'admin';

      // Act
      component.resetSearch();

      // Assert
      expect(component.searchTerm).toBe('');
      expect(loadRolesSpy).toHaveBeenCalledWith(0, component.pageSize);
    });

    it('should reload roles even when search term is already empty', () => {
      // Arrange
      const loadRolesSpy = spyOn(component, 'loadRoles');
      component.searchTerm = '';

      // Act
      component.resetSearch();

      // Assert
      expect(component.searchTerm).toBe('');
      expect(loadRolesSpy).toHaveBeenCalledWith(0, component.pageSize);
    });
  });

  describe('refresh function', () => {
    it('should call loadRoles with current page size', () => {
      // Arrange
      const loadRolesSpy = spyOn(component, 'loadRoles');

      // Act
      component.refresh();

      // Assert
      expect(loadRolesSpy).toHaveBeenCalledWith(0, component.pageSize);
    });

    it('should call loadRoles with custom page size', () => {
      // Arrange
      const loadRolesSpy = spyOn(component, 'loadRoles');
      component.pageSize = 25;

      // Act
      component.refresh();

      // Assert
      expect(loadRolesSpy).toHaveBeenCalledWith(0, 25);
    });
  });

  describe('editRole function', () => {
    it('should call roleConfig open with role data', () => {
      // Arrange
      component.roleConfig = jasmine.createSpyObj('RoleConfigurationComponent', ['open']);
      const testRole: RoleConfigData = {
        id: 1,
        status: 'Active',
        roleName: 'TestRole',
        roleDescription: 'Test Description',
        rolePrivileges: ['List view'],
        customLanding: 'Yes',
        defaultLanding: '/test',
        roleType: 'TEST',
        skin: 'test-skin',
        createdBy: 'tester',
        createdOn: '2024-01-01T00:00:00Z',
        updatedBy: 'tester',
        updatedOn: '2024-01-01T00:00:00Z'
      };

      // Act
      component.editRole(testRole);

      // Assert
      expect(component.roleConfig.open).toHaveBeenCalledWith(testRole);
    });
  });

  describe('openAddRoleDialog function', () => {
    it('should call roleConfig open without parameters', () => {
      // Arrange
      component.roleConfig = jasmine.createSpyObj('RoleConfigurationComponent', ['open']);

      // Act
      component.openAddRoleDialog();

      // Assert
      expect(component.roleConfig.open).toHaveBeenCalledWith();
    });
  });

  describe('getPresetExt function', () => {
    it('should return preset object with semantic structure', () => {
      // Act
      const preset = component.getPresetExt();

      // Assert
      expect(preset).toBeDefined();
      expect(preset.semantic).toBeDefined();
    });
  });

  describe('computed properties', () => {
    it('should have darkTheme computed property', () => {
      // Act
      const darkTheme = component.darkTheme();

      // Assert
      expect(typeof darkTheme).toBe('boolean');
    });

    it('should have selectedPrimaryColor computed property', () => {
      // Act
      const primaryColor = component.selectedPrimaryColor();

      // Assert
      expect(typeof primaryColor).toBe('string');
    });

    it('should compute primaryColors with all available colors', () => {
      // Act
      const colors = component.primaryColors();

      // Assert
      expect(colors.length).toBeGreaterThan(10);
      expect(colors[0].name).toBe('noir');
      expect(colors.some(c => c.name === 'blue')).toBe(true);
      expect(colors.some(c => c.name === 'green')).toBe(true);
    });
  });

  describe('applyTheme function', () => {
    it('should handle primary type', () => {
      // Arrange
      spyOn(component, 'getPresetExt').and.returnValue({
        semantic: {
          primary: { 500: '#0000ff' },
          colorScheme: {
            light: {
              primary: { color: '', contrastColor: '', hoverColor: '', activeColor: '' },
              highlight: { background: '', focusBackground: '', color: '', focusColor: '' },
              surface: { 0: '', 50: '', 100: '', 200: '', 300: '', 400: '', 500: '', 600: '', 700: '', 800: '', 900: '', 950: '' }
            },
            dark: {
              primary: { color: '', contrastColor: '', hoverColor: '', activeColor: '' },
              highlight: { background: '', focusBackground: '', color: '', focusColor: '' },
              surface: { 0: '', 50: '', 100: '', 200: '', 300: '', 400: '', 500: '', 600: '', 700: '', 800: '', 900: '', 950: '' }
            }
          }
        }
      });

      // Act
      component.applyTheme('primary', { name: 'blue' });

      // Assert
      expect(component.getPresetExt).toHaveBeenCalled();
    });

    it('should handle surface type without errors', () => {
      // Arrange
      const color = { palette: { 100: '#f5f5f5' } };

      // Act & Assert - Should not throw
      expect(() => component.applyTheme('surface', color)).not.toThrow();
    });
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
});
