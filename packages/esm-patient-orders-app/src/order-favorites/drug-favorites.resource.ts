import { useMemo } from 'react';
import useSWR from 'swr';
import { getLoggedInUser, openmrsFetch, restBaseUrl, setUserProperties } from '@openmrs/esm-framework';
import type { DrugFavoriteOrder, UserResponse } from './types';

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
