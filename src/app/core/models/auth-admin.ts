export interface AdminUtilisateur {
  id: string;
  nomComplet: string;
  email: string;
}

export interface AdminLoginPayload {
  email: string;
  motDePasse: string;
}