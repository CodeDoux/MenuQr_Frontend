import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JournalService } from '../../../core/services/journal-activite.service';

@Component({
  selector: 'app-journal-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './journal-page.component.html',
})
export class JournalPageComponent {
  readonly entries;

  constructor(private readonly service: JournalService) {
    this.entries = this.service.entriesTriees;
  }
}