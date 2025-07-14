import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { PrimengModule } from '../../primeng/primeng.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast-component',
  standalone: true,
  imports: [PrimengModule, CommonModule],
  providers: [MessageService],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent implements OnInit {

  constructor(private messageService: MessageService) { }

  ngOnInit(): void {
  }

  /**
   * Show success notification
   * @param detail - The message to display
   * @param summary - Optional summary (defaults to empty for clean look)
   */
  showSuccess(detail: string, summary?: string): void {
    this.messageService.add({
      severity: 'success',
      summary: summary || '',
      detail: detail,
      life: 300000
    });
  }

  /**
   * Show error notification
   * @param detail - The message to display
   * @param summary - Optional summary (defaults to empty for clean look)
   */
  showError(detail: string, summary?: string): void {
    this.messageService.add({
      severity: 'error',
      summary: summary || '',
      detail: detail
    });
  }

  /**
   * Show warning notification
   * @param detail - The message to display
   * @param summary - Optional summary (defaults to empty for clean look)
   */
  showWarn(detail: string, summary?: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: summary || '',
      detail: detail
    });
  }

  /**
   * Show info notification
   * @param detail - The message to display
   * @param summary - Optional summary (defaults to empty for clean look)
   */
  showInfo(detail: string, summary?: string): void {
    this.messageService.add({
      severity: 'info',
      summary: summary || '',
      detail: detail
    });
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.messageService.clear();
  }
}
