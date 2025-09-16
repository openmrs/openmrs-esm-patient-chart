import {
  fhirBaseUrl,
  openmrsFetch,
  restBaseUrl,
  showToast,
  toOmrsIsoString,
  useConfig,
  useOpenmrsSWR,
} from '@openmrs/esm-framework';
import { useEffect, useMemo, createContext } from 'react';
import { type ConfigObject } from '../config-schema';
import { useTranslation } from 'react-i18next';

export const StickyNoteContext = createContext<{}>({});

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
  } = useOpenmrsSWR<fhir.Bundle>(url);

  useEffect(() => {
    if (!stickyNoteConceptUuid) {
      showToast({
        title: t('stickyNoteError', 'Error fetching sticky notes'),
        description: t('stickyNoteConceptUuidNotSet', 'Sticky note concept UUID not set'),
        kind: 'error',
      });
    }
  }, [stickyNoteConceptUuid, t]);

  const results = useMemo(() => {
    return {
      stickyNotes: data?.data?.entry?.map((entry) => entry.resource as fhir.Observation),
      isLoadingStickyNotes,
      errorFetchingStickyNotes,
      isValidatingStickyNotes,
      mutateStickyNotes,
    };
  }, [data, isLoadingStickyNotes, errorFetchingStickyNotes, isValidatingStickyNotes, mutateStickyNotes]);

  return results;
}

export function createStickyNote(patientUuid: string, note: string, stickyNoteConceptUuid: string) {
  const payload = {
    person: patientUuid,
    concept: stickyNoteConceptUuid,
    value: note,
    obsDatetime: toOmrsIsoString(new Date()),
  };
  return openmrsFetch(`${restBaseUrl}/obs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
  });
}

export function updateStickyNote(observationUuid: string, noteText: string) {
  const payload = {
    value: noteText,
    obsDatetime: toOmrsIsoString(new Date()),
  };
  return openmrsFetch(`${restBaseUrl}/obs/${observationUuid}`, {
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
