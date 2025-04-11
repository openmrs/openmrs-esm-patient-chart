import React, { useMemo, useState } from 'react';
import EncountersTable from './encounters-table.component';
import { type EncountersTableProps, mapEncounter, usePaginatedEncounters } from './encounters-table.resource';
import { type EncounterType } from '@openmrs/esm-framework';

interface AllEncountersTableProps {
  patientUuid: string;
}

/**
 * This component shows a table of all encounters (across all visits) of a patient
 */
const AllEncountersTable: React.FC<AllEncountersTableProps> = ({ patientUuid }) => {
  const pageSize = 20;
  const [encounterTypeToFilter, setEncounterTypeToFilter] = useState<EncounterType>(null);

  const {
    data: paginatedEncounters,
    currentPage,
    isLoading,
    totalCount,
    goTo,
    mutate: mutateEncounters,
  } = usePaginatedEncounters(patientUuid, encounterTypeToFilter?.uuid, pageSize);

  const paginatedEncounterRows = useMemo(() => {
    return paginatedEncounters?.map(mapEncounter);
  }, [paginatedEncounters]);

  const encountersTableProp: EncountersTableProps = {
    patientUuid,
    totalCount,
    currentPage,
    goTo,
    isLoading,
    onEncountersUpdated: mutateEncounters,
    showVisitType: true,
    paginatedMappedEncounters: paginatedEncounterRows,
    encounterTypeToFilter,
    setEncounterTypeToFilter,
  };

  return <EncountersTable {...encountersTableProp} />;
};

export default AllEncountersTable;
