/**
 * Base de Données Géographique Officielle d'Haïti.
 * Structure complète à 3 niveaux : Départements (10), Communes et Sections Communales.
 */

export interface DepartmentGeo {
  code: string;
  name: string;
  chefLieu: string;
  communes: CommuneGeo[];
}

export interface CommuneGeo {
  code: string;
  name: string;
  circonscription: string;
  sectionsCommunales: string[];
}

export const HAITI_DEPARTMENTS: DepartmentGeo[] = [
  {
    code: 'HT-OU',
    name: 'Ouest',
    chefLieu: 'Port-au-Prince',
    communes: [
      { code: 'HT-OU-PAP', name: 'Port-au-Prince', circonscription: 'Circonscription 1ère de Port-au-Prince', sectionsCommunales: ['Turgeau', 'Morne l\'Hôpital', 'Martissant', 'Saint-Gérard', 'Fort-National'] },
      { code: 'HT-OU-DEL', name: 'Delmas', circonscription: 'Circonscription de Delmas', sectionsCommunales: ['Saint-Martin', 'Delmas 33', 'Delmas 75', 'Delmas 60'] },
      { code: 'HT-OU-PET', name: 'Pétion-Ville', circonscription: 'Circonscription de Pétion-Ville', sectionsCommunales: ['Montagne Noire', 'Aux Cadets', 'Bellevue', 'Tête de l\'Eau'] },
      { code: 'HT-OU-CAR', name: 'Carrefour', circonscription: 'Circonscription de Carrefour', sectionsCommunales: ['Bizoton', 'Thor', 'Côte Plage', 'Taillefer', 'Corail Thor'] },
      { code: 'HT-OU-CDB', name: 'Croix-des-Bouquets', circonscription: 'Circonscription de Croix-des-Bouquets', sectionsCommunales: ['Varreux', 'Despuzeau', 'Ganthier', 'Canaan', 'Duvalierville'] },
      { code: 'HT-OU-TAB', name: 'Tabarre', circonscription: 'Circonscription de Tabarre', sectionsCommunales: ['Petite Place Cazeau', 'Carradeux', 'Bellevue'] },
      { code: 'HT-OU-CTS', name: 'Cité Soleil', circonscription: 'Circonscription de Cité Soleil', sectionsCommunales: ['Varreux 1', 'Varreux 2'] },
      { code: 'HT-OU-KEN', name: 'Kenscoff', circonscription: 'Circonscription de Kenscoff', sectionsCommunales: ['Obléon', 'Sourçailles', 'Bongars'] },
      { code: 'HT-OU-LEO', name: 'Léogâne', circonscription: 'Circonscription de Léogâne', sectionsCommunales: ['Dessources', 'Grande Rivière', 'Corail'] },
      { code: 'HT-OU-PETG', name: 'Petit-Goâve', circonscription: 'Circonscription de Petit-Goâve', sectionsCommunales: ['1ère Plaine', '2ème Plaine', 'Trou Chouchou'] },
    ],
  },
  {
    code: 'HT-ND',
    name: 'Nord',
    chefLieu: 'Cap-Haïtien',
    communes: [
      { code: 'HT-ND-CAP', name: 'Cap-Haïtien', circonscription: 'Circonscription du Cap-Haïtien', sectionsCommunales: ['Bande du Nord', 'Haut du Cap', 'Petit Anse'] },
      { code: 'HT-ND-MIL', name: 'Milot', circonscription: 'Circonscription de Milot', sectionsCommunales: ['Perches de Bonnet', 'Bonnet à l\'Évêque'] },
      { code: 'HT-ND-LIM', name: 'Limonade', circonscription: 'Circonscription de Limonade', sectionsCommunales: ['Basse Plaine', 'Bois de Lance'] },
      { code: 'HT-ND-PLN', name: 'Plaine du Nord', circonscription: 'Circonscription de Plaine du Nord', sectionsCommunales: ['Morne Rouge', 'Basse Plaine'] },
      { code: 'HT-ND-GRR', name: 'Grande-Rivière-du-Nord', circonscription: 'Circonscription de Grande-Rivière', sectionsCommunales: ['Grand Gilles', 'Joly'] },
    ],
  },
  {
    code: 'HT-AR',
    name: 'Artibonite',
    chefLieu: 'Gonaïves',
    communes: [
      { code: 'HT-AR-GON', name: 'Gonaïves', circonscription: 'Circonscription des Gonaïves', sectionsCommunales: ['Pont Tamarin', 'Petite Rivière de Bayonnais', 'Poteaux'] },
      { code: 'HT-AR-STM', name: 'Saint-Marc', circonscription: 'Circonscription de Saint-Marc', sectionsCommunales: ['1ère Section Haut de Saint-Marc', '2ème Section Petite Rivière'] },
      { code: 'HT-AR-PRN', name: 'Petite-Rivière-de-l\'Artibonite', circonscription: 'Circonscription de Petite-Rivière', sectionsCommunales: ['Bas de Sainte-Claire', 'Savane à Roche'] },
      { code: 'HT-AR-VER', name: 'Verrettes', circonscription: 'Circonscription de Verrettes', sectionsCommunales: ['Desarmes', 'Liancourt'] },
      { code: 'HT-AR-GRO', name: 'Gros-Morne', circonscription: 'Circonscription de Gros-Morne', sectionsCommunales: ['Boucan Richard', 'Riviere Mancelle'] },
    ],
  },
  {
    code: 'HT-SD',
    name: 'Sud',
    chefLieu: 'Les Cayes',
    communes: [
      { code: 'HT-SD-CAY', name: 'Les Cayes', circonscription: 'Circonscription des Cayes', sectionsCommunales: ['Bourdet', 'Fonfrède', 'Laborde'] },
      { code: 'HT-SD-POR', name: 'Port-Salut', circonscription: 'Circonscription de Port-Salut', sectionsCommunales: ['Barbois', 'Anse-à-Drick'] },
      { code: 'HT-SD-AQU', name: 'Aquin', circonscription: 'Circonscription d\'Aquin', sectionsCommunales: ['La Tête l\'Étang', 'Flamands'] },
      { code: 'HT-SD-CAV', name: 'Cavaillon', circonscription: 'Circonscription de Cavaillon', sectionsCommunales: ['Martineau', 'Boileau'] },
    ],
  },
  {
    code: 'HT-NE',
    name: 'Nord-Est',
    chefLieu: 'Fort-Liberté',
    communes: [
      { code: 'HT-NE-FLB', name: 'Fort-Liberté', circonscription: 'Circonscription de Fort-Liberté', sectionsCommunales: ['Dumas', 'Duchity'] },
      { code: 'HT-NE-OUA', name: 'Ouanaminthe', circonscription: 'Circonscription de Ouanaminthe', sectionsCommunales: ['Haut Maribahoux', 'Acul des Pins'] },
      { code: 'HT-NE-TRO', name: 'Trou-du-Nord', circonscription: 'Circonscription du Trou-du-Nord', sectionsCommunales: ['Garcin', 'Roucou'] },
    ],
  },
  {
    code: 'HT-NO',
    name: 'Nord-Ouest',
    chefLieu: 'Port-de-Paix',
    communes: [
      { code: 'HT-NO-PDP', name: 'Port-de-Paix', circonscription: 'Circonscription de Port-de-Paix', sectionsCommunales: ['Baudin', 'La Corne', 'Chansolme'] },
      { code: 'HT-NO-SMG', name: 'Saint-Louis-du-Nord', circonscription: 'Circonscription de Saint-Louis-du-Nord', sectionsCommunales: ['Rivière des Nègres', 'Desdunes'] },
      { code: 'HT-NO-MOL', name: 'Môle-Saint-Nicolas', circonscription: 'Circonscription du Môle-Saint-Nicolas', sectionsCommunales: ['Damé', 'Mare-Rouge'] },
    ],
  },
  {
    code: 'HT-CE',
    name: 'Centre',
    chefLieu: 'Hinche',
    communes: [
      { code: 'HT-CE-HIN', name: 'Hinche', circonscription: 'Circonscription de Hinche', sectionsCommunales: ['Marmont', 'Aguahedionde', 'Jambette'] },
      { code: 'HT-CE-MIR', name: 'Mirebalais', circonscription: 'Circonscription de Mirebalais', sectionsCommunales: ['Gascogne', 'Grand Boucan'] },
      { code: 'HT-CE-MIRE', name: 'Lascahobas', circonscription: 'Circonscription de Lascahobas', sectionsCommunales: ['Ilau', 'Dois-Pin'] },
    ],
  },
  {
    code: 'HT-SE',
    name: 'Sud-Est',
    chefLieu: 'Jacmel',
    communes: [
      { code: 'HT-SE-JAC', name: 'Jacmel', circonscription: 'Circonscription de Jacmel', sectionsCommunales: ['Bas Cap Rouge', 'Bas de Véronne', 'Coquiolle'] },
      { code: 'HT-SE-COG', name: 'Marigot', circonscription: 'Circonscription de Marigot', sectionsCommunales: ['Corail Lamothe', 'Grande Rivière'] },
      { code: 'HT-SE-BEN', name: 'Bainet', circonscription: 'Circonscription de Bainet', sectionsCommunales: ['Bréman', 'Brazillier'] },
    ],
  },
  {
    code: 'HT-GA',
    name: 'Grand\'Anse',
    chefLieu: 'Jérémie',
    communes: [
      { code: 'HT-GA-JER', name: 'Jérémie', circonscription: 'Circonscription de Jérémie', sectionsCommunales: ['Bas de la Rivière', 'Château', 'Marfranc'] },
      { code: 'HT-GA-DAN', name: 'Dame-Marie', circonscription: 'Circonscription de Dame-Marie', sectionsCommunales: ['Desormeaux', 'Baradères'] },
      { code: 'HT-GA-ANS', name: 'Anse-d\'Hainault', circonscription: 'Circonscription d\'Anse-d\'Hainault', sectionsCommunales: ['Boudon', 'Grandoit'] },
    ],
  },
  {
    code: 'HT-NI',
    name: 'Nippes',
    chefLieu: 'Miragoâne',
    communes: [
      { code: 'HT-NI-MIR', name: 'Miragoâne', circonscription: 'Circonscription de Miragoâne', sectionsCommunales: ['Chalon', 'Saint-Michel', 'Dessources'] },
      { code: 'HT-NI-ANS', name: 'Anse-à-Veau', circonscription: 'Circonscription d\'Anse-à-Veau', sectionsCommunales: ['Baconnois', 'Saut du Baril'] },
      { code: 'HT-NI-PET', name: 'Petite-Rivière-de-Nippes', circonscription: 'Circonscription de Petite-Rivière-de-Nippes', sectionsCommunales: ['Miragoâne 2', 'Fond des Nègres'] },
    ],
  },
];

export function getDepartmentNames(): string[] {
  return HAITI_DEPARTMENTS.map((d) => d.name);
}

export function getCommunesByDepartmentName(deptName: string): CommuneGeo[] {
  const dept = HAITI_DEPARTMENTS.find((d) => d.name.toLowerCase() === deptName.toLowerCase());
  return dept ? dept.communes : [];
}

export function getSectionsCommunales(deptName: string, communeName: string): string[] {
  const communes = getCommunesByDepartmentName(deptName);
  const com = communes.find((c) => c.name.toLowerCase() === communeName.toLowerCase());
  return com ? com.sectionsCommunales : [];
}
