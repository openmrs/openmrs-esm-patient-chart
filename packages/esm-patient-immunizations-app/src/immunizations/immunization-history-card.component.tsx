import React, { useState, useMemo } from 'react';
import { PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { Table, TableRow, TableBody, TableCell, DataTableSkeleton } from '@carbon/react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import styles from './immunization-history-card.scss';
import { useImmunizations } from '../hooks/useImmunizations';

const ImmunizationHistoryCard = ({ patientUuid }) => {
  const { data: immunizations, error, isLoading } = useImmunizations(patientUuid);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const formatDates = (date: string): string => {
    return formatDate(parseDate(date), { mode: 'standard', time: 'for today' });
  };

  const sortedImmunizations = useMemo(
    () =>
      (immunizations ?? []).map((immunization) => ({
        ...immunization,
        existingDoses: [...immunization.existingDoses].sort(
          (a, b) => new Date(a.occurrenceDateTime).getTime() - new Date(b.occurrenceDateTime).getTime(),
        ),
      })),
    [immunizations],
  );

  if (isLoading) {
    return (
      <div className={styles.widgetCard}>
        <DataTableSkeleton role="progressbar" />
      </div>
    );
  }

  if (error) return <div>Error loading immunizations</div>;

  const totalItems = sortedImmunizations.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedImmunizations = sortedImmunizations.slice(startIndex, endIndex);

  const headers = [
    { key: 'vaccine', header: 'Vaccine' },
    { key: 'doses', header: 'Doses' },
  ];

  const rows = paginatedImmunizations.map((immunization) => {
    const vaccineName = immunization.vaccineName;

    return {
      id: immunization.vaccineUuid,
      vaccine: vaccineName,
      doses: immunization.existingDoses.map((dose, index) => (
        <div key={index} className={styles.doseCell}>
          {'Dose ' + dose.doseNumber}
          <br />
          {formatDates(dose.occurrenceDateTime)}
        </div>
      )),
    };
  });

  const goTo = ({ page }) => {
    setCurrentPage(page);
  };

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
            {rows.map((row) => (
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
        totalItems={totalItems}
        pageSize={pageSize}
        pageNumber={currentPage}
        currentItems={paginatedImmunizations.length}
        onPageNumberChange={goTo}
      />
    </div>
  );
};

export default ImmunizationHistoryCard;
