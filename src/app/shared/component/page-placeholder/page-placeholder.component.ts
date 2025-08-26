import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-page-placeholder',
  imports: [CommonModule],
  template: `
    <div style="padding:2rem; text-align:center;">
      <h2 style="margin-bottom: .5rem;">{{ title }}</h2>
      <p style="opacity:.8;">This page is not implemented yet. Routing is functional.</p>
    </div>
  `
})
export class PagePlaceholderComponent {
  title = 'Page';
  constructor(route: ActivatedRoute) {
    const t = route.snapshot.data?.['title'];
    if (typeof t === 'string' && t.length) {
      this.title = t;
    }
  }
}
