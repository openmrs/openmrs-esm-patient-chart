import React from 'react';
import dayjs from 'dayjs';
import Add16 from '@carbon/icons-react/es/add/16';
import styles from './immunizations-overview.scss';
import {
  Button,
  DataTableSkeleton,
  DataTable,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  InlineLoading,
} from 'carbon-components-react';
import {
  EmptyState,
  ErrorState,
  launchPatientWorkspace,
  PatientChartPagination,
} from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { useImmunizations } from './immunizations.resource';
import { useLayoutType, usePagination } from '@openmrs/esm-framework';

export interface ImmunizationsOverviewProps {
  basePath: string;
  patient: fhir.Patient;
  patientUuid: string;
}

const ImmunizationsOverview: React.FC<ImmunizationsOverviewProps> = ({ patient, patientUuid, basePath }) => {
  const { t } = useTranslation();
  const immunizationsToShowCount = 5;
  const displayText = t('immunizations', 'immunizations');
  const headerTitle = t('immunizations', 'Immunizations');
  const urlLabel = t('seeAll', 'See all');
  const pageUrl = window.spaBase + basePath + '/immunizations';
  const isTablet = useLayoutType() === 'tablet';

  const { data: immunizations, isError, isLoading, isValidating } = useImmunizations(patientUuid);
  const {
    results: paginatedImmunizations,
    goTo,
    currentPage,
  } = usePagination(immunizations ?? [], immunizationsToShowCount);

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
      vaccinationDate: `${dayjs(immunization.existingDoses[0].occurrenceDateTime).format('MMM-YYYY')}`,
    }));
  }, [paginatedImmunizations]);

  if (isLoading) return <DataTableSkeleton role="progressbar" />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (immunizations?.length) {
    return (
      <div className={styles.widgetCard}>
        <div className={isTablet ? styles.tabletHeader : styles.desktopHeader}>
          <h4>{headerTitle}</h4>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <Button kind="ghost" renderIcon={Add16} iconDescription="Add immunizations" onClick={launchImmunizationsForm}>
            {t('add', 'Add')}
          </Button>
        </div>
        <TableContainer>
          <DataTable headers={tableHeaders} rows={tableRows} isSortable={true} size="short">
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
          currentItems={paginatedImmunizations.length}
          onPageNumberChange={({ page }) => goTo(page)}
          pageNumber={currentPage}
          pageSize={immunizationsToShowCount}
          pageUrl={pageUrl}
          totalItems={immunizations.length}
          urlLabel={urlLabel}
        />
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchImmunizationsForm} />;
};

export default ImmunizationsOverview;
