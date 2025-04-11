import React, { useMemo } from 'react';
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
  const pageSize = 10;
  const encounterRows = useMemo(() => visit.encounters.map(mapEncounter), [visit]);

  const { results: paginatedEncounterRows, currentPage, goTo } = usePagination(encounterRows, pageSize);

  const encountersTableProp: EncountersTableProps = {
    patientUuid,
    totalCount: encounterRows.length,
    currentPage,
    goTo,
    isLoading: false,
    onEncountersUpdated: mutateVisits,
    showVisitType: false,
    paginatedMappedEncounters: paginatedEncounterRows,
  };

  return <EncountersTable {...encountersTableProp} />;
};

export default VisitEncountersTable;
