import React, { useCallback, useState, useMemo } from 'react';
import { userHasAccess, useSession, type EncounterType } from '@openmrs/esm-framework';
import { type EncountersTableProps, useAllEncounters, encounterHasJsonSchemaForm } from './encounters-table.resource';
import EncountersTable from './encounters-table.component';
import { invalidateVisitAndEncounterData } from '@openmrs/esm-patient-common-lib';
import { useSWRConfig } from 'swr';

interface CompletedFormsTableProps {
  patient: fhir.Patient;
  isTabActive?: boolean;
}

const CompletedFormsTable: React.FC<CompletedFormsTableProps> = ({ patient, isTabActive = false }) => {
  const [encounterTypeToFilter, setEncounterTypeToFilterState] = useState<EncounterType>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const setEncounterTypeToFilter = useCallback((encounterType: EncounterType) => {
    setEncounterTypeToFilterState(encounterType);
    setCurrentPage(1);
  }, []);

  const patientUuid = patient.id;
  const { data: allEncounters, isLoading } = useAllEncounters(
    isTabActive ? patientUuid : null,
    encounterTypeToFilter?.uuid,
  );

  const filteredCompletedForms = useMemo(() => {
    if (!allEncounters) {
      return [];
    }
    return allEncounters.filter(encounterHasJsonSchemaForm);
  }, [allEncounters]);

  const paginatedEncounters = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredCompletedForms.slice(startIndex, endIndex);
  }, [filteredCompletedForms, currentPage, pageSize]);

  const goTo = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const session = useSession();
  const canPrintEncounters = userHasAccess('App: Print encounter forms', session?.user);
  const {mutate: globalMutate} = useSWRConfig();

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
    canPrintEncounters,
    onEncounterSaved: () => {
      invalidateVisitAndEncounterData(globalMutate, patientUuid);
    },
    patient,
  };

  return <EncountersTable {...encountersTableProps} />;
};

export default CompletedFormsTable;
