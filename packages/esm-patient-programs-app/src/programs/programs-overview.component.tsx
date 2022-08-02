import React from 'react';
import Add16 from '@carbon/icons-react/es/add/16';
import styles from './programs-overview.scss';
import { formatDate, formatDatetime, useConfig, usePagination } from '@openmrs/esm-framework';
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
import {
  CardHeader,
  EmptyState,
  ErrorState,
  PatientChartPagination,
  launchPatientWorkspace,
} from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { usePrograms } from './programs.resource';
import { ConfigObject } from '../config-schema';
import { capitalize } from 'lodash';
import ProgramActionButton from './program-action-button/program-action-button.component';
import { ConfigurableProgram } from '../types';

interface ProgramsOverviewProps {
  basePath: string;
  patientUuid: string;
}

const ProgramsOverview: React.FC<ProgramsOverviewProps> = ({ basePath, patientUuid }) => {
  const programsCount = 5;
  const config = useConfig() as ConfigObject;
  const { t } = useTranslation();
  const displayText = t('programs', 'Program enrollments');
  const headerTitle = t('carePrograms', 'Care Programs');
  const urlLabel = t('seeAll', 'See all');
  const pageUrl = window.spaBase + basePath + '/programs';
  const isConfigurable = config.customUrl ? true : false;

  const {
    enrollments,
    isLoading,
    isError,
    activeEnrollments,
    isValidating,
    availablePrograms,
    eligiblePrograms,
    configurablePrograms,
  } = usePrograms(patientUuid);

  const {
    results: paginatedEnrollments,
    goTo,
    currentPage,
  } = usePagination(isConfigurable ? configurablePrograms : enrollments ?? [], programsCount);

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
    {
      key: 'actions',
      header: t('actions', 'Actions'),
    },
  ];

  const tableRows = React.useMemo(() => {
    return paginatedEnrollments?.map((enrollment: ConfigurableProgram) => ({
      id: enrollment.uuid,
      display: enrollment.display,
      location: enrollment.location?.display,
      dateEnrolled: enrollment.dateEnrolled ? formatDatetime(new Date(enrollment.dateEnrolled)) : '--',
      status: isConfigurable
        ? capitalize(enrollment.enrollmentStatus)
        : enrollment.dateCompleted
        ? `${t('completedOn', 'Completed On')} ${formatDate(new Date(enrollment.dateCompleted))}`
        : t('active', 'Active'),
      actions: <ProgramActionButton enrollment={enrollment} />,
    }));
  }, [isConfigurable, paginatedEnrollments, t]);

  if (isLoading) return <DataTableSkeleton role="progressbar" />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (isConfigurable ? configurablePrograms.length : activeEnrollments?.length) {
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
              lowContrast
              subtitle={t('noEligibleEnrollments', 'There are no more programs left to enroll this patient in')}
              title={t('fullyEnrolled', 'Enrolled in all programs')}
            />
          )}
          <DataTable
            rows={tableRows}
            headers={isConfigurable ? tableHeaders : tableHeaders.filter((header) => header.key !== 'actions')}
            isSortable={true}
            size="short"
          >
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
          pageSize={programsCount}
          totalItems={isConfigurable ? configurablePrograms.length : enrollments?.length}
          dashboardLinkUrl={pageUrl}
          dashboardLinkLabel={urlLabel}
        />
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchProgramsForm} />;
};

export default ProgramsOverview;
