import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton, Table, TableBody, TableCell, TableRow } from '@carbon/react';
import { formatDate, parseDate, usePagination } from '@openmrs/esm-framework';
import { ErrorState, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import type { Immunization } from '../types';
import styles from './immunization-history-card.scss';

interface ImmunizationHistoryCardProps {
  error?: Error | null;
  immunizations?: Immunization[];
  isLoading?: boolean;
}

const ImmunizationHistoryCard: React.FC<ImmunizationHistoryCardProps> = ({ error, immunizations, isLoading }) => {
  const { t } = useTranslation();

  const headerTitle = t('immunizations', 'Immunizations');
  const pageSize = 5;

  const sortedImmunizations = useMemo(() => {
    return (immunizations || []).map((immunization) => ({
      ...immunization,
      existingDoses: (immunization?.existingDoses || []).sort(
        (a, b) => new Date(a?.occurrenceDateTime).getTime() - new Date(b?.occurrenceDateTime).getTime(),
      ),
    }));
  }, [immunizations]);

  const headers = [
    { key: 'vaccine', header: t('vaccine', 'Vaccine') },
    { key: 'doses', header: t('doses', 'Doses') },
  ];

  const tableRows = useMemo(() => {
    return (sortedImmunizations || []).map((immunization) => ({
      id: immunization.vaccineUuid,
      vaccine: immunization.vaccineName,
      doses: immunization.existingDoses.map((dose) => (
        <div key={dose.immunizationObsUuid} className={styles.doseCell}>
          <div className={styles.doseLabel}>{t('doseNumber', 'Dose {{number}}', { number: dose.doseNumber })}</div>
          {dose.occurrenceDateTime && (
            <div className={styles.doseDate}>
              {formatDate(parseDate(dose.occurrenceDateTime), {
                mode: 'standard',
                time: false,
                noToday: true,
              })}
            </div>
          )}
        </div>
      )),
    }));
  }, [sortedImmunizations, t]);

  const { results: paginatedRows, currentPage, goTo } = usePagination(tableRows || [], pageSize);

  if (isLoading) {
    return (
      <div className={styles.widgetCard}>
        <DataTableSkeleton role="progressbar" />
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  return (
    <div className={styles.widgetCard}>
      <div className={styles.headerRow}>
        {headers.map((header, index) => (
          <div key={index} className={styles.headerCell}>
            {header.header}
          </div>
        ))}
      </div>

      <div>
        <Table size="xl" useZebraStyles={false} aria-label={t('immunizationHistory', 'Immunization history')}>
          <TableBody className={styles.tableBody}>
            {paginatedRows?.map((row) => (
              <TableRow key={row.id}>
                <TableCell className={styles.vaccineNameCell}>
                  <div className={styles.vaccineNameContent}>
                    <strong>{row.vaccine}</strong>
                  </div>
                </TableCell>
                <TableCell className={styles.dosesCell}>
                  <div className={styles.vaccineDose}>{row.doses}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PatientChartPagination
        totalItems={tableRows?.length || 0}
        pageSize={pageSize}
        pageNumber={currentPage}
        currentItems={paginatedRows?.length || 0}
        onPageNumberChange={({ page }) => {
          goTo(page);
        }}
      />
    </div>
  );
};

export default ImmunizationHistoryCard;
