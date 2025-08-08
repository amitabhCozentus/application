import { Component, OnInit, ViewChild } from '@angular/core';
import { PrimengModule } from '../../../shared/primeng/primeng.module';
import { RoleService } from '../../../shared/service/role-control/role.service';
import { SelectOption, RoleConfigData } from '../../../shared/lib/constants';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastComponent } from '../../../shared/component/toast-component/toast.component';

@Component({
  selector: 'app-role-configuration',
  standalone: true,
  imports: [PrimengModule, ReactiveFormsModule, FormsModule, ToastComponent],
  providers: [RoleService],
  templateUrl: './role-configuration.component.html',
  styleUrls: ['./role-configuration.component.scss']
})
export class RoleConfigurationComponent implements OnInit {
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

  display = false;
  form!: FormGroup;
  privilegeGroups: { label: string; privileges: string[] }[] = [];
  privilegeTreeOptions: any[] = []; // Tree structure for p-treeselect

  landingPages: SelectOption[] = [];
  skinOptions: SelectOption[] = [];

  constructor(private roleService: RoleService, private fb: FormBuilder) {}

  ngOnInit(): void {
    // initialize form with default controls
    this.form = this.fb.group({
      status: ['', Validators.required],
      name: ['', Validators.required],
      customLanding: ['', Validators.required],
      defaultLanding: [{ value: null, disabled: true }],
      roleType: ['', Validators.required],
      skin: [null, Validators.required],
      description: [''],
      privPermissions: [[], Validators.required]
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

  /** Load privilege hierarchy from dedicated API */
  private loadPrivilegeHierarchy(): void {
    this.roleService.getPrivilegeHierarchy().subscribe(privilegeData => {
      // Flatten the privilege hierarchy for simple privileges array
      const privs = privilegeData.flatMap(category =>
        category.features.flatMap(feature =>
          feature.privileges.map(privilege => privilege.privilegeName)
        )
      );
      const uniquePrivs = Array.from(new Set(privs));

      this.privilegeGroups = [{ label: 'Features', privileges: uniquePrivs }];

      // Build tree structure based on the actual API hierarchy
      this.privilegeTreeOptions = privilegeData.map(category => ({
        label: category.categoryName,
        key: category.categoryKey,
        children: category.features.map(feature => ({
          label: feature.featureName,
          key: feature.featureKey,
          children: feature.privileges.map(privilege => ({
            label: privilege.privilegeName,
            key: privilege.privilegeKey,
            data: privilege.privilegeName
          }))
        }))
      }));
    });
  }

  /** Load skins and landing pages from dedicated APIs */
  private loadSkinsAndLandingPages(): void {
    // Load skins
    this.roleService.getSkins().subscribe(skinData => {
      const allSkins = skinData.flatMap(roleType =>
        roleType.skins.map(skin => ({ label: skin.name, value: skin.key }))
      );
      this.skinOptions = allSkins;
    });

    // Load landing pages
    this.roleService.getLandingPages().subscribe(landingPages => {
      this.landingPages = landingPages.map(page => ({
        label: page.name,
        value: page.key
      }));
    });
  }

  /** Open dialog; if data provided, prefill form for editing, otherwise reset */
  open(data?: RoleConfigData): void {
        // this.showErrorNotification("BNS Super Admin");

    if (data) {
      this.form.get('customLanding')?.setValue(data.customLanding, { emitEvent: true });

      // Convert defaultLanding name to key for dropdown selection
      let defaultLandingKey = null;
      if (data.defaultLanding) {
        const landingPageOption = this.landingPages.find(page => page.label === data.defaultLanding);
        defaultLandingKey = landingPageOption ? landingPageOption.value : null;
      }

      this.form.patchValue({
        status: data.status,
        name: data.roleName,
        defaultLanding: defaultLandingKey,
        roleType: data.roleType,
        skin: data.skin,
        description: data.roleDescription,
        privPermissions: data.rolePrivileges || []
      });
    } else {
      this.form.reset({
        status: '',
        name: '',
        customLanding: '',
        defaultLanding: null,
        roleType: '',
        skin: null,
        description: '',
        privPermissions: []
      });
      this.form.get('defaultLanding')?.disable({ emitEvent: false });
    }
    this.display = true;
  }

  close(): void { this.display = false; }

  isFormValid(): boolean {
    const privPermissions = this.form.get('privPermissions')?.value;
    const hasSelectedPrivileges = privPermissions && privPermissions.length > 0;
    return this.form.valid && hasSelectedPrivileges;
  }

  save(): void {
    const privPermissions = this.form.get('privPermissions')?.value;
    const roleName = this.form.get('name')?.value;
    const formData = {
      ...this.form.value,
      rolePrivileges: privPermissions
    };

    console.log('Saved role:', formData);

    // Simulate save operation - replace this with actual service call
    try {
      // TODO: Replace with actual service call
      // this.roleService.saveRole(formData).subscribe({
      //   next: (response) => {
      //     this.close();
      //     this.showSuccessNotification();
      //   },
      //   error: (error) => {
      //     this.close();
      //     this.showErrorNotification(roleName);
      //   }
      // });

      // For now, simulate success
      const isSuccess = true; // Change this to false to test error scenario

      this.close();

      if (isSuccess) {
        this.showSuccessNotification();
      } else {
        this.showErrorNotification(roleName);
      }

    } catch (error) {
      this.close();
      this.showErrorNotification(roleName);
    }
  }

  private showSuccessNotification(): void {
    this.toastComponent.showSuccess('The Role is added successfully');
  }

  private showErrorNotification(roleName: string): void {
    this.toastComponent.showError(`${roleName} role has not added. Please try again.`);
  }
}
