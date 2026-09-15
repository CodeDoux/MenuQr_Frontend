import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (ouvert) {
      <div class="modal-overlay" (click)="fermer.emit()">
        <div class="modal-panel" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
          <header class="modal-header">
            @if (icone) {
              <span class="modal-icon">{{ icone }}</span>
            }
            <h2 class="modal-title">{{ titre }}</h2>
            <button type="button" class="modal-close" (click)="fermer.emit()" aria-label="Fermer">✕</button>
          </header>
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  @Input() ouvert = false;
  @Input({ required: true }) titre!: string;
  /** Optionnel — emoji/icône affiché à gauche du titre. Rétrocompatible : les
   *  modales existantes qui ne le passent pas continuent de fonctionner à l'identique. */
  @Input() icone?: string;
  @Output() fermer = new EventEmitter<void>();
}