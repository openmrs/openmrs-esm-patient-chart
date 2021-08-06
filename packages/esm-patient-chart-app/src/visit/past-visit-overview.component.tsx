import { getVisitsForPatient, Visit } from '@openmrs/esm-api';
import { createErrorHandler } from '@openmrs/esm-error-handling';
import React, { useState, useEffect } from 'react';
import {
  DataTable,
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
import { useMemo, useReducer } from 'react-router/node_modules/@types/react';
import dayjs from 'dayjs';
import { ErrorState } from '@openmrs/esm-patient-common-lib';

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
      { key: 'endDate', header: t('endDate', 'End Date') },
      { key: 'Actions', header: t('actions', 'Actions') },
    ],
    [t],
  );

  const rowData: Array<DataTableRow> = useMemo(
    () =>
      patientPastVisits.map((visit) => {
        return {
          id: `${visit.uuid}`,
          startDate: dayjs(visit.startDatetime).format(dateFormat),
          visitType: visit.visitType,
          location: visit.location.display,
          endDate: dayjs(visit.stopDatetime).format(dateFormat),
        };
      }),
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
    }
  }, [patientUuid]);

  return (
    <>
      {viewState.status === ActionTypes.pending && <DataTableSkeleton />}
      {viewState.status === ActionTypes.resolved && (
        <DataTable rows={rowData} headers={headerData}>
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <TableContainer title="DataTable">
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                      <TableCell className="bx--table-column-menu">
                        <OverflowMenu selectorPrimaryFocus="option-two">
                          <OverflowMenuItem itemText={t('edit', 'Edit')} />
                          <OverflowMenuItem itemText={t('load', 'Load Visit Info')} />
                        </OverflowMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      )}
      {viewState.status === ActionTypes.error && (
        <ErrorState error={error} headerTitle={t('pastVisitErrorText', 'Past Visit Error')} />
      )}
    </>
  );
};

export default PastVisitOverview;
