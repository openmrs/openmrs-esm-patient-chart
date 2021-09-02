import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import styles from './programs-detailed-summary.scss';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { attach, createErrorHandler } from '@openmrs/esm-framework';
import { fetchEnrolledPrograms } from './programs.resource';
import { useProgramsContext } from './programs.context';
import { PatientProgram } from '../types';
import DataTable, {
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  DataTableHeader,
  DataTableRow,
} from 'carbon-components-react/es/components/DataTable';
import Button from 'carbon-components-react/es/components/Button';
import Add16 from '@carbon/icons-react/es/add/16';
import DataTableSkeleton from 'carbon-components-react/lib/components/DataTableSkeleton/DataTableSkeleton';

interface ProgramsDetailedSummaryProps {}

const ProgramsDetailedSummary: React.FC<ProgramsDetailedSummaryProps> = () => {
  const { t } = useTranslation();
  const displayText = t('programEnrollments', 'Program enrollments');
  const headerTitle = t('carePrograms', 'Care Programs');
  const [enrolledPrograms, setEnrolledPrograms] = useState<Array<PatientProgram>>(null);
  const { patientUuid } = useProgramsContext();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patientUuid) {
      const subscription = fetchEnrolledPrograms(patientUuid).subscribe(
        (enrolledPrograms) => setEnrolledPrograms(enrolledPrograms),
        setError,
      );
      return () => subscription.unsubscribe();
    }
  }, [patientUuid]);

  const tableHeader: Array<DataTableHeader> = useMemo(
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

  const tableRows: Array<DataTableRow> = useMemo(() => {
    return enrolledPrograms?.map((programs) => {
      return {
        id: programs.uuid,
        display: programs.display,
        dateEnrolled: dayjs(programs.dateEnrolled).format('MMM-YYYY'),
        status: programs.dateCompleted
          ? `${t('completedOn', 'Completed On')} ${dayjs(programs.dateCompleted).format('MMM-YYYY')}`
          : t('active', 'Active'),
      };
    });
  }, [enrolledPrograms, t]);

  const launchProgramsForm = React.useCallback(
    () => attach('patient-chart-workspace-slot', 'programs-form-workspace'),
    [],
  );

  const RenderPrograms = () => {
    return (
      <>
        {enrolledPrograms?.length ? (
          <>
            <div className={styles.programsHeader}>
              <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
              <Button kind="ghost" renderIcon={Add16} iconDescription="Add programs" onClick={launchProgramsForm}>
                {t('add', 'Add')}
              </Button>
            </div>

            <TableContainer>
              <DataTable rows={tableRows} headers={tableHeader} isSortable={true} size="short">
                {({ rows, headers, getHeaderProps, getTableProps }) => (
                  <Table {...getTableProps()}>
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
          </>
        ) : (
          <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchProgramsForm} />
        )}
      </>
    );
  };

  return (
    <>
      {enrolledPrograms ? (
        <RenderPrograms />
      ) : error ? (
        <ErrorState error={error} headerTitle={headerTitle} />
      ) : (
        <DataTableSkeleton rowCount={5} />
      )}
    </>
  );
};

export default ProgramsDetailedSummary;
