import React from 'react';
import dayjs from 'dayjs';
import Add16 from '@carbon/icons-react/es/add/16';
import styles from './programs-detailed-summary.scss';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { attach } from '@openmrs/esm-framework';
import { useEnrollments } from './programs.resource';
import { useProgramsContext } from './programs.context';
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
} from 'carbon-components-react';

interface ProgramsDetailedSummaryProps {}

const ProgramsDetailedSummary: React.FC<ProgramsDetailedSummaryProps> = () => {
  const { t } = useTranslation();
  const { patientUuid } = useProgramsContext();
  const displayText = t('programEnrollments', 'Program enrollments');
  const headerTitle = t('carePrograms', 'Care Programs');

  const { data: enrolledPrograms, isError, isLoading, isValidating } = useEnrollments(patientUuid);

  const tableHeaders: Array<DataTableHeader> = React.useMemo(
    () => [
      {
        key: 'display',
        header: t('activePrograms', 'Active programs'),
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

  const tableRows: Array<DataTableRow> = React.useMemo(() => {
    return enrolledPrograms?.map((program) => {
      return {
        id: program.uuid,
        display: program.display,
        dateEnrolled: dayjs(program.dateEnrolled).format('MMM-YYYY'),
        status: program.dateCompleted
          ? `${t('completedOn', 'Completed On')} ${dayjs(program.dateCompleted).format('MMM-YYYY')}`
          : t('active', 'Active'),
      };
    });
  }, [enrolledPrograms, t]);

  const launchProgramsForm = React.useCallback(
    () => attach('patient-chart-workspace-slot', 'programs-form-workspace'),
    [],
  );

  if (isLoading) return <DataTableSkeleton role="progressbar" />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (enrolledPrograms?.length) {
    return (
      <div className={styles.widgetCard}>
        <div className={styles.programsHeader}>
          <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <Button kind="ghost" renderIcon={Add16} iconDescription="Add programs" onClick={launchProgramsForm}>
            {t('add', 'Add')}
          </Button>
        </div>
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
                        })}>
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

export default ProgramsDetailedSummary;
