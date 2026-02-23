import React, { useMemo, useState } from 'react';
import { type Visit } from '@openmrs/esm-framework';
import EncountersTable from './encounters-table.component';
import { type EncountersTableProps, isCompletedFormEncounter } from './encounters-table.resource';

interface VisitCompletedFormsTableProps {
  patientUuid: string;
  visit: Visit;
}

/**
 * This component shows a table of only completed forms from a single visit of a patient
 */
const VisitCompletedFormsTable: React.FC<VisitCompletedFormsTableProps> = ({ patientUuid, visit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const mappedFilteredEncounters = useMemo(() => {
    if (!visit || !visit.encounters) return [];

    const completedForms = visit.encounters.filter(isCompletedFormEncounter);

    return completedForms.map((encounter) => {
      encounter.visit = visit;
      return encounter;
    });
  }, [visit]);

  const paginatedEncounters = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return mappedFilteredEncounters.slice(startIndex, endIndex);
  }, [mappedFilteredEncounters, currentPage, pageSize]);

  const goTo = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const encountersTableProps: EncountersTableProps = {
    patientUuid,
    totalCount: mappedFilteredEncounters.length,
    currentPage,
    goTo,
    isLoading: false,
    showVisitType: false,
    paginatedEncounters: paginatedEncounters,
    showEncounterTypeFilter: false,
    pageSize,
    setPageSize,
    isSelectable: false,
  };

  return <EncountersTable {...encountersTableProps} />;
};

export default VisitCompletedFormsTable;
