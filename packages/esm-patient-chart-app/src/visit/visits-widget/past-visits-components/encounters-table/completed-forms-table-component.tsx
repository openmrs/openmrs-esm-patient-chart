import React, { useState, useMemo } from 'react';
import { type EncounterType } from '@openmrs/esm-framework';
import {
  type EncountersTableProps,
  useAllEncounters,
  isCompletedFormEncounter,
} from './encounters-table.resource';
import EncountersTable from './encounters-table.component';

interface CompletedFormsTableProps {
  patientUuid: string;
}

const CompletedFormsTable: React.FC<CompletedFormsTableProps> = ({ patientUuid }) => {
  const [encounterTypeToFilter, setEncounterTypeToFilter] = useState<EncounterType>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: allEncounters, isLoading } = useAllEncounters(patientUuid, encounterTypeToFilter?.uuid);

  const filteredCompletedForms = useMemo(() => {
    if (!allEncounters) return [];
    return allEncounters.filter(isCompletedFormEncounter);
  }, [allEncounters]);

  const paginatedEncounters = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredCompletedForms.slice(startIndex, endIndex);
  }, [filteredCompletedForms, currentPage, pageSize]);

  const goTo = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const encountersTableProps: EncountersTableProps = {
    currentPage,
    encounterTypeToFilter,
    goTo,
    isLoading,
    pageSize,
    paginatedEncounters: paginatedEncounters,
    patientUuid,
    setEncounterTypeToFilter,
    setPageSize,
    showEncounterTypeFilter: true,
    showVisitType: true,
    totalCount: filteredCompletedForms.length,
    isSelectable: true,
  };

  return <EncountersTable {...encountersTableProps} />;
};

export default CompletedFormsTable;
