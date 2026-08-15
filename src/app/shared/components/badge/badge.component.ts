import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [class]="'badge--' + tone">
      <span class="badge-dot" aria-hidden="true"></span>
      {{ label }}
    </span>
  `,
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  @Input({ required: true }) label!: string;
  @Input() tone: BadgeTone = 'neutral';
}