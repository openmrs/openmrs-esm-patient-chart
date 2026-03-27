import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import styles from './print-encounter-preview.scss';
import { formatDate } from '@openmrs/esm-framework';

interface ObsSummary {
  uuid: string;
  concept?: { display?: string };
  value?: string | number | boolean | { display?: string } | null;
  obsDatetime?: string;
}

interface PrintableEncounterReportProps {
  observations: Array<ObsSummary>;
}

const PrintableEncounterReport: React.FC<PrintableEncounterReportProps> = ({ observations }) => {
  const { t } = useTranslation();

  const tableHeaders = useMemo(
    () => [
      { key: 'concept', header: t('observation', 'Observation') },
      { key: 'value', header: t('value', 'Value') },
      { key: 'date', header: t('date', 'Date') },
    ],
    [t],
  );

  const tableRows = useMemo(
    () =>
      observations.map((obs) => ({
        id: obs.uuid,
        concept: obs.concept?.display ?? '--',
        value: obs.value
          ? typeof obs.value === 'object' && 'display' in obs.value
            ? obs.value.display
            : String(obs.value)
          : '--',
        date: formatDate(new Date(obs.obsDatetime)),
      })),
    [observations],
  );

  if (!observations.length) {
    return (
      <p className={styles.noObs}>{t('noObservationsRecorded', 'No observations recorded for this encounter.')}</p>
    );
  }

  return (
    <div className={styles.container}>
      <DataTable rows={tableRows} headers={tableHeaders} size="sm" useZebraStyles>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
          <TableContainer {...getTableContainerProps()}>
            <Table {...getTableProps()} aria-label={t('encounterObservations', 'Encounter observations')}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader key={header.key} {...getHeaderProps({ header })} className={styles.cell}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })} key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={classNames(styles.cell, {
                          [styles.conceptCell]: cell.info.header === 'concept',
                        })}
                      >
                        {cell.value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default PrintableEncounterReport;
