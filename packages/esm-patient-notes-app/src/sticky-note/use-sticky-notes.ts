import { useState, useCallback } from 'react';
import { openmrsFetch, useSession } from '@openmrs/esm-framework';

interface OpenMRSObsData {
  uuid: string;
  display: string;
  value: string;
  obsDatetime: string;
  auditInfo: {
    creator: {
      uuid: string;
      display: string;
    };
    dateCreated: string;
    changedBy?: {
      uuid: string;
      display: string;
    } | null;
    dateChanged?: string | null;
  };
}

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

const STICKY_NOTE_CONCEPT_UUID = '165095AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export function useStickyNotes(patientUuid: string) {
  const [stickyNote, setStickyNote] = useState<StickyNoteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSession();

  const fetchStickyNote = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await openmrsFetch(
        `/ws/rest/v1/obs?concept=${STICKY_NOTE_CONCEPT_UUID}&patient=${patientUuid}&v=full`,
      );

      if (response.data?.results?.length > 0) {
        const obsData: OpenMRSObsData = response.data.results[0];

        const noteData: StickyNoteData = {
          uuid: obsData.uuid,
          patientUuid,
          note: obsData.value,
          createdAt: obsData.auditInfo.dateCreated,
          updatedAt: obsData.auditInfo.dateChanged || obsData.auditInfo.dateCreated,
          createdBy: obsData.auditInfo.creator,
          updatedBy: obsData.auditInfo.changedBy || obsData.auditInfo.creator,
        };

        setStickyNote(noteData);
        return noteData;
      } else {
        setStickyNote(null);
        return null;
      }
    } catch (error) {
      console.error('Error fetching sticky note:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [patientUuid]);

  const saveStickyNote = useCallback(
    async (note: string) => {
      try {
        const payload = {
          person: patientUuid,
          concept: STICKY_NOTE_CONCEPT_UUID,
          value: note,
          obsDatetime: new Date().toISOString(),
        };

        const response = await openmrsFetch('/ws/rest/v1/obs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload,
        });

        if (response.data?.uuid) {
          // Fetch the created obs to get full data including audit info
          const createdObs = await openmrsFetch(`/ws/rest/v1/obs/${response.data.uuid}?v=full`);

          const obsData: OpenMRSObsData = createdObs.data;
          const noteData: StickyNoteData = {
            uuid: obsData.uuid,
            patientUuid,
            note: obsData.value,
            createdAt: obsData.auditInfo.dateCreated,
            updatedAt: obsData.auditInfo.dateChanged || obsData.auditInfo.dateCreated,
            createdBy: obsData.auditInfo.creator,
            updatedBy: obsData.auditInfo.changedBy || obsData.auditInfo.creator,
          };

          setStickyNote(noteData);
          return noteData;
        }

        throw new Error('Failed to create sticky note');
      } catch (error) {
        console.error('Error saving sticky note:', error);
        throw error;
      }
    },
    [patientUuid],
  );

  const updateStickyNote = useCallback(
    async (note: string) => {
      try {
        if (!stickyNote?.uuid) {
          throw new Error('No sticky note to update');
        }

        const payload = {
          person: patientUuid,
          concept: STICKY_NOTE_CONCEPT_UUID,
          value: note,
          uuid: stickyNote.uuid,
          obsDatetime: new Date().toISOString(),
        };

        const response = await openmrsFetch(`/ws/rest/v1/obs/${stickyNote.uuid}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload,
        });

        if (response.data?.uuid) {
          // Fetch the updated obs to get full data including audit info
          const updatedObs = await openmrsFetch(`/ws/rest/v1/obs/${response.data.uuid}?v=full`);

          const obsData: OpenMRSObsData = updatedObs.data;
          const noteData: StickyNoteData = {
            uuid: obsData.uuid,
            patientUuid,
            note: obsData.value,
            createdAt: obsData.auditInfo.dateCreated,
            updatedAt: obsData.auditInfo.dateChanged || obsData.auditInfo.dateCreated,
            createdBy: obsData.auditInfo.creator,
            updatedBy: obsData.auditInfo.changedBy || obsData.auditInfo.creator,
          };

          setStickyNote(noteData);
          return noteData;
        }

        throw new Error('Failed to update sticky note');
      } catch (error) {
        console.error('Error updating sticky note:', error);
        throw error;
      }
    },
    [patientUuid, stickyNote],
  );

  const deleteStickyNote = useCallback(async () => {
    try {
      if (!stickyNote?.uuid) {
        throw new Error('No sticky note to delete');
      }

      await openmrsFetch(`/ws/rest/v1/obs/${stickyNote.uuid}?purge=true`, {
        method: 'DELETE',
      });

      setStickyNote(null);
    } catch (error) {
      console.error('Error deleting sticky note:', error);
      throw error;
    }
  }, [stickyNote]);

  return {
    stickyNote,
    isLoading,
    fetchStickyNote,
    saveStickyNote,
    updateStickyNote,
    deleteStickyNote,
  };
}
