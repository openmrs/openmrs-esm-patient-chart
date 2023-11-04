import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableHeader,
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
import { Add, Edit } from '@carbon/react/icons';
import {
  formatDate,
  formatDatetime,
  useConfig,
  ConfigObject,
  useLayoutType,
  isDesktop as desktopLayout,
} from '@openmrs/esm-framework';
import { CardHeader, EmptyState, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { usePrograms } from './programs.resource';
import styles from './programs-detailed-summary.scss';

interface ProgramsDetailedSummaryProps {
  patientUuid: string;
}

interface ProgramEditButtonProps {
  programEnrollmentId: string;
}

const ProgramsDetailedSummary: React.FC<ProgramsDetailedSummaryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = desktopLayout(layout);
  const { hideAddProgramButton } = useConfig<ConfigObject>();
  const displayText = t('programEnrollments', 'Program enrollments');
  const headerTitle = t('carePrograms', 'Care Programs');

  const { enrollments, isLoading, isError, isValidating, availablePrograms, eligiblePrograms } =
    usePrograms(patientUuid);

  const tableHeaders: Array<typeof DataTableHeader> = useMemo(
    () => [
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
    ],
    [t],
  );

  const tableRows = useMemo(() => {
    return enrollments?.map((program) => {
      return {
        id: program.uuid,
        display: program.display,
        location: program.location?.display ?? '--',
        dateEnrolled: formatDatetime(new Date(program.dateEnrolled)),
        status: program.dateCompleted
          ? `${t('completedOn', 'Completed On')} ${formatDate(new Date(program.dateCompleted))}`
          : t('active', 'Active'),
      };
    });
  }, [enrollments, t]);

  const launchProgramsForm = useCallback(() => launchPatientWorkspace('programs-form-workspace'), []);

  if (isLoading) return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (enrollments?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          {hideAddProgramButton ? null : (
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              iconDescription="Add programs"
              onClick={launchProgramsForm}
              disabled={availablePrograms?.length && eligiblePrograms?.length === 0}
            >
              {t('add', 'Add')}
            </Button>
          )}
        </CardHeader>
        {availablePrograms?.length && eligiblePrograms?.length === 0 ? (
          <InlineNotification
            style={{ minWidth: '100%', margin: '0rem', padding: '0rem' }}
            kind={'info'}
            lowContrast
            subtitle={t('noEligibleEnrollments', 'There are no more programs left to enroll this patient in')}
            title={t('fullyEnrolled', 'Enrolled in all programs')}
          />
        ) : null}
        <DataTable rows={tableRows} headers={tableHeaders} isSortable size={isTablet ? 'lg' : 'sm'} useZebraStyles>
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
                    <TableHeader />
                  </TableRow>
                </TableHead>
                <TableBody data-testid="program-table">
                  {rows.map((row, i) => (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                      ))}
                      <TableCell className="cds--table-column-menu">
                        <ProgramEditButton programEnrollmentId={enrollments[i]?.uuid} />
                      </TableCell>
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
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchProgramsForm} />;
};

function ProgramEditButton({ programEnrollmentId }: ProgramEditButtonProps) {
  const isTablet = useLayoutType() === 'tablet';
  const { t } = useTranslation();
  const launchEditProgramsForm = React.useCallback(
    () => launchPatientWorkspace('programs-form-workspace', { programEnrollmentId }),
    [programEnrollmentId],
  );

  return (
    <Button
      kind="ghost"
      renderIcon={(props) => <Edit size={16} {...props} />}
      iconDescription={t('editProgram', 'Edit Program')}
      onClick={launchEditProgramsForm}
      hasIconOnly
      tooltipPosition="left"
      size={isTablet ? 'lg' : 'sm'}
      data-testid="edit-program-button"
    />
  );
}

export default ProgramsDetailedSummary;
