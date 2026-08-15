import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationsService } from '../services/notifications.service';
import { Notification } from '../models/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
})
export class NotificationBellComponent {
  readonly notifications;
  readonly nombreNonLues;
  panneauOuvert = signal(false);

  constructor(
    private readonly service: NotificationsService,
    private readonly router: Router
  ) {
    this.notifications = this.service.notifications;
    this.nombreNonLues = this.service.nombreNonLues;
  }

  togglePanneau(): void {
    this.panneauOuvert.update((v) => !v);
  }

  ouvrirNotification(n: Notification): void {
    this.service.marquerCommeLue(n.id);
    this.panneauOuvert.set(false);
    if (n.lien) this.router.navigateByUrl(n.lien);
  }

  toutMarquer(): void {
    this.service.toutMarquerCommeLu();
  }
}
