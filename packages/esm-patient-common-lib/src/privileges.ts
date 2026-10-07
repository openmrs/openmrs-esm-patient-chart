import { useMemo } from 'react';
import { useSession, userHasAccess } from '@openmrs/esm-framework';

/** Allows editing visits and encounters other than the current active visit, and backdating within them. */
export const PRIVILEGE_EDIT_PAST_VISITS = 'Edit Past Visits';

/** Allows adding, editing and deleting visits and encounters on behalf of another clinician. */
export const PRIVILEGE_EDIT_ENCOUNTERS_ON_BEHALF_OF_OTHERS = 'Edit Encounters On Behalf Of Others';

export function useEncounterPrivileges() {
  const user = useSession()?.user;

  return useMemo(
    () => ({
      canEditPastVisits: Boolean(userHasAccess(PRIVILEGE_EDIT_PAST_VISITS, user)),
      canActOnBehalfOfOthers: Boolean(userHasAccess(PRIVILEGE_EDIT_ENCOUNTERS_ON_BEHALF_OF_OTHERS, user)),
    }),
    [user],
  );
}
