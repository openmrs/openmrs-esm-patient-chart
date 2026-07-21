import { useMemo } from 'react';
import useSWR from 'swr';
import { getLoggedInUser, openmrsFetch, restBaseUrl, setUserProperties } from '@openmrs/esm-framework';
import type { UserResponse } from './form-favorites.types';

export const FORM_FAVORITES_PROPERTY_KEY = 'form_favorites';

export interface FormFavorite {
  id: string;
  formUuid: string;
  displayName: string;
}

export function useFormFavorites(userUuid: string | undefined) {
  const url = userUuid ? `${restBaseUrl}/user/${userUuid}?v=custom:(uuid,userProperties)` : null;

  const { data, error, isLoading, mutate } = useSWR<{ data: UserResponse }>(url, openmrsFetch);

  const rawValue = data?.data?.userProperties?.[FORM_FAVORITES_PROPERTY_KEY];

  const favorites = useMemo((): FormFavorite[] => {
    if (!rawValue) return [];
    try {
      const stored: { favorites: FormFavorite[] } = JSON.parse(rawValue);
      return stored.favorites ?? [];
    } catch (e) {
      console.error('Error parsing form favorites:', e);
      return [];
    }
  }, [rawValue]);

  return { favorites, error, isLoading, mutate };
}

export async function saveFormFavorites(userUuid: string, favorites: FormFavorite[]) {
  const user = await getLoggedInUser();
  const stored = { favorites };

  return setUserProperties(userUuid, {
    ...user.userProperties,
    [FORM_FAVORITES_PROPERTY_KEY]: JSON.stringify(stored),
  });
}

export function addFormFavorite(currentFavorites: FormFavorite[], newFavorite: FormFavorite): FormFavorite[] {
  const existingIndex = currentFavorites.findIndex((f) => f.formUuid === newFavorite.formUuid);

  if (existingIndex >= 0) {
    const updated = [...currentFavorites];
    updated[existingIndex] = newFavorite;
    return updated;
  }
  return [...currentFavorites, newFavorite];
}

export function removeFormFavorite(currentFavorites: FormFavorite[], formUuid: string): FormFavorite[] {
  return currentFavorites.filter((f) => f.formUuid !== formUuid);
}

export function isFormFavorite(favorites: FormFavorite[], formUuid?: string): boolean {
  if (!formUuid) return false;
  return favorites.some((f) => f.formUuid === formUuid);
}

export function getFormFavorite(favorites: FormFavorite[], formUuid: string): FormFavorite | undefined {
  return favorites.find((f) => f.formUuid === formUuid);
}
