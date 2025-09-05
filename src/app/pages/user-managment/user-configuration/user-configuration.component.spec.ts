import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService, TreeNode } from 'primeng/api';
import { UserConfigurationComponent } from './user-configuration.component';
import { UserControlService } from '../../../shared/service/user-control/user-control.service';
import { UserConfigurationService } from '../../../shared/service/user-configuration/user-configuration.service';
import { CommonService } from '../../../shared/service/common/common.service';
import { ChangeDetectorRef } from '@angular/core';

describe('UserConfigurationComponent', () => {
  let component: UserConfigurationComponent;
  let fixture: ComponentFixture<UserConfigurationComponent>;
  let userControlService: jasmine.SpyObj<UserControlService>;
  let userConfigurationService: jasmine.SpyObj<UserConfigurationService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;

  // Mock data for companies
  const mockCompanyTreeNodes = [
    {
      key: '1',
      data: { id: 'COMP001', companyName: 'Test Company 1', subscriptionType: 'PSA' },
      children: [] as TreeNode[]  // Explicitly typed as an empty array of TreeNode
    },
    {
      key: '2',
      data: { id: 'COMP002', companyName: 'Test Company 2', subscriptionType: 'PSA' },
      children: []  // Explicitly typed as an empty array of TreeNode
    }
  ];

  // Mock API response with pagination and required fields
  const mockApiResponse = {
    success: true,
    message: 'Success',  // Added 'message' to match ApiResponse
    data: {
      companyTreeNodes: mockCompanyTreeNodes,
      totalSize: 50,
      page: 0,  // Add page field
      size: 10,  // Add size field
      totalElements: 50,  // Add totalElements field
      totalPages: 5,  // Add totalPages field
      last: false,  // Add last field
      content: mockCompanyTreeNodes  // Add content as TreeNode[]
    }
  };

  // Mock assigned companies response
  const mockAssignedCompaniesResponse = {
    success: true,
    message: 'Success',  // Added 'message' to match ApiResponseWithoutContent
    data: {
      psaCompanies: [
        { companyCode: 'COMP001', companyName: 'Test Company 1', id: '1' }
      ],
      nonPsaCompanies: [
        { companyCode: 'COMP003', companyName: 'Test Company 3', id: '3' }
      ]
    }
  };

  // Mock role list response
  const mockRoleListResponse = {
    success: true,
    message: 'Success',  // Added 'message' to match ApiResponseWithoutContent
    data: [
      { roleId: 1, roleName: 'Admin' },
      { roleId: 2, roleName: 'User' }
    ]
  };

  beforeEach(async () => {
    const userControlSpy = jasmine.createSpyObj('UserControlService', ['getCompanyList', 'getRoleList']);
    const userConfigSpy = jasmine.createSpyObj('UserConfigurationService', ['getUserAssignedCompanies', 'updateCopySubscription']);
    const messageSpy = jasmine.createSpyObj('MessageService', ['add']);
    const commonServiceSpy = jasmine.createSpyObj('CommonService', ['someMethod']);
    const cdrSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NoopAnimationsModule
      ],
      declarations: [ UserConfigurationComponent ],
      providers: [
        { provide: UserControlService, useValue: userControlSpy },
        { provide: UserConfigurationService, useValue: userConfigSpy },
        { provide: MessageService, useValue: messageSpy },
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: ChangeDetectorRef, useValue: cdrSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserConfigurationComponent);
    component = fixture.componentInstance;
    userControlService = TestBed.inject(UserControlService) as jasmine.SpyObj<UserControlService>;
    userConfigurationService = TestBed.inject(UserConfigurationService) as jasmine.SpyObj<UserConfigurationService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    cdr = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;

    // Setup spy returns for the service calls
    // userConfigurationService.getUserAssignedCompanies.and.returnValue(of(mockAssignedCompaniesResponse));
    // userControlService.getCompanyList.and.returnValue(of(mockApiResponse));
    // userControlService.getRoleList.and.returnValue(of(mockRoleListResponse));
    userConfigurationService.updateCopySubscription.and.returnValue(of({ success: true }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.selectedIndex).toBe('0');
      expect(component.selectedCompanyIndex).toBe('0');
      expect(component.checked).toBe(false);
      expect(component.psaSelectionKeys).toEqual({});
      expect(component.nonPsaSelectionKeys).toEqual({});
    });

    it('should fetch assigned companies on init', fakeAsync(() => {
      component.ngOnInit();
      tick();
      expect(userConfigurationService.getUserAssignedCompanies).toHaveBeenCalledWith('2');
    }));

    it('should populate selection keys with assigned companies', async () => {
      await component.ngOnInit();
      expect(Object.keys(component.psaSelectionKeys).length).toBeGreaterThan(0);
      expect(Object.keys(component.nonPsaSelectionKeys).length).toBeGreaterThan(0);
    });
  });

  describe('Tab Navigation', () => {
    it('should load role list when switching to role type tab', () => {
      component.onTabChange('1');
      expect(userControlService.getRoleList).toHaveBeenCalled();
    });

    it('should set selected index when switching to company tab', () => {
      component.onTabChange('2');
      expect(component.selectedIndex).toBe('2');
    });

    it('should set company index when switching company tabs', () => {
      component.onCompanyTabChange('0');
      expect(component.selectedCompanyIndex).toBe('0');
    });
  });

  describe('Company Data Loading', () => {
    it('should load PSA company data', () => {
      spyOn(component, 'callSignal').and.callFake((requestBody, useSignal, callback) => {
        if (callback) callback();
      });
      
      component['loadCompanyData']('PSA');
      expect(component.callSignal).toHaveBeenCalled();
    });

    it('should load Non-PSA company data', () => {
      spyOn(component, 'callSignal').and.callFake((requestBody, useSignal, callback) => {
        if (callback) callback();
      });
      
      component['loadCompanyData']('NON-PSA');
      expect(component.callSignal).toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    const mockPageEvent = { first: 10, rows: 10 };

    it('should handle PSA pagination', () => {
      component.onPageChange(mockPageEvent, 'PSA');
      expect(userControlService.getCompanyList).toHaveBeenCalled();
      expect(component.psaPaginationState.first).toBe(10);
      expect(component.psaPaginationState.rows).toBe(10);
    });

    it('should handle Non-PSA pagination', () => {
      component.onPageChange(mockPageEvent, 'NON-PSA');
      expect(userControlService.getCompanyList).toHaveBeenCalled();
      expect(component.nonPsaPaginationState.first).toBe(10);
      expect(component.nonPsaPaginationState.rows).toBe(10);
    });
  });

  describe('Search Functionality', () => {
    it('should not search with less than 3 characters', () => {
      component.searchTerm = 'te';
      component.onSearch('PSA');
      expect(userControlService.getCompanyList).not.toHaveBeenCalled();
    });

    it('should search PSA companies', () => {
      component.searchTerm = 'test';
      component.onSearch('PSA');
      expect(userControlService.getCompanyList).toHaveBeenCalled();
    });

    it('should reset search and refresh', () => {
      spyOn(component, 'refresh');
      component.resetSearch();
      expect(component.searchTerm).toBe('');
      expect(component.refresh).toHaveBeenCalled();
    });
  });

  describe('Selection Management', () => {
    it('should get checked keys from selection', () => {
      const selectionKeys = {
        '1': { checked: true, partialChecked: false },
        '2': { checked: false, partialChecked: false },
        '3': { checked: true, partialChecked: false }
      };
      
      const checkedKeys = component['getCheckedKeys'](selectionKeys);
      expect(checkedKeys).toEqual(['1', '3']);
    });

    it('should build user config payload', () => {
      component.roleType = 1;
      component.checked = true;
      spyOn(component as any, 'getSelectedCompanies').and.returnValue([]);
      
      const payload = component.buildUserConfigPayload();
      expect(payload.roleId).toBe(1);
      expect(payload.isBdpEmployee).toBe(true);
      expect(payload.assignedCompanies).toBeDefined();
    });
  });
});
