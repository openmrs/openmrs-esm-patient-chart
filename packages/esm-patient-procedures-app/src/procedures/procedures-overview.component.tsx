import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { AddIcon, launchWorkspace, useLayoutType } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { patientProceduresFormWorkspace } from '../constants';
import { useProcedures } from './procedures.resource';
import styles from './procedures-overview.scss';

interface ProceduresOverviewProps {
  patient: fhir.Patient;
}

const ProceduresOverview: React.FC<ProceduresOverviewProps> = ({ patient }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { procedures, error, isLoading, isValidating } = useProcedures(patient.id);
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';
  const displayText = t('procedures', 'procedures');
  const headerTitle = t('procedures', 'Procedures');

  const launchProceduresForm = useCallback(() => {
    launchWorkspace(patientProceduresFormWorkspace, {
      workspaceTitle: t('recordProcedure', 'Record a Procedure'),
      patientUuid: patient.id,
    });
  }, [patient.id, t]);

  const tableHeaders = [
    { key: 'procedureName', header: t('procedureName', 'Procedure Name') },
    { key: 'year', header: t('year', 'Year') },
    { key: 'status', header: t('status', 'Status') },
  ];

  const tableRows = useMemo(
    () =>
      procedures?.map((procedure) => ({
        ...procedure,
        year: procedure.year ?? '--',
        status: procedure.status ?? '--',
      })),
    [procedures],
  );

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (procedures?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <Button
            kind="ghost"
            renderIcon={(props) => <AddIcon size={16} {...props} />}
            iconDescription="Add procedure"
            onClick={launchProceduresForm}
          >
            {t('add', 'Add')}
          </Button>
        </CardHeader>
        <DataTable rows={tableRows} headers={tableHeaders} isSortable useZebraStyles size={isTablet ? 'lg' : 'sm'}>
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <TableContainer>
              <Table aria-label="procedures summary" {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        className={styles.tableHeader}
                        {...getHeaderProps({
                          header,
                        })}
                      >
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </div>
    );
  }

  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchProceduresForm} />;
};

export default ProceduresOverview;
