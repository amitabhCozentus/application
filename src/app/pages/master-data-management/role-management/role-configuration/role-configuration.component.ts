import { Component, OnInit, ViewChild, HostListener, ElementRef, inject, DestroyRef, Output, EventEmitter } from '@angular/core';
import { PrimengModule } from '../../../../shared/primeng/primeng.module';
import { RoleService, RoleCreatePayload, RoleUpdatePayload } from '../../../../shared/service/role-control/role.service';
import { SelectOption, RoleConfigData } from '../../../../shared/lib/constants';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastComponent } from '../../../../shared/component/toast-component/toast.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    @ViewChild('searchBox') searchBox!: ElementRef<HTMLInputElement>;
    @ViewChild('dropdownContainer') dropdownContainer!: ElementRef<HTMLDivElement>;
    @ViewChild(ToastComponent) toastComponent!: ToastComponent;

    private readonly roleService = inject(RoleService);
    private readonly fb = inject(FormBuilder);
    private readonly elementRef = inject(ElementRef);
    private readonly destroyRef = inject(DestroyRef);

    display = false;
    form!: FormGroup;
    privilegeGroups: { label: string; privileges: string[] }[] = [];
    privilegeTreeOptions: any[] = []; // Tree structure for p-treeselect

    landingPages: SelectOption[] = [];
    skinOptions: SelectOption[] = [];
    private allSkinOptions: SelectOption[] = [];
    // Internal maps for ID resolution
    private roleTypeIdByName: Record<string, number> = {};
    private landingPageIdByKey: Record<string, number> = {};
    private skinIdByKey: Record<string, number> = {};
    private skinsByRoleTypeName: Record<string, SelectOption[]> = {};

    dropdownOpen: boolean = false;
    query: string = '';
    filteredCategories: CategoryItem[] = [];
    categoryExpanded: boolean[] = [];

    // UI selection (per leaf instance)
    selectedNodeIds = new Set<string>();
    private initialized = false;
    isEdit = false;
    private editingRoleId?: number;
    dialogHeader = 'Add Role';
    saving = false;
    private pendingSkinNames: string[] | null = null;
    private pendingDefaultLandingName: string | null = null;

    @Output() saved = new EventEmitter<void>();

    /** Close the dropdown when clicking outside */
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (this.dropdownOpen) {
            const target = event.target as HTMLElement;
            const dropdownElement = this.elementRef.nativeElement.querySelector('.role-privilege-dropdown');
            if (dropdownElement && !dropdownElement.contains(target)) {
                this.closeDropdown();
            }
        }
    }

    ngOnInit(): void {
        // initialize form with default controls
        this.form = this.fb.group({
            status: ['', Validators.required],
            name: ['', Validators.required],
            customLanding: ['', Validators.required],
            defaultLanding: [{ value: null, disabled: true }],
            roleType: ['', Validators.required],
            // multiple select of skin keys; disabled until roleType chosen
            skin: [{ value: [], disabled: true }, Validators.required],
            description: [''],
            privPermissions: [[], Validators.required]
        });

        // enable/disable defaultLanding on customLanding changes
        this.form.get('customLanding')?.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((val: string) => {
                const ctrl = this.form.get('defaultLanding');
                val === 'Yes' ? ctrl?.enable() : ctrl?.disable();
            });

        // Update skins by role type and clear selection on change (per user story)
        this.form.get('roleType')?.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((roleTypeName: string) => {
                this.updateSkinOptionsForRoleType(roleTypeName, true);
            });
    }

    // Ensure APIs are called once, when dialog is actually opened
    private initIfNeeded(): void {
        if (this.initialized) return;
        this.initialized = true;
        this.loadPrivilegeHierarchy();
        this.loadSkinsAndLandingPages();
    }

    // Selection helpers
    isNodeSelected(nodeId: string) {
        return this.selectedNodeIds.has(nodeId);
    }

    /** Check if the edit privilege is selected in the same feature */
    private isEditSelectedInSameFeature(node: any): boolean {
        const editPrivilege = node.feature.children.find((p: any) => p.label.toLowerCase() === 'edit');
        return !!(editPrivilege && this.selectedNodeIds.has(editPrivilege.nodeId));
    }

    /** Toggle the selection of a privilege */
    toggleNode(nodeId: string) {
        const privilege = this.findPrivilegeByNodeId(nodeId);
        if (!privilege) return;

        const selected = new Set(this.selectedNodeIds);
        const isEdit = privilege.label.toLowerCase() === 'edit';

        if (selected.has(nodeId)) {
            // Prevent deselect if required by others
            if (this.isPrivilegeRequiredByOthers(nodeId)) return;
            selected.delete(nodeId);
            // If deselecting Edit, also deselect View in the same feature
            if (isEdit) {
                const viewPrivilege = privilege.feature.children.find((p: any) => p.label.toLowerCase() === 'view');
                if (viewPrivilege && selected.has(viewPrivilege.nodeId)) {
                    selected.delete(viewPrivilege.nodeId);
                }
            }
        } else {
            selected.add(nodeId);
            // If selecting Edit, auto-select View in the same feature
            if (isEdit) {
                const viewPrivilege = privilege.feature.children.find((p: any) => p.label.toLowerCase() === 'view');
                if (viewPrivilege && !selected.has(viewPrivilege.nodeId)) {
                    selected.add(viewPrivilege.nodeId);
                }
            }
        }
        this.selectedNodeIds = selected;
        this.updateFormPrivilegesFromSelection();
    }

    // When applying, write canonical values (deduped) to the form control
    applySelection() {
        this.updateFormPrivilegesFromSelection();
        this.closeDropdown();
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

    /** Check if the privilege is required by others */
    private isPrivilegeRequiredByOthers(nodeId: string): boolean {
        const privilege = this.findPrivilegeByNodeId(nodeId);
        if (!privilege) return false;
        // If this is a View privilege, check if Edit is selected in the same feature
        if (privilege.label.toLowerCase() === 'view') {
            const editPrivilege = privilege.feature.children.find((p: any) => p.label.toLowerCase() === 'edit');
            if (editPrivilege && this.selectedNodeIds.has(editPrivilege.nodeId)) {
                return true;
            }
        }
        return false;
    }

    /** Update the form privileges based on the current selection */
    private updateFormPrivilegesFromSelection(): void {
        const values = new Set<string>();
        this.privilegeTreeOptions.forEach(category => category.children.forEach((feature: any) =>
            feature.children.forEach((privilege: any) => {
                if (this.selectedNodeIds.has(privilege.nodeId)) values.add(privilege.value);
            })
        ));
        const arr = Array.from(values);
        const ctrl = this.form.get('privPermissions');
        ctrl?.setValue(arr);
        ctrl?.markAsDirty();
        ctrl?.markAsTouched();
    }

    // Check if a privilege should be disabled (non-editable)
    isPrivilegeDisabled(nodeId: string): boolean {
        const privilege = this.findPrivilegeByNodeId(nodeId);
        if (!privilege) return false;
        if (privilege.label.toLowerCase() === 'view') {
            return this.isEditSelectedInSameFeature(privilege);
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
        const grouped: { [featureKey: string]: { featureLabel: string; privileges: string[] } } = {};
        this.privilegeTreeOptions.forEach(category =>
            category.children.forEach((feature: any) =>
                feature.children.forEach((privilege: any) => {
                    if (this.selectedNodeIds.has(privilege.nodeId)) {
                        const featureKey = feature.label;
                        if (!grouped[featureKey]) {
                            grouped[featureKey] = { featureLabel: feature.label, privileges: [] };
                        }
                        grouped[featureKey].privileges.push(privilege.label);
                    }
                })
            )
        );
        const formatted: string[] = [];
        Object.values(grouped).forEach(group => {
            formatted.push(
                group.privileges.length === 1
                    ? `${group.featureLabel}(${group.privileges[0]})`
                    : `${group.featureLabel}(${group.privileges.join(', ')})`
            );
        });
        return formatted.join(', ');
    }

    // Selected values are stored in your Reactive Form control
    get selectedValues(): string[] {
        return this.form.get('privPermissions')?.value ?? [];
    }

    /** Set the selected values */
    private setSelectedValues(next: string[]): void {
        const ctrl = this.form.get('privPermissions');
        ctrl?.setValue([...next]);
        ctrl?.markAsDirty();
        ctrl?.markAsTouched();
    }

    // Open/close
    /** Toggle the dropdown open state */
    toggleOpen(): void {
        this.dropdownOpen = !this.dropdownOpen;
        if (this.dropdownOpen) { this.ensureFiltered(); this.onDropdownOpened(); this.onSearch(); }
    }

    /** Close the dropdown */
    closeDropdown(): void {
        this.dropdownOpen = false;
    }

    // Expand/collapse categories
    toggleCategory(categoryIndex: number): void {
        this.categoryExpanded[categoryIndex] = !this.categoryExpanded[categoryIndex];
    }

    /** Handle the dropdown opened event */
    onDropdownOpened(): void {
        this.categoryExpanded = this.filteredCategories.map(() => false);
    }

    // Selection (legacy list helpers used by template if any)
    isSelected(val: string): boolean {
        return this.selectedValues?.includes(val) || false;
    }

    /** Toggle the selection of a privilege */
    togglePrivilege(privilege: PrivilegeItem): void {
        if (privilege.disabled) return;
        const current = new Set(this.selectedValues || []);
        current.has(privilege.value) ? current.delete(privilege.value) : current.add(privilege.value);
        this.setSelectedValues(Array.from(current));
    }

    // Search
    /** Handle the search input */
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
        this.categoryExpanded = this.filteredCategories.map(() => false);
    }

    /** Reset the filter */
    resetFilter(): void {
        this.filteredCategories = JSON.parse(JSON.stringify(this.privilegeTreeOptions));
        this.categoryExpanded = this.filteredCategories.map(() => false);
    }

    /** Ensure the filtered categories are valid */
    private ensureFiltered() {
        if (!Array.isArray(this.filteredCategories) || this.filteredCategories.length === 0) {
            this.resetFilter();
        }
    }

    // Load privilege hierarchy from dedicated API
    /** Load privilege hierarchy from dedicated API */
    private loadPrivilegeHierarchy(): void {
        this.roleService.getPrivilegeHierarchy().subscribe(privilegeData => {
            // flat list (unchanged)
            const allPrivileges = privilegeData.flatMap(category =>
                category.features.flatMap(feature =>
                    feature.privileges.map(privilege => privilege.privilegeName)
                )
            );
            const uniquePrivileges = Array.from(new Set(allPrivileges));
            this.privilegeGroups = [{ label: 'Features', privileges: uniquePrivileges }];

            // STRICT 3-level tree with guaranteed-unique nodeId per privilege
            this.privilegeTreeOptions = privilegeData.map((category, categoryIndex) => ({
                label: category.categoryName,
                key: category.categoryKey,
                children: category.features.map((feature, featureIndex) => ({
                    label: feature.featureName,
                    key: feature.featureKey,
                    children: feature.privileges.map((privilege, privilegeIndex) => ({
                        label: privilege.privilegeName,
                        value: String(privilege.privilegeKey ?? privilege.privilegeName),
                        nodeId: `${categoryIndex}-${featureIndex}-${privilegeIndex}`,
                        privilegeId: privilege.privilegeId,
                        mapCatFeatPrivId: privilege.mapCatFeatPrivId,
                    }))
                }))
            }));

            // IMPORTANT: reset UI selection state when data reloads
            this.selectedNodeIds.clear();
            this.resetFilter();
            this.ensureFiltered();

            // If we're editing an existing role, load the privileges after tree is built
            const currentPrivileges = this.form.get('privPermissions')?.value;
            if (currentPrivileges && currentPrivileges.length > 0) {
                this.mapPrivilegesToNodes(currentPrivileges);
            }
        });

    }

    /** Load skins and landing pages from dedicated APIs */
    private loadSkinsAndLandingPages(): void {
        // Load skins
        this.roleService.getSkins().subscribe((skinData: any) => {
            // Build maps and per-roleType options
            this.skinsByRoleTypeName = {};
            this.skinIdByKey = {};
            this.roleTypeIdByName = {};
            skinData.forEach((rt: any) => {
                this.roleTypeIdByName[rt.roleType.name] = rt.roleType.id;
                const list: SelectOption[] = rt.skins.map((s: any) => {
                    this.skinIdByKey[s.key] = s.id;
                    return { label: s.name, value: s.key } as SelectOption;
                });
                this.skinsByRoleTypeName[rt.roleType.name] = list;
            });
            // Build all unique skins
            const seen = new Set<string>();
            this.allSkinOptions = [];
            Object.values(this.skinsByRoleTypeName).forEach(list => {
                list.forEach(opt => {
                    if (!seen.has(opt.value)) {
                        seen.add(opt.value);
                        this.allSkinOptions.push(opt);
                    }
                });
            });
            // Initialize current skin options based on selected role type, without clearing
            const currentRoleType = this.form.get('roleType')?.value as string;
            this.updateSkinOptionsForRoleType(currentRoleType, false);
            // If we opened in edit mode before skins loaded, apply pending names now
            if (this.isEdit && this.pendingSkinNames && (!this.form.get('skin')?.value || (this.form.get('skin')?.value as any[]).length === 0)) {
                const nameToKey = new Map(this.allSkinOptions.map(o => [o.label, o.value] as [string, string]));
                const skinKeys = this.pendingSkinNames.map(n => nameToKey.get(n)).filter(Boolean) as string[];
                this.form.get('skin')?.setValue(skinKeys);
                this.pendingSkinNames = null;
            }
        });

        // Load landing pages
        this.roleService.getLandingPages().subscribe((landingPages: any) => {
            this.landingPages = landingPages.map((page: any) => {
                this.landingPageIdByKey[page.key] = page.id;
                return { label: page.name, value: page.key } as SelectOption;
            });
            // Apply pending default landing if any (e.g., when edit dialog opened before pages loaded)
            if (this.isEdit && this.pendingDefaultLandingName) {
                const opt = this.landingPages.find(p => p.label === this.pendingDefaultLandingName);
                if (opt) {
                    this.form.get('defaultLanding')?.setValue(opt.value);
                    this.pendingDefaultLandingName = null;
                }
            }
        });
    }

    /** Compute skin options for the given role type and optionally clear current selection */
    private updateSkinOptionsForRoleType(roleTypeName: string | null | undefined, clearSelection: boolean): void {
        const nextOptions = this.getSkinsForRoleType(roleTypeName || '');
        this.skinOptions = nextOptions && nextOptions.length ? nextOptions : [];

        const skinCtrl = this.form.get('skin');
        const shouldEnable = !!roleTypeName && this.skinOptions.length > 0;
        if (shouldEnable) {
            skinCtrl?.enable({ emitEvent: false });
        } else {
            skinCtrl?.disable({ emitEvent: false });
        }
        if (clearSelection) {
            skinCtrl?.setValue([]);
            skinCtrl?.markAsDirty();
            skinCtrl?.markAsTouched();
        }
    }

    /** Return skins for a role type from API mapping or by label prefix fallback */
    private getSkinsForRoleType(roleTypeName: string): SelectOption[] {
        if (!roleTypeName) return this.allSkinOptions;
        const byApi = this.skinsByRoleTypeName[roleTypeName] || [];
        if (byApi.length) return byApi;
        // Fallback: filter by label prefix (e.g., 'PSA BDP', 'BNS')
        const prefix = roleTypeName.trim();
        return this.allSkinOptions.filter(o => o.label?.toLowerCase().startsWith(prefix.toLowerCase()));
    }

    /** Open dialog; if data provided, prefill form for editing, otherwise reset */
    openDialog(data?: RoleConfigData): void {
        // Initialize on first open to avoid early API calls
        this.initIfNeeded();

        // Reset dropdown state when opening dialog
        this.closeDropdown();
        this.query = '';

        if (data) {
            this.isEdit = true;
            this.editingRoleId = data.id;
            this.dialogHeader = 'Edit Role';
            this.form.get('customLanding')?.setValue(data.customLanding, { emitEvent: true });
            // Convert defaultLanding name to key for dropdown selection
            let defaultLandingKey: string | null = null;
            if (data.defaultLanding) {
                const landingPageOption = this.landingPages.find(page => page.label === data.defaultLanding);
                if (landingPageOption) {
                    defaultLandingKey = landingPageOption.value;
                } else {
                    // Defer until landing pages load
                    this.pendingDefaultLandingName = data.defaultLanding;
                }
            }

            // Map skin names (comma-separated) to keys array
            let skinKeys: string[] = [];
            if (data.skin) {
                const skinNames = data.skin.split(',').map(s => s.trim());
                const nameToKey = new Map(this.allSkinOptions.map(o => [o.label, o.value] as [string, string]));
                skinKeys = skinNames.map(n => nameToKey.get(n)).filter(Boolean) as string[];
                if (skinKeys.length === 0) {
                    // skins not ready yet; store and set after load
                    this.pendingSkinNames = skinNames;
                }
            }

            this.form.patchValue({
                status: data.status,
                name: data.roleName,
                defaultLanding: defaultLandingKey,
                roleType: data.roleType,
                skin: skinKeys,
                description: data.roleDescription,
                privPermissions: data.rolePrivileges || []
            });

            // Load existing privileges into the tree selection
            this.loadExistingPrivileges(data.rolePrivileges || []);
        } else {
            this.isEdit = false;
            this.editingRoleId = undefined;
            this.dialogHeader = 'Add Role';
            this.form.reset({
                status: '',
                name: '',
                customLanding: '',
                defaultLanding: null,
                roleType: '',
                skin: [],
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
        // Clear current selection
        this.selectedNodeIds.clear();

        // Wait for privilege tree to be loaded before mapping
        if (this.privilegeTreeOptions.length === 0) {
            const checkTreeLoaded = () => {
                if (this.privilegeTreeOptions.length > 0) {
                    this.mapPrivilegesToNodes(existingPrivileges);
                } else {
                    setTimeout(checkTreeLoaded, 100);
                }
            };
            checkTreeLoaded();
        } else {
            this.mapPrivilegesToNodes(existingPrivileges);
        }
    }

    /** Map privilege values to node IDs for selection */
    private mapPrivilegesToNodes(privilegeValues: any[]): void {
        const featurePrivilegeMap: Map<string, Set<string>> = new Map();

        if (Array.isArray(privilegeValues) && privilegeValues.length > 0) {
            if (typeof privilegeValues[0] === 'string') {
                // Parse grouped format: "Feature (Edit, View)"
                privilegeValues.forEach(groupedPrivilege => {
                    const match = groupedPrivilege.match(/^(.+?)\s*\(([^)]+)\)$/);
                    if (match) {
                        const featureName = match[1].trim();
                        const privileges = match[2].split(',').map((p: string) => p.trim());
                        if (!featurePrivilegeMap.has(featureName)) {
                            featurePrivilegeMap.set(featureName, new Set());
                        }
                        privileges.forEach((p: string) => featurePrivilegeMap.get(featureName)!.add(p));
                    }
                });

                this.privilegeTreeOptions.forEach(category =>
                    category.children.forEach((feature: any) => {
                        const wanted = featurePrivilegeMap.get(feature.label);
                        if (wanted) {
                            feature.children.forEach((privilege: any) => {
                                if (wanted.has(privilege.label)) this.selectedNodeIds.add(privilege.nodeId);
                            });
                        }
                    })
                );

            } else if (typeof privilegeValues[0] === 'object') {
                // Object array with boolean flags: [{privilege1: true}, {privilege2: false}]
                const active = new Set<string>();
                privilegeValues.forEach((privilegeObject: any) => {
                    Object.entries(privilegeObject).forEach(([key, value]) => {
                        if (value === true) active.add(key);
                    });
                });

                this.privilegeTreeOptions.forEach(category =>
                    category.children.forEach((feature: any) =>
                        feature.children.forEach((privilege: any) => {
                            if (active.has(privilege.value)) this.selectedNodeIds.add(privilege.nodeId);
                        })
                    )
                );
            }
        }
    }

    /** Close the dialog */
    close(): void {
        this.display = false;
        this.closeDropdown();
    }

    /** Check if the form is valid */
    isFormValid(): boolean {
        const hasSelectedPrivileges = this.selectedNodeIds.size > 0;
        const skinSel: any[] = this.form.get('skin')?.value;
        const hasSkins = Array.isArray(skinSel) && skinSel.length > 0;
        const customLanding = this.form.get('customLanding')?.value;
        const defaultLanding = this.form.get('defaultLanding')?.value;
        const defaultValid = customLanding === 'Yes' ? !!defaultLanding : true;
        const statusValid = !!this.form.get('status')?.valid;
        const nameValid = !!this.form.get('name')?.valid;
        const roleTypeValid = !!this.form.get('roleType')?.valid;
        return statusValid && nameValid && roleTypeValid
            && hasSelectedPrivileges && hasSkins && defaultValid;
    }

    /** Save the role */
    save(): void {
        if (this.saving) return;
        const missing = this.getMissingRequiredFields();
        if (missing.length) {
            this.markRequiredTouched();
            this.toastComponent.showError(`Please fill the required fields: ${missing.join(', ')}`);
            return;
        }
        const roleName: string = this.form.get('name')?.value;
        const payloadBase = this.buildCreatePayloadBase();
        this.saving = true;
        if (this.isEdit && this.editingRoleId != null) {
            const updatePayload: RoleUpdatePayload = { id: this.editingRoleId, ...payloadBase } as RoleUpdatePayload;
            this.roleService.updateRole(updatePayload).subscribe({
                next: (res) => {
                    this.saving = false;
                    this.close();
                    if (res?.success) {
                        this.toastComponent.showSuccess('The Role was updated successfully');
                        this.saved.emit();
                    } else {
                        this.showErrorNotification(roleName);
                    }
                },
                error: () => {
                    this.saving = false;
                    this.close();
                    this.showErrorNotification(roleName);
                }
            });
        } else {
            const createPayload: RoleCreatePayload = payloadBase as RoleCreatePayload;
            this.roleService.createRole(createPayload).subscribe({
                next: (res: any) => {
                    this.saving = false;
                    this.close();
                    if (res?.body?.success) {
                        this.toastComponent.showSuccess('The Role is added successfully');
                        this.saved.emit();
                    } else {
                        this.showErrorNotification(roleName);
                    }
                },
                error: () => {
                    this.saving = false;
                    this.close();
                    this.showErrorNotification(roleName);
                }
            });
        }
    }

    /** Show error notification */
    private showErrorNotification(roleName: string): void {
        this.toastComponent.showError(`${roleName} role has not added. Please try again.`);
    }

    // Helpers
    /** Get selected privilege IDs from the mapCatFeatPrivId */
    private getSelectedPrivilegeIds(): number[] {
        // Return unique mapCatFeatPrivId values only
        const ids = new Set<number>();
        this.privilegeTreeOptions.forEach((category: any) =>
            category.children.forEach((feature: any) =>
                feature.children.forEach((privilege: any) => {
                    if (this.selectedNodeIds.has(privilege.nodeId)) {
                        const mapId = privilege.mapCatFeatPrivId;
                        if (typeof mapId === 'number') ids.add(mapId);
                    }
                })
            )
        );
        return Array.from(ids);
    }

    /** Build the base payload for creating a role */
    private buildCreatePayloadBase(): RoleCreatePayload {
        const status: 'Active' | 'Inactive' = this.form.get('status')?.value;
        const name: string = this.form.get('name')?.value;
        const customLandingStr: 'Yes' | 'No' = this.form.get('customLanding')?.value;
        const defaultLandingKey: string | null = this.form.get('defaultLanding')?.value;
        const roleTypeName: string = this.form.get('roleType')?.value;
        const skinKeys: string[] = this.form.get('skin')?.value || [];
        const description: string = this.form.get('description')?.value || '';

        const landingPageConfigId = customLandingStr === 'Yes' && defaultLandingKey
            ? this.landingPageIdByKey[defaultLandingKey]
            : undefined;
        const roleTypeConfigId = this.roleTypeIdByName[roleTypeName];
        const skinConfigIds = (skinKeys || []).map(k => this.skinIdByKey[k]).filter((v: any) => typeof v === 'number');
        const privilegeIds = this.getSelectedPrivilegeIds();

        const payload: RoleCreatePayload = {
            name,
            description,
            isActive: status === 'Active',
            customLanding: customLandingStr === 'Yes',
            landingPageConfigId,
            roleTypeConfigId,
            skinConfigIds,
            privilegeIds,
            // TODO: replace with actual logged-in user id
            createdById: 0,
            updatedById: 0,
        };
        return payload;
    }

    /** Compute missing required fields for error messaging */
    private getMissingRequiredFields(): string[] {
        const missing: string[] = [];
        const status = this.form.get('status')?.value;
        const name = (this.form.get('name')?.value || '').trim();
        const roleType = this.form.get('roleType')?.value;
        const skins: any[] = this.form.get('skin')?.value || [];
        const custom = this.form.get('customLanding')?.value;
        const defaultLanding = this.form.get('defaultLanding')?.value;
        if (!status) missing.push('Status');
        if (!name) missing.push('Role Name');
        if (!roleType) missing.push('Role Type');
        if (!Array.isArray(skins) || skins.length === 0) missing.push('Skin');
        if (!custom) missing.push('Custom Landing');
        if (custom === 'Yes' && !defaultLanding) missing.push('Default Landing Page');
        if (this.selectedNodeIds.size === 0) missing.push('Role Privileges');
        return missing;
    }

    /** Mark required controls as touched to reveal field-level validation */
    private markRequiredTouched(): void {
        ['status','name','roleType','skin','customLanding','defaultLanding'].forEach(c => this.form.get(c)?.markAsTouched());
    }
}
