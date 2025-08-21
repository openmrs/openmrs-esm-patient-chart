import React, { type ComponentProps, useCallback } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  InlineNotification,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { CardHeader, EmptyState, ErrorState, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import {
  AddIcon,
  type ConfigObject,
  formatDate,
  formatDatetime,
  launchWorkspace,
  useConfig,
  useLayoutType,
  usePagination,
  isDesktop as desktopLayout,
} from '@openmrs/esm-framework';
import { type ConfigurableProgram } from '../types';
import { findLastState, usePrograms } from './programs.resource';
import { ProgramsActionMenu } from './programs-action-menu.component';
import styles from './programs-overview.scss';

interface ProgramsOverviewProps {
  basePath: string;
  patientUuid: string;
}

const ProgramsOverview: React.FC<ProgramsOverviewProps> = ({ basePath, patientUuid }) => {
  const programsCount = 5;
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const displayText = t('programs', 'Program enrollments');
  const headerTitle = t('carePrograms', 'Care Programs');
  const urlLabel = t('seeAll', 'See all');
  const pageUrl = `\${openmrsSpaBase}/patient/${patientUuid}/chart/Programs`;
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = desktopLayout(layout);

  const { activeEnrollments, availablePrograms, eligiblePrograms, enrollments, error, isLoading, isValidating } =
    usePrograms(patientUuid);

  const { results: paginatedEnrollments, goTo, currentPage } = usePagination(enrollments ?? [], programsCount);

  const launchProgramsForm = useCallback(() => launchWorkspace('programs-form-workspace'), []);

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
      key: 'state',
      header: t('state', 'State'),
    },
    {
      key: 'actions',
      header: t('actions', 'Actions'),
    },
  ];

  const tableRows = React.useMemo(() => {
    return paginatedEnrollments?.map((enrollment: ConfigurableProgram) => {
      const state = enrollment ? findLastState(enrollment.states) : null;
      return {
        id: enrollment.uuid,
        display: enrollment.display,
        location: enrollment.location?.display ?? '--',
        dateEnrolled: enrollment.dateEnrolled ? formatDatetime(new Date(enrollment.dateEnrolled)) : '--',
        status: enrollment.dateCompleted
          ? `${t('completedOn', 'Completed On')} ${formatDate(new Date(enrollment.dateCompleted))}`
          : t('active', 'Active'),
        state: state ? state.state.concept.display : '--',
      };
    });
  }, [paginatedEnrollments, t]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (activeEnrollments?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          {config.hideAddProgramButton ? null : (
            <Button
              kind="ghost"
              renderIcon={(props: ComponentProps<typeof AddIcon>) => <AddIcon size={16} {...props} />}
              iconDescription="Add programs"
              onClick={launchProgramsForm}
              disabled={availablePrograms?.length && eligiblePrograms?.length === 0}
            >
              {t('add', 'Add')}
            </Button>
          )}
        </CardHeader>
        {availablePrograms?.length && eligiblePrograms?.length === 0 && (
          <InlineNotification
            style={{ minWidth: '100%', margin: '0', padding: '0' }}
            kind={'info'}
            lowContrast
            subtitle={t('noEligibleEnrollments', 'There are no more programs left to enroll this patient in')}
            title={t('fullyEnrolled', 'Enrolled in all programs')}
          />
        )}
        <DataTable rows={tableRows} headers={tableHeaders} isSortable size={isTablet ? 'lg' : 'sm'} useZebraStyles>
          {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
            <TableContainer>
              <Table aria-label="programs overview" {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        className={classNames(styles.productiveHeading01, styles.text02)}
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
                  {rows.map((row, i) => (
                    <TableRow key={row.id} {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                      ))}
                      <TableCell className="cds--table-column-menu">
                        <ProgramsActionMenu
                          patientUuid={patientUuid}
                          programEnrollmentId={activeEnrollments[i]?.uuid}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
        <PatientChartPagination
          currentItems={paginatedEnrollments.length}
          onPageNumberChange={({ page }) => goTo(page)}
          pageNumber={currentPage}
          pageSize={programsCount}
          totalItems={enrollments?.length}
          dashboardLinkUrl={pageUrl}
          dashboardLinkLabel={urlLabel}
        />
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchProgramsForm} />;
};

export default ProgramsOverview;
