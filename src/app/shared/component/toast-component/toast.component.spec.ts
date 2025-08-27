import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let messageService: MessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent, ToastModule],
      providers: [MessageService] 
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    messageService = TestBed.inject(MessageService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show success notification', () => {
    spyOn(messageService, 'add');
    component.showSuccess('Test success message');

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: '',
      detail: 'Test success message',
  life: 300
    });
  });

  it('should show error notification', () => {
    spyOn(messageService, 'add');
    component.showError('Test error message');

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: '',
      detail: 'Test error message'
    });
  });

  it('should show warning notification', () => {
    spyOn(messageService, 'add');
    component.showWarn('Test warning message');

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: '',
      detail: 'Test warning message'
    });
  });

  it('should show info notification', () => {
    spyOn(messageService, 'add');
    component.showInfo('Test info message');

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: '',
      detail: 'Test info message'
    });
  });

  it('should clear all notifications', () => {
    spyOn(messageService, 'clear');
    component.clear();

    expect(messageService.clear).toHaveBeenCalled();
  });

  it('should show success notification with custom summary', () => {
    spyOn(messageService, 'add');
    component.showSuccess('Test success message', 'Custom Summary');

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Custom Summary',
      detail: 'Test success message',
  life: 300
    });
  });
});
