import React, { useCallback, useMemo, useState } from 'react';
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
  Tile,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import {
  formatDate,
  isDesktop as isDesktopLayout,
  launchWorkspace2,
  parseDate,
  useConfig,
  useLayoutType,
  CardHeader,
  EmptyCard,
  ErrorState,
  formatPartialDate,
} from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { useProcedures } from './procedures.resource';
import styles from './procedures-overview.scss';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';

interface ProceduresOverviewProps {
  patientUuid: string;
}

const ProceduresOverview: React.FC<ProceduresOverviewProps> = ({ patientUuid }) => {
  const { procedurePageSize } = useConfig<ConfigObject>();
  const { t } = useTranslation();
  const launchProceduresForm = useCallback(() => launchWorkspace2('procedures-form-workspace'), []);
  const headerTitle = t('procedures', 'Procedures');
  const displayText = t('procedures_lower', 'procedures');
  const pageUrl = `\${openmrsSpaBase}/patient/${patientUuid}/chart/Procedures`;
  const urlLabel = t('seeAll', 'See all');
  const layout = useLayoutType();
  const isDesktop = isDesktopLayout(layout);

  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * procedurePageSize;

  const { procedures, totalCount, error, isLoading, isValidating } = useProcedures(
    patientUuid,
    startIndex,
    procedurePageSize,
  );

  const headers = useMemo(
    () => [
      { key: 'display', header: t('procedure', 'Procedure') },
      { key: 'startDateTimeRender', header: t('date', 'Date') },
    ],
    [t],
  );

  const tableRows = useMemo(
    () =>
      procedures?.map((p) => ({
        id: p.uuid,
        display: p.display ?? p.procedureNonCoded ?? '',
        startDateTimeRender: p.estimatedStartDate
          ? `${formatPartialDate(p.estimatedStartDate, { mode: 'wide' })}*`
          : formatDate(parseDate(p.startDateTime), { mode: 'wide', time: true }),
      })),
    [procedures],
  );

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" zebra />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (totalCount > 0 || procedures?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription={t('addProcedure', 'Add procedure')}
            onClick={launchProceduresForm}
          >
            {t('add', 'Add')}
          </Button>
        </CardHeader>
        <DataTable
          aria-label="procedures overview"
          headers={headers}
          overflowMenuOnHover={isDesktop}
          rows={tableRows ?? []}
          size={isDesktop ? 'sm' : 'lg'}
          useZebraStyles
        >
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <>
              <TableContainer className={styles.tableContainer}>
                <Table {...getTableProps()} className={styles.table}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader {...getHeaderProps({ header })} key={header.key}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DataTable>
        <PatientChartPagination
          currentItems={tableRows?.length ?? 0}
          onPageNumberChange={({ page }) => setCurrentPage(page)}
          pageNumber={currentPage}
          pageSize={procedurePageSize}
          totalItems={totalCount}
          dashboardLinkUrl={pageUrl}
          dashboardLinkLabel={urlLabel}
        />
      </div>
    );
  }

  return <EmptyCard displayText={displayText} headerTitle={headerTitle} launchForm={launchProceduresForm} />;
};

export default ProceduresOverview;
