/**
 * Géographie Officielle de la République d'Haïti.
 * 10 Départements, Communes, Arrondissements et Circonscriptions Électorales.
 */

export interface CommuneGeo {
  code: string;
  name: string;
  arrondissement: string;
  circonscription: string;
  sectionsCommunales?: string[];
}

export interface DepartmentGeo {
  code: string;
  name: string;
  chefLieu: string;
  communes: CommuneGeo[];
}

export const HAITI_DEPARTMENTS: DepartmentGeo[] = [
  {
    code: 'HT-OU',
    name: 'Ouest',
    chefLieu: 'Port-au-Prince',
    communes: [
      { code: 'OU-PAP', name: 'Port-au-Prince', arrondissement: 'Port-au-Prince', circonscription: 'Circonscription de Port-au-Prince', sectionsCommunales: ['Turgeau', 'Morne à Tuf', 'Saint-Antoine', 'Péan', 'Bas de Peu de Chose'] },
      { code: 'OU-DEL', name: 'Delmas', arrondissement: 'Port-au-Prince', circonscription: 'Circonscription de Delmas', sectionsCommunales: ['Saint-Martin'] },
      { code: 'OU-CAR', name: 'Carrefour', arrondissement: 'Port-au-Prince', circonscription: 'Circonscription de Carrefour', sectionsCommunales: ['Bizoton', 'Thor', 'Côte Plage', 'Mahotière'] },
      { code: 'OU-PET', name: 'Pétion-Ville', arrondissement: 'Port-au-Prince', circonscription: 'Circonscription de Pétion-Ville', sectionsCommunales: ['Aux Cadets', 'Montagne Noire', 'Aux Étangs'] },
      { code: 'OU-CST', name: 'Cité Soleil', arrondissement: 'Port-au-Prince', circonscription: 'Circonscription de Cité Soleil', sectionsCommunales: ['Varreux'] },
      { code: 'OU-KEN', name: 'Kenscoff', arrondissement: 'Port-au-Prince', circonscription: 'Circonscription de Kenscoff', sectionsCommunales: ['Sourçailles', 'Grand Fond', 'Belle Fontaine'] },
      { code: 'OU-TAB', name: 'Tabarre', arrondissement: 'Port-au-Prince', circonscription: 'Circonscription de Tabarre', sectionsCommunales: ['Bellevue', 'Toussaint Louverture'] },
      { code: 'OU-CDB', name: 'Croix-des-Bouquets', arrondissement: 'Croix-des-Bouquets', circonscription: 'Circonscription de Croix-des-Bouquets', sectionsCommunales: ['Varreux', 'Descroizettes'] },
      { code: 'OU-GAN', name: 'Ganthier', arrondissement: 'Croix-des-Bouquets', circonscription: 'Circonscription de Ganthier', sectionsCommunales: ['Galette Henri', 'Fond Parisien'] },
      { code: 'OU-LEO', name: 'Léogâne', arrondissement: 'Léogâne', circonscription: 'Circonscription de Léogâne', sectionsCommunales: ['Dessources', 'Petite Rivière'] },
      { code: 'OU-PGO', name: 'Petit-Goâve', arrondissement: 'Léogâne', circonscription: 'Circonscription de Petit-Goâve', sectionsCommunales: ['Trou Chouchou', 'Premier Plaine'] },
      { code: 'OU-ARC', name: 'Arcahaie', arrondissement: 'Arcahaie', circonscription: 'Circonscription de l\'Arcahaie', sectionsCommunales: ['Montrouis', 'Délices'] },
    ],
  },
  {
    code: 'HT-ND',
    name: 'Nord',
    chefLieu: 'Cap-Haïtien',
    communes: [
      { code: 'ND-CAP', name: 'Cap-Haïtien', arrondissement: 'Cap-Haïtien', circonscription: 'Circonscription du Cap-Haïtien', sectionsCommunales: ['Bande du Nord', 'Haut du Cap', 'Petite Anse'] },
      { code: 'ND-LIM', name: 'Limonade', arrondissement: 'Cap-Haïtien', circonscription: 'Circonscription de Limonade', sectionsCommunales: ['Basse Plaine', 'Roucou'] },
      { code: 'ND-QMR', name: 'Quartier-Morin', arrondissement: 'Cap-Haïtien', circonscription: 'Circonscription de Quartier-Morin', sectionsCommunales: ['Basse Plaine'] },
      { code: 'ND-PDN', name: 'Plaine-du-Nord', arrondissement: 'Acul-du-Nord', circonscription: 'Circonscription de Plaine-du-Nord', sectionsCommunales: ['Morne Rouge'] },
      { code: 'ND-ACU', name: 'Acul-du-Nord', arrondissement: 'Acul-du-Nord', circonscription: 'Circonscription d\'Acul-du-Nord', sectionsCommunales: ['Camp-Louise'] },
      { code: 'ND-GRN', name: 'Grande-Rivière-du-Nord', arrondissement: 'Grande-Rivière-du-Nord', circonscription: 'Circonscription de Grande-Rivière-du-Nord', sectionsCommunales: ['Grand Gilles'] },
    ],
  },
  {
    code: 'HT-AR',
    name: 'Artibonite',
    chefLieu: 'Gonaïves',
    communes: [
      { code: 'AR-GON', name: 'Gonaïves', arrondissement: 'Gonaïves', circonscription: 'Circonscription des Gonaïves', sectionsCommunales: ['Pont Tamarin', 'Poteaux', 'Labranche'] },
      { code: 'AR-STM', name: 'Saint-Marc', arrondissement: 'Saint-Marc', circonscription: 'Circonscription de Saint-Marc', sectionsCommunales: ['Charrette', 'Bois Neuf'] },
      { code: 'AR-VER', name: 'Verrettes', arrondissement: 'Saint-Marc', circonscription: 'Circonscription de Verrettes', sectionsCommunales: ['Desarmes', 'Liancourt'] },
      { code: 'AR-PRA', name: 'Petite-Rivière-de-l\'Artibonite', arrondissement: 'Dessalines', circonscription: 'Circonscription de Petite-Rivière-de-l\'Artibonite', sectionsCommunales: ['Savane à Roche'] },
      { code: 'AR-DES', name: 'Dessalines', arrondissement: 'Dessalines', circonscription: 'Circonscription de Dessalines', sectionsCommunales: ['Villars', 'Duclos'] },
      { code: 'AR-GRO', name: 'Gros-Morne', arrondissement: 'Gros-Morne', circonscription: 'Circonscription de Gros-Morne', sectionsCommunales: ['Boucan Richard'] },
    ],
  },
  {
    code: 'HT-SD',
    name: 'Sud',
    chefLieu: 'Les Cayes',
    communes: [
      { code: 'SD-CAY', name: 'Les Cayes', arrondissement: 'Les Cayes', circonscription: 'Circonscription des Cayes', sectionsCommunales: ['Fonfrède', 'Laborde', 'Boulmier'] },
      { code: 'SD-PTS', name: 'Port-Salut', arrondissement: 'Port-Salut', circonscription: 'Circonscription de Port-Salut', sectionsCommunales: ['Anse-à-Drick'] },
      { code: 'SD-AQU', name: 'Aquin', arrondissement: 'Aquin', circonscription: 'Circonscription d\'Aquin', sectionsCommunales: ['Brodequin', 'Flamands'] },
      { code: 'SD-CAV', name: 'Cavaillon', arrondissement: 'Aquin', circonscription: 'Circonscription de Cavaillon', sectionsCommunales: ['Boileau'] },
      { code: 'SD-TOR', name: 'Torbeck', arrondissement: 'Les Cayes', circonscription: 'Circonscription de Torbeck', sectionsCommunales: ['Bourdet'] },
    ],
  },
  {
    code: 'HT-SE',
    name: 'Sud-Est',
    chefLieu: 'Jacmel',
    communes: [
      { code: 'SE-JAC', name: 'Jacmel', arrondissement: 'Jacmel', circonscription: 'Circonscription de Jacmel', sectionsCommunales: ['Bas Cap Rouge', 'La Vanille'] },
      { code: 'SE-BAN', name: 'Bainet', arrondissement: 'Bainet', circonscription: 'Circonscription de Bainet', sectionsCommunales: ['Bréman'] },
      { code: 'SE-BEL', name: 'Belle-Anse', arrondissement: 'Belle-Anse', circonscription: 'Circonscription de Belle-Anse', sectionsCommunales: ['Mapou'] },
      { code: 'SE-COT', name: 'Côtes-de-Fer', arrondissement: 'Bainet', circonscription: 'Circonscription de Côtes-de-Fer', sectionsCommunales: ['Gris Gris'] },
    ],
  },
  {
    code: 'HT-NE',
    name: 'Nord-Est',
    chefLieu: 'Fort-Liberté',
    communes: [
      { code: 'NE-FLB', name: 'Fort-Liberté', arrondissement: 'Fort-Liberté', circonscription: 'Circonscription de Fort-Liberté', sectionsCommunales: ['Dumas', 'Dérac'] },
      { code: 'NE-OUA', name: 'Ouanaminthe', arrondissement: 'Ouanaminthe', circonscription: 'Circonscription de Ouanaminthe', sectionsCommunales: ['Haut Maribahoux'] },
      { code: 'NE-TDN', name: 'Trou-du-Nord', arrondissement: 'Trou-du-Nord', circonscription: 'Circonscription de Trou-du-Nord', sectionsCommunales: ['Garcin'] },
    ],
  },
  {
    code: 'HT-NO',
    name: 'Nord-Ouest',
    chefLieu: 'Port-de-Paix',
    communes: [
      { code: 'NO-PDP', name: 'Port-de-Paix', arrondissement: 'Port-de-Paix', circonscription: 'Circonscription de Port-de-Paix', sectionsCommunales: ['Baudardin', 'La Corne'] },
      { code: 'NO-SLN', name: 'Saint-Louis-du-Nord', arrondissement: 'Saint-Louis-du-Nord', circonscription: 'Circonscription de Saint-Louis-du-Nord', sectionsCommunales: ['Desdunes'] },
      { code: 'NO-JRB', name: 'Jean-Rabel', arrondissement: 'Môle-Saint-Nicolas', circonscription: 'Circonscription de Jean-Rabel', sectionsCommunales: ['Lacoma'] },
    ],
  },
  {
    code: 'HT-GA',
    name: 'Grand\'Anse',
    chefLieu: 'Jérémie',
    communes: [
      { code: 'GA-JER', name: 'Jérémie', arrondissement: 'Jérémie', circonscription: 'Circonscription de Jérémie', sectionsCommunales: ['Basse Voldrogue', 'Marfranc'] },
      { code: 'GA-ADH', name: 'Anse-d\'Hainault', arrondissement: 'Anse-d\'Hainault', circonscription: 'Circonscription d\'Anse-d\'Hainault', sectionsCommunales: ['Grandoit'] },
      { code: 'GA-MOR', name: 'Moron', arrondissement: 'Jérémie', circonscription: 'Circonscription de Moron', sectionsCommunales: ['L\'Assise'] },
    ],
  },
  {
    code: 'HT-NI',
    name: 'Nippes',
    chefLieu: 'Miragoâne',
    communes: [
      { code: 'NI-MIR', name: 'Miragoâne', arrondissement: 'Miragoâne', circonscription: 'Circonscription de Miragoâne', sectionsCommunales: ['Chalon', 'Dessources'] },
      { code: 'NI-ADV', name: 'Anse-à-Veau', arrondissement: 'Anse-à-Veau', circonscription: 'Circonscription d\'Anse-à-Veau', sectionsCommunales: ['Baconnois'] },
      { code: 'NI-PRN', name: 'Petite-Rivière-de-Nippes', arrondissement: 'Miragoâne', circonscription: 'Circonscription de Petite-Rivière-de-Nippes', sectionsCommunales: ['Miragoâne'] },
    ],
  },
  {
    code: 'HT-CE',
    name: 'Centre',
    chefLieu: 'Hinche',
    communes: [
      { code: 'CE-HIN', name: 'Hinche', arrondissement: 'Hinche', circonscription: 'Circonscription de Hinche', sectionsCommunales: ['Marmont', 'Aguahedionde'] },
      { code: 'CE-MIR', name: 'Mirebalais', arrondissement: 'Mirebalais', circonscription: 'Circonscription de Mirebalais', sectionsCommunales: ['Gascogne'] },
      { code: 'CE-LAS', name: 'Lascahobas', arrondissement: 'Lascahobas', circonscription: 'Circonscription de Lascahobas', sectionsCommunales: ['Juampas'] },
    ],
  },
];

/** Helpers de filtrage géographique */
export function getDepartmentByCodeOrName(identifier: string): DepartmentGeo | undefined {
  return HAITI_DEPARTMENTS.find(
    (d) => d.code.toLowerCase() === identifier.toLowerCase() || d.name.toLowerCase() === identifier.toLowerCase()
  );
}

export function getCommunesForDepartment(departmentIdentifier: string): CommuneGeo[] {
  const dept = getDepartmentByCodeOrName(departmentIdentifier);
  return dept ? dept.communes : [];
}

export function getCommuneByCodeOrName(deptIdentifier: string, communeName: string): CommuneGeo | undefined {
  const communes = getCommunesForDepartment(deptIdentifier);
  return communes.find((c) => c.name.toLowerCase() === communeName.toLowerCase() || c.code.toLowerCase() === communeName.toLowerCase());
}
