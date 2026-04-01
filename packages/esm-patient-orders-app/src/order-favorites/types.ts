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
