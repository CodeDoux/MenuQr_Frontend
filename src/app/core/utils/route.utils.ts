import { ActivatedRoute } from '@angular/router';

/**
 * Lit un paramètre de route en remontant manuellement l'arborescence des
 * routes parentes si besoin (ex. 'restaurantId' défini sur 'm/:restaurantId'
 * mais lu depuis un enfant comme 'suivi/:commandeId').
 *
 * Ne dépend PAS de la configuration paramsInheritanceStrategy du routeur —
 * fonctionne de façon fiable quel que soit ce réglage.
 */
export function lireParamAncetre(route: ActivatedRoute, nom: string): string | null {
  let courant: ActivatedRoute | null = route;
  while (courant) {
    const valeur = courant.snapshot.paramMap.get(nom);
    if (valeur) return valeur;
    courant = courant.parent;
  }
  return null;
}