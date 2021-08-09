import { Visit } from '@openmrs/esm-api';
import { createErrorHandler } from '@openmrs/esm-error-handling';
import React, { useState, useEffect, useMemo, useReducer, useCallback } from 'react';
import DataTable, {
  TableContainer,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  DataTableHeader,
  DataTableRow,
} from 'carbon-components-react/es/components//DataTable';
import DataTableSkeleton from 'carbon-components-react/es/components/DataTableSkeleton';
import OverflowMenu from 'carbon-components-react/es/components/OverflowMenu';
import OverflowMenuItem from 'carbon-components-react/es/components/OverflowMenuItem';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import { attach, detach, getStartedVisit, getVisitsForPatient, VisitMode, VisitStatus } from '@openmrs/esm-framework';
import styles from './past-visit-overview.component.scss';
import Button from 'carbon-components-react/es/components/Button';

// TO DO Abstract this logic for state machines to a hook
enum ActionTypes {
  pending = 'pending',
  resolved = 'resolved',
  error = 'error',
}

interface ViewState {
  status: string;
}

interface Pending {
  type: ActionTypes.pending;
}

interface Error {
  type: ActionTypes.error;
}

interface Resolved {
  type: ActionTypes.resolved;
}

type Action = Pending | Error | Resolved;

function viewStateReducer(state: ViewState, action: Action): ViewState {
  switch (action.type) {
    case ActionTypes.pending:
      return {
        status: 'pending',
      };
    case ActionTypes.resolved:
      return { status: 'resolved' };
    case ActionTypes.error:
      return { status: 'error' };
    default:
      return state;
  }
}

interface PastVisitOverviewProps {
  patientUuid: string;
}

const PastVisitOverview: React.FC<PastVisitOverviewProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const [viewState, dispatch] = useReducer(viewStateReducer, { status: 'pending' });
  const [patientPastVisits, setPatientPastVisits] = useState<Array<Visit>>([]);
  const [error, setError] = useState<Error>();
  const dateFormat = 'DD-MMM-YYYY';

  const headerData: Array<DataTableHeader> = useMemo(
    () => [
      { key: 'startDate', header: t('startDate', 'Start Date') },
      { key: 'visitType', header: t('type', 'Type') },
      { key: 'location', header: t('location', 'Location') },
      { key: 'endDate', header: t('endDate', 'End Date'), colSpan: 2 },
    ],
    [t],
  );

  const rowData: Array<DataTableRow> = useMemo(
    () =>
      patientPastVisits.length
        ? patientPastVisits.map((visit, index) => {
            return {
              id: `${index}`,
              startDate: dayjs(visit.startDatetime).format(dateFormat),
              visitType: visit.visitType.display,
              location: visit.location?.display,
              endDate: visit.stopDatetime ? dayjs(visit.stopDatetime).format(dateFormat) : '',
              visit: visit,
            };
          })
        : [],
    [patientPastVisits],
  );
  useEffect(() => {
    if (patientUuid) {
      const ac = new AbortController();
      getVisitsForPatient(patientUuid, ac).subscribe(
        ({ data }) => {
          setPatientPastVisits(data.results);
          dispatch({ type: ActionTypes.resolved });
        },
        (error) => {
          createErrorHandler();
          setError(error);
          dispatch({ type: ActionTypes.error });
        },
      );
      return () => ac.abort();
    }
  }, [patientUuid]);

  const handleClose = useCallback(() => {
    detach('patient-chart-workspace-slot', 'past-visits-overview');
  }, []);

  const handleOpenVisitForm = useCallback(() => {
    attach('patient-chart-workspace-slot', 'start-visit-workspace-form');
    handleClose();
  }, [handleClose]);

  return (
    <>
      {viewState.status === ActionTypes.pending && <DataTableSkeleton />}
      {viewState.status === ActionTypes.resolved && (
        <>
          <DataTable headers={headerData} rows={rowData}>
            {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
              <TableContainer title={t('pastVisit', 'Past Visit')}>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader
                          {...getHeaderProps({
                            header,
                            isSortable: header.isSortable,
                          })}>
                          {header.header}
                        </TableHeader>
                      ))}
                      <TableHeader />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, rowIndex) => (
                      <TableRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                        ))}
                        <TableCell className="bx--table-column-menu">
                          <OverflowMenu flipped selectorPrimaryFocus="option-two">
                            <OverflowMenuItem onClick={handleOpenVisitForm} itemText={t('edit', 'Edit')} />
                            <OverflowMenuItem
                              onClick={() => {
                                getStartedVisit.next({
                                  mode: VisitMode.LOADING,
                                  visitData: rowData[rowIndex],
                                  status: VisitStatus.ONGOING,
                                });
                              }}
                              itemText={t('load', 'Load Visit Info')}
                            />
                          </OverflowMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
          <div className={styles.buttonContainer}>
            <Button onClick={handleClose} kind="secondary">
              {t('cancel', 'Cancel')}
            </Button>
          </div>
        </>
      )}
      {viewState.status === ActionTypes.error && (
        <ErrorState error={error} headerTitle={t('pastVisitErrorText', 'Past Visit Error')} />
      )}
    </>
  );
};

export default PastVisitOverview;
