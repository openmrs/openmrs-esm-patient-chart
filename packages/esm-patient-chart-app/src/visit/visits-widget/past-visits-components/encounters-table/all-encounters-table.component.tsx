import React, { useCallback, useState } from 'react';
import { useVisitContextStore, type EncounterType } from '@openmrs/esm-framework';
import { type EncountersTableProps, usePaginatedEncounters } from './encounters-table.resource';
import EncountersTable from './encounters-table.component';

interface AllEncountersTableProps {
  patientUuid: string;
}

/**
 * This component shows a table of all encounters (across all visits) of a patient
 */
const AllEncountersTable: React.FC<AllEncountersTableProps> = ({ patientUuid }) => {
  const [encounterTypeToFilter, setEncounterTypeToFilter] = useState<EncounterType>(null);
  const [pageSize, setPageSize] = useState(20);

  const {
    data: paginatedEncounters,
    currentPage,
    isLoading,
    totalCount,
    goTo,
    mutate,
  } = usePaginatedEncounters(patientUuid, encounterTypeToFilter?.uuid, pageSize);

  const mutateEncounters = useCallback(() => mutate(), [mutate]);
  useVisitContextStore(mutateEncounters);

  const encountersTableProps: EncountersTableProps = {
    currentPage,
    encounterTypeToFilter,
    goTo,
    isLoading,
    pageSize,
    paginatedEncounters,
    patientUuid,
    setEncounterTypeToFilter,
    setPageSize,
    showEncounterTypeFilter: true,
    showVisitType: true,
    totalCount,
  };

  return <EncountersTable {...encountersTableProps} />;
};

export default AllEncountersTable;
