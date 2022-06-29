import React from 'react';
import Add16 from '@carbon/icons-react/es/add/16';
import Edit16 from '@carbon/icons-react/es/edit/16';
import filter from 'lodash-es/filter';
import includes from 'lodash-es/includes';
import map from 'lodash-es/map';
import styles from './programs-detailed-summary.scss';
import { CardHeader, EmptyState, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { useAvailablePrograms, useEnrollments } from './programs.resource';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  DataTableHeader,
  DataTableRow,
  InlineNotification,
} from 'carbon-components-react';
import { formatDate, formatDatetime } from '@openmrs/esm-framework';

interface ProgramsDetailedSummaryProps {
  patientUuid: string;
}

const ProgramsDetailedSummary: React.FC<ProgramsDetailedSummaryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const displayText = t('programEnrollments', 'Program enrollments');
  const headerTitle = t('carePrograms', 'Care Programs');

  const { data: enrollments, isError, isLoading, isValidating } = useEnrollments(patientUuid);
  const { data: availablePrograms } = useAvailablePrograms();
  const eligiblePrograms = filter(
    availablePrograms,
    (program) => !includes(map(enrollments, 'program.uuid'), program.uuid),
  );

  const tableHeaders: Array<DataTableHeader> = React.useMemo(
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
      {
        key: 'actions',
        header: t('actions', 'Actions'),
      },
    ],
    [t],
  );

  const tableRows: Array<DataTableRow> = React.useMemo(() => {
    return enrollments?.map((program) => {
      return {
        id: program.uuid,
        display: program.display,
        location: program.location?.display,
        dateEnrolled: formatDatetime(new Date(program.dateEnrolled)),
        status: program.dateCompleted
          ? `${t('completedOn', 'Completed On')} ${formatDate(new Date(program.dateCompleted))}`
          : t('active', 'Active'),
        actions: <ProgramEditButton programEnrollmentId={program.uuid} />,
      };
    });
  }, [enrollments, t]);

  const launchProgramsForm = React.useCallback(() => launchPatientWorkspace('programs-form-workspace'), []);

  if (isLoading) return <DataTableSkeleton role="progressbar" />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (enrollments?.length) {
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
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchProgramsForm} />;
};

interface ProgramEditButtonProps {
  programEnrollmentId: string;
}

function ProgramEditButton({ programEnrollmentId }: ProgramEditButtonProps) {
  const launchEditProgramsForm = React.useCallback(
    () => launchPatientWorkspace('programs-form-workspace', { programEnrollmentId }),
    [],
  );

  return (
    <Button
      kind="ghost"
      renderIcon={Edit16}
      iconDescription="Edit Program"
      onClick={launchEditProgramsForm}
      hasIconOnly
    />
  );
}

export default ProgramsDetailedSummary;
