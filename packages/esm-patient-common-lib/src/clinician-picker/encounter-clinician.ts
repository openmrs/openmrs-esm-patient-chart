import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type Provider } from './use-clinicians';

interface EncounterProviderLike {
  encounterRole?: { uuid: string } | null;
  provider?: { uuid: string; display?: string; person?: { display?: string } | null } | null;
}

/**
 * The clinician an existing encounter is attributed to: the provider with the clinician encounter role,
 * or the first provider when none has that role. The order of an encounter's providers is not guaranteed,
 * so this should not be taken from the last or first entry blindly.
 */
export function getEncounterClinician(
  encounterProviders: Array<EncounterProviderLike> | undefined | null,
  clinicianEncounterRoleUuid?: string,
): Provider | null {
  const providers = encounterProviders ?? [];
  const clinician =
    providers.find((ep) => ep.encounterRole?.uuid === clinicianEncounterRoleUuid) ??
    providers.find((ep) => ep.provider) ??
    null;
  return clinician?.provider
    ? {
        uuid: clinician.provider.uuid,
        person: { display: clinician.provider.person?.display ?? clinician.provider.display },
      }
    : null;
}

/**
 * Makes the given provider the encounter's only active provider for the role. Posting `encounterProviders` to
 * an existing encounter only ever adds providers, so the previous ones are voided separately.
 */
export async function replaceEncounterClinician(
  abortController: AbortController,
  encounterUuid: string,
  providerUuid: string,
  encounterRoleUuid: string,
) {
  const encounterProvidersUrl = `${restBaseUrl}/encounter/${encounterUuid}/encounterprovider`;
  const { data } = await openmrsFetch<{
    results: Array<{ uuid: string; provider: { uuid: string }; encounterRole: { uuid: string } }>;
  }>(`${encounterProvidersUrl}?v=custom:(uuid,provider:(uuid),encounterRole:(uuid))`, {
    signal: abortController.signal,
  });
  const providersToVoid = data.results.filter(
    (encounterProvider) =>
      encounterProvider.encounterRole?.uuid === encounterRoleUuid && encounterProvider.provider?.uuid !== providerUuid,
  );

  // Add before voiding, so a failure part way never leaves the encounter without a clinician
  await openmrsFetch(encounterProvidersUrl, {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: { provider: providerUuid, encounterRole: encounterRoleUuid },
    signal: abortController.signal,
  });
  for (const encounterProvider of providersToVoid) {
    await openmrsFetch(`${encounterProvidersUrl}/${encounterProvider.uuid}`, {
      method: 'DELETE',
      signal: abortController.signal,
    });
  }
}
