import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorState, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { Table, TableRow, TableBody, TableCell, DataTableSkeleton } from '@carbon/react';
import { formatDate, parseDate, usePagination } from '@openmrs/esm-framework';
import styles from './immunization-history-card.scss';
import { useImmunizations } from '../hooks/useImmunizations';

interface ImmunizationHistoryCardProps {
  patientUuid: string;
}

const ImmunizationHistoryCard: React.FC<ImmunizationHistoryCardProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { data: immunizations, error, isLoading } = useImmunizations(patientUuid);
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

  const tableRows = useMemo(() => {
    return (sortedImmunizations || []).map((immunization) => ({
      id: immunization.vaccineUuid,
      vaccine: immunization.vaccineName,
      doses: immunization.existingDoses.map((dose, index) => (
        <div key={index} className={styles.doseCell}>
          {'Dose ' + dose.doseNumber}
          <br />
          {formatDate(parseDate(dose.occurrenceDateTime), { mode: 'standard', time: 'for today' })}
        </div>
      )),
    }));
  }, [sortedImmunizations]);

  const { results: row, currentPage, goTo } = usePagination(tableRows || [], pageSize);

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

  const headers = [
    { key: 'vaccine', header: 'Vaccine' },
    { key: 'doses', header: 'Doses' },
  ];

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
        <Table size="xl" useZebraStyles={false} aria-label="Immunization History">
          <TableBody>
            {row?.map((row) => (
              <TableRow key={row.id}>
                <TableCell
                  className={styles.vaccineName}
                  style={{
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div style={{ width: '200px' }}>
                    <strong>{row.vaccine}</strong>
                    <br />
                  </div>
                </TableCell>
                <TableCell
                  style={{
                    backgroundColor: '#ffffff',
                    padding: 0,
                    width: '100%',
                  }}
                >
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
        currentItems={row?.length || 0}
        onPageNumberChange={({ page }) => {
          goTo(page);
        }}
      />
    </div>
  );
};

export default ImmunizationHistoryCard;
