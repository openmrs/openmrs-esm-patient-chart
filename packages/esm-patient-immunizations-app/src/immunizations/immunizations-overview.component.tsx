import React from 'react';
import classNames from 'classnames';
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
import { Add } from '@carbon/react/icons';
import {
  launchPatientWorkspace,
  CardHeader,
  EmptyState,
  ErrorState,
  PatientChartPagination,
} from '@openmrs/esm-patient-common-lib';
import { formatDate, parseDate, usePagination } from '@openmrs/esm-framework';
import styles from './immunizations-overview.scss';
import { useImmunizations } from '../hooks/useImmunizations';

export interface ImmunizationsOverviewProps {
  basePath: string;
  patient: fhir.Patient;
  patientUuid: string;
}

const ImmunizationsOverview: React.FC<ImmunizationsOverviewProps> = ({ patient, patientUuid, basePath }) => {
  const { t } = useTranslation();
  const immunizationsCount = 5;
  const displayText = t('immunizations__lower', 'immunizations');
  const headerTitle = t('immunizations', 'Immunizations');
  const urlLabel = t('seeAll', 'See all');
  const pageUrl = window.spaBase + basePath + '/immunizations';

  const { data: immunizations, error, isLoading, isValidating } = useImmunizations(patientUuid);
  const { results: paginatedImmunizations, goTo, currentPage } = usePagination(immunizations ?? [], immunizationsCount);

  const launchImmunizationsForm = React.useCallback(() => launchPatientWorkspace('immunization-form-workspace'), []);

  const tableHeaders = [
    {
      key: 'vaccineName',
      header: t('recentVaccination', 'Recent vaccination'),
    },
    {
      key: 'vaccinationDate',
      header: t('vaccinationDate', 'Vaccination date'),
    },
  ];

  const tableRows = React.useMemo(() => {
    return paginatedImmunizations?.map((immunization, index) => ({
      ...immunization,
      id: `${index}`,
      vaccineName: immunization.vaccineName,
      vaccinationDate: `${formatDate(parseDate(immunization.existingDoses[0].occurrenceDateTime), {
        day: false,
        time: false,
      })}`,
    }));
  }, [paginatedImmunizations]);

  if (isLoading) return <DataTableSkeleton role="progressbar" />;
  if (error) return <ErrorState error={error} headerTitle={headerTitle} />;
  if (immunizations?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription="Add immunizations"
            onClick={launchImmunizationsForm}
          >
            {t('add', 'Add')}
          </Button>
        </CardHeader>
        <DataTable headers={tableHeaders} rows={tableRows} isSortable size="sm" useZebraStyles>
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <TableContainer>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        className={classNames(styles.productiveHeading01, styles.text02)}
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
            </TableContainer>
          )}
        </DataTable>
        <PatientChartPagination
          currentItems={paginatedImmunizations.length}
          onPageNumberChange={({ page }) => goTo(page)}
          pageNumber={currentPage}
          pageSize={immunizationsCount}
          totalItems={immunizations.length}
          dashboardLinkUrl={pageUrl}
          dashboardLinkLabel={urlLabel}
        />
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchImmunizationsForm} />;
};

export default ImmunizationsOverview;
