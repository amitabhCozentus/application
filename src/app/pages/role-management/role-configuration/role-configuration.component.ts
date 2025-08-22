import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { PrimengModule } from '../../../shared/primeng/primeng.module';
import { RoleService } from '../../../shared/service/role-control/role.service';
import { SelectOption, RoleConfigData } from '../../../shared/lib/constants';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastComponent } from '../../../shared/component/toast-component/toast.component';

// Types for the privilege hierarchy dropdown (3-level strict)
interface PrivilegeItem { label: string; value: string; disabled?: boolean; }
interface FeatureItem { label: string; key?: string; children: PrivilegeItem[]; }
interface CategoryItem { label: string; key?: string; children: FeatureItem[]; }

@Component({
  selector: 'app-role-configuration',
  standalone: true,
  imports: [PrimengModule, ReactiveFormsModule, FormsModule, ToastComponent],
  providers: [RoleService],
  templateUrl: './role-configuration.component.html',
  styleUrls: ['./role-configuration.component.scss']
})
export class RoleConfigurationComponent implements OnInit {


// add this in the class
@ViewChild('searchBox') searchBox!: ElementRef<HTMLInputElement>;
  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef<HTMLDivElement>;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

  display = false;
  form!: FormGroup;
  privilegeGroups: { label: string; privileges: string[] }[] = [];
  privilegeTreeOptions: any[] = []; // Tree structure for p-treeselect

  landingPages: SelectOption[] = [];
  skinOptions: SelectOption[] = [];
  
  // Store full data for ID mapping
  private landingPagesData: any[] = [];
  private skinOptionsData: any[] = [];
  private privilegeHierarchyData: any[] = [];

  // Loading states
  private isDataLoading = true;

  // Local dropdown state
  dropdownOpen = false;
  query = '';
  filteredCategories: CategoryItem[] = [];
  categoryExpanded: boolean[] = [];

  // Track current role being edited
  currentRoleId?: number;
  isEditMode = false;

  constructor(private roleService: RoleService, private fb: FormBuilder, private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.dropdownOpen) {
      const target = event.target as HTMLElement;
      const dropdownElement = this.elementRef.nativeElement.querySelector('.role-privilege-dropdown');

      // Check if the click is outside the dropdown container
      if (dropdownElement && !dropdownElement.contains(target)) {
        this.closeDropdown();
      }
    }
  }

  ngOnInit(): void {
    // initialize form with default controls
    this.form = this.fb.group({
      status: ['Active', Validators.required],  // Default to Active
      name: ['', Validators.required],
      customLanding: ['No', Validators.required],  // Default to No
      defaultLanding: [{ value: null, disabled: true }],
      roleType: ['', Validators.required],
      skin: [null, Validators.required],
      description: [''],
      privPermissions: [[]]  // Remove required validator for privileges
    });

    // Load data from separate APIs
    this.loadPrivilegeHierarchy();
    this.loadSkinsAndLandingPages();

    // enable/disable defaultLanding on customLanding changes
    this.form.get('customLanding')?.valueChanges.subscribe(val => {
      const ctrl = this.form.get('defaultLanding');
      val === 'Yes' ? ctrl?.enable() : ctrl?.disable();
    });
  }

  // UI selection (per leaf instance)
selectedNodeIds = new Set<string>();

isNodeSelected(nodeId: string) {
  return this.selectedNodeIds.has(nodeId);
}

toggleNode(nodeId: string) {
  const privilege = this.findPrivilegeByNodeId(nodeId);
  if (!privilege) return;

  if (this.selectedNodeIds.has(nodeId)) {
    // When deselecting, check if this privilege is required by others
    if (this.isPrivilegeRequiredByOthers(nodeId)) {
      return; // Don't allow deselection if required by other selected privileges
    }
    this.selectedNodeIds.delete(nodeId);

    // If deselecting Edit, also deselect any privileges that depend on Edit
    // if (privilege.label.toLowerCase() === 'edit') {
    //   this.deselectDependentPrivileges(nodeId, 'edit');
    // }
  } else {
    this.selectedNodeIds.add(nodeId);

    // If selecting Edit, automatically select View in the same feature
    if (privilege.label.toLowerCase() === 'edit') {
      this.autoSelectRequiredPrivileges(nodeId, 'view');
    }
  }
}

// When applying, write canonical values (deduped) to the form control
applySelection() {
  const values = new Set<string>();
  // walk filtered tree to map nodeId -> value
  const collectSelectedValues = (categories: any[]) => {
    categories.forEach(category => category.children.forEach((feature: any) =>
      feature.children.forEach((privilege: any) => {
        if (this.selectedNodeIds.has(privilege.nodeId)) values.add(privilege.value);
      })
    ));
  };
  collectSelectedValues(this.privilegeTreeOptions);
  this.form.get('privPermissions')?.setValue(Array.from(values));
  this.form.get('privPermissions')?.markAsDirty();
  this.form.get('privPermissions')?.markAsTouched();
  this.closeDropdown();
}

  /**
   * Get default privilege IDs for new roles
   */
  private getDefaultPrivilegeIds(): number[] {
    const defaultIds: number[] = [];

    // Select first View privilege from each category as default
    if (this.privilegeHierarchyData) {
      this.privilegeHierarchyData.forEach((category: any) => {
        category.features.forEach((feature: any) => {
          feature.privileges.forEach((privilege: any) => {
            if (privilege.privilegeName.toLowerCase() === 'view' && !defaultIds.includes(privilege.mapCatFeatPrivId)) {
              defaultIds.push(privilege.mapCatFeatPrivId);
            }
          });
        });
      });
    }

    return defaultIds;
}

// Helper methods for privilege dependencies
private findPrivilegeByNodeId(nodeId: string): any {
  for (const category of this.privilegeTreeOptions) {
    for (const feature of category.children) {
      for (const privilege of feature.children) {
        if (privilege.nodeId === nodeId) {
          return { ...privilege, feature, category };
        }
      }
    }
  }
  return null;
}

private autoSelectRequiredPrivileges(editNodeId: string, requiredPrivilegeType: string): void {
  const editPrivilege = this.findPrivilegeByNodeId(editNodeId);
  if (!editPrivilege) return;

  // Find the View privilege in the same feature
  const viewPrivilege = editPrivilege.feature.children.find((p: any) =>
    p.label.toLowerCase() === requiredPrivilegeType.toLowerCase()
  );

  if (viewPrivilege && !this.selectedNodeIds.has(viewPrivilege.nodeId)) {
    this.selectedNodeIds.add(viewPrivilege.nodeId);
  }
}

private deselectDependentPrivileges(editNodeId: string, privilegeType: string): void {
  // When Edit is deselected, automatically deselect View in the same feature
  const editPrivilege = this.findPrivilegeByNodeId(editNodeId);
  if (!editPrivilege) return;

  // Find the View privilege in the same feature
  const viewPrivilege = editPrivilege.feature.children.find((p: any) =>
    p.label.toLowerCase() === 'view'
  );

  if (viewPrivilege && this.selectedNodeIds.has(viewPrivilege.nodeId)) {
    this.selectedNodeIds.delete(viewPrivilege.nodeId);
  }
}

private isPrivilegeRequiredByOthers(nodeId: string): boolean {
  const privilege = this.findPrivilegeByNodeId(nodeId);
  if (!privilege) return false;

  // If this is a View privilege, check if Edit is selected in the same feature
  if (privilege.label.toLowerCase() === 'view') {
    const editPrivilege = privilege.feature.children.find((p: any) =>
      p.label.toLowerCase() === 'edit'
    );

    if (editPrivilege && this.selectedNodeIds.has(editPrivilege.nodeId)) {
      return true; // View is required by Edit, don't allow deselection
    }
  }

  return false;
}

// Check if a privilege should be disabled (non-editable)
isPrivilegeDisabled(nodeId: string): boolean {
  const privilege = this.findPrivilegeByNodeId(nodeId);
  if (!privilege) return false;

  // View is disabled when Edit is selected in the same feature
  if (privilege.label.toLowerCase() === 'view') {
    const editPrivilege = privilege.feature.children.find((p: any) =>
      p.label.toLowerCase() === 'edit'
    );

    if (editPrivilege && this.selectedNodeIds.has(editPrivilege.nodeId)) {
      return true;
    }

  }

  return false;
}

// Clear both UI and form
clearSelection() {
  this.selectedNodeIds.clear();
  this.form.get('privPermissions')?.setValue([]);
  this.form.get('privPermissions')?.markAsDirty();
  this.form.get('privPermissions')?.markAsTouched();
}

// Show labels for the selected nodes grouped by feature (secondary hierarchy level)
get displayText(): string {
  const groupedSelections: { [featureKey: string]: { featureLabel: string; privileges: string[] } } = {};

  this.privilegeTreeOptions.forEach(category =>
    category.children.forEach((feature: any) =>
      feature.children.forEach((privilege: any) => {
        if (this.selectedNodeIds.has(privilege.nodeId)) {
          // Use feature (secondary level) as the grouping key
          const featureKey = feature.label;
          if (!groupedSelections[featureKey]) {
            groupedSelections[featureKey] = {
              featureLabel: feature.label,
              privileges: []
            };
          }
          groupedSelections[featureKey].privileges.push(privilege.label);
        }
      })
    )
  );

  // Format the grouped selections
  const formattedGroups: string[] = [];
  Object.values(groupedSelections).forEach(group => {
    if (group.privileges.length === 1) {
      // Single privilege: "FeatureName(PrivilegeName)"
      formattedGroups.push(`${group.featureLabel}(${group.privileges[0]})`);
    } else {
      // Multiple privileges: "FeatureName(Privilege1, Privilege2)"
      formattedGroups.push(`${group.featureLabel}(${group.privileges.join(', ')})`);
    }
  });

  return formattedGroups.join(', ');
}


  // Selected values are stored in your Reactive Form control
  get selectedValues(): string[] {
    return this.form.get('privPermissions')?.value ?? [];
  }

  private setSelectedValues(next: string[]): void {
    const ctrl = this.form.get('privPermissions');
    ctrl?.setValue([...next]);
    ctrl?.markAsDirty();
    ctrl?.markAsTouched();
  }

  // Display text in input (comma-joined leaf labels)


  // Open/close
  toggleOpen(): void {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen){ this.ensureFiltered(); this.onDropdownOpened(); this.onSearch(); }
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }



  // Expand/collapse categories
  toggleCategory(categoryIndex: number): void {
    this.categoryExpanded[categoryIndex] = !this.categoryExpanded[categoryIndex];
  }

  onDropdownOpened(): void {
    this.categoryExpanded = this.filteredCategories.map(() => false); // Categories not auto-expanded
  }

  // Selection
  isSelected(val: string): boolean {
    return this.selectedValues?.includes(val) || false;
  }

  togglePrivilege(privilege: PrivilegeItem): void {
    if (privilege.disabled) return;
    const current = new Set(this.selectedValues || []);
    current.has(privilege.value) ? current.delete(privilege.value) : current.add(privilege.value);
    this.setSelectedValues(Array.from(current));
  }

  // Search
  onSearch(): void {
    const query = this.query.trim().toLowerCase();
    if (!query) { this.resetFilter(); return; }

    const filteredResults: CategoryItem[] = [];
    const matchesQuery = (text: string) => text.toLowerCase().includes(query);

    this.privilegeTreeOptions.forEach((category: any) => {
      const matchingFeatures: FeatureItem[] = [];
      category.children.forEach((feature: any) => {
        const matchingPrivileges = feature.children.filter((privilege: any) => matchesQuery(privilege.label));
        if (matchesQuery(feature.label) || matchingPrivileges.length) {
          matchingFeatures.push({ ...feature, children: matchingPrivileges.length ? matchingPrivileges : feature.children });
        }
      });
      if (matchesQuery(category.label) || matchingFeatures.length) {
        filteredResults.push({ ...category, children: matchingFeatures.length ? matchingFeatures : category.children });
      }
    });

    this.filteredCategories = filteredResults;
    // Do NOT auto-expand categories; user chooses
    this.categoryExpanded = this.filteredCategories.map(() => false);
  }

  resetFilter(): void {
    this.filteredCategories = JSON.parse(JSON.stringify(this.privilegeTreeOptions));
    this.categoryExpanded = this.filteredCategories.map(() => false);
  }

  private ensureFiltered() {
    if (!Array.isArray(this.filteredCategories) || this.filteredCategories.length === 0) {
      this.resetFilter();
    }
  }


  // Load privilege hierarchy from dedicated API
  /** Load privilege hierarchy from dedicated API */
  private loadPrivilegeHierarchy(): void {
    this.isDataLoading = true;
    this.roleService.getPrivilegeHierarchy().subscribe(privilegeData => {
      // Store the full hierarchy data for ID mapping
      this.privilegeHierarchyData = privilegeData;

      // flat list (unchanged)
      const allPrivileges = privilegeData.flatMap((category: any) =>
        category.features.flatMap((feature: any) =>
          feature.privileges.map((privilege: any) => privilege.privilegeName)
        )
      );
      const uniquePrivileges = Array.from(new Set(allPrivileges));
      this.privilegeGroups = [{ label: 'Features', privileges: uniquePrivileges }];

      // STRICT 3-level tree with guaranteed-unique nodeId per privilege
      // Use actual IDs from API instead of array indices
      this.privilegeTreeOptions = privilegeData.map((category: any) => ({
        label: category.categoryName,
        key: category.categoryKey,
        children: category.features.map((feature: any) => ({
          label: feature.featureName,
          key: feature.featureKey,
          children: feature.privileges.map((privilege: any) => ({
            label: privilege.privilegeName,
            value: String(privilege.privilegeKey ?? privilege.privilegeName),   // canonical submit value
            nodeId: `privilege-${category.categoryId}-${feature.featureId}-${privilege.privilegeId}`,       // <-- unique per privilege instance using actual IDs
          }))
        }))
      }));

      // Ensure tree is properly built
      this.ensureFiltered();

      // IMPORTANT: reset UI selection state when data reloads
      this.selectedNodeIds.clear();
      this.resetFilter();
      this.ensureFiltered();

      // If we're editing an existing role, load the privileges after tree is built
      const currentPrivileges = this.form.get('privPermissions')?.value;
      if (currentPrivileges && currentPrivileges.length > 0) {
        this.mapPrivilegesToNodes(currentPrivileges);
      }

      // Mark loading as complete
      this.isDataLoading = false;
    }, error => {

      this.isDataLoading = false;
      this.showErrorNotification('Failed to load privilege data. Please refresh the page.');
    });

  }



  /** Load skins and landing pages from dedicated APIs */
  private loadSkinsAndLandingPages(): void {
    this.isDataLoading = true;

    // Load skins - preserve the original structure
    this.roleService.getSkins().subscribe((skinData: any) => {

      // Store the original data structure for role type lookup
      this.skinOptionsData = skinData;

      // Flatten for dropdown options
      this.skinOptions = skinData.flatMap((roleType: any) =>
        roleType.skins.map((skin: any) => ({ label: skin.name, value: skin.key }))
      );

    }, error => {

    });

    // Load landing pages
    this.roleService.getLandingPages().subscribe((landingPages: any) => {

      this.landingPagesData = landingPages;
      this.landingPages = landingPages.map((page: any) => ({
        label: page.name,
        value: page.key
      }));

    }, error => {

    });
  }

  /** Open dialog; if data provided, prefill form for editing, otherwise reset */
  openDialog(data?: RoleConfigData): void {
    // Reset dropdown state when opening dialog
    this.closeDropdown();
    this.query = '';

    // Set edit mode and current role ID
    this.isEditMode = !!data;
    this.currentRoleId = data?.id;

    // this.showErrorNotification("BNS Super Admin");

    if (data) {
      this.form.get('customLanding')?.setValue(data.customLanding, { emitEvent: true });

      // Convert defaultLanding name to key for dropdown selection
      let defaultLandingKey = null;
      if (data.defaultLanding) {
        const landingPageOption = this.landingPages.find(page => page.label === data.defaultLanding);
        defaultLandingKey = landingPageOption ? landingPageOption.value : null;
      }

      // Convert skin name to skin key for dropdown selection
      let skinKey = null;
      if (data.skin && this.skinOptions.length > 0) {
        const skinOption = this.skinOptions.find(skin => skin.label === data.skin);
        skinKey = skinOption ? skinOption.value : null;
      }

      this.form.patchValue({
        status: data.status,
        name: data.roleName,
        defaultLanding: defaultLandingKey,
        roleType: data.roleType,
        skin: skinKey,
        description: data.roleDescription,
        privPermissions: data.rolePrivileges || []
      });

      // Load existing privileges into the tree selection
      this.loadExistingPrivileges(data.rolePrivileges || []);
    } else {
      this.form.reset({
        status: 'Active',
        name: '',
        customLanding: 'No',
        defaultLanding: null,
        roleType: '',
        skin: null,
        description: '',
        privPermissions: []
      });
      this.form.get('defaultLanding')?.disable({ emitEvent: false });

      // Clear tree selection for new role
      this.selectedNodeIds.clear();
    }
    this.display = true;
  }

  /** Load existing privileges into the tree selection UI */
  private loadExistingPrivileges(existingPrivileges: any[]): void {
    // Clear current selection first
    this.selectedNodeIds.clear();

    // Wait for privilege tree to be fully loaded before mapping
    const waitForTree = () => {
      if (this.privilegeTreeOptions.length > 0) {
        // Tree is loaded, now map the privileges
        this.mapPrivilegesToNodes(existingPrivileges);
      } else {
        // Tree not loaded yet, wait and try again
        setTimeout(waitForTree, 100);
      }
    };

    waitForTree();
  }

  /** Map privilege values to node IDs for selection */
  private mapPrivilegesToNodes(privilegeValues: any[]): void {
    // Clear current selection first
    this.selectedNodeIds.clear();

    if (!Array.isArray(privilegeValues) || privilegeValues.length === 0) {
      // No privileges to select
      return;
    }

    // First, try to extract mapCatFeatPrivId values if they exist in the data
    let privilegeIds: number[] = [];

    if (typeof privilegeValues[0] === 'object') {
      // Object array - try to extract privilege IDs
      privilegeValues.forEach(item => {
        if (typeof item === 'object' && item.mapCatFeatPrivId) {
          privilegeIds.push(item.mapCatFeatPrivId);
        }
      });

      if (privilegeIds.length > 0) {
        this.selectPrivilegesByIds(privilegeIds);
        return;
      }
    }

    // Handle string format: ["Role Management (View, Edit)", "Subscription management (Edit, View)"]
    if (typeof privilegeValues[0] === 'string') {
      this.parseAndSelectStringPrivileges(privilegeValues as string[]);
      return;
    }

    // If we get here, no valid privileges found, leave selection empty
  }

  /**
   * Parse string format privileges and select corresponding tree nodes
   * Format: ["Role Management (View, Edit)", "Subscription management (Edit, View)"]
   */
  private parseAndSelectStringPrivileges(privilegeStrings: string[]): void {
    privilegeStrings.forEach(privilegeString => {
      // Parse format like "Role Management (View, Edit)"
      const match = privilegeString.match(/^(.+?)\s*\(([^)]+)\)$/);
      if (match) {
        const featureName = match[1].trim();
        const privilegeTypes = match[2].split(',').map(p => p.trim());

        // Find the corresponding nodes in the tree
        this.selectPrivilegeNodesByFeatureAndTypes(featureName, privilegeTypes);
      }
    });
  }

  /**
   * Select privilege nodes by feature name and privilege types
   */
  private selectPrivilegeNodesByFeatureAndTypes(featureName: string, privilegeTypes: string[]): void {
    let foundFeature = false;
    let selectedCount = 0;

    this.privilegeTreeOptions.forEach(category => {
      category.children.forEach((feature: any) => {
        // Match feature by name (case-insensitive)
        if (feature.label.toLowerCase() === featureName.toLowerCase()) {
          foundFeature = true;
          feature.children.forEach((privilege: any) => {
            // Check if this privilege type should be selected
            const privilegeType = privilege.label.toLowerCase();
            if (privilegeTypes.some(type => type.toLowerCase() === privilegeType)) {
              this.selectedNodeIds.add(privilege.nodeId);
              selectedCount++;
            }
          });
        }
      });
    });
  }

  /** Select privileges by their mapCatFeatPrivId values */
  private selectPrivilegesByIds(privilegeIds: number[]): void {
    this.privilegeTreeOptions.forEach(category => {
      category.children.forEach((feature: any) => {
        feature.children.forEach((privilege: any) => {
          // Extract IDs from nodeId format: "privilege-categoryId-featureId-privilegeId"
          const parts = privilege.nodeId.split('-');
          if (parts.length === 4 && parts[0] === 'privilege') {
            const categoryId = parseInt(parts[1]);
            const featureId = parseInt(parts[2]);
            const privilegeId = parseInt(parts[3]);

            // Find the mapCatFeatPrivId for this privilege
            const mapCatFeatPrivId = this.findMapCatFeatPrivId(categoryId, featureId, privilegeId);
            if (mapCatFeatPrivId && privilegeIds.includes(mapCatFeatPrivId)) {
              this.selectedNodeIds.add(privilege.nodeId);

            }
          }
        });
      });
    });
  }

  /** Select default View privileges when specific privileges aren't available */
  private selectDefaultPrivileges(): void {

    this.privilegeTreeOptions.forEach(category => {
      category.children.forEach((feature: any) => {
        feature.children.forEach((privilege: any) => {
          // Select View privileges by default
          if (privilege.label.toLowerCase() === 'view') {
            this.selectedNodeIds.add(privilege.nodeId);

          }
        });
      });
    });
  }

  /** Legacy method for backward compatibility */
  private mapPrivilegesToNodesLegacy(privilegeValues: any[]): void {
    // Handle different formats of privilege data
    let privilegeSet: Set<string>;
    let featurePrivilegeMap: Map<string, Set<string>> = new Map();

    if (Array.isArray(privilegeValues)) {
      if (typeof privilegeValues[0] === 'string') {
        // Parse the grouped format: ["PETA/PETD Management (Edit, View)", "Subscription management (Edit, View)"]
        privilegeValues.forEach(groupedPrivilege => {
          // Extract feature name and privileges from format like "PETA/PETD Management (Edit, View)"
          const match = groupedPrivilege.match(/^(.+?)\s*\(([^)]+)\)$/);
          if (match) {
            const featureName = match[1].trim();
            const privileges = match[2].split(',').map((p: string) => p.trim());

            // Store feature-privilege mapping
            if (!featurePrivilegeMap.has(featureName)) {
              featurePrivilegeMap.set(featureName, new Set());
            }
            privileges.forEach((privilege: string) => {
              featurePrivilegeMap.get(featureName)!.add(privilege);
            });
          }
        });

        // Now map to tree nodes using feature names and privilege types
        this.privilegeTreeOptions.forEach(category =>
          category.children.forEach((feature: any) => {
            // Check if this feature matches any in our privilege data
            const featurePrivileges = featurePrivilegeMap.get(feature.label);
            if (featurePrivileges) {
              feature.children.forEach((privilege: any) => {
                // Check if this privilege type is included for this feature
                if (featurePrivileges.has(privilege.label)) {
                  this.selectedNodeIds.add(privilege.nodeId);
                }
              });
            }
          })
        );

      } else if (typeof privilegeValues[0] === 'object') {
        // Object array with boolean flags: [{privilege1: true}, {privilege2: false}]
        const activePrivileges: string[] = [];
        privilegeValues.forEach(privilegeObject => {
          Object.entries(privilegeObject).forEach(([key, value]) => {
            if (value === true) {
              activePrivileges.push(key);
            }
          });
        });
        privilegeSet = new Set(activePrivileges);

        // Map using privilege values
        this.privilegeTreeOptions.forEach(category =>
          category.children.forEach((feature: any) =>
            feature.children.forEach((privilege: any) => {
              // Check if this privilege's value matches any of the existing privileges
              if (privilegeSet.has(privilege.value)) {
                this.selectedNodeIds.add(privilege.nodeId);
              }
            })
          )
        );
      }
    }
  }

  close(): void {
    this.display = false;
    this.closeDropdown(); // Close the privilege dropdown when dialog closes
    // Reset edit mode tracking
    this.isEditMode = false;
    this.currentRoleId = undefined;
  }

  isFormValid(): boolean {
    // Check if required data is loaded
    const isDataLoaded = this.skinOptionsData && this.skinOptionsData.length > 0;

    // Basic form validation - check required fields
    const formValue = this.form.value;
    const hasName = formValue.name && formValue.name.trim().length > 0;
    const hasStatus = formValue.status && formValue.status.length > 0;
    const hasRoleType = formValue.roleType && formValue.roleType.length > 0;
    const hasSkin = formValue.skin && formValue.skin.length > 0;

    // Basic validation for required fields
    const isBasicValid = hasName && hasStatus && hasRoleType && hasSkin;

    // For add mode, only require basic fields and data loading
    if (!this.isEditMode) {
      return isBasicValid && isDataLoaded;
    }

    // For edit mode, also check if privileges are selected
    const privPermissions = this.form.get('privPermissions')?.value;
    const hasSelectedPrivileges = privPermissions && privPermissions.length > 0;

    return isBasicValid && hasSelectedPrivileges && isDataLoaded;
  }

  save(): void {
    // Check if required data is loaded
    if (!this.skinOptionsData || this.skinOptionsData.length === 0) {
      this.showErrorNotification('Loading data. Please wait a moment and try again.');
      return;
    }

    const formValue = this.form.value;
    const roleName = formValue.name;

    // Build the payload
    const payload = this.buildRolePayload(formValue);

    // Validate and save
    this.validateAndSave(payload, roleName);
  }

  /**
   * Build role payload from form values
   */
  private buildRolePayload(formValue: any): any {
    const payload: any = {
      name: formValue.name,
      description: formValue.description || '',
      isActive: formValue.status === 'Active',
      customLanding: formValue.customLanding === 'Yes',
      roleTypeConfigId: this.getRoleTypeId(formValue.roleType),
      skinConfigIds: this.getSkinConfigIds(formValue.skin),
      privilegeIds: this.getSelectedPrivilegeIds(),
      createdById: 1,
      updatedById: 1
    };

    // Add landing page if custom landing is enabled
    if (payload.customLanding) {
      const landingPageId = this.getLandingPageId(formValue.defaultLanding);
      if (landingPageId) {
        payload.landingPageConfigId = landingPageId;
      }
    }

    // Add ID for update operations
    if (this.isEditMode && this.currentRoleId) {
      payload.id = this.currentRoleId;
    }

    return payload;
  }

  /**
   * Validate and save the role
   */
  private validateAndSave(payload: any, roleName: string): void {
    // Validate required fields
    if (payload.roleTypeConfigId === null) {

      this.showErrorNotification('Invalid role type selected. Please try again.');
      return;
    }

    if (!payload.skinConfigIds.length) {

      this.showErrorNotification('No skin configuration found. Please select a skin.');
      return;
    }

    // For add mode, if no privileges selected, add some default ones
    if (!this.isEditMode && !payload.privilegeIds.length) {

      payload.privilegeIds = this.getDefaultPrivilegeIds();
    }

    // For edit mode, require privileges
    if (this.isEditMode && !payload.privilegeIds.length) {

      this.showErrorNotification('No privileges selected. Please select at least one privilege.');
      return;
    }



    // Use appropriate service method based on edit mode
    const serviceCall = this.isEditMode
      ? this.roleService.updateRole(payload)
      : this.roleService.createRole(payload);

    serviceCall.subscribe({
      next: (response) => {
        this.close();

        // Check for successful response - if we get here, the HTTP call was successful
        if (response) {
          this.showSuccessNotification();
        } else {
          this.showErrorNotification('Failed to save role. Please try again.');
        }
      },
      error: (error) => {
        this.close();
        this.showErrorNotification('Failed to save role. Please try again.');
      }
    });
  }

  /** Extract selected privilege IDs from the current selection */
  private getSelectedPrivilegeIds(): number[] {
    const privilegeIds: number[] = [];



    if (this.selectedNodeIds.size === 0) {

      // Try to get from form control as fallback
      const formPrivileges = this.form.get('privPermissions')?.value;


      // If no privileges are selected, this is likely the issue
      return [];
    }

    // Get selected privileges from the selectedNodeIds Set
    // The nodeId format is: "privilege-categoryId-featureId-privilegeId"
    // But we need to map this to the actual mapCatFeatPrivId from the API
    this.selectedNodeIds.forEach(nodeId => {
      const parts = nodeId.split('-');
      if (parts.length === 4 && parts[0] === 'privilege') {
        const categoryId = parseInt(parts[1]);
        const featureId = parseInt(parts[2]);
        const privilegeId = parseInt(parts[3]);

        // Find the corresponding privilege in the hierarchy data
        // and get its mapCatFeatPrivId
        const mapCatFeatPrivId = this.findMapCatFeatPrivId(categoryId, featureId, privilegeId);
        if (mapCatFeatPrivId) {
          privilegeIds.push(mapCatFeatPrivId);
        }
      }
    });


    return privilegeIds;
  }

  /** Find the mapCatFeatPrivId for a given category, feature, and privilege */
  private findMapCatFeatPrivId(categoryId: number, featureId: number, privilegeId: number): number | null {
    // Search through the privilege hierarchy data
    if (!this.privilegeHierarchyData) {

      return null;
    }

    for (const category of this.privilegeHierarchyData) {
      if (category.categoryId === categoryId) {
        for (const feature of category.features) {
          if (feature.featureId === featureId) {
            for (const privilege of feature.privileges) {
              if (privilege.privilegeId === privilegeId) {
                return privilege.mapCatFeatPrivId;
              }
            }
          }
        }
      }
    }

    
    return null;
  }

  /** Get landing page ID from landing page key */
  private getLandingPageId(landingPageKey: string | null): number | null {
    if (!landingPageKey || !this.landingPagesData.length) return null;
    
    // Find the landing page by key and return its ID
    const landingPage = this.landingPagesData.find(page => page.key === landingPageKey);
    return landingPage ? landingPage.id : null;
  }

  /** Get role type ID from role type value */
  private getRoleTypeId(roleType: string | null): number | null {
    if (!roleType) return null;



    // Try to find role type ID from the skins API data if loaded
    if (this.skinOptionsData && this.skinOptionsData.length > 0) {

      for (const roleTypeData of this.skinOptionsData) {

        if (roleTypeData.roleType && roleTypeData.roleType.name === roleType) {

          return roleTypeData.roleType.id;
        }
      }

    } else {

    }

    // Fallback mapping if data not loaded
    const roleTypeMapping: { [key: string]: number } = {
      'PSA BDP': 4,
      'BNS': 5
    };

    const result = roleTypeMapping[roleType] || null;

    return result;
  }

  /** Get skin config IDs from skin value */
  private getSkinConfigIds(skinValue: string | null): number[] {
    if (!skinValue) return [];



    if (!this.skinOptionsData || !this.skinOptionsData.length) {

      return [];
    }

    // Find the skin by key and return its ID in an array
    for (const roleTypeData of this.skinOptionsData) {
      
      if (roleTypeData.skins && Array.isArray(roleTypeData.skins)) {
        const skin = roleTypeData.skins.find((s: any) => s.key === skinValue);
        if (skin) {

          return [skin.id];
        }
      } else {

      }
    }


    return [];
  }

  private showSuccessNotification(): void {
    this.toastComponent.showSuccess('The Role is added successfully');
  }

  private showErrorNotification(roleName: string): void {
    this.toastComponent.showError(`${roleName} role has not added. Please try again.`);
  }
}

