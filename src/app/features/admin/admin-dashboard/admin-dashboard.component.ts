import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  readonly nbTotal;
  readonly nbActifs;
  readonly nbEnEssai;
  readonly nbSuspendus;

  constructor(private readonly service: PlatformAdminService) {
    this.nbTotal = this.service.nbTotal;
    this.nbActifs = this.service.nbActifs;
    this.nbEnEssai = this.service.nbEnEssai;
    this.nbSuspendus = this.service.nbSuspendus;
  }
}