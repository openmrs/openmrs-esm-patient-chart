import { useMemo } from 'react';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { getLoggedInUser, openmrsFetch, restBaseUrl, setUserProperties } from '@openmrs/esm-framework';
import type { Drug } from '@openmrs/esm-patient-common-lib';
import { FAVORITES_PROPERTY_KEYS } from './constants';
import type {
  DrugFavoriteOrder,
  DrugFavoriteAttributes,
  DrugOrderSlotState,
  StoredDrugFavorites,
  UserResponse,
  OrderConfig,
} from './types';

export function getFavoriteKey(favorite: DrugFavoriteOrder): string {
  return favorite.id;
}

export function useDrugFavorites(userUuid: string | undefined) {
  const url = userUuid ? `${restBaseUrl}/user/${userUuid}?v=custom:(uuid,userProperties)` : null;

  const { data, error, isLoading, mutate } = useSWR<{ data: UserResponse }>(url, openmrsFetch);

  const rawValue = data?.data?.userProperties?.[FAVORITES_PROPERTY_KEYS.DRUG];

  const favorites = useMemo((): DrugFavoriteOrder[] => {
    if (!rawValue) return [];
    try {
      const stored: StoredDrugFavorites = JSON.parse(rawValue);
      return stored.favorites ?? [];
    } catch (e) {
      console.error('Error parsing drug favorites:', e);
      return [];
    }
  }, [rawValue]);

  return { favorites, error, isLoading, mutate };
}

export async function saveDrugFavorites(userUuid: string, favorites: DrugFavoriteOrder[]) {
  const user = await getLoggedInUser();
  const stored: StoredDrugFavorites = { favorites };

  return setUserProperties(userUuid, {
    ...user.userProperties,
    [FAVORITES_PROPERTY_KEYS.DRUG]: JSON.stringify(stored),
  });
}

export function addDrugFavorite(
  currentFavorites: DrugFavoriteOrder[],
  newFavorite: DrugFavoriteOrder,
): DrugFavoriteOrder[] {
  const existingIndex = currentFavorites.findIndex((f) => f.id === newFavorite.id);

  if (existingIndex >= 0) {
    const updated = [...currentFavorites];
    updated[existingIndex] = newFavorite;
    return updated;
  }
  return [...currentFavorites, newFavorite];
}

export function removeDrugFavorite(currentFavorites: DrugFavoriteOrder[], id: string): DrugFavoriteOrder[] {
  return currentFavorites.filter((f) => f.id !== id);
}

function hasOrderAttributes(orderItem?: DrugOrderSlotState): boolean {
  return Boolean(
    orderItem?.route?.value || orderItem?.frequency?.value || orderItem?.dosage != null || orderItem?.unit?.value,
  );
}

function matchesOrderAttributes(favorite: DrugFavoriteOrder, orderItem?: DrugOrderSlotState): boolean {
  if (!orderItem || !hasOrderAttributes(orderItem)) return true;
  const { attributes } = favorite;
  const pairs: [string | undefined, string | undefined][] = [
    [attributes.route, orderItem.route?.value],
    [attributes.frequency, orderItem.frequency?.value],
    [attributes.dose, orderItem.dosage == null ? undefined : orderItem.dosage.toString()],
    [attributes.unit, orderItem.unit?.value],
  ];
  return pairs.every(([favValue, orderValue]) => !favValue || (!!orderValue && favValue === orderValue));
}

export function isDrugFavorite(
  favorites: DrugFavoriteOrder[],
  drugUuid?: string,
  conceptUuid?: string,
  hasSpecificStrength?: boolean,
  orderItem?: DrugOrderSlotState,
): boolean {
  if (!drugUuid && !conceptUuid) return false;

  if (drugUuid) {
    const hasDrugMatch = favorites.some((f) => f.drugUuid === drugUuid && matchesOrderAttributes(f, orderItem));
    if (hasDrugMatch) return true;
  }

  if (conceptUuid && !hasSpecificStrength) {
    return favorites.some((f) => f.conceptUuid === conceptUuid && !f.drugUuid && matchesOrderAttributes(f, orderItem));
  }

  return false;
}

export function getDrugFavorite(
  favorites: DrugFavoriteOrder[],
  drugUuid?: string,
  conceptUuid?: string,
  orderItem?: DrugOrderSlotState,
): DrugFavoriteOrder | undefined {
  if (drugUuid) {
    return favorites.find((f) => f.drugUuid === drugUuid && matchesOrderAttributes(f, orderItem));
  }
  if (conceptUuid) {
    return favorites.find((f) => f.conceptUuid === conceptUuid && !f.drugUuid && matchesOrderAttributes(f, orderItem));
  }
  return undefined;
}

export function extractDrugOrderAttributes(
  drug: Drug | undefined,
  orderItem: DrugOrderSlotState | undefined,
): DrugFavoriteAttributes {
  const attributes: DrugFavoriteAttributes = {};

  if (drug?.strength) attributes.strength = drug.strength;
  if (drug?.dosageForm) {
    attributes.dosageFormDisplay = drug.dosageForm.display;
    if (drug.dosageForm.uuid) attributes.dosageFormUuid = drug.dosageForm.uuid;
  }
  if (orderItem?.dosage) attributes.dose = orderItem.dosage.toString();
  if (orderItem?.unit?.value) {
    attributes.unit = orderItem.unit.value;
    if (orderItem.unit.valueCoded) attributes.unitUuid = orderItem.unit.valueCoded;
  }
  if (orderItem?.route?.value) {
    attributes.route = orderItem.route.value;
    if (orderItem.route.valueCoded) attributes.routeUuid = orderItem.route.valueCoded;
  }
  if (orderItem?.frequency?.value) {
    attributes.frequency = orderItem.frequency.value;
    if (orderItem.frequency.valueCoded) attributes.frequencyUuid = orderItem.frequency.valueCoded;
  }

  return attributes;
}

export function useOrderConfig(enabled: boolean = true) {
  const { data, error, isLoading } = useSWRImmutable<{ data: OrderConfig }>(
    enabled ? `${restBaseUrl}/orderentryconfig` : null,
    openmrsFetch,
  );

  return {
    routes: data?.data?.drugRoutes ?? [],
    dosingUnits: data?.data?.drugDosingUnits ?? [],
    frequencies: data?.data?.orderFrequencies ?? [],
    isLoading,
    error,
  };
}

export function useDrugsByConceptName(conceptName: string | undefined, conceptUuid: string | undefined) {
  const { data, isLoading, error } = useSWRImmutable<{ data: { results: Drug[] } }>(
    conceptName
      ? `${restBaseUrl}/drug?q=${encodeURIComponent(conceptName)}&v=custom:(uuid,display,name,strength,dosageForm:(display,uuid),concept:(display,uuid))`
      : null,
    openmrsFetch,
  );

  const matchingDrugs = useMemo(() => {
    if (!data?.data?.results || !conceptUuid) return [];
    return data.data.results.filter((d) => d.concept?.uuid === conceptUuid);
  }, [data, conceptUuid]);

  return { matchingDrugs, isLoading, error };
}
