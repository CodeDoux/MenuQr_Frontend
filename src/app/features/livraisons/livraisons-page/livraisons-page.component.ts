import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeLivreur } from '../../../core/enums/enums';
import { DeliveryService } from '../../../core/services/livraison.service';
import { EmployeesService } from '../../../core/services/employees.service';

const LABEL_STATUT: Record<string, string> = {
  EN_ATTENTE_AFFECTATION: 'À assigner', AFFECTEE: 'Affectée', RECUPEREE: 'Récupérée',
  EN_ROUTE: 'En route', LIVREE: 'Livrée', ANNULEE: 'Annulée',
};
const LABEL_ETAPE_SUIVANTE: Record<string, string> = {
  AFFECTEE: 'Marquer récupérée', RECUPEREE: 'Marquer en route', EN_ROUTE: 'Marquer livrée',
};

type Onglet = 'a-assigner' | 'en-cours' | 'terminees';

@Component({
  selector: 'app-livraisons-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './livraisons-page.component.html',
})
export class LivraisonsPageComponent {
  readonly TypeLivreur = TypeLivreur;
  readonly LABEL_STATUT = LABEL_STATUT;
  readonly LABEL_ETAPE_SUIVANTE = LABEL_ETAPE_SUIVANTE;

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
    // ⚠️ Plus d'id de poste figé côté mock — on identifie le poste "Livreur" par son nom.
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