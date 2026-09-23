import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface OffrePublique {
  id: string;
  nom: string;
  description: string | null;
  prix_mensuel: number;
  duree_essai: number;
  fonctionnalites: { nom: string }[];
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent implements OnInit, AfterViewInit {
  offres = signal<OffrePublique[]>([]);
  faqOuverte = signal<number | null>(0);
  readonly anneeActuelle = new Date().getFullYear();
  avantagesVisibles = signal(false);

  @ViewChild('avantagesRef') avantagesRef?: ElementRef<HTMLElement>;

  readonly etapes = [
    { numero: '01', titre: 'Scanner', texte: 'Le client scanne le QR code posé sur sa table, sans rien installer.', image: 'images/scan.jpg' },
    { numero: '02', titre: 'Parcourir', texte: 'Le menu à jour s\'affiche instantanément, avec photos et descriptions.', image: 'images/menu.jpg' },
    { numero: '03', titre: 'Commander', texte: 'La commande part directement en cuisine — plus de ticket papier.', image: 'images/commande.jpg' },
    { numero: '04', titre: 'Être servi', texte: 'Le client suit sa commande en direct, et peut payer depuis son téléphone.', image: 'images/servie.jpg' },
  ];

  readonly faq = [
    {
      question: 'Faut-il du matériel spécial pour commencer ?',
      reponse: "Non. Un smartphone pour générer et imprimer vos QR codes suffit. Vos clients scannent avec leur propre téléphone — aucune application à installer, pour vous comme pour eux.",
    },
    {
      question: "Puis-je essayer avant de payer ?",
      reponse: "Oui, chaque compte démarre avec une période d'essai complète, sans carte bancaire à renseigner. Vous décidez de passer à un plan payant seulement si l'outil vous convient.",
    },
    {
      question: 'Mes clients peuvent-ils payer directement en ligne ?',
      reponse: "Oui, via Wave, Orange Money ou carte bancaire, directement depuis leur téléphone après avoir scanné le menu — ou vous pouvez continuer à encaisser en espèces à table, à votre convenance.",
    },
    {
      question: 'Puis-je gérer plusieurs employés avec des accès différents ?',
      reponse: "Oui. Chaque membre de votre équipe (serveur, cuisinier, caissier...) a son propre accès, limité à ce dont il a besoin pour son poste.",
    },
    {
      question: 'Que se passe-t-il si je change d\'avis ?',
      reponse: "Vous pouvez annuler à tout moment depuis votre tableau de bord, sans engagement ni justification à fournir.",
    },
  ];

  constructor(private readonly http: HttpClient) {}

  async ngOnInit(): Promise<void> {
    try {
      const rep = await firstValueFrom(this.http.get<{ data: OffrePublique[] }>(`${environment.apiUrl}/offres`));
      this.offres.set(rep.data);
    } catch {
      this.offres.set([]);
    }
  }

  toggleFaq(index: number): void {
    this.faqOuverte.set(this.faqOuverte() === index ? null : index);
  }

  ngAfterViewInit(): void {
    if (!this.avantagesRef) return;

    const observer = new IntersectionObserver(
      ([entree]) => {
        if (entree.isIntersecting) {
          this.avantagesVisibles.set(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(this.avantagesRef.nativeElement);
  }
}