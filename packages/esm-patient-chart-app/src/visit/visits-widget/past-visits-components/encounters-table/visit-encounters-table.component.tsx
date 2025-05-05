import React, { useMemo, useState } from 'react';
import EncountersTable from './encounters-table.component';
import { type EncountersTableProps } from './encounters-table.resource';
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
  const mappedEncounters = useMemo(
    () =>
      visit.encounters.map((encounter) => {
        encounter.visit = visit;
        return encounter;
      }),
    [visit],
  );
  const { results: paginatedEncounters, currentPage, goTo } = usePagination(mappedEncounters, pageSize);

  const encountersTableProps: EncountersTableProps = {
    patientUuid,
    totalCount: visit.encounters.length,
    currentPage,
    goTo,
    isLoading: false,
    onEncountersUpdated: mutateVisits,
    showVisitType: false,
    paginatedEncounters: paginatedEncounters,
    showEncounterTypeFilter: false,
    pageSize,
    setPageSize,
  };

  return <EncountersTable {...encountersTableProps} />;
};

export default VisitEncountersTable;
