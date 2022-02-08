import React, { useMemo, useCallback } from 'react';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  OverflowMenu,
  OverflowMenuItem,
  TableContainer,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  DataTableHeader,
} from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { DefaultWorkspaceProps, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { getStartedVisit, VisitMode, VisitStatus } from '@openmrs/esm-framework';
import { usePastVisits } from './visits-widget/visit.resource';
import styles from './past-visit-overview.scss';

const PastVisitOverview: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.toLowerCase().replace('_', '-');

  const { data: pastVisits, isError, isLoading } = usePastVisits(patientUuid);

  const headerData: Array<DataTableHeader> = useMemo(
    () => [
      { key: 'startDate', header: t('startDate', 'Start Date') },
      { key: 'visitType', header: t('type', 'Type') },
      { key: 'location', header: t('location', 'Location') },
      { key: 'endDate', header: t('endDate', 'End Date'), colSpan: 2 },
    ],
    [t],
  );

  const rowData = useMemo(() => {
    return pastVisits?.map((visit, index) => ({
      id: `${index}`,
      startDate: new Date(visit.startDatetime).toLocaleDateString(locale, { dateStyle: 'medium' }),
      visitType: visit.visitType.display,
      location: visit.location?.display,
      endDate: visit.stopDatetime
        ? new Date(visit.startDatetime).toLocaleDateString(locale, { dateStyle: 'medium' })
        : '',
      visit: visit,
    }));
  }, [locale, pastVisits]);

  const handleOpenVisitForm = useCallback(() => {
    launchPatientWorkspace('start-visit-workspace-form');
    closeWorkspace();
  }, [closeWorkspace]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }
  if (isError) {
    return <ErrorState error={isError} headerTitle={t('pastVisitErrorText', 'Past Visit Error')} />;
  }
  if (pastVisits?.length) {
    return (
      <div className={styles.container}>
        <DataTable headers={headerData} rows={rowData}>
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <TableContainer title={t('pastVisits', 'Past Visits')}>
              <Table {...getTableProps()} useZebraStyles>
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
                      <TableCell className="bx--table-column-menu">
                        <OverflowMenu flipped selectorPrimaryFocus="option-two">
                          <OverflowMenuItem onClick={handleOpenVisitForm} itemText={t('edit', 'Edit')} />
                          <OverflowMenuItem
                            onClick={() => {
                              getStartedVisit.next({
                                mode: VisitMode.LOADING,
                                visitData: rowData[rowIndex].visit,
                                status: VisitStatus.ONGOING,
                              });
                            }}
                            itemText={t('loadVisitInfo', 'Load Visit Info')}
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
        <Button className={styles.button} onClick={closeWorkspace} kind="secondary">
          {t('cancel', 'Cancel')}
        </Button>
      </div>
    );
  }
};

export default PastVisitOverview;
