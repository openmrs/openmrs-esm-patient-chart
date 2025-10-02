import { useCallback, useMemo } from 'react';
import { fhirBaseUrl, openmrsFetch, showToast, useConfig, useOpenmrsSWR } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { useTranslation } from 'react-i18next';

interface StickyNoteData {
  uuid?: string;
  patientUuid: string;
  note: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    uuid: string;
    display: string;
  };
  updatedBy?: {
    uuid: string;
    display: string;
  };
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
  } = useOpenmrsSWR<fhir.Bundle>(url);

  // Show error toast if there's an error fetching sticky notes
  if (!isLoadingStickyNotes && errorFetchingStickyNotes) {
    showToast({
      title: t('stickyNoteError', 'Error fetching sticky notes'),
      description: errorFetchingStickyNotes?.message,
      kind: 'error',
    });
  }

  // Show error toast if concept UUID is not set
  if (!stickyNoteConceptUuid) {
    showToast({
      title: t('stickyNoteError', 'Error fetching sticky notes'),
      description: t('stickyNoteConceptUuidNotSet', 'Sticky note concept UUID not set'),
      kind: 'error',
    });
  }

  const results = useMemo(() => {
    const stickyNote = data?.data?.entry[0].resource as fhir.Observation;

    return {
      stickyNote,
      isStickyNotePresent: Boolean(stickyNote),
      isLoadingStickyNotes,
      errorFetchingStickyNotes,
      isValidatingStickyNotes,
      mutateStickyNotes,
    };
  }, [data, isLoadingStickyNotes, errorFetchingStickyNotes, isValidatingStickyNotes, mutateStickyNotes]);

  return results;
}

// CRUD functions for sticky notes using FHIR API
export function createStickyNote(patientUuid: string, note: string, stickyNoteConceptUuid: string) {
  const payload = {
    resourceType: 'Observation',
    status: 'final',
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: stickyNoteConceptUuid,
        },
      ],
    },
    subject: {
      reference: `Patient/${patientUuid}`,
    },
    valueString: note,
    issued: new Date().toISOString(),
  };

  return openmrsFetch(`${fhirBaseUrl}/Observation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/fhir+json',
    },
    body: JSON.stringify(payload),
  });
}

export function updateStickyNote(observationUuid: string, note: string) {
  const payload = {
    resourceType: 'Observation',
    id: observationUuid,
    status: 'final',
    valueString: note,
    issued: new Date().toISOString(),
  };

  return openmrsFetch(`${fhirBaseUrl}/Observation/${observationUuid}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/fhir+json',
    },
    body: JSON.stringify(payload),
  });
}

export function deleteStickyNote(observationUuid: string) {
  return openmrsFetch(`${fhirBaseUrl}/Observation/${observationUuid}`, {
    method: 'DELETE',
  });
}
