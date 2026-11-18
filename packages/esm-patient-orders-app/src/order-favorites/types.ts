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

export interface UserResponse {
  uuid: string;
  userProperties: Record<string, string>;
}

export interface DrugOrderTally {
  drugUuid: string;
  count: number;
  lastOrderedAt: string;
}

export interface DrugOrderSuggestion extends DrugOrderTally {
  drug: Drug;
}
