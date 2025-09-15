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
  params.set('patient', patientUuid);
  params.set('code', stickyNoteConceptUuid);
  const url = stickyNoteConceptUuid ? `${fhirBaseUrl}/Observation?${params.toString()}` : null;
  const { data, isLoading, error, isValidating } = useOpenmrsSWR<fhir.Observation>(url);

  useEffect(() => {
    if (!isLoading && error) {
      showToast({
        title: t('stickyNoteError', 'Error fetching sticky notes'),
        description: error?.message,
        kind: 'error',
      });
    }
  }, [isLoading, error, t]);

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
      isLoading,
      error,
      isValidating,
    }),
    [data, isLoading, error, isValidating],
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
