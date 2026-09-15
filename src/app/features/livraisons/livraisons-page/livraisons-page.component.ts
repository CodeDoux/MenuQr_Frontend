import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeLivreur } from '../../../core/enums/enums';
import { DeliveryService } from '../../../core/services/livraison.service';
import { EmployeesService } from '../../../core/services/employees.service';
import { BadgeComponent, BadgeTone } from '../../../shared/components/badge/badge.component';

const LABEL_STATUT: Record<string, string> = {
  EN_ATTENTE_AFFECTATION: 'À assigner', AFFECTEE: 'Affectée', RECUPEREE: 'Récupérée',
  EN_ROUTE: 'En route', LIVREE: 'Livrée', ANNULEE: 'Annulée',
};
const TONE_STATUT: Record<string, BadgeTone> = {
  EN_ATTENTE_AFFECTATION: 'neutral', AFFECTEE: 'info', RECUPEREE: 'warning',
  EN_ROUTE: 'info', LIVREE: 'success', ANNULEE: 'danger',
};
const LABEL_ETAPE_SUIVANTE: Record<string, string> = {
  AFFECTEE: 'Marquer récupérée', RECUPEREE: 'Marquer en route', EN_ROUTE: 'Marquer livrée',
};

const ICONE_ONGLET: Record<string, string> = {
  'a-assigner': '📋', 'en-cours': '🛵', terminees: '✅',
};

type Onglet = 'a-assigner' | 'en-cours' | 'terminees';

@Component({
  selector: 'app-livraisons-page',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent],
  templateUrl: './livraisons-page.component.html',
  styleUrl: './livraisons-page.component.css',
})
export class LivraisonsPageComponent {
  readonly TypeLivreur = TypeLivreur;
  readonly LABEL_STATUT = LABEL_STATUT;
  readonly TONE_STATUT = TONE_STATUT;
  readonly LABEL_ETAPE_SUIVANTE = LABEL_ETAPE_SUIVANTE;
  readonly ICONE_ONGLET = ICONE_ONGLET;

  readonly aAssigner;
  readonly enCours;
  readonly terminees;
  readonly livreursInternes;

  onglet = signal<Onglet>('a-assigner');
  livraisonEnAffectation = signal<string | null>(null);
  typeAffectation = signal<TypeLivreur>(TypeLivreur.EMPLOYE_RESTAURANT);
  employeChoisiId = signal<string>('');
  nomExterne = signal('');
  telephoneExterne = signal('');

  constructor(
    private readonly service: DeliveryService,
    private readonly employeesService: EmployeesService
  ) {
    this.aAssigner = this.service.aAssigner;
    this.enCours = this.service.enCours;
    this.terminees = this.service.terminees;
    this.livreursInternes = () =>
      this.employeesService.employesAvecAcces()
        .filter((item) => item.poste?.nom?.toLowerCase() === 'livreur')
        .map((item) => item.employe);
  }

  nomLivreur(livraison: any): string {
    if (livraison.typeLivreur === TypeLivreur.EMPLOYE_RESTAURANT) {
      return livraison.livreurNom ? `${livraison.livreurNom} (interne)` : 'Employé';
    }
    if (livraison.nomLivreurExterne) {
      const suffixe = livraison.typeLivreur === TypeLivreur.LIVREUR_CLIENT ? 'livreur du client' : 'prestataire externe';
      return `${livraison.nomLivreurExterne} (${suffixe})`;
    }
    return 'Non assigné';
  }

  ouvrirAffectation(livraisonId: string): void {
    this.livraisonEnAffectation.set(livraisonId);
    this.typeAffectation.set(TypeLivreur.EMPLOYE_RESTAURANT);
    this.employeChoisiId.set(this.livreursInternes()[0]?.id ?? '');
    this.nomExterne.set('');
    this.telephoneExterne.set('');
  }

  fermerAffectation(): void {
    this.livraisonEnAffectation.set(null);
  }

  confirmerAffectation(): void {
    const livraisonId = this.livraisonEnAffectation();
    if (!livraisonId) return;

    const promesse = this.typeAffectation() === TypeLivreur.EMPLOYE_RESTAURANT
      ? this.service.affecterLivreurInterne(livraisonId, this.employeChoisiId())
      : this.service.affecterLivreurExterne(
          livraisonId, this.nomExterne(), this.telephoneExterne(),
          this.typeAffectation() as TypeLivreur.PRESTATAIRE_EXTERNE | TypeLivreur.LIVREUR_CLIENT
        );

    promesse.then(() => this.fermerAffectation()).catch(() => alert('Une erreur est survenue.'));
  }

  avancer(livraison: any): void {
    this.service.avancerStatut(livraison.id).catch(() => alert('Une erreur est survenue.'));
  }

  annuler(livraison: any): void {
    if (confirm('Annuler cette livraison ? La commande associée sera aussi annulée.')) {
      this.service.annulerLivraison(livraison.id).catch(() => alert('Une erreur est survenue.'));
    }
  }
}