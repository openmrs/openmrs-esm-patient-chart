import React, { useState } from 'react';
import { userHasAccess, useSession, type EncounterType } from '@openmrs/esm-framework';
import { type EncountersTableProps, usePaginatedEncounters } from './encounters-table.resource';
import EncountersTable from './encounters-table.component';
import { invalidateVisitAndEncounterData } from '@openmrs/esm-patient-common-lib';
import { useSWRConfig } from 'swr';

interface AllEncountersTableProps {
  patient: fhir.Patient;
}

/**
 * This component shows a table of all encounters (across all visits) of a patient
 */
const AllEncountersTable: React.FC<AllEncountersTableProps> = ({ patient }) => {
  const [encounterTypeToFilter, setEncounterTypeToFilter] = useState<EncounterType>(null);
  const [pageSize, setPageSize] = useState(20);
  const patientUuid = patient.id;

  const {
    data: paginatedEncounters,
    currentPage,
    isLoading,
    totalCount,
    goTo,
  } = usePaginatedEncounters(patientUuid, encounterTypeToFilter?.uuid, pageSize);

  const session = useSession();
  const canPrintEncounters = userHasAccess('App: Print encounter forms', session?.user);
  const {mutate: globalMutate} = useSWRConfig();

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
    isSelectable: false,
    canPrintEncounters,
    onEncounterUpdated: () => {
      invalidateVisitAndEncounterData(globalMutate, patientUuid)
    },
    patient
  };

  return <EncountersTable {...encountersTableProps} />;
};

export default AllEncountersTable;
