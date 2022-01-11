import React from 'react';
import dayjs from 'dayjs';
import Add16 from '@carbon/icons-react/es/add/16';
import styles from './programs-overview.scss';
import { formatDate, formatDatetime, usePagination } from '@openmrs/esm-framework';
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
  InlineNotification,
} from 'carbon-components-react';
import filter from 'lodash-es/filter';
import includes from 'lodash-es/includes';
import map from 'lodash-es/map';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  PatientChartPagination,
  launchPatientWorkspace,
} from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { useAvailablePrograms, useEnrollments } from './programs.resource';

const programsToShowCount = 5;

interface ProgramsOverviewProps {
  basePath: string;
  patientUuid: string;
}

const ProgramsOverview: React.FC<ProgramsOverviewProps> = ({ patientUuid, basePath }) => {
  const { t } = useTranslation();
  const displayText = t('programs', 'Program enrollments');
  const headerTitle = t('carePrograms', 'Care Programs');
  const urlLabel = t('seeAll', 'See all');
  const pageUrl = window.spaBase + basePath + '/programs';

  const { data: enrollments, isError, isLoading, isValidating } = useEnrollments(patientUuid);
  const activeEnrollments = enrollments?.filter((enrollment) => !enrollment.dateCompleted);

  const { data: availablePrograms } = useAvailablePrograms();

  const eligiblePrograms = filter(
    availablePrograms,
    (program) => !includes(map(enrollments, 'program.uuid'), program.uuid),
  );

  const {
    results: paginatedEnrollments,
    goTo,
    currentPage,
  } = usePagination(activeEnrollments ?? [], programsToShowCount);

  const launchProgramsForm = React.useCallback(() => launchPatientWorkspace('programs-form-workspace'), []);

  const tableHeaders = [
    {
      key: 'display',
      header: t('activePrograms', 'Active programs'),
    },
    {
      key: 'location',
      header: t('location', 'Location'),
    },
    {
      key: 'dateEnrolled',
      header: t('dateEnrolled', 'Date enrolled'),
    },
    {
      key: 'status',
      header: t('status', 'Status'),
    },
  ];

  const tableRows = React.useMemo(() => {
    return paginatedEnrollments?.map((enrollment) => ({
      id: enrollment.uuid,
      display: enrollment.display,
      location: enrollment.location?.display,
      dateEnrolled: formatDatetime(new Date(enrollment.dateEnrolled)),
      status: enrollment.dateCompleted
        ? `${t('completedOn', 'Completed On')} ${formatDate(new Date(enrollment.dateCompleted))}`
        : t('active', 'Active'),
    }));
  }, [paginatedEnrollments, t]);

  if (isLoading) return <DataTableSkeleton role="progressbar" />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (activeEnrollments?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <Button
            kind="ghost"
            renderIcon={Add16}
            iconDescription="Add programs"
            onClick={launchProgramsForm}
            disabled={availablePrograms?.length && eligiblePrograms?.length === 0}
          >
            {t('add', 'Add')}
          </Button>
        </CardHeader>
        <TableContainer>
          {availablePrograms?.length && eligiblePrograms?.length === 0 && (
            <InlineNotification
              style={{ minWidth: '100%', margin: '0rem', padding: '0rem' }}
              kind={'info'}
              lowContrast={true}
              subtitle={t('noEligibleEnrollments', 'There are no more programs left to enroll this patient in')}
              title={t('fullyEnrolled', 'Enrolled in all programs')}
            />
          )}
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
          currentItems={paginatedEnrollments.length}
          onPageNumberChange={({ page }) => goTo(page)}
          pageNumber={currentPage}
          pageSize={programsToShowCount}
          pageUrl={pageUrl}
          totalItems={activeEnrollments.length}
          urlLabel={urlLabel}
        />
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchProgramsForm} />;
};

export default ProgramsOverview;
