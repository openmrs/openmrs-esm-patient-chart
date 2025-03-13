import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ButtonSet,
  Button,
  TableContainer,
  TableToolbar,
  TableToolbarSearch,
  TableToolbarContent,
  DataTableSkeleton,
} from '@carbon/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './visit-selector.scss';
import { useVisits } from './visit-resource';
import { ErrorState, launchWorkspace, useAppContext } from '@openmrs/esm-framework';
import { VisitRow } from './visit-row';
import { type SelectedVisitContext } from '../../types/visit';

export const VisitSelector = ({ closeModal, patientUuid }) => {
  const { setSelectedVisitUuid } = useAppContext<SelectedVisitContext>('selected-visit-uuid') ?? {
    // Fallback values used when the app context is undefined
    setSelectedVisitUuid: () => {},
  };

  const { t } = useTranslation();
  const { visits, isLoading, isValidating, error } = useVisits(patientUuid);
  const [selectedVisitUuidLocal, setSelectedVisitUuidLocal] = useState<string | null>(null);

  const updateSelectedVisitUuid = (value: string) => {
    setSelectedVisitUuidLocal(value);
  };

  const handleContinue = () => {
    setSelectedVisitUuid(selectedVisitUuidLocal);
    closeModal();
  };

  // Question: what is the limit of visits we can fetch
  // Question: modal sizes.

  const handleCreateNewVisit = () => {
    closeModal();
    launchWorkspace('start-visit-workspace-form', {
      patientUuid,
      openedFrom: 'patient-chart-start-visit',
    });
  };

  return (
    <React.Fragment>
      <ModalHeader closeModal={closeModal} title={t('selectAVisit', 'Select a visit')} subtitle={'shsh'} />
      <ModalBody>
        {isLoading || isValidating ? (
          <DataTableSkeleton
            aria-label="sample table"
            showHeader={false}
            showToolbar={false}
            rowCount={2}
            columnCount={2}
          />
        ) : error ? (
          <ErrorState error={error} headerTitle={t('anErrorOccurred', 'An error occurred')} />
        ) : (
          <DataTable
            headers={[
              {
                header: 'Display',
                key: 'display',
              },
            ]}
            rows={visits}
            size="md"
          >
            {({ getTableProps, getTableContainerProps, getToolbarProps }) => (
              <TableContainer {...getTableContainerProps()} className={styles.tableContainer}>
                <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
                  <TableToolbarContent>
                    <TableToolbarSearch persistent />
                  </TableToolbarContent>
                </TableToolbar>
                <Table {...getTableProps()}>
                  <TableBody>
                    {visits.map((visit) => (
                      <VisitRow
                        visit={visit}
                        selectedVisitUuid={selectedVisitUuidLocal}
                        updateSelectedVisitUuid={updateSelectedVisitUuid}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        )}
        <Button kind="ghost" onClick={handleCreateNewVisit}>
          Create new visit...
        </Button>
      </ModalBody>
      <ModalFooter>
        <ButtonSet className={styles.buttonSet}>
          <Button kind="secondary" onClick={closeModal}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button disabled={!selectedVisitUuidLocal} onClick={handleContinue}>
            {t('continue', 'Continue')}
          </Button>
        </ButtonSet>
      </ModalFooter>
    </React.Fragment>
  );
};
