import { Component, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalleFormComponent } from '../salle-form/salle-form.component';
import { TableFormComponent } from '../table-form/table-form.component';
import { QrcodeModalComponent } from '../qrcode-modal/qrcode-modal.component';
import { StatutTable, TypeQRCode } from '../../../core/enums/enums';
import { Salle, SalleFormPayload } from '../../../core/models/salle';
import { TableFormPayload, TableRestaurant } from '../../../core/models/table';
import { QRCode } from '../../../core/models/qrcode';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';
import { TablesQrcodesService } from '../../../core/services/table-qrcode.service';

@Component({
  selector: 'app-salle-list',
  standalone: true,
  imports: [CommonModule, SalleFormComponent, TableFormComponent, QrcodeModalComponent, BadgeComponent],
  templateUrl: './salle-list.component.html',
  styleUrl: './salle-list.component.css',
})
export class SalleListComponent {
  readonly StatutTable = StatutTable;
  readonly TypeQRCode = TypeQRCode;

  readonly salles;
  readonly qrCodesGeneraux;

  salleFormOuvert = signal(false);
  salleEnEdition = signal<Salle | null>(null);

  tableFormOuvert = signal(false);
  tableEnEdition = signal<TableRestaurant | null>(null);
  salleIdCourante = signal<string>('');

  qrModalOuvert = signal(false);
  qrCourant = signal<QRCode | null>(null);
  qrEnCoursGeneration = signal(false);
  contexteQr = signal<{ type: 'table'; table: TableRestaurant; salle: Salle } | { type: 'general'; typeQr: TypeQRCode.EMPORTER | TypeQRCode.LIVRAISON } | null>(null);

  constructor(private readonly service: TablesQrcodesService) {
    this.salles = this.service.sallesTriees;
    this.qrCodesGeneraux = this.service.qrCodesGeneraux;
  }

  tablesDeLaSalle(salleId: string): Signal<TableRestaurant[]> {
    return this.service.tablesDeLaSalle(salleId);
  }

  qrDeLaTable(tableId: string): QRCode | undefined {
    return this.service.qrCodeDeLaTable(tableId)();
  }

  toneStatutTable(statut: StatutTable): BadgeTone {
    if (statut === StatutTable.LIBRE) return 'success';
    if (statut === StatutTable.OCCUPEE) return 'warning';
    return 'neutral';
  }

  labelStatutTable(statut: StatutTable): string {
    return { LIBRE: 'Libre', OCCUPEE: 'Occupée', HORS_SERVICE: 'Hors service' }[statut];
  }

  // --- Salles ---
  ouvrirCreationSalle(): void {
    this.salleEnEdition.set(null);
    this.salleFormOuvert.set(true);
  }
  ouvrirEditionSalle(salle: Salle): void {
    this.salleEnEdition.set(salle);
    this.salleFormOuvert.set(true);
  }
  

  // --- Tables ---
  ouvrirCreationTable(salleId: string): void {
    this.salleIdCourante.set(salleId);
    this.tableEnEdition.set(null);
    this.tableFormOuvert.set(true);
  }
  ouvrirEditionTable(table: TableRestaurant): void {
    this.salleIdCourante.set(table.salleId);
    this.tableEnEdition.set(table);
    this.tableFormOuvert.set(true);
  }
  

  // --- QR Codes ---
  async ouvrirQrTable(table: TableRestaurant, salle: Salle): Promise<void> {
    this.contexteQr.set({ type: 'table', table, salle });
    this.qrCourant.set(this.service.qrCodeDeLaTable(table.id)() ?? null);
    this.qrModalOuvert.set(true);
  }

  async ouvrirQrGeneral(typeQr: TypeQRCode.EMPORTER | TypeQRCode.LIVRAISON): Promise<void> {
    this.contexteQr.set({ type: 'general', typeQr });
    const existant = this.qrCodesGeneraux().find((q) => q.type === typeQr && q.estActif);
    this.qrCourant.set(existant ?? null);
    this.qrModalOuvert.set(true);
  }

  async genererOuRegenerer(): Promise<void> {
    const ctx = this.contexteQr();
    if (!ctx) return;
    this.qrEnCoursGeneration.set(true);
    try {
      if (ctx.type === 'table') {
        const qr = await this.service.genererQrPourTable(ctx.table, ctx.salle);
        this.qrCourant.set(qr);
      } else {
        const qr = await this.service.genererQrGeneral(ctx.typeQr);
        this.qrCourant.set(qr);
      }
    } finally {
      this.qrEnCoursGeneration.set(false);
    }
  }

  fermerQrModal(): void {
    this.qrModalOuvert.set(false);
    this.contexteQr.set(null);
  }

  titreModaleQr(): string {
    const ctx = this.contexteQr();
    if (!ctx) return 'QR Code';
    if (ctx.type === 'table') return `QR Code — Table ${ctx.table.numero}`;
    return ctx.typeQr === TypeQRCode.EMPORTER ? 'QR Code — À emporter' : 'QR Code — Livraison';
  }

  // ⚠️ Remplace uniquement ces 4 méthodes dans salle-list.component.ts
// (le reste du fichier, y compris genererOuRegenerer/ouvrirQr*, ne change pas —
// elles étaient déjà asynchrones).

  validerSalle(payload: SalleFormPayload): void {
    const enEdition = this.salleEnEdition();
    const promesse = enEdition
      ? this.service.modifierSalle(enEdition.id, payload)
      : this.service.creerSalle(payload);

    promesse
      .then(() => this.salleFormOuvert.set(false))
      .catch(() => alert('Une erreur est survenue lors de l\'enregistrement de la salle.'));
  }

  supprimerSalle(salle: Salle): void {
    if (confirm(`Supprimer la salle "${salle.description}" et toutes ses tables ?`)) {
      this.service.supprimerSalle(salle.id).catch(() => alert('Une erreur est survenue lors de la suppression.'));
    }
  }

  validerTable(payload: TableFormPayload): void {
    const enEdition = this.tableEnEdition();
    const promesse = enEdition
      ? this.service.modifierTable(enEdition.id, payload)
      : this.service.creerTable(payload);

    promesse
      .then(() => this.tableFormOuvert.set(false))
      .catch(() => alert('Une erreur est survenue lors de l\'enregistrement de la table.'));
  }

  supprimerTable(table: TableRestaurant): void {
    if (confirm(`Supprimer la table ${table.numero} ? Son QR code sera désactivé.`)) {
      this.service.supprimerTable(table.id).catch(() => alert('Une erreur est survenue lors de la suppression.'));
    }
  }

  libererTable(table: TableRestaurant): void {
  if (confirm(`Libérer la table ${table.numero} ? À utiliser une fois les clients partis.`)) {
    this.service.libererTable(table.id).catch(() => alert('Une erreur est survenue.'));
  }
}
}
