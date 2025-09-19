import {
  AddIcon,
  launchWorkspace,
  useVisit,
  useLayoutType,
  usePagination,
  type ConfigObject,
  useConfig,
} from '@openmrs/esm-framework';
import { EmptyState, PatientChartPagination, CardHeader } from '@openmrs/esm-patient-common-lib';
import React, { useCallback, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader, Button } from '@carbon/react';
import styles from './procedures-history.scss';
import { useProcedures } from '../../hooks/useProcedures';
import { mutate } from 'swr';
import dayjs from 'dayjs';

interface ProceduresHistoryProps {
  patientUuid: string;
  launchStartVisitPrompt: () => void;
}

const ProceduresHistory: React.FC<ProceduresHistoryProps> = ({ patientUuid, launchStartVisitPrompt }) => {
  const { t } = useTranslation();
  const displayText = t('procedures__lower', 'procedures');
  const headerTitle = t('procedures', 'Procedures');
  const pageSize = 5;
  const isTablet = useLayoutType() === 'tablet';
  const { currentVisit } = useVisit(patientUuid);

  const config = useConfig<ConfigObject>();

  const procedureData = useProcedures(patientUuid, config.procedureEncounterType);

  const launchProceduresForm = useCallback(() => {
    if (!currentVisit) {
      launchStartVisitPrompt();
      return;
    }
    launchWorkspace('patient-form-entry-workspace', {
      workspaceTitle: 'Record a Procedure',
      mutateForm: () => {
        mutate((key) => true, undefined, {
          revalidate: true,
        });
      },
      formInfo: {
        formUuid: config.procedureFormUuid,
      },
    });
  }, [currentVisit, launchStartVisitPrompt, config.procedureFormUuid]);

  const headers = [
    { key: 'procedure', header: t('procedure', 'Procedure') },
    { key: 'year', header: t('date', 'Date') },
  ];

  const tableRows = procedureData.procedures.map((procedure) => ({
    id: procedure.id,
    procedure: procedure.procedure,
    date: procedure.date,
  }));

  const { results: paginatedRows, currentPage, goTo } = usePagination(tableRows || [], pageSize);
  const showPagination = (tableRows?.length || 0) > pageSize;

  if (procedureData.procedures.length === 0) {
    return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchProceduresForm} />;
  }

  if (procedureData.procedures.length !== 0) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <Button
            data-testid="add-procedures-button"
            iconDescription={t('addProcedures', 'Add Procedures')}
            kind="ghost"
            renderIcon={(props: ComponentProps<typeof AddIcon>) => <AddIcon size={16} {...props} />}
            onClick={launchProceduresForm}
          >
            {t('add', 'Add')}
          </Button>
        </CardHeader>
        <div className={styles.content}>
          <div>
            <Table
              aria-label={t('proceduresHistory', 'Procedures history')}
              className={styles.table}
              size={isTablet ? 'md' : 'sm'}
              useZebraStyles
            >
              <TableHead>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableHeader key={header.key} className={index === 0 ? styles.vaccineNameCell : undefined}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows?.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div>{row.procedure}</div>
                    </TableCell>
                    <TableCell>{dayjs(row.date).format('YYYY-MM-DD')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {showPagination ? (
              <div className={styles.paginationContainer}>
                <PatientChartPagination
                  currentItems={paginatedRows?.length || 0}
                  onPageNumberChange={({ page }) => goTo(page)}
                  pageNumber={currentPage}
                  pageSize={pageSize}
                  totalItems={tableRows?.length || 0}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
};

export default ProceduresHistory;
