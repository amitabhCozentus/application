import { Component } from '@angular/core';
import { PrimengModule } from '../../../shared/primeng/primeng.module';

@Component({
  selector: 'app-role-configuration',
  standalone: true,
  imports: [PrimengModule],
  templateUrl: './role-configuration.component.html',
  styleUrls: ['./role-configuration.component.scss']
})
export class RoleConfigurationComponent {
    display = false;

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

  allPrivileges: any[] = [
    { label: 'Home', value: 'Home' },
    { label: 'Tracking List', value: 'Tracking List' },
    { label: 'Tracking Detail', value: 'Tracking Detail' },
    { label: 'Data Management', value: 'Data Management' },
    { label: 'Master Data Management', value: 'Master Data Management' }
  ];

  landingPages: any[] = [
    { label: 'Home', value: 'Home' },
    { label: 'Tracking List', value: 'Tracking List' },
    { label: 'Tracking Detail', value: 'Tracking Detail' },
    { label: 'Data Management', value: 'Data Management' }
  ];

  skinOptions: any[] = [
    { label: 'Default', value: 'Default' },
    { label: 'Ocean', value: 'Ocean' },
    { label: 'Analytics', value: 'Analytics' }
  ];

  open(): void { this.display = true; }
  close(): void { this.display = false; }

  isFormValid(): boolean {
    return (
      !!this.role.name.trim() &&
      this.role.rolePrivileges.length > 0 &&
      (this.role.customLanding === 'No' || !!this.role.defaultLanding) &&
      !!this.role.roleType &&
      !!this.role.skin
    );
  }

  save(): void {
    console.log('Saved role:', this.role);
    this.close();
  }
}
