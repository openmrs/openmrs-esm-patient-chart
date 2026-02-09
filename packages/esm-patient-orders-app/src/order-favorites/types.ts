import type { Drug } from '@openmrs/esm-patient-common-lib';

type MedicationValue = { value: string; valueCoded?: string };

export interface DrugOrderSlotState {
  dosage?: number;
  unit?: MedicationValue;
  route?: MedicationValue;
  frequency?: MedicationValue;
}

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
  orderItem?: DrugOrderSlotState;
}

export interface DrugFavoritesModalProps {
  closeModal: () => void;
  drug?: Drug;
  initialAttributes?: DrugFavoriteAttributes;
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

export interface StrengthOption {
  id: string;
  label: string;
  drug?: Drug;
}

export type AttributeKey = 'strength' | 'dose' | 'unit' | 'route' | 'frequency';

export type ManualInputKey = 'dose' | 'route' | 'frequency';
