export interface Association {
  id: string;
  name: string;
  short_name: string;
  member_label: string;
  description: string;
  territory: string;
  route_slug: string;
}

export const WINE_ASSOCIATIONS: Association[] = [
  {
    id: 'route-des-vignerons-et-des-pecheurs',
    name: 'Route des Vignerons et des Pêcheurs',
    short_name: 'Route des Vignerons',
    member_label: 'Membre de la Route des Vignerons et des Pêcheurs',
    description:
      "Association regroupant vignerons et pêcheurs du littoral héraultais autour d'une démarche commune de valorisation des produits du territoire.",
    territory: 'Hérault · Méditerranée',
    route_slug: '/vin/association/route-des-vignerons-et-des-pecheurs',
  },
];

export function getAssociationById(id: string): Association | undefined {
  return WINE_ASSOCIATIONS.find((a) => a.id === id);
}
