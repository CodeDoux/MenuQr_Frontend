export interface JournalEntry {
  id: string;
  utilisateurId: string;
  utilisateurNom: string; // projection pour affichage
  restaurantId: string;
  action: string;
  tableCible: string;
  idCible?: string | null;
  ancienneValeur?: string | null;
  nouvelleValeur?: string | null;
  date: string;
}