import React, { useCallback, type ComponentProps } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@carbon/react';
import {
  AddIcon,
  launchWorkspace,
  type ConfigObject,
  useConfig,
  useLayoutType,
  usePagination,
  useVisit,
} from '@openmrs/esm-framework';
import { CardHeader, EmptyState, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useProcedures } from '../../hooks/useProcedures';
import styles from './procedures-history.scss';

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
  const config = useConfig<ConfigObject>();
  const { currentVisit } = useVisit(patientUuid);
  const { procedures, mutate } = useProcedures(patientUuid);

  const launchProceduresForm = useCallback(() => {
    if (!currentVisit) {
      launchStartVisitPrompt();
      return;
    }

    launchWorkspace('patient-form-entry-workspace', {
      workspaceTitle: t('recordProcedure', 'Record a procedure'),
      mutateForm: mutate,
      formInfo: {
        formUuid: config.procedureFormUuid,
      },
    });
  }, [currentVisit, config.procedureFormUuid, launchStartVisitPrompt, mutate, t]);

  const headers = [
    { key: 'procedure', header: t('procedure', 'Procedure') },
    { key: 'year', header: t('date', 'Date') },
  ];

  const tableRows = procedures.map((procedure) => ({
    id: procedure.id,
    procedure: procedure.procedure,
    date: procedure.date,
  }));

  const { results: paginatedRows, currentPage, goTo } = usePagination(tableRows || [], pageSize);
  const showPagination = (tableRows?.length || 0) > pageSize;

  if (procedures.length === 0) {
    return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchProceduresForm} />;
  }

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={headerTitle}>
        <Button
          data-testid="add-procedures-button"
          iconDescription={t('addProcedures', 'Add procedures')}
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
                {headers.map((header) => (
                  <TableHeader key={header.key}>{header.header}</TableHeader>
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
};

export default ProceduresHistory;
