import React, { useMemo, useState } from 'react';
import { usePagination, userHasAccess, useSession, type Visit } from '@openmrs/esm-framework';
import EncountersTable from './encounters-table.component';
import { type EncountersTableProps } from './encounters-table.resource';

interface VisitEncountersTableProps {
  patientUuid: string;
  visit: Visit;
}

/**
 * This component shows a table of encounters from a single visit of a patient
 */
const VisitEncountersTable: React.FC<VisitEncountersTableProps> = ({ patientUuid, visit }) => {
  const [pageSize, setPageSize] = useState(10);
  const mappedEncounters = useMemo(
    () =>
      (visit.encounters ?? []).map((encounter) => {
        encounter.visit = visit;
        return encounter;
      }),
    [visit],
  );
  const { results: paginatedEncounters, currentPage, goTo } = usePagination(mappedEncounters, pageSize);

  const session = useSession();
  const canPrintEncounters = userHasAccess('App: Print encounter forms', session?.user);

  const encountersTableProps: EncountersTableProps = {
    patientUuid,
    totalCount: mappedEncounters.length,
    currentPage,
    goTo,
    isLoading: false,
    showVisitType: false,
    paginatedEncounters: paginatedEncounters,
    showEncounterTypeFilter: false,
    pageSize,
    setPageSize,
    isSelectable: false,
    canPrintEncounters,
  };

  return <EncountersTable {...encountersTableProps} />;
};

export default VisitEncountersTable;
