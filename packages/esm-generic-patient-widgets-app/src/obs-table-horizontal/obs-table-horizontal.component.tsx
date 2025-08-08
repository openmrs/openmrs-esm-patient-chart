import React from 'react';
import { usePagination, useConfig, formatDate, formatTime } from '@openmrs/esm-framework';
import {
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  InlineLoading,
} from '@carbon/react';
import { CardHeader, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useObs } from '../resources/useObs';
import styles from './obs-table-horizontal.scss';
import { useTranslation } from 'react-i18next';
import { type ConfigObjectHorizontal } from '../config-schema-obs-horizontal';

interface ObsTableHorizontalProps {
  patientUuid: string;
}

const ObsTableHorizontal: React.FC<ObsTableHorizontalProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObjectHorizontal>();
  const { data: obss, isValidating } = useObs(patientUuid, config.showEncounterType);
  const uniqueEncounterReferences = [...new Set(obss.map((o) => o.encounter.reference))].sort();
  let obssGroupedByEncounters = uniqueEncounterReferences.map((reference) =>
    obss.filter((o) => o.encounter.reference === reference),
  );

  if (config.oldestFirst) {
    obssGroupedByEncounters.sort(
      (a, b) => new Date(a[0].effectiveDateTime).getTime() - new Date(b[0].effectiveDateTime).getTime(),
    );
  } else {
    obssGroupedByEncounters.sort(
      (a, b) => new Date(b[0].effectiveDateTime).getTime() - new Date(a[0].effectiveDateTime).getTime(),
    );
  }

  let tableRowLabels = config.data.map(({ concept, label }) => ({
    key: concept,
    header: label || obss.find((o) => o.conceptUuid === concept)?.code?.text,
  }));

  if (config.showEncounterType) {
    tableRowLabels = [{ key: 'encounter', header: t('encounterType', 'Encounter type') }, ...tableRowLabels];
  }

  const tableColumns = React.useMemo(
    () =>
      obssGroupedByEncounters?.map((obss, index) => {
        const rowData = {
          id: `${index}`,
          date: new Date(obss[0].effectiveDateTime),
          encounter: { value: obss[0].encounter.name },
        };

        for (const obs of obss) {
          switch (obs.dataType) {
            case 'Text':
              rowData[obs.conceptUuid] = {
                value: obs.valueString,
              };
              break;

            case 'Number': {
              const decimalPlaces: number | undefined = config.data.find(
                (ele: any) => ele.concept === obs.conceptUuid,
              )?.decimalPlaces;

              let value;
              if (obs.valueQuantity?.value % 1 !== 0) {
                value = obs.valueQuantity?.value.toFixed(decimalPlaces);
              } else {
                value = obs.valueQuantity?.value;
              }
              rowData[obs.conceptUuid] = {
                value: value,
              };
              break;
            }

            case 'Coded':
              rowData[obs.conceptUuid] = { value: obs.valueCodeableConcept?.coding[0]?.display };
              break;
          }
        }

        return rowData;
      }),
    [config.data, obssGroupedByEncounters],
  );

  const { results, goTo, currentPage } = usePagination(tableColumns, config.maxColumns);

  return (
    <div className={styles.widgetContainer}>
      <CardHeader title={t(config.title)}>
        <div className={styles.backgroundDataFetchingIndicator}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
        </div>
      </CardHeader>
      <HorizontalTable tableRowLabels={tableRowLabels} tableColumns={results} />
      <PatientChartPagination
        currentItems={results.length}
        totalItems={tableColumns.length}
        pageSize={config.maxColumns}
        pageNumber={currentPage}
        onPageNumberChange={({ page }) => goTo(page)}
      />
    </div>
  );
};

const HorizontalTable = ({ tableRowLabels, tableColumns }: { tableRowLabels: any; tableColumns: any }) => {
  const { t } = useTranslation();
  return (
    <TableContainer>
      <Table experimentalAutoAlign={true} size="sm" useZebraStyles>
        <TableHead>
          <TableRow>
            <TableHeader>{t('dateAndTime', 'Date and time')}</TableHeader>
            {tableColumns.map((column) => (
              <TableHeader key={`obs-hz-date-${column.id}-${column.date}`}>
                <div className={styles.headerYear}>{column.date.getFullYear()}</div>
                <div className={styles.headerDate}>{formatDate(column.date, { mode: 'wide', year: false })}</div>
                <div className={styles.headerTime}>{formatTime(column.date)}</div>
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableRowLabels.map((label) => (
            <TableRow key={`obs-hz-row-${label.key}`}>
              <TableCell>{label.header}</TableCell>
              {tableColumns.map((column) => (
                <TableCell key={`obs-hz-value-${column.id}-${label.key}`}>{column[label.key]?.value ?? '--'}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ObsTableHorizontal;
