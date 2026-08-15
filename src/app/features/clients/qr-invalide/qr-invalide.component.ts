import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qr-invalide',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pm-invalide">
      <p class="pm-invalide-icon">⚠️</p>
      <h1 class="pm-page-titre">QR code invalide</h1>
      <p class="pm-field-hint">Ce QR code n'est plus valide ou a expiré. Demandez au restaurant de vous en fournir un nouveau.</p>
    </div>
  `,
})
export class QrInvalideComponent {}