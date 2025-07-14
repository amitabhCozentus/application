import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolbarModule } from 'primeng/toolbar';
import { MenubarModule } from 'primeng/menubar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenuItem, SelectItem } from 'primeng/api';
import { PrimengModule } from '../../primeng/primeng.module';

@Component({
  standalone: true,
  selector: 'app-topbar',
  imports: [CommonModule, FormsModule, ToolbarModule, MenubarModule, DropdownModule, ButtonModule, AvatarModule, TieredMenuModule, PrimengModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {
  applicationTitle = 'SMART + NAVIGATOR';
  currentSection = 'MARITIME + INSIGHTS';

  companyItems: SelectItem[] = [
    { label: 'Saved Companies', value: null }
  ];
  selectedCompany: any;

  navMenuItems: MenuItem[] = [];
  userMenuItems: MenuItem[] = [];

  userName = 'Solution User';
  get userInitials(): string {
    return this.userName
      .split(' ')
      .map((n) => n.charAt(0))
      .join('');
  }

  ngOnInit(): void {
    this.navMenuItems = [
      { label: 'Home', icon: 'pi pi-home', routerLink: '/home' },
      { label: 'Tracking List', icon: 'pi pi-list', routerLink: '/tracking-list' },
      { label: 'Favorites', icon: 'pi pi-star', routerLink: '/favorites' },
      { label: 'Alerts', icon: 'pi pi-bell', routerLink: '/alerts' },
      { label: 'Reporting', icon: 'pi pi-chart-line', routerLink: '/reporting' },
      { label: '3PL', icon: 'pi pi-refresh', items: [] },
      { label: 'Data Management', icon: 'pi pi-database', items: [] },
      { label: 'User Management', icon: 'pi pi-users', items: [] },
      { label: 'Master Data', icon: 'pi pi-cog', items: [] }
    ];

    this.userMenuItems = [
      { label: 'Profile', icon: 'pi pi-user' },
      { label: 'Settings', icon: 'pi pi-cog' },
      { separator: true },
      { label: 'Logout', icon: 'pi pi-sign-out' }
    ];
  }
}
