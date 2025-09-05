import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@carbon/react';
import { formatDate, parseDate, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { ErrorState, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import type { Immunization } from '../types';
import styles from './immunization-history-card.scss';

dayjs.extend(isSameOrAfter);

interface ImmunizationHistoryCardProps {
  error?: Error | null;
  immunizations?: Array<Immunization>;
}

const getNextDoseStatus = (nextDoseDate: string): 'DUE' | 'NOT_DUE' => {
  const today = dayjs().startOf('day');
  const nextDate = dayjs(nextDoseDate).startOf('day');

  return today.isSameOrAfter(nextDate) ? 'DUE' : 'NOT_DUE';
};

const ImmunizationHistoryCard: React.FC<ImmunizationHistoryCardProps> = ({ error, immunizations }) => {
  const { t } = useTranslation();
  const headerTitle = t('immunizations', 'Immunizations');
  const pageSize = 5;
  const isTablet = useLayoutType() === 'tablet';

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

  const getNextDoseStatusLabel = (status: 'DUE' | 'NOT_DUE') => {
    return status === 'DUE' ? t('due', 'Due') : t('notDue', 'Not due');
  };

  const tableRows = useMemo(() => {
    return (sortedImmunizations || []).map((immunization) => {
      const latestDose = immunization.existingDoses?.[immunization.existingDoses.length - 1];
      return {
        id: immunization.vaccineUuid,
        vaccine: immunization.vaccineName,
        nextDoseDate: latestDose?.nextDoseDate,
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
      };
    });
  }, [sortedImmunizations, t]);

  const { results: paginatedRows, currentPage, goTo } = usePagination(tableRows || [], pageSize);
  const showPagination = (tableRows?.length || 0) > pageSize;

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  return (
    <div>
      <Table
        aria-label={t('immunizationHistory', 'Immunization history')}
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
              <TableCell className={styles.vaccineNameCell}>
                <div className={styles.vaccineNameContent}>
                  <strong>{row.vaccine}</strong>
                  {row.nextDoseDate && (
                    <div className={styles.nextDoseDateLabel} data-status={getNextDoseStatus(row.nextDoseDate)}>
                      {t('nextDose', 'Next dose')}:{' '}
                      {formatDate(parseDate(row.nextDoseDate), {
                        mode: 'standard',
                        time: false,
                        noToday: true,
                      })}{' '}
                      ({getNextDoseStatusLabel(getNextDoseStatus(row.nextDoseDate))})
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className={styles.dosesCell}>
                <div className={styles.vaccineDose}>{row.doses}</div>
              </TableCell>
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
  );
};

export default ImmunizationHistoryCard;
