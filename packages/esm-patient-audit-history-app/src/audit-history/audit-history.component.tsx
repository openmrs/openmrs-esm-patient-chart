import React, { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Layer,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import {
  type FetchError,
  isDesktop,
  useConfig,
  useLayoutType,
  useSession,
  userHasAccess,
} from '@openmrs/esm-framework';
import { CardHeader, EmptyState, ErrorState, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';
import { DEFAULT_PAGE_SIZE, getVisibleChanges, isFullSnapshot } from '../constants';
import { usePatientAuditHistory } from './audit-history.resource';
import AuditLogDiff from './audit-log-diff.component';
import AuditLogEventTag from './audit-log-event-tag.component';
import { formatRevisionDatetime } from './audit-log-format';
import styles from './audit-history.scss';

interface AuditHistoryProps {
  patientUuid: string;
  patient?: fhir.Patient;
}

const AuditHistory: React.FC<AuditHistoryProps> = ({ patientUuid, patient }) => {
  const { t } = useTranslation();
  const session = useSession();
  const { viewPrivilege, auditHistoryPageSize } = useConfig<ConfigObject>();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const headerTitle = t('auditHistory', 'Audit history');

  const resolvedPatientUuid = patientUuid ?? patient?.id ?? '';
  const pageSize = auditHistoryPageSize ?? DEFAULT_PAGE_SIZE;
  const hasAccess = !viewPrivilege || !session || userHasAccess(viewPrivilege, session.user);

  const [page, setPage] = useState(1);

  const { logs, totalLogs, isLoading, isValidating, error, mutate } = usePatientAuditHistory(
    hasAccess ? resolvedPatientUuid : '',
    page - 1,
    pageSize,
  );

  const tableHeaders = useMemo(
    () => [
      { key: 'changedOn', header: t('dateTime', 'Date & time') },
      { key: 'eventType', header: t('event', 'Event') },
      { key: 'changedBy', header: t('changedBy', 'Changed by') },
      { key: 'changesCount', header: t('changes', 'Changes') },
    ],
    [t],
  );

  const { tableRows, originalById } = useMemo(() => {
    const occurrences = new Map<string, number>();
    const rows = logs.map((log) => {
      const baseKey = `${log.revisionID}-${log.changedOn}`;
      const occurrence = occurrences.get(baseKey) ?? 0;
      occurrences.set(baseKey, occurrence + 1);
      const id = occurrence === 0 ? baseKey : `${baseKey}-${occurrence}`;
      const visibleChanges = getVisibleChanges(log.changes ?? []);
      const changeCount = visibleChanges.length + (log.relatedEntities?.length ?? 0);
      return {
        id,
        changedOn: log.changedOn,
        eventType: log.eventType,
        changedBy: log.changedBy || t('unknownUser', 'Unknown'),
        changesCount: isFullSnapshot(visibleChanges) ? t('newRecord', 'New record') : String(changeCount),
        _original: log,
      };
    });
    return {
      tableRows: rows,
      originalById: new Map(rows.map((row) => [row.id, row._original])),
    };
  }, [logs, t]);

  if (!hasAccess) {
    return (
      <Layer>
        <Tile className={styles.messageTile}>
          <p>{t('noPermission', "You do not have permission to view this patient's audit history.")}</p>
        </Tile>
      </Layer>
    );
  }

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" compact={isDesktop(layout)} zebra />;
  }

  if (error) {
    if ((error as unknown as FetchError)?.response?.status === 404) {
      return (
        <Layer>
          <Tile className={styles.messageTile}>
            <p>
              {t(
                'moduleNotInstalled',
                'The auditlogweb module is not installed or does not support patient audit history.',
              )}
            </p>
          </Tile>
        </Layer>
      );
    }
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (logs.length === 0) {
    return <EmptyState displayText={t('auditRecords', 'audit records')} headerTitle={headerTitle} />;
  }

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={headerTitle}>
        {isValidating ? <InlineLoading description={t('updating', 'Updating…')} /> : null}
      </CardHeader>
      <DataTable rows={tableRows} headers={tableHeaders} size={responsiveSize} useZebraStyles>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
          <TableContainer>
            <Table {...getTableProps()} aria-label={headerTitle}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader aria-label={t('expandRow', 'Expand row')} />
                  {headers.map((header) => (
                    <TableHeader key={header.key} {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const original = originalById.get(row.id);
                  const relatedEntities = original?.relatedEntities ?? [];
                  return (
                    <Fragment key={row.id}>
                      <TableExpandRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>
                            {cell.info.header === 'eventType' ? (
                              <AuditLogEventTag eventType={cell.value} changes={original?.changes ?? []} />
                            ) : cell.info.header === 'changedOn' ? (
                              formatRevisionDatetime(cell.value)
                            ) : (
                              cell.value
                            )}
                          </TableCell>
                        ))}
                      </TableExpandRow>
                      {row.isExpanded && (
                        <TableExpandedRow colSpan={headers.length + 1} className={styles.expandedRow}>
                          <AuditLogDiff changes={original?.changes ?? []} eventType={original?.eventType} />
                          {relatedEntities.length > 0 && (
                            <div className={styles.relatedEntities}>
                              <p className={styles.relatedTitle}>{t('alsoChanged', 'Changed in the same save')}</p>
                              <div className={styles.relatedList}>
                                {relatedEntities.map((related, idx) => (
                                  <span
                                    key={`${related.simpleName}-${related.entityIdValue}-${idx}`}
                                    className={styles.relatedItem}
                                  >
                                    <AuditLogEventTag eventType={related.revisionType} />
                                    <span className={styles.relatedName}>{related.simpleName}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </TableExpandedRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      <PatientChartPagination
        pageNumber={page}
        totalItems={totalLogs}
        currentItems={logs.length}
        pageSize={pageSize}
        onPageNumberChange={({ page: newPage }) => setPage(newPage)}
      />
    </div>
  );
};

export default AuditHistory;
