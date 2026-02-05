import type { Drug, DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';

export type DrugFavoriteOrder =
  | {
      drugUuid: string;
      conceptUuid?: string;
      conceptName?: string;
      displayName: string;
      attributes: DrugFavoriteAttributes;
    }
  | {
      conceptUuid: string;
      conceptName: string;
      drugUuid?: undefined;
      displayName: string;
      attributes: DrugFavoriteAttributes;
    };

export interface DrugFavoriteAttributes {
  strength?: string;
  dose?: string;
  unit?: string;
  unitUuid?: string;
  route?: string;
  routeUuid?: string;
  frequency?: string;
  frequencyUuid?: string;
  dosageFormDisplay?: string;
  dosageFormUuid?: string;
}

export interface StoredDrugFavorites {
  favorites: DrugFavoriteOrder[];
}

export interface DrugPinButtonProps {
  drug: Drug;
  orderItem?: DrugOrderBasketItem;
}

export interface DrugFavoritesModalProps {
  closeModal: () => void;
  drug?: Drug;
  drugUuid?: string;
  conceptUuid?: string;
  conceptName?: string;
  strength?: string;
  dose?: string;
  unit?: string;
  unitUuid?: string;
  route?: string;
  routeUuid?: string;
  frequency?: string;
  frequencyUuid?: string;
  existingFavorite?: DrugFavoriteOrder;
}

export interface UserResponse {
  uuid: string;
  userProperties: Record<string, string>;
}

export interface OrderConfigItem {
  uuid: string;
  display: string;
}

export interface OrderConfig {
  drugRoutes: Array<OrderConfigItem>;
  drugDosingUnits: Array<OrderConfigItem>;
  orderFrequencies: Array<OrderConfigItem>;
}

export interface DrugSearchResponse {
  results: Array<Drug>;
}

export interface StrengthOption {
  id: string;
  label: string;
  drug?: Drug;
}

export type AttributeKey = 'strength' | 'dose' | 'unit' | 'route' | 'frequency';

export type ManualInputKey = 'dose' | 'route' | 'frequency';
