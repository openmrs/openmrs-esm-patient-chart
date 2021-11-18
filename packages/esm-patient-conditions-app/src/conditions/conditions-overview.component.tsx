import React from 'react';
import dayjs from 'dayjs';
import {
  DataTable,
  DataTableSkeleton,
  Button,
  InlineLoading,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react';
import Add16 from '@carbon/icons-react/es/add/16';
import styles from './conditions-overview.scss';
import { usePagination } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useConditions } from './conditions.resource';
import {
  EmptyState,
  ErrorState,
  PatientChartPagination,
  launchPatientWorkspace,
  CardHeader,
} from '@openmrs/esm-patient-common-lib';

const conditionsToShowCount = 5;

interface ConditionsOverviewProps {
  basePath: string;
  patient: fhir.Patient;
}

const ConditionsOverview: React.FC<ConditionsOverviewProps> = ({ patient, basePath }) => {
  const { t } = useTranslation();
  const displayText = t('conditions', 'Conditions');
  const headerTitle = t('conditions', 'Conditions');
  const urlLabel = t('seeAll', 'See all');
  const pageUrl = window.spaBase + basePath + '/conditions';

  const { data: conditions, isError, isLoading, isValidating } = useConditions(patient.id);
  const { results: paginatedConditions, goTo, currentPage } = usePagination(conditions ?? [], conditionsToShowCount);

  const launchConditionsForm = React.useCallback(() => launchPatientWorkspace('conditions-form-workspace'), []);
  const tableHeaders = [
    {
      key: 'display',
      header: t('activeConditions', 'Active Conditions'),
    },
    {
      key: 'onsetDateTime',
      header: t('since', 'Since'),
    },
  ];

  const tableRows = React.useMemo(() => {
    return paginatedConditions?.map((condition) => ({
      ...condition,
      onsetDateTime: dayjs(condition.onsetDateTime).format('MMM-YYYY'),
    }));
  }, [paginatedConditions]);

  if (isLoading) return <DataTableSkeleton role="progressbar" />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (conditions?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <Button kind="ghost" renderIcon={Add16} iconDescription="Add conditions" onClick={launchConditionsForm}>
            {t('add', 'Add')}
          </Button>
        </CardHeader>
        <TableContainer>
          <DataTable rows={tableRows} headers={tableHeaders} isSortable={true} size="short">
            {({ rows, headers, getHeaderProps, getTableProps }) => (
              <Table {...getTableProps()} useZebraStyles>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        className={`${styles.productiveHeading01} ${styles.text02}`}
                        {...getHeaderProps({
                          header,
                          isSortable: header.isSortable,
                        })}
                      >
                        {header.header?.content ?? header.header}
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
            )}
          </DataTable>
        </TableContainer>
        <PatientChartPagination
          currentItems={paginatedConditions.length}
          onPageNumberChange={({ page }) => goTo(page)}
          pageNumber={currentPage}
          pageSize={conditionsToShowCount}
          pageUrl={pageUrl}
          totalItems={conditions.length}
          urlLabel={urlLabel}
        />
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchConditionsForm} />;
};

export default ConditionsOverview;
