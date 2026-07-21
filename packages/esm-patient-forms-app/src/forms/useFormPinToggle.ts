import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import { v4 as uuid } from 'uuid';
import type { FormEntryConfigSchema } from '../config-schema';
import type { Form } from '../types';
import { addFormFavorite, getFormFavorite, isFormFavorite } from './form-favorites.resource';
import { useFormFavoritesActions } from './useFormFavoritesActions';

export function useFormPinToggle(form: Form | undefined) {
  const { t } = useTranslation();
  const { enableFormFavorites, maxPinnedForms } = useConfig<FormEntryConfigSchema>();
  const { favorites, isLoading, deleteMultipleFavorites, persistFavorites } = useFormFavoritesActions();
  const [isSaving, setIsSaving] = useState(false);

  const isPinned = isFormFavorite(favorites, form?.uuid);

  const toggle = useCallback(async () => {
    if (!form?.uuid) {
      return;
    }

    if (isPinned) {
      const favorite = getFormFavorite(favorites, form.uuid);
      if (favorite) {
        setIsSaving(true);
        await deleteMultipleFavorites([favorite]);
        setIsSaving(false);
      }
    } else {
      if (favorites.length >= maxPinnedForms) {
        showSnackbar({
          isLowContrast: false,
          kind: 'warning',
          title: t('maxPinnedFormsReached', 'Maximum pinned forms reached'),
          subtitle: t('maxPinnedFormsSubtitle', 'You can have a maximum of {{max}} pinned forms', {
            max: maxPinnedForms,
          }),
        });
        return;
      }

      setIsSaving(true);
      const newFavorite = {
        id: uuid(),
        formUuid: form.uuid,
        displayName: form.display ?? form.name,
      };
      const updatedFavorites = addFormFavorite(favorites, newFavorite);
      await persistFavorites(updatedFavorites, {
        successTitle: t('formPinned', 'Form pinned'),
        successSubtitle: t('formPinnedSubtitle', '{{formName}} added to your pinned forms', {
          formName: newFavorite.displayName,
          interpolation: { escapeValue: false },
        }),
        errorTitle: t('errorPinningForm', 'Error pinning form'),
      });
      setIsSaving(false);
    }
  }, [form, isPinned, favorites, deleteMultipleFavorites, persistFavorites, maxPinnedForms, t]);

  return { isPinned, isSaving, isLoading, isEnabled: Boolean(form && enableFormFavorites), toggle };
}
