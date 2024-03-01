import React, { useMemo, useCallback } from 'react';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  TableContainer,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  type DataTableHeader,
} from '@carbon/react';
import { Edit, Run } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { setCurrentVisit } from '@openmrs/esm-framework';
import { type DefaultWorkspaceProps, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { usePastVisits } from './visits-widget/visit.resource';
import styles from './past-visit-overview.scss';

const PastVisitOverview: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.toLowerCase().replace('_', '-');

  const { data: pastVisits, isError, isLoading } = usePastVisits(patientUuid);

  const headerData: Array<typeof DataTableHeader> = useMemo(
    () => [
      { key: 'startDate', header: t('startDate', 'Start Date') },
      { key: 'visitType', header: t('type', 'Type') },
      { key: 'location', header: t('location', 'Location') },
      { key: 'endDate', header: t('endDate_title', 'End Date'), colSpan: 2 },
    ],
    [t],
  );

  const rowData = useMemo(() => {
    return pastVisits?.map((visit) => ({
      id: `${visit.uuid}`,
      startDate: new Date(visit.startDatetime).toLocaleDateString(locale, { dateStyle: 'medium' }),
      visitType: visit.visitType.display,
      location: visit.location?.display,
      endDate: visit.stopDatetime
        ? new Date(visit.startDatetime).toLocaleDateString(locale, { dateStyle: 'medium' })
        : '',
      visit: visit,
    }));
  }, [locale, pastVisits]);

  const startRetrospectiveEntry = useCallback(
    (visitUuid: string) => {
      closeWorkspace();
      setCurrentVisit(patientUuid, visitUuid);
    },
    [closeWorkspace, patientUuid],
  );

  const editVisitDetails = useCallback(
    (visitUuid: string) => {
      const visitToEdit = pastVisits.find((visit) => visit.uuid === visitUuid);
      launchPatientWorkspace('start-visit-workspace-form', {
        workspaceTitle: t('editVisitDetails', 'Edit visit details'),
        visitToEdit,
      });
    },
    [pastVisits, t],
  );

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }
  if (isError) {
    return <ErrorState error={isError} headerTitle={t('pastVisitErrorText', 'Past Visit Error')} />;
  }
  if (pastVisits?.length) {
    return (
      <div className={styles.container}>
        <DataTable headers={headerData} rows={rowData} useZebraStyles>
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <TableContainer title={t('pastVisits', 'Past Visits')}>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        {...getHeaderProps({
                          header,
                          isSortable: header.isSortable,
                        })}
                      >
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
                      <TableCell className="cds--table-column-menu">
                        <Button
                          renderIcon={Edit}
                          hasIconOnly
                          kind="ghost"
                          iconDescription={t('editThisVisit', 'Edit this visit')}
                          tooltipPosition="left"
                          onClick={() => editVisitDetails(row.id)}
                        />
                        <Button
                          renderIcon={Run}
                          hasIconOnly
                          kind="ghost"
                          iconDescription={t('startRetrospectiveEntry', 'Start retrospective entry')}
                          tooltipPosition="left"
                          onClick={() => startRetrospectiveEntry(row.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
        <Button className={styles.button} onClick={closeWorkspace} kind="secondary">
          {t('cancel', 'Cancel')}
        </Button>
      </div>
    );
  }
};

export default PastVisitOverview;
