import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="public-shell">
      <header class="public-header">
        <span class="public-brand">MenuQr</span>
      </header>
      <main class="public-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class PublicLayoutComponent {}