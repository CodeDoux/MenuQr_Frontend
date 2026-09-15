import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { QRCode } from '../../../core/models/qrcode';

@Component({
  selector: 'app-qrcode-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './qrcode-modal.component.html',
  styleUrl: './qrcode-modal.component.css',
})
export class QrcodeModalComponent {
  @Input() ouvert = false;
  @Input() titre = 'QR Code';
  @Input() qrCode: QRCode | null = null;
  @Input() enCoursGeneration = false;
  @Output() fermer = new EventEmitter<void>();
  @Output() regenerer = new EventEmitter<void>();

  telecharger(): void {
    if (!this.qrCode?.image) return;
    const lien = document.createElement('a');
    lien.href = this.qrCode.image;
    lien.download = `qrcode-${this.qrCode.code}.png`;
    lien.click();
  }
}
