import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import {
  createGlobalStore,
  openmrsFetch,
  reportError,
  showSnackbar,
  useSession,
  useStore,
} from '@openmrs/esm-framework';
import { getUserPropertiesUrl, updateUserProperty, withUserProperty } from './drug-favorites.resource';
import type { UserResponse } from './types';

export const DISMISSED_SUGGESTIONS_PROPERTY_KEY = 'order_favorites_dismissed_suggestions';
export const MAX_DISMISSED_SUGGESTIONS = 200;

// Suggestions hidden "for now", and a declined swap, are remembered until the page is reloaded
interface HiddenSuggestionsStore {
  hiddenDrugUuids: Array<string>;
  isSwapPromptHidden: boolean;
}

const hiddenSuggestionsStore = createGlobalStore<HiddenSuggestionsStore>('hidden-drug-order-suggestions', {
  hiddenDrugUuids: [],
  isSwapPromptHidden: false,
});

export function parseDismissedDrugUuids(rawValue: string | undefined): Array<string> {
  if (!rawValue) {
    return [];
  }
  try {
    const stored: { drugUuids?: Array<string> } = JSON.parse(rawValue);
    return Array.isArray(stored.drugUuids) ? stored.drugUuids : [];
  } catch (e) {
    console.error('Error parsing dismissed drug suggestions:', e);
    return [];
  }
}

/**
 * Suggestions can be hidden for now or dismissed permanently. Permanent dismissals are stored in the user's
 * properties, keeping the most recent MAX_DISMISSED_SUGGESTIONS.
 */
export function useDismissedSuggestions() {
  const { t } = useTranslation();
  const { user } = useSession();
  const { data, mutate } = useSWR<{ data: UserResponse }>(getUserPropertiesUrl(user?.uuid), openmrsFetch);
  const rawValue = data?.data?.userProperties?.[DISMISSED_SUGGESTIONS_PROPERTY_KEY];
  const dismissedDrugUuids = useMemo(() => parseDismissedDrugUuids(rawValue), [rawValue]);
  const { hiddenDrugUuids, isSwapPromptHidden } = useStore(hiddenSuggestionsStore);

  const hiddenOrDismissedDrugUuids = useMemo(
    () => new Set([...dismissedDrugUuids, ...hiddenDrugUuids]),
    [dismissedDrugUuids, hiddenDrugUuids],
  );

  const hideSuggestion = useCallback((drugUuid: string) => {
    const { hiddenDrugUuids } = hiddenSuggestionsStore.getState();
    hiddenSuggestionsStore.setState({ hiddenDrugUuids: [...hiddenDrugUuids, drugUuid] });
  }, []);

  const hideSwapPrompt = useCallback(() => hiddenSuggestionsStore.setState({ isSwapPromptHidden: true }), []);

  const dismissSuggestion = useCallback(
    async (drugUuid: string) => {
      if (!user?.uuid) {
        return;
      }

      const updated = [...dismissedDrugUuids.filter((uuid) => uuid !== drugUuid), drugUuid].slice(
        -MAX_DISMISSED_SUGGESTIONS,
      );
      const value = JSON.stringify({ drugUuids: updated });

      try {
        await mutate(updateUserProperty(user.uuid, DISMISSED_SUGGESTIONS_PROPERTY_KEY, value), {
          optimisticData: (_, displayedData) =>
            withUserProperty(displayedData, DISMISSED_SUGGESTIONS_PROPERTY_KEY, value),
          populateCache: false,
        });
      } catch (error: unknown) {
        reportError(error);
        showSnackbar({
          isLowContrast: false,
          kind: 'error',
          title: t('errorDismissingSuggestion', 'Error dismissing suggestion'),
          subtitle: error instanceof Error ? error.message : '',
        });
      }
    },
    [user?.uuid, dismissedDrugUuids, mutate, t],
  );

  return {
    hiddenOrDismissedDrugUuids,
    isSwapPromptHidden,
    hideSuggestion,
    hideSwapPrompt,
    dismissSuggestion,
  };
}
