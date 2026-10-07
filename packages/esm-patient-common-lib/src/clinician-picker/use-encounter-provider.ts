import { useEffect, useMemo, useState } from 'react';
import { useEmrConfiguration, useSession } from '@openmrs/esm-framework';
import { useEncounterPrivileges } from '../privileges';
import { useClinicians, type Provider } from './use-clinicians';

/** The standard "Clinician" encounter role, used when neither the caller nor the EMR configuration supplies one. */
export const DEFAULT_CLINICIAN_ENCOUNTER_ROLE_UUID = '240b26f9-dd88-4172-823d-4a8bfeb7841f';

interface UseEncounterProviderOptions {
  /** Limits the clinicians the user can pick from. Empty or undefined means all providers. */
  providerRoles?: Array<string>;
  /** The clinician an existing encounter is attributed to; used instead of the session provider when editing. */
  initialProvider?: Provider | null;
  /** The encounter role of the clinician. Defaults to the EMR configuration's clinician encounter role. */
  encounterRoleUuid?: string;
}

/**
 * Holds the clinician an encounter is placed on behalf of. Users without the
 * `Edit Encounters On Behalf Of Others` privilege are always the clinician themselves.
 */
export function useEncounterProvider({
  providerRoles,
  initialProvider,
  encounterRoleUuid,
}: UseEncounterProviderOptions = {}) {
  const session = useSession();
  const { emrConfiguration } = useEmrConfiguration();
  const encounterRole =
    encounterRoleUuid ?? emrConfiguration?.clinicianEncounterRole?.uuid ?? DEFAULT_CLINICIAN_ENCOUNTER_ROLE_UUID;
  const { canActOnBehalfOfOthers } = useEncounterPrivileges();
  const { providers, isLoading, error } = useClinicians(canActOnBehalfOfOthers ? providerRoles ?? [] : null);

  const sessionProvider = useMemo<Provider | null>(
    () =>
      session?.currentProvider?.uuid
        ? { uuid: session.currentProvider.uuid, person: { display: session.user?.person?.display } }
        : null,
    [session?.currentProvider?.uuid, session?.user?.person?.display],
  );

  const [selected, setSelected] = useState<Provider | null | undefined>(undefined);

  // Default to the logged-in provider, as long as they are among the clinicians that can be picked
  useEffect(() => {
    if (selected !== undefined || !canActOnBehalfOfOthers || initialProvider || !providers) {
      return;
    }
    setSelected(providers.some((p) => p.uuid === sessionProvider?.uuid) ? sessionProvider : null);
  }, [selected, canActOnBehalfOfOthers, initialProvider, providers, sessionProvider]);

  if (!canActOnBehalfOfOthers) {
    return {
      provider: initialProvider ?? sessionProvider,
      setProvider: setSelected,
      canChoose: false,
      isLoading: false,
      error: undefined,
      hasChanged: false,
      encounterProviders: undefined,
    };
  }

  const provider = selected === undefined ? initialProvider ?? null : selected;
  const hasChanged = selected !== undefined && selected?.uuid !== (initialProvider ?? sessionProvider)?.uuid;

  return {
    provider,
    setProvider: setSelected,
    canChoose: true,
    isLoading,
    error,
    /** Whether the user picked a clinician other than the one the encounter started out with. */
    hasChanged,
    /**
     * The `encounterProviders` to post with the encounter when the user can choose the clinician;
     * `undefined` when the server should attribute the encounter to the logged-in user.
     */
    encounterProviders: provider && encounterRole ? [{ provider: provider.uuid, encounterRole }] : undefined,
  };
}
