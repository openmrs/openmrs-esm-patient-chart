import React, { useState } from 'react';
import EncountersTable from './encounters-table.component';
import { type EncountersTableProps, usePaginatedEncounters } from './encounters-table.resource';
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
    paginated,
  } = usePaginatedEncounters(patientUuid, encounterTypeToFilter?.uuid, pageSize);

  const encountersTableProps: EncountersTableProps = {
    patientUuid,
    totalCount,
    currentPage,
    goTo,
    isLoading,
    onEncountersUpdated: mutateEncounters,
    showVisitType: true,
    paginated,
    paginatedEncounters,
    encounterTypeToFilter,
    setEncounterTypeToFilter,
    showEncounterTypeFilter: true,
  };

  return <EncountersTable {...encountersTableProps} />;
};

export default AllEncountersTable;
