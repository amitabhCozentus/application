import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { RoleConfigurationComponent } from './role-configuration.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastComponent } from 'src/app/shared/component/toast-component/toast.component';
import { MessageService } from 'primeng/api';
import { RoleService } from 'src/app/shared/service/role-control/role.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('RoleConfigurationComponent', () => {
  let component: RoleConfigurationComponent;
  let fixture: ComponentFixture<RoleConfigurationComponent>;
  let roleService: RoleService;

  const privilegeHierarchyMock = [
    {
    categoryId: 1,
      categoryName: 'Administration',
      categoryKey: 'ADMIN',
      features: [
        {
      featureId: 10,
          featureName: 'Users',
          featureKey: 'USERS',
          privileges: [
            { privilegeId: 1, privilegeName: 'View', privilegeKey: 'VIEW', mapCatFeatPrivId: 101, isSelected: false },
            { privilegeId: 2, privilegeName: 'Edit', privilegeKey: 'EDIT', mapCatFeatPrivId: 102, isSelected: false }
          ]
        }
      ]
    }
  ];

  const skinsResponseMock = [
    {
  roleType: { id: 10, key: 'PSA', name: 'PSA BDP' },
      skins: [
        { id: 1001, key: 'classic', name: 'Classic' },
        { id: 1002, key: 'modern', name: 'Modern' }
      ]
    }
  ];

  const landingPagesMock = [
    { id: 21, key: 'dashboard', name: 'Dashboard' },
    { id: 22, key: 'reports', name: 'Reports' }
  ];

  beforeEach(async () => {
    class FakeLoader implements TranslateLoader {
      getTranslation(lang: string) { return of({}); }
    }

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RoleConfigurationComponent,
        ToastComponent,
  TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: FakeLoader } }),
  NoopAnimationsModule
      ],
      providers: [
        MessageService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleConfigurationComponent);
    component = fixture.componentInstance;
    // Spy on the actual injected service instance (component has its own provider)
    roleService = (component as any)['roleService'];
  spyOn(roleService, 'getPrivilegeHierarchy').and.returnValue(of(privilegeHierarchyMock) as any);
  spyOn(roleService, 'getSkins').and.returnValue(of(skinsResponseMock) as any);
  spyOn(roleService, 'getLandingPages').and.returnValue(of(landingPagesMock) as any);
  (roleService.createRole as any as jasmine.Spy) = spyOn(roleService, 'createRole').and.returnValue(of({ body: { success: true } } as any) as any);
  (roleService.updateRole as any as jasmine.Spy) = spyOn(roleService, 'updateRole').and.returnValue(of({ success: true } as any) as any);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should block save and show error when required fields are missing', () => {
    spyOn(component.toastComponent, 'showError');
    // No need to open dialog; directly attempt save on empty form
    component.save();
    expect(component.toastComponent.showError).toHaveBeenCalled();
    expect(roleService.createRole).not.toHaveBeenCalled();
  });

  it('should enable/disable skins when role type changes', () => {
    const skinCtrl = component.form.get('skin');
    expect(skinCtrl?.disabled).toBeTrue();
    (component as any)['skinsByRoleTypeName'] = { 'PSA BDP': [{ label: 'Classic', value: 'classic' }] };
    (component as any)['updateSkinOptionsForRoleType']('PSA BDP', false);
    expect(skinCtrl?.enabled).toBeTrue();
    (component as any)['updateSkinOptionsForRoleType']('', false);
    expect(skinCtrl?.disabled).toBeTrue();
  });

  it('toggleNode should auto-select View when Edit selected and prevent deselect of View', () => {
    (component as any)['privilegeTreeOptions'] = [
      { label: 'Administration', children: [
        { label: 'Users', children: [
          { label: 'View', value: 'VIEW', nodeId: '0-0-0', mapCatFeatPrivId: 101 },
          { label: 'Edit', value: 'EDIT', nodeId: '0-0-1', mapCatFeatPrivId: 102 }
        ]}
      ]}
    ];
    const feature = (component as any)['privilegeTreeOptions'][0].children[0];
    const viewNodeId = feature.children.find((c: any) => c.label === 'View').nodeId;
    const editNodeId = feature.children.find((c: any) => c.label === 'Edit').nodeId;
    component.toggleNode(editNodeId);
    expect((component as any)['selectedNodeIds'].has(editNodeId)).toBeTrue();
    expect((component as any)['selectedNodeIds'].has(viewNodeId)).toBeTrue();
    component.toggleNode(viewNodeId);
    expect((component as any)['selectedNodeIds'].has(viewNodeId)).toBeTrue();
  });

  it('should save new role (create) with mapped IDs', fakeAsync(() => {
    spyOn(component.toastComponent, 'showSuccess');
    const savedSpy = spyOn(component.saved, 'emit');
    // Seed internal maps and tree
    (component as any)['roleTypeIdByName'] = { 'PSA BDP': 10 };
    (component as any)['skinIdByKey'] = { classic: 1001, modern: 1002 };
    (component as any)['landingPageIdByKey'] = { dashboard: 21 };
    (component as any)['privilegeTreeOptions'] = [
      { label: 'Administration', children: [
        { label: 'Users', children: [
          { label: 'View', value: 'VIEW', nodeId: '0-0-0', mapCatFeatPrivId: 101 },
          { label: 'Edit', value: 'EDIT', nodeId: '0-0-1', mapCatFeatPrivId: 102 }
        ]}
      ]}
    ];
    component.form.get('status')?.setValue('Active');
    component.form.get('name')?.setValue('Test Role');
    component.form.get('customLanding')?.setValue('Yes');
    component.form.get('defaultLanding')?.enable();
    component.form.get('defaultLanding')?.setValue('dashboard');
    component.form.get('roleType')?.setValue('PSA BDP');
    component.form.get('skin')?.enable();
    component.form.get('skin')?.setValue(['classic', 'modern']);
    // Select privileges
    (component as any)['selectedNodeIds'].add('0-0-1');
    (component as any)['selectedNodeIds'].add('0-0-0');
    component.save();
    tick();
  expect((roleService.createRole as any)).toHaveBeenCalled();
  const payload = (roleService.createRole as any).calls.mostRecent().args[0];
    expect(payload.isActive).toBeTrue();
    expect(payload.customLanding).toBeTrue();
    expect(payload.landingPageConfigId).toBe(21);
    expect(payload.roleTypeConfigId).toBe(10);
    expect(payload.skinConfigIds).toEqual(jasmine.arrayContaining([1001, 1002]));
    expect(payload.privilegeIds).toEqual(jasmine.arrayContaining([101, 102]));
    expect(component.toastComponent.showSuccess).toHaveBeenCalled();
    expect(savedSpy).toHaveBeenCalled();
  }));

  it('isPrivilegeDisabled returns true for View when Edit selected in same feature', () => {
    (component as any)['privilegeTreeOptions'] = [
      { label: 'Admin', children: [
        { label: 'Users', children: [
          { label: 'View', value: 'VIEW', nodeId: '0-0-0', mapCatFeatPrivId: 1 },
          { label: 'Edit', value: 'EDIT', nodeId: '0-0-1', mapCatFeatPrivId: 2 },
        ]}
      ]}
    ];
    (component as any)['selectedNodeIds'].add('0-0-1'); // Edit selected
    expect(component.isPrivilegeDisabled('0-0-0')).toBeTrue();
  });

  it('toggleOpen ensures filtered options and can search features/privileges', () => {
    (component as any)['privilegeTreeOptions'] = [
      { label: 'Category A', children: [
        { label: 'Users', children: [ { label: 'View', value: 'VIEW', nodeId: '0-0-0' } ] },
        { label: 'Roles', children: [ { label: 'View', value: 'VIEW_R', nodeId: '0-1-0' } ] },
      ]}
    ];
    component.query = 'role';
    component.toggleOpen();
    expect((component as any)['dropdownOpen']).toBeTrue();
    // After search, only Roles should remain in filteredCategories
    expect((component as any)['filteredCategories'][0].children.length).toBe(1);
    expect((component as any)['filteredCategories'][0].children[0].label).toBe('Roles');
    component.closeDropdown();
    expect((component as any)['dropdownOpen']).toBeFalse();
  });

  it('onDocumentClick closes dropdown when clicking outside', () => {
    // Ensure dropdown is open
    (component as any)['dropdownOpen'] = true;
    // Mock a dropdown container element
    const dropdownEl = document.createElement('div');
    dropdownEl.className = 'role-privilege-dropdown';
    const host = (component as any)['elementRef'].nativeElement as HTMLElement;
    spyOn(host, 'querySelector').and.callFake((sel: string) => {
      return sel === '.role-privilege-dropdown' ? dropdownEl : null;
    });
    // Create a click event with a target that is NOT inside dropdownEl
    const outside = document.createElement('button');
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: outside });

    component.onDocumentClick(event);
    expect((component as any)['dropdownOpen']).toBeFalse();
  });

  it('mapPrivilegesToNodes supports grouped string format and boolean object format', () => {
    (component as any)['privilegeTreeOptions'] = [
      { label: 'Administration', children: [
        { label: 'Users', children: [
          { label: 'View', value: 'VIEW_U', nodeId: '0-0-0', mapCatFeatPrivId: 1 },
          { label: 'Edit', value: 'EDIT_U', nodeId: '0-0-1', mapCatFeatPrivId: 2 },
        ]},
        { label: 'Roles', children: [
          { label: 'View', value: 'VIEW_R', nodeId: '0-1-0', mapCatFeatPrivId: 3 },
        ]}
      ]}
    ];

    // Grouped strings
    (component as any)['selectedNodeIds'].clear();
    (component as any)['mapPrivilegesToNodes']([ 'Users (View, Edit)', 'Roles (View)' ]);
    expect((component as any)['selectedNodeIds'].has('0-0-0')).toBeTrue();
    expect((component as any)['selectedNodeIds'].has('0-0-1')).toBeTrue();
    expect((component as any)['selectedNodeIds'].has('0-1-0')).toBeTrue();

    // Boolean object array
    (component as any)['selectedNodeIds'].clear();
    (component as any)['mapPrivilegesToNodes']([ { VIEW_U: true }, { EDIT_U: false }, { VIEW_R: true } ]);
    expect((component as any)['selectedNodeIds'].has('0-0-0')).toBeTrue();
    expect((component as any)['selectedNodeIds'].has('0-1-0')).toBeTrue();
    expect((component as any)['selectedNodeIds'].has('0-0-1')).toBeFalse();
  });

  it('getSelectedPrivilegeIds returns unique map IDs based on selected nodes', () => {
    (component as any)['privilegeTreeOptions'] = [
      { label: 'Administration', children: [
        { label: 'Users', children: [
          { label: 'View', value: 'VIEW_U', nodeId: '0-0-0', mapCatFeatPrivId: 10 },
          { label: 'Edit', value: 'EDIT_U', nodeId: '0-0-1', mapCatFeatPrivId: 10 }, // duplicate id across nodes
        ]}
      ]}
    ];
    (component as any)['selectedNodeIds'].add('0-0-0');
    (component as any)['selectedNodeIds'].add('0-0-1');
    const ids = (component as any)['getSelectedPrivilegeIds']();
    expect(ids).toEqual([10]);
  });

  it('should update existing role (update) with success message', fakeAsync(() => {
    spyOn(component.toastComponent, 'showSuccess');
    const savedSpy = spyOn(component.saved, 'emit');
    // Seed internal maps and tree and edit state
    (component as any)['roleTypeIdByName'] = { 'PSA BDP': 10 };
    (component as any)['skinIdByKey'] = { classic: 1001, modern: 1002 };
    (component as any)['landingPageIdByKey'] = { dashboard: 21 };
    (component as any)['privilegeTreeOptions'] = [
      { label: 'Administration', children: [
        { label: 'Users', children: [
          { label: 'View', value: 'VIEW', nodeId: '0-0-0', mapCatFeatPrivId: 101 },
          { label: 'Edit', value: 'EDIT', nodeId: '0-0-1', mapCatFeatPrivId: 102 }
        ]}
      ]}
    ];
    (component as any)['isEdit'] = true;
    (component as any)['editingRoleId'] = 999;
    component.form.get('status')?.setValue('Active');
    component.form.get('name')?.setValue('Existing');
    component.form.get('customLanding')?.setValue('Yes');
    component.form.get('defaultLanding')?.enable();
    component.form.get('defaultLanding')?.setValue('dashboard');
    component.form.get('roleType')?.setValue('PSA BDP');
    component.form.get('skin')?.enable();
    component.form.get('skin')?.setValue(['classic']);
    (component as any)['selectedNodeIds'].add('0-0-0');
    component.save();
    tick();
    expect(roleService.updateRole).toHaveBeenCalled();
    expect(component.toastComponent.showSuccess).toHaveBeenCalled();
    expect(savedSpy).toHaveBeenCalled();
  }));

  it('displayText groups selections by feature and joins labels', () => {
    // Seed a tree with two features and selections
    (component as any)['privilegeTreeOptions'] = [
      { label: 'Admin', children: [
        { label: 'Users', children: [
          { label: 'View', value: 'VIEW_U', nodeId: '0-0-0', mapCatFeatPrivId: 1 },
          { label: 'Edit', value: 'EDIT_U', nodeId: '0-0-1', mapCatFeatPrivId: 2 },
        ]},
        { label: 'Roles', children: [
          { label: 'View', value: 'VIEW_R', nodeId: '0-1-0', mapCatFeatPrivId: 3 },
        ]}
      ]}
    ];
    (component as any)['selectedNodeIds'].add('0-0-0');
    (component as any)['selectedNodeIds'].add('0-0-1');
    (component as any)['selectedNodeIds'].add('0-1-0');

    const txt = component.displayText;
    expect(txt).toContain('Users(View, Edit)');
    expect(txt).toContain('Roles(View)');
  });

  it('clearSelection resets UI and form control', () => {
    (component as any)['selectedNodeIds'].add('x');
    component.form.get('privPermissions')?.setValue(['A']);
    component.clearSelection();
    expect((component as any)['selectedNodeIds'].size).toBe(0);
    expect(component.form.get('privPermissions')?.value).toEqual([]);
  });

  it('initIfNeeded should only initialize once (privileges, skins, pages)', () => {
    const service = roleService as any;
    (service.getPrivilegeHierarchy as jasmine.Spy).calls.reset();
    (service.getSkins as jasmine.Spy).calls.reset();
    (service.getLandingPages as jasmine.Spy).calls.reset();
    // call openDialog twice to trigger initIfNeeded twice
    component.openDialog();
    component.openDialog();
    expect(service.getPrivilegeHierarchy).toHaveBeenCalledTimes(1);
    expect(service.getSkins).toHaveBeenCalledTimes(1);
    expect(service.getLandingPages).toHaveBeenCalledTimes(1);
  });

  it('loadExistingPrivileges waits for tree options when empty, then maps', fakeAsync(() => {
    (component as any)['privilegeTreeOptions'] = [];
    // Begin loading later via subscription response already stubbed in beforeEach
    component.openDialog({
      id: 1,
      status: 'Active',
      roleName: 'R',
      roleDescription: '',
      rolePrivileges: ['Users (View)'],
      customLanding: 'No',
      defaultLanding: null,
      roleType: 'PSA BDP',
      skin: null,
      createdBy: '', createdOn: '', updatedBy: '', updatedOn: ''
    } as any);
    // Simulate async tree population
    (component as any)['privilegeTreeOptions'] = [ { label: 'Administration', children: [ { label: 'Users', children: [ { label: 'View', value: 'VIEW', nodeId: '0-0-0', mapCatFeatPrivId: 1 } ] } ] } ];
    // allow the polling timeout to detect non-empty tree
    tick(100);
    expect((component as any)['selectedNodeIds'].has('0-0-0')).toBeTrue();
  }));

  it('getSkinsForRoleType falls back to label prefix when API map empty', () => {
    (component as any)['allSkinOptions'] = [ { label: 'PSA BDP Classic', value: 'classic' } ];
    (component as any)['skinsByRoleTypeName'] = {};
    const out = (component as any)['getSkinsForRoleType']('PSA BDP');
    expect(out.length).toBe(1);
    expect(out[0].value).toBe('classic');
  });

  it('getSkinsForRoleType returns all skins when roleType is falsy', () => {
    (component as any)['allSkinOptions'] = [
      { label: 'PSA BDP Classic', value: 'classic' },
      { label: 'Modern', value: 'modern' }
    ];
    const out = (component as any)['getSkinsForRoleType']('');
    expect(out.length).toBe(2);
    expect(out.map((o: any) => o.value)).toEqual(['classic','modern']);
  });

  it('updateSkinOptionsForRoleType clears selection when clearSelection=true', () => {
    component.form.get('skin')?.enable();
    component.form.get('skin')?.setValue(['classic']);
    (component as any)['skinsByRoleTypeName'] = { A: [ { label: 'X', value: 'x' } ] };
    (component as any)['updateSkinOptionsForRoleType']('A', true);
    expect(component.form.get('skin')?.value).toEqual([]);
  });

  it('openDialog (new) resets form, disables defaultLanding and clears selection', () => {
    // Seed selection then open without data
    (component as any)['selectedNodeIds'].add('x');
    component.form.get('defaultLanding')?.enable();
    component.form.get('privPermissions')?.setValue(['A']);
    component.openDialog();
    expect(component['display']).toBeTrue();
    expect(component.form.get('status')?.value).toBe('');
    expect(component.form.get('name')?.value).toBe('');
    expect(component.form.get('roleType')?.value).toBe('');
    expect(component.form.get('skin')?.value).toEqual([]);
    expect(component.form.get('defaultLanding')?.disabled).toBeTrue();
    expect((component as any)['selectedNodeIds'].size).toBe(0);
  });

  it('legacy togglePrivilege updates privPermissions and isSelected reflects it', () => {
    const item = { label: 'View', value: 'VIEW_U' } as any;
    expect(component.isSelected('VIEW_U')).toBeFalse();
    component.togglePrivilege(item);
    expect(component.form.get('privPermissions')?.value).toEqual(['VIEW_U']);
    expect(component.isSelected('VIEW_U')).toBeTrue();
    // Toggle again to deselect
    component.togglePrivilege(item);
    expect(component.form.get('privPermissions')?.value).toEqual([]);
    expect(component.isSelected('VIEW_U')).toBeFalse();
  });

  it('getMissingRequiredFields lists all missing when nothing filled and no privileges', () => {
    (component as any)['selectedNodeIds'].clear();
    const missing = (component as any)['getMissingRequiredFields']();
    expect(missing).toEqual(jasmine.arrayContaining([
      'Status','Role Name','Role Type','Skin','Custom Landing','Role Privileges'
    ]));
  });

  it('markRequiredTouched marks key controls as touched', () => {
    (component as any)['markRequiredTouched']();
    const touched = ['status','name','roleType','skin','customLanding','defaultLanding']
      .every(c => !!component.form.get(c)?.touched);
    expect(touched).toBeTrue();
  });

  it('onDropdownOpened initializes categoryExpanded flags to false', () => {
    // Prepare filtered categories with two entries
    (component as any)['filteredCategories'] = [
      { label: 'Cat1', children: [] },
      { label: 'Cat2', children: [] }
    ];
    component.onDropdownOpened();
    expect((component as any)['categoryExpanded'].length).toBe(2);
    expect((component as any)['categoryExpanded'].every((v: boolean) => v === false)).toBeTrue();
  });

  it('isNodeSelected returns true only for selected node ids', () => {
    (component as any)['selectedNodeIds'].clear();
    (component as any)['selectedNodeIds'].add('a');
    expect(component.isNodeSelected('a')).toBeTrue();
    expect(component.isNodeSelected('b')).toBeFalse();
  });

  it('onDocumentClick does not close when clicking inside dropdown', () => {
    (component as any)['dropdownOpen'] = true;
    const dropdownEl = document.createElement('div');
    dropdownEl.className = 'role-privilege-dropdown';
    const inside = document.createElement('span');
    dropdownEl.appendChild(inside);
    const host = (component as any)['elementRef'].nativeElement as HTMLElement;
    spyOn(host, 'querySelector').and.returnValue(dropdownEl as any);
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: inside });
    component.onDocumentClick(event);
    expect((component as any)['dropdownOpen']).toBeTrue();
  });

  it('isPrivilegeDisabled false when View and Edit not selected, and for non-View privilege', () => {
    (component as any)['privilegeTreeOptions'] = [
      { label: 'Admin', children: [ { label: 'Users', children: [
        { label: 'View', value: 'VIEW', nodeId: 'v' },
        { label: 'Edit', value: 'EDIT', nodeId: 'e' },
        { label: 'Delete', value: 'DEL', nodeId: 'd' },
      ] } ] }
    ];
    // No edit selected
    expect(component.isPrivilegeDisabled('v')).toBeFalse();
    // Non-view privilege
    expect(component.isPrivilegeDisabled('d')).toBeFalse();
  });

  it('resetFilter clones tree into filteredCategories and ensureFiltered restores when empty', () => {
    (component as any)['privilegeTreeOptions'] = [ { label: 'A', children: [] } ];
    (component as any)['filteredCategories'] = [];
    (component as any)['ensureFiltered']();
    expect((component as any)['filteredCategories'].length).toBe(1);
    // Now mutate filtered and call resetFilter explicitly
    (component as any)['filteredCategories'] = [];
    component.resetFilter();
    expect((component as any)['filteredCategories'].length).toBe(1);
  });

  it('save returns early when already saving', () => {
    (component as any)['saving'] = true;
    const createSpy = (roleService.createRole as any as jasmine.Spy);
    const before = createSpy.calls.count();
    component.save();
    expect(createSpy.calls.count()).toBe(before);
  });

  it('displayText returns empty string when nothing selected', () => {
    (component as any)['selectedNodeIds'].clear();
    expect(component.displayText).toBe('');
  });

  it('openDialog in edit mode sets header and pre-fills basic fields', () => {
    const data: any = {
      id: 2,
      status: 'Active',
      roleName: 'Editor',
      roleDescription: 'Desc',
      rolePrivileges: [],
      customLanding: 'No',
      defaultLanding: null,
      roleType: 'PSA BDP',
      skin: null,
      createdBy: '', createdOn: '', updatedBy: '', updatedOn: ''
    };
    component.openDialog(data);
    expect((component as any)['isEdit']).toBeTrue();
    expect(component['dialogHeader']).toBe('Edit Role');
    expect(component.form.get('name')?.value).toBe('Editor');
  });

  it('customLanding value changes enable/disable defaultLanding control', () => {
    const ctrl = component.form.get('defaultLanding');
    // Initially disabled per ngOnInit
    expect(ctrl?.disabled).toBeTrue();
    component.form.get('customLanding')?.setValue('Yes');
    expect(ctrl?.enabled).toBeTrue();
    component.form.get('customLanding')?.setValue('No');
    expect(ctrl?.disabled).toBeTrue();
  });

  it('updateSkinOptionsForRoleType enables skin via prefix fallback when API map empty', () => {
    (component as any)['skinsByRoleTypeName'] = {};
    (component as any)['allSkinOptions'] = [
      { label: 'Foo Light', value: 'foo-light' },
      { label: 'Bar Dark', value: 'bar-dark' }
    ];
    const skinCtrl = component.form.get('skin');
    (component as any)['updateSkinOptionsForRoleType']('Foo', false);
    expect(skinCtrl?.enabled).toBeTrue();
    expect((component as any)['skinOptions'].length).toBe(1);
    expect((component as any)['skinOptions'][0].value).toBe('foo-light');
  });

  it('loadPrivilegeHierarchy builds privilegeGroups when dialog opens', () => {
    // Uses the stubbed getPrivilegeHierarchy from beforeEach
    component.openDialog();
    expect(component['privilegeGroups'].length).toBe(1);
    const group = component['privilegeGroups'][0];
    expect(group.label).toBe('Features');
    expect(group.privileges).toEqual(jasmine.arrayContaining(['View','Edit']));
  });

  it('applySelection marks privPermissions as dirty and touched', () => {
    (component as any)['privilegeTreeOptions'] = [ { label: 'Admin', children: [ { label: 'Users', children: [ { label: 'View', value: 'VIEW', nodeId: '0' } ] } ] } ];
    (component as any)['selectedNodeIds'].add('0');
    const ctrl = component.form.get('privPermissions');
    (component as any)['dropdownOpen'] = true;
    component.applySelection();
    expect(ctrl?.dirty).toBeTrue();
    expect(ctrl?.touched).toBeTrue();
  });

  it('isPrivilegeRequiredByOthers returns true for View when Edit selected', () => {
    (component as any)['privilegeTreeOptions'] = [
      { label: 'Admin', children: [ { label: 'Users', children: [
        { label: 'View', value: 'VIEW', nodeId: 'v' },
        { label: 'Edit', value: 'EDIT', nodeId: 'e' },
      ] } ] }
    ];
    (component as any)['selectedNodeIds'].add('e');
    const res = (component as any)['isPrivilegeRequiredByOthers']('v');
    expect(res).toBeTrue();
  });

  it('save create handles error path: closes dialog and shows error toast', fakeAsync(() => {
    (roleService.createRole as any).and.returnValue(throwError(() => new Error('boom')) as any);
    spyOn(component.toastComponent, 'showError');
    // Valid form and selection
    (component as any)['roleTypeIdByName'] = { 'PSA BDP': 10 };
    (component as any)['skinIdByKey'] = { classic: 1001 };
    (component as any)['privilegeTreeOptions'] = [ { label: 'Admin', children: [ { label: 'Users', children: [ { label: 'View', value: 'VIEW', nodeId: '0', mapCatFeatPrivId: 7 } ] } ] } ];
    component.form.patchValue({ status: 'Active', name: 'Z', customLanding: 'No', roleType: 'PSA BDP', skin: ['classic'] });
    (component as any)['selectedNodeIds'].add('0');
    // Open for visibility tracking
    (component as any)['display'] = true;
    component.save();
    tick();
    expect(component.toastComponent.showError).toHaveBeenCalled();
    expect(component['display']).toBeFalse();
  }));

  it('save update handles error path: closes dialog and shows error toast', fakeAsync(() => {
    (roleService.updateRole as any).and.returnValue(throwError(() => new Error('boom')) as any);
    spyOn(component.toastComponent, 'showError');
    (component as any)['isEdit'] = true;
    (component as any)['editingRoleId'] = 42;
    (component as any)['roleTypeIdByName'] = { 'PSA BDP': 10 };
    (component as any)['skinIdByKey'] = { classic: 1001 };
    (component as any)['privilegeTreeOptions'] = [ { label: 'Admin', children: [ { label: 'Users', children: [ { label: 'View', value: 'VIEW', nodeId: '0', mapCatFeatPrivId: 7 } ] } ] } ];
    component.form.patchValue({ status: 'Active', name: 'Z', customLanding: 'No', roleType: 'PSA BDP', skin: ['classic'] });
    (component as any)['selectedNodeIds'].add('0');
    (component as any)['display'] = true;
    component.save();
    tick();
    expect(component.toastComponent.showError).toHaveBeenCalled();
    expect(component['display']).toBeFalse();
  }));

  it('buildCreatePayloadBase maps all fields and filters unmapped skin keys', () => {
    // Seed internal id maps
    (component as any)['landingPageIdByKey'] = { dashboard: 21 };
    (component as any)['roleTypeIdByName'] = { 'PSA BDP': 10 };
    (component as any)['skinIdByKey'] = { classic: 1001 };
    // Seed tree to produce privilege ids
    (component as any)['privilegeTreeOptions'] = [
      { label: 'Admin', children: [ { label: 'Users', children: [
        { label: 'View', value: 'VIEW', nodeId: '0', mapCatFeatPrivId: 7 },
        { label: 'Edit', value: 'EDIT', nodeId: '1', mapCatFeatPrivId: 8 },
      ] } ] }
    ];
    (component as any)['selectedNodeIds'].add('0');
    (component as any)['selectedNodeIds'].add('1');
    // Fill form
    component.form.patchValue({
      status: 'Inactive',
      name: 'R1',
      customLanding: 'No',
      defaultLanding: null,
      roleType: 'PSA BDP',
      skin: ['classic', 'unknown'],
      description: 'D'
    });
    const payload = (component as any)['buildCreatePayloadBase']();
    expect(payload.isActive).toBeFalse();
    expect(payload.customLanding).toBeFalse();
    expect(payload.landingPageConfigId).toBeUndefined();
    expect(payload.roleTypeConfigId).toBe(10);
    expect(payload.skinConfigIds).toEqual([1001]);
    expect(payload.privilegeIds).toEqual(jasmine.arrayContaining([7,8]));
    expect(payload.createdById).toBe(0);
    expect(payload.updatedById).toBe(0);
  });

  it('toggleCategory toggles expanded state for given index', () => {
    (component as any)['filteredCategories'] = [ { label: 'A', children: [] } ];
    component.onDropdownOpened();
    expect((component as any)['categoryExpanded'][0]).toBeFalse();
    component.toggleCategory(0);
    expect((component as any)['categoryExpanded'][0]).toBeTrue();
  });

  it('onSearch matches category label and keeps full children when feature not matched', () => {
    (component as any)['privilegeTreeOptions'] = [
      { label: 'Administration', children: [
        { label: 'Users', children: [ { label: 'View', value: 'VIEW', nodeId: '0' } ] },
        { label: 'Roles', children: [ { label: 'View', value: 'VIEW_R', nodeId: '1' } ] }
      ] }
    ];
    component.query = 'administration';
    component.onSearch();
    const fc = (component as any)['filteredCategories'];
    expect(fc.length).toBe(1);
    expect(fc[0].children.length).toBe(2); // full children retained
  });

  it('getMissingRequiredFields includes Default Landing Page when customLanding is Yes and value missing', () => {
    component.form.patchValue({ status: 'Active', name: 'N', roleType: 'RT', customLanding: 'Yes' });
    component.form.get('skin')?.setValue([]);
    (component as any)['selectedNodeIds'].clear();
    const missing = (component as any)['getMissingRequiredFields']();
    expect(missing).toContain('Default Landing Page');
  });

  it('openDialog (edit) applies pending defaultLanding and skins after async load', fakeAsync(() => {
    // Arrange: ensure APIs will return after openDialog is called
    const skinsResp = [
      { roleType: { id: 10, key: 'PSA', name: 'PSA BDP' }, skins: [ { id: 1001, key: 'classic', name: 'Classic' }, { id: 1002, key: 'modern', name: 'Modern' } ] }
    ];
    (roleService.getSkins as jasmine.Spy).and.returnValue(of(skinsResp as any) as any);
    const pagesResp = [ { id: 21, key: 'dashboard', name: 'Dashboard' }, { id: 22, key: 'reports', name: 'Reports' } ];
    (roleService.getLandingPages as jasmine.Spy).and.returnValue(of(pagesResp as any) as any);

    // Act: open in edit mode with names that require mapping after data loads
    component.openDialog({
      id: 7,
      status: 'Active',
      roleName: 'Ops',
      roleDescription: '',
      rolePrivileges: [],
      customLanding: 'Yes',
      defaultLanding: 'Reports', // by name, to be mapped to key 'reports'
      roleType: 'PSA BDP',
      skin: 'Classic, Modern', // by names, to be mapped to ['classic','modern']
      createdBy: '', createdOn: '', updatedBy: '', updatedOn: ''
    } as any);

    // Allow observables to emit and pending mappings to apply
    tick();
    // Assert: defaultLanding and skin keys set
    expect(component.form.get('defaultLanding')?.value).toBe('reports');
    expect(component.form.get('skin')?.value).toEqual(jasmine.arrayContaining(['classic','modern']));
  }));

  it('toggleNode deselecting Edit also deselects View in same feature', () => {
    (component as any)['privilegeTreeOptions'] = [
      { label: 'Administration', children: [
        { label: 'Users', children: [
          { label: 'View', value: 'VIEW', nodeId: '0-0-0', mapCatFeatPrivId: 101 },
          { label: 'Edit', value: 'EDIT', nodeId: '0-0-1', mapCatFeatPrivId: 102 }
        ]}
      ]}
    ];
    const feature = (component as any)['privilegeTreeOptions'][0].children[0];
    const viewNodeId = feature.children.find((c: any) => c.label === 'View').nodeId;
    const editNodeId = feature.children.find((c: any) => c.label === 'Edit').nodeId;
    // select Edit (auto-selects View)
    component.toggleNode(editNodeId);
    expect((component as any)['selectedNodeIds'].has(viewNodeId)).toBeTrue();
    // now deselect Edit -> should also remove View
    component.toggleNode(editNodeId);
    expect((component as any)['selectedNodeIds'].has(editNodeId)).toBeFalse();
    expect((component as any)['selectedNodeIds'].has(viewNodeId)).toBeFalse();
  });

  it('isFormValid enforces default landing only when customLanding is Yes', () => {
    // Valid base
    (component as any)['selectedNodeIds'].add('n');
    component.form.patchValue({ status: 'Active', name: 'R', roleType: 'PSA BDP' });
    component.form.get('skin')?.enable();
    component.form.get('skin')?.setValue(['classic']);
    component.form.get('customLanding')?.setValue('No');
    expect(component.isFormValid()).toBeTrue();
    component.form.get('customLanding')?.setValue('Yes');
    component.form.get('defaultLanding')?.enable();
    component.form.get('defaultLanding')?.setValue(null);
    expect(component.isFormValid()).toBeFalse();
    component.form.get('defaultLanding')?.setValue('dashboard');
    expect(component.isFormValid()).toBeTrue();
  });

  it('close should hide dialog and dropdown', () => {
    (component as any)['dropdownOpen'] = true;
    component.close();
    expect(component['display']).toBeFalse();
    expect((component as any)['dropdownOpen']).toBeFalse();
  });

  it('applySelection writes selected values to form and closes dropdown', () => {
    // Prepare a simple tree
    (component as any)['privilegeTreeOptions'] = [
      { label: 'Admin', children: [
        { label: 'Users', children: [
          { label: 'View', value: 'VIEW_U', nodeId: '0-0-0', mapCatFeatPrivId: 1 },
        ]}
      ]}
    ];
    (component as any)['selectedNodeIds'].add('0-0-0');
    (component as any)['dropdownOpen'] = true;
    component.applySelection();
    expect(component.form.get('privPermissions')?.value).toEqual(['VIEW_U']);
    expect((component as any)['dropdownOpen']).toBeFalse();
  });

  it('save shows error toast on create failure and closes dialog', fakeAsync(() => {
    // Force createRole to emit success: false
    (roleService.createRole as any).and.returnValue(of({ body: { success: false } } as any));
    spyOn(component.toastComponent, 'showError');
    // Make form valid and selection present
    (component as any)['roleTypeIdByName'] = { 'PSA BDP': 10 };
    (component as any)['skinIdByKey'] = { classic: 1001 };
    (component as any)['privilegeTreeOptions'] = [ { label: 'Admin', children: [ { label: 'Users', children: [ { label: 'View', value: 'VIEW_U', nodeId: '0-0-0', mapCatFeatPrivId: 1 } ] } ] } ];
    component.form.patchValue({ status: 'Active', name: 'X', customLanding: 'No', roleType: 'PSA BDP', skin: ['classic'] });
    (component as any)['selectedNodeIds'].add('0-0-0');
    component.save();
    tick();
    expect(component.toastComponent.showError).toHaveBeenCalled();
  }));

  it('save shows error toast on update failure and closes dialog', fakeAsync(() => {
    (roleService.updateRole as any).and.returnValue(of({ success: false } as any));
    spyOn(component.toastComponent, 'showError');
    (component as any)['isEdit'] = true;
    (component as any)['editingRoleId'] = 5;
    (component as any)['roleTypeIdByName'] = { 'PSA BDP': 10 };
    (component as any)['skinIdByKey'] = { classic: 1001 };
    (component as any)['privilegeTreeOptions'] = [ { label: 'Admin', children: [ { label: 'Users', children: [ { label: 'View', value: 'VIEW_U', nodeId: '0-0-0', mapCatFeatPrivId: 1 } ] } ] } ];
    component.form.patchValue({ status: 'Active', name: 'Y', customLanding: 'No', roleType: 'PSA BDP', skin: ['classic'] });
    (component as any)['selectedNodeIds'].add('0-0-0');
    component.save();
    tick();
    expect(component.toastComponent.showError).toHaveBeenCalled();
  }));
});
