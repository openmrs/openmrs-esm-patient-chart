import type { Drug } from '@openmrs/esm-patient-common-lib';

export interface DrugFavoriteOrder {
  id: string;
  drugUuid: string;
  conceptUuid?: string;
  conceptName?: string;
  displayName: string;
  attributes: DrugFavoriteAttributes;
}

export interface DrugFavoriteAttributes {
  strength?: string;
  dosageFormDisplay?: string;
  dosageFormUuid?: string;
}

export interface StoredDrugFavorites {
  favorites: DrugFavoriteOrder[];
}

export interface DrugActionsMenuProps {
  drug: Drug;
}

export interface UserResponse {
  uuid: string;
  userProperties: Record<string, string>;
}
