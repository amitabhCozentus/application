# MMT Portal Development Guidelines

## 🎯 Overview

This document outlines the development standards and best practices for the MMT Portal project. Follow these guidelines to ensure code consistency, maintainability, and optimal performance.

## 🚀 Angular 19+ Best Practices

### 1. Use Modern Angular Features

#### New Control Flow Syntax
**✅ DO**: Use the new `@if`, `@for`, `@switch` syntax
```typescript
@Component({
  template: `
    @if (users.length > 0) {
      <div class="user-list">
        @for (user of users; track user.id) {
          <div class="user-card">
            @switch (user.status) {
              @case ('active') {
                <span class="status-active">Active</span>
              }
              @case ('inactive') {
                <span class="status-inactive">Inactive</span>
              }
              @default {
                <span class="status-unknown">Unknown</span>
              }
            }
          </div>
        }
      </div>
    } @else {
      <div class="empty-state">No users found</div>
    }
  `
})
```

**❌ DON'T**: Use legacy structural directives
```typescript
// Avoid this legacy syntax
template: `
  <div *ngIf="users.length > 0; else emptyState">
    <div *ngFor="let user of users; trackBy: trackUser">
      <span [ngSwitch]="user.status">
        <span *ngSwitchCase="'active'">Active</span>
      </span>
    </div>
  </div>
  <ng-template #emptyState>No users found</ng-template>
`
```

#### Standalone Components
**✅ DO**: Use standalone components with explicit imports
```typescript
@Component({
  selector: 'app-role-control',
  standalone: true,
  imports: [PrimengModule, CommonTableSearchComponent, RoleConfigurationComponent],
  templateUrl: './role-control.component.html',
  styleUrls: ['./role-control.component.scss']
})
export class RoleControlComponent implements OnInit {
  // Component logic
}
```

**❌ DON'T**: Use NgModules for new components
```typescript
// Avoid creating new NgModules
@NgModule({
  declarations: [RoleControlComponent],
  imports: [CommonModule, PrimengModule],
  exports: [RoleControlComponent]
})
export class RoleModule { }
```

#### Signals for Reactive State
**✅ DO**: Use signals for reactive state management
```typescript
export class LayoutService {
  layoutConfig = signal<LayoutConfig>({
    preset: 'Aura',
    primary: 'blue',
    darkTheme: false
  });

  darkTheme = computed(() => this.layoutConfig().darkTheme);
  
  updateTheme(theme: string) {
    this.layoutConfig.update(config => ({
      ...config,
      primary: theme
    }));
  }
}
```

### 2. Component Architecture

#### Dependency Injection
**✅ DO**: Use the `inject()` function
```typescript
export class RoleControlComponent {
  private roleService = inject(RoleService);
  private layoutService = inject(LayoutService);
  
  constructor() {
    // Constructor only for initialization logic
  }
}
```

#### ViewChild and Template References
**✅ DO**: Use ViewChild with proper typing
```typescript
@ViewChild(RoleConfigurationComponent, { static: true }) 
roleConfig!: RoleConfigurationComponent;

@ViewChild('roleTable') 
roleTable!: Table;
```

#### Lifecycle Hooks
**✅ DO**: Implement proper lifecycle management
```typescript
export class UserControlComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => this.users = users);
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## 🎨 PrimeNG Integration & Theming

### 1. Theme Management

#### Use PrimeNG 19+ Theming System
**✅ DO**: Use the new theme system with presets
```typescript
// app.config.ts
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      500: '{blue.500}',
      // ... other shades
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          // ... other surfaces
        }
      },
      dark: {
        surface: {
          0: '#0d1117',
          // ... other surfaces
        }
      }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.app-dark'
        }
      }
    })
  ]
};
```

#### Dynamic Theme Updates
**✅ DO**: Use updatePreset for dynamic theming
```typescript
updateColors(type: string, color: any) {
  if (type === 'primary') {
    this.layoutService.layoutConfig.update(state => ({
      ...state,
      primary: color.name
    }));
  }
  
  updatePreset(this.getPresetExt());
  this.layoutService.updateBodyBackground(color.name);
}
```

### 2. CSS Best Practices

#### Avoid Custom CSS Override
**❌ DON'T**: Override PrimeNG styles directly
```scss
// Avoid this - can break with theme changes
.p-button {
  background-color: #007bff !important;
  border-color: #007bff !important;
}

.p-datatable .p-datatable-thead > tr > th {
  background-color: #f8f9fa !important;
}
```

**✅ DO**: Use theme variables and PrimeFlex utilities
```scss
// Use theme variables
.custom-button {
  background-color: var(--p-primary-color);
  border-color: var(--p-primary-color);
}

// Use PrimeFlex utilities
.status-active {
  @apply px-3 py-1 rounded shadow-none border-0 text-sm font-semibold;
  background-color: var(--p-green-100);
  color: var(--p-green-800);
}
```

#### Dark Mode Compatibility
**✅ DO**: Design for both light and dark themes
```scss
.user-card {
  background-color: var(--p-surface-card);
  border: 1px solid var(--p-surface-border);
  color: var(--p-text-color);
  
  &:hover {
    background-color: var(--p-surface-hover);
  }
}
```

## 📡 API Integration & State Management

### 1. Service Architecture

#### HTTP Client Best Practices
**✅ DO**: Use proper error handling and typing
```typescript
@Injectable({ providedIn: 'root' })
export class RoleService {
  private httpClient = inject(HttpClient);
  
  getActiveRoles(page: number, size: number, search?: string): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('search', search || '');
      
    return this.httpClient.get<ApiResponse>(`${environment.baseurl}/roles`, { params })
      .pipe(
        map(response => this.transformRoleData(response)),
        catchError(error => {
          console.error('Error loading roles:', error);
          return throwError(() => error);
        })
      );
  }
}
```

### 2. Caching Strategy

#### Use the Built-in Cache Service
**✅ DO**: Configure endpoints for caching
```typescript
// cache.config.ts
export const CACHEABLE_ENDPOINTS: { [url: string]: CachePolicy } = {
  "common/hierarchy/port-list": { persistUntilLogout: true },
  "users/profile": { ttl: 300000 }, // 5 minutes
  "roles/active": { ttl: 600000 }   // 10 minutes
};
```

**✅ DO**: Use force refresh when needed
```typescript
// Force refresh data
loadRoles(forceRefresh = false) {
  const params = forceRefresh ? { forceRefresh: 'true' } : {};
  
  this.roleService.getActiveRoles(0, 10, '', params)
    .subscribe(roles => this.roles = roles);
}
```

## 🔧 Form Handling & Validation

### 1. Reactive Forms
**✅ DO**: Use reactive forms with proper validation
```typescript
export class RoleConfigurationComponent {
  private fb = inject(FormBuilder);
  
  roleForm = this.fb.group({
    roleName: ['', [Validators.required, Validators.minLength(3)]],
    roleDescription: ['', Validators.required],
    roleType: ['', Validators.required],
    status: ['Active', Validators.required]
  });
  
  onSubmit() {
    if (this.roleForm.valid) {
      const roleData = this.roleForm.value;
      this.submitRole(roleData);
    } else {
      this.markFormGroupTouched();
    }
  }
}
```

### 2. PrimeNG Form Components
**✅ DO**: Use PrimeNG form components with proper binding
```html
<form [formGroup]="roleForm" (ngSubmit)="onSubmit()">
  <div class="field">
    <label for="roleName" class="required-label">
      Role Name <span class="required-star">*</span>
    </label>
    <input 
      pInputText 
      id="roleName" 
      formControlName="roleName"
      [class.ng-invalid]="roleForm.get('roleName')?.invalid && roleForm.get('roleName')?.touched"
    />
    @if (roleForm.get('roleName')?.invalid && roleForm.get('roleName')?.touched) {
      <small class="p-error">Role name is required</small>
    }
  </div>
</form>
```

## 🧪 Testing Guidelines

### 1. Component Testing
**✅ DO**: Write comprehensive component tests
```typescript
describe('RoleControlComponent', () => {
  let component: RoleControlComponent;
  let fixture: ComponentFixture<RoleControlComponent>;
  let mockRoleService: jasmine.SpyObj<RoleService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('RoleService', ['getActiveRoles']);
    
    await TestBed.configureTestingModule({
      imports: [RoleControlComponent],
      providers: [
        { provide: RoleService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleControlComponent);
    component = fixture.componentInstance;
    mockRoleService = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
  });

  it('should load roles on init', () => {
    mockRoleService.getActiveRoles.and.returnValue(of(mockRolesData));
    
    component.ngOnInit();
    
    expect(mockRoleService.getActiveRoles).toHaveBeenCalled();
    expect(component.roles.length).toBeGreaterThan(0);
  });
});
```

### 2. Service Testing
**✅ DO**: Test services with HTTP client mocking
```typescript
describe('RoleService', () => {
  let service: RoleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RoleService]
    });
    
    service = TestBed.inject(RoleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch roles', () => {
    const mockRoles = { data: [{ id: 1, name: 'Admin' }] };

    service.getActiveRoles(0, 10).subscribe(roles => {
      expect(roles).toEqual(mockRoles);
    });

    const req = httpMock.expectOne(req => 
      req.url.includes('/roles') && req.method === 'GET'
    );
    req.flush(mockRoles);
  });
});
```

## 📱 Accessibility & Performance

### 1. Accessibility
**✅ DO**: Follow ARIA guidelines
```html
<button 
  pButton 
  [attr.aria-label]="'Edit role ' + role.roleName"
  [attr.aria-describedby]="'role-' + role.id + '-description'"
  (click)="editRole(role)"
>
  <i class="pi pi-pencil" aria-hidden="true"></i>
</button>
```

### 2. Performance Optimization
**✅ DO**: Use trackBy functions for lists
```typescript
@Component({
  template: `
    @for (role of roles; track trackByRoleId) {
      <div class="role-card">{{ role.roleName }}</div>
    }
  `
})
export class RoleListComponent {
  trackByRoleId(index: number, role: any): number {
    return role.id;
  }
}
```

**✅ DO**: Use OnPush change detection when possible
```typescript
@Component({
  selector: 'app-role-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class RoleCardComponent {
  @Input() role!: Role;
}
```

## 🚨 Common Pitfalls to Avoid

### 1. Memory Leaks
**❌ DON'T**: Forget to unsubscribe from observables
```typescript
// This will cause memory leaks
ngOnInit() {
  this.userService.getUsers().subscribe(users => {
    this.users = users;
  }); // No unsubscribe!
}
```

### 2. Direct DOM Manipulation
**❌ DON'T**: Manipulate DOM directly
```typescript
// Avoid this
document.getElementById('myElement').style.display = 'none';
```

**✅ DO**: Use Angular's Renderer2 or template bindings
```typescript
// Use template binding
template: `<div [style.display]="isVisible ? 'block' : 'none'">Content</div>`

// Or use Renderer2 for complex DOM operations
constructor(private renderer: Renderer2, private el: ElementRef) {}

hideElement() {
  this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
}
```

### 3. Inconsistent State Management
**❌ DON'T**: Mix different state management patterns
```typescript
// Don't mix signals with BehaviorSubject randomly
private userSubject = new BehaviorSubject(null);
userSignal = signal(null);
```

**✅ DO**: Choose one pattern and stick to it
```typescript
// Use signals consistently
userSignal = signal<User | null>(null);
isLoading = signal(false);
error = signal<string | null>(null);
```

## 📋 Code Review Checklist

Before submitting a PR, ensure:

- [ ] Used Angular 19+ control flow syntax (`@if`, `@for`, `@switch`)
- [ ] Components are standalone with explicit imports
- [ ] No custom CSS overrides that break theming
- [ ] Proper error handling in services
- [ ] Memory leaks prevented (unsubscribe patterns)
- [ ] Accessibility attributes added where needed
- [ ] Unit tests written and passing
- [ ] TypeScript strict mode compliance
- [ ] No console.log statements in production code
- [ ] Proper loading states for async operations

## 🔗 Additional Resources

- [Angular 19 Documentation](https://angular.io/docs)
- [PrimeNG 19 Components](https://primeng.org/)
- [Angular Style Guide](https://angular.io/guide/styleguide)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
