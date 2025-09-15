import { fhirBaseUrl, openmrsFetch, showToast, useConfig, useOpenmrsSWR } from '@openmrs/esm-framework';
import { useEffect, useMemo } from 'react';
import { type ConfigObject } from '../config-schema';
import { useTranslation } from 'react-i18next';

interface StickyNoteObservation {
  display: string;
  uuid: string;
}

export function useStickyNotes(patientUuid: string) {
  const { t } = useTranslation();
  const { stickyNoteConceptUuid } = useConfig<ConfigObject>();
  const params = new URLSearchParams();
  params.set('subject:Patient', patientUuid);
  params.set('code', stickyNoteConceptUuid);
  const url = stickyNoteConceptUuid ? `${fhirBaseUrl}/Observation?${params.toString()}` : null;
  const {
    data,
    isLoading: isLoadingStickyNotes,
    error: errorFetchingStickyNotes,
    isValidating: isValidatingStickyNotes,
    mutate: mutateStickyNotes,
  } = useOpenmrsSWR<fhir.Observation>(url);

  useEffect(() => {
    if (!isLoadingStickyNotes && errorFetchingStickyNotes) {
      showToast({
        title: t('stickyNoteError', 'Error fetching sticky notes'),
        description: errorFetchingStickyNotes?.message,
        kind: 'error',
      });
    }
  }, [isLoadingStickyNotes, errorFetchingStickyNotes, t]);

  useEffect(() => {
    if (!stickyNoteConceptUuid) {
      showToast({
        title: t('stickyNoteError', 'Error fetching sticky notes'),
        description: t('stickyNoteConceptUuidNotSet', 'Sticky note concept UUID not set'),
        kind: 'error',
      });
    }
  }, [stickyNoteConceptUuid, t]);

  const results = useMemo(
    () => ({
      data: data?.data,
      isLoadingStickyNotes,
      errorFetchingStickyNotes,
      isValidatingStickyNotes,
      mutateStickyNotes,
    }),
    [data, isLoadingStickyNotes, errorFetchingStickyNotes, isValidatingStickyNotes, mutateStickyNotes],
  );

  return results;
}

export function updateStickyNote(observationUuid: string, payload: Record<string, any>) {
  return openmrsFetch(`${fhirBaseUrl}/Observation/${observationUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function deleteStickyNote(observationUuid: string) {
  return openmrsFetch(`${fhirBaseUrl}/Observation/${observationUuid}`, {
    method: 'DELETE',
  });
}
