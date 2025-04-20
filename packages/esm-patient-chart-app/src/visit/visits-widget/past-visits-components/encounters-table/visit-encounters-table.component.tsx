import React, { useMemo, useState } from 'react';
import EncountersTable from './encounters-table.component';
import { type EncountersTableProps, mapEncounter } from './encounters-table.resource';
import { usePagination, type Visit } from '@openmrs/esm-framework';

interface VisitEncountersTableProps {
  patientUuid: string;
  visit: Visit;
  mutateVisits(): void;
}

/**
 * This component shows a table of encounters from a single visit of a patient
 */
const VisitEncountersTable: React.FC<VisitEncountersTableProps> = ({ patientUuid, visit, mutateVisits }) => {
  const [pageSize, setPageSize] = useState(10);
  const { results: paginatedEncounters, currentPage, goTo, paginated } = usePagination(visit.encounters, pageSize);

  const encountersTableProps: EncountersTableProps = {
    patientUuid,
    totalCount: visit.encounters.length,
    currentPage,
    goTo,
    isLoading: false,
    onEncountersUpdated: mutateVisits,
    showVisitType: false,
    paginated,
    paginatedEncounters: paginatedEncounters,
    showEncounterTypeFilter: false,
    pageSize,
    setPageSize,
  };

  return <EncountersTable {...encountersTableProps} />;
};

export default VisitEncountersTable;
