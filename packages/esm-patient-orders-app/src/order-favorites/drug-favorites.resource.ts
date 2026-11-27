import { useMemo } from 'react';
import useSWR from 'swr';
import { getLoggedInUser, openmrsFetch, restBaseUrl, setUserProperties } from '@openmrs/esm-framework';
import type { DrugFavoriteOrder, UserResponse } from './types';

export const FAVORITES_PROPERTY_KEY = 'order_favorites_drugs';

export function getFavoriteKey(favorite: DrugFavoriteOrder): string {
  return favorite.id;
}

export function getUserPropertiesUrl(userUuid: string | undefined) {
  return userUuid ? `${restBaseUrl}/user/${userUuid}?v=custom:(uuid,userProperties)` : null;
}

export function useDrugFavorites(userUuid: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<{ data: UserResponse }>(
    getUserPropertiesUrl(userUuid),
    openmrsFetch,
  );

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

// Returns the cached user response with one property replaced, for optimistic SWR updates
export function withUserProperty(currentData: { data: UserResponse } | undefined, key: string, value: string) {
  return currentData
    ? { data: { ...currentData.data, userProperties: { ...currentData.data.userProperties, [key]: value } } }
    : currentData;
}

let userPropertyWriteQueue: Promise<unknown> = Promise.resolve();

/**
 * Saves a single user property. setUserProperties replaces the user's whole property map, which we build from
 * the cached session user, so concurrent writes to different keys would overwrite each other. Writes are
 * serialized so each one starts from the session refreshed by the previous write.
 */
export function updateUserProperty(userUuid: string, key: string, value: string) {
  const write = userPropertyWriteQueue.then(async () => {
    const user = await getLoggedInUser();
    await setUserProperties(userUuid, { ...user.userProperties, [key]: value });
    return undefined;
  });
  userPropertyWriteQueue = write.catch(() => undefined);
  return write;
}

export function saveDrugFavorites(userUuid: string, favorites: DrugFavoriteOrder[]) {
  return updateUserProperty(userUuid, FAVORITES_PROPERTY_KEY, JSON.stringify({ favorites }));
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
