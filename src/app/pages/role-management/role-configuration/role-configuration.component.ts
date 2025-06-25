import { Component, OnInit } from '@angular/core';
import { PrimengModule } from '../../../shared/primeng/primeng.module';
import { RoleService } from '../../../shared/service/role-control/role.service';
import { SelectOption, RoleConfigData } from '../../../shared/lib/constants';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-role-configuration',
  standalone: true,
  imports: [PrimengModule, ReactiveFormsModule],
  templateUrl: './role-configuration.component.html',
  styleUrls: ['./role-configuration.component.scss']
})
export class RoleConfigurationComponent implements OnInit {
  display = false;
  form!: FormGroup;

  role = {
    status: '',
    name: '',
    rolePrivileges: [] as string[],
    customLanding: '',
    defaultLanding: null as string | null,
    roleType: '',
    skin: null as string | null,
    description: ''
  };

  privilegeOptions: SelectOption[] = [];

  landingPages: SelectOption[] = [];
  skinOptions: SelectOption[] = [];

  constructor(private roleService: RoleService, private fb: FormBuilder) {}

  ngOnInit(): void {
    // initialize form with default controls
    this.form = this.fb.group({
      status: ['', Validators.required],
      name: ['', Validators.required],
      rolePrivileges: [[], Validators.required],
      customLanding: ['', Validators.required],
      defaultLanding: [{ value: null, disabled: true }],
      roleType: ['', Validators.required],
      skin: [null, Validators.required],
      description: ['']
    });
    // load options once
    this.roleService.getConfigOptions().subscribe(opts => {
      this.skinOptions = opts.skins.map(s => ({ label: s, value: s }));
      this.landingPages = opts.defaultLandings.map(l => ({ label: l, value: l }));
    });
    // load privilege options
    this.roleService.getPrivilegeOptions().subscribe(privs => {
      this.privilegeOptions = privs.map(p => ({ label: p, value: p }));
    });
    // enable/disable defaultLanding on customLanding changes
    this.form.get('customLanding')?.valueChanges.subscribe(val => {
      const ctrl = this.form.get('defaultLanding');
      if (val === 'Yes') ctrl?.enable(); else ctrl?.disable();
    });
  }

  /** Open dialog; if data provided, prefill form for editing, otherwise reset */
  open(data?: RoleConfigData): void {
    if (data) {
      this.form.get('customLanding')?.setValue(data.customLanding, { emitEvent: true });
      this.form.patchValue({
        status: data.status,
        name: data.roleName,
        rolePrivileges: data.rolePrivileges,
        defaultLanding: data.defaultLanding,
        roleType: data.roleType,
        skin: data.skin,
        description: data.roleDescription
      });
    } else {
      this.form.reset({
        status: '',
        name: '',
        rolePrivileges: [],
        customLanding: '',
        defaultLanding: null,
        roleType: '',
        skin: null,
        description: ''
      });
      this.form.get('defaultLanding')?.disable({ emitEvent: false });
    }
    this.display = true;
  }

  close(): void { this.display = false; }

  isFormValid(): boolean {
    return this.form.valid;
  }

  save(): void {
    console.log('Saved role:', this.form.value);
    this.close();
  }
}
