import { useMemo } from 'react';
import useSWR from 'swr';
import { getLoggedInUser, openmrsFetch, restBaseUrl, setUserProperties } from '@openmrs/esm-framework';
import { careSettingUuid, drugCustomRepresentation, type Order } from '@openmrs/esm-patient-common-lib';
import type { DrugFavoriteOrder, UserResponse } from './types';

export function useActiveDrugOrders(patientUuid: string | undefined) {
  const url = patientUuid
    ? `${restBaseUrl}/order?patient=${patientUuid}&careSetting=${careSettingUuid}&v=${drugCustomRepresentation}&excludeDiscontinueOrders=true`
    : null;

  const { data, isLoading } = useSWR<{ data: { results: Order[] } }>(url, openmrsFetch);

  const prescribedDrugUuids = useMemo(() => {
    if (isLoading || !data) return new Set<string>();
    const now = new Date();
    return new Set<string>(
      data.data.results
        .filter((order) => {
          if (!order.drug?.uuid) return false;
          const stopped = order.dateStopped ? new Date(order.dateStopped) : null;
          const expired = order.autoExpireDate ? new Date(order.autoExpireDate) : null;
          return !(stopped && stopped <= now) && !(expired && expired <= now);
        })
        .map((order) => order.drug!.uuid),
    );
  }, [data, isLoading]);

  return { prescribedDrugUuids, isLoading };
}

export const FAVORITES_PROPERTY_KEY = 'order_favorites_drugs';

export function getFavoriteKey(favorite: DrugFavoriteOrder): string {
  return favorite.id;
}

export function useDrugFavorites(userUuid: string | undefined) {
  const url = userUuid ? `${restBaseUrl}/user/${userUuid}?v=custom:(uuid,userProperties)` : null;

  const { data, error, isLoading, mutate } = useSWR<{ data: UserResponse }>(url, openmrsFetch);

  const rawValue = data?.data?.userProperties?.[FAVORITES_PROPERTY_KEY];

  const favorites = useMemo((): DrugFavoriteOrder[] => {
    if (!rawValue) return [];
    try {
      const stored: { favorites: DrugFavoriteOrder[] } = JSON.parse(rawValue);
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
  const stored = { favorites };

  return setUserProperties(userUuid, {
    ...user.userProperties,
    [FAVORITES_PROPERTY_KEY]: JSON.stringify(stored),
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

export function isDrugFavorite(favorites: DrugFavoriteOrder[], drugUuid?: string): boolean {
  if (!drugUuid) return false;
  return favorites.some((f) => f.drugUuid === drugUuid);
}

export function getDrugFavorite(favorites: DrugFavoriteOrder[], drugUuid: string): DrugFavoriteOrder | undefined {
  return favorites.find((f) => f.drugUuid === drugUuid);
}
