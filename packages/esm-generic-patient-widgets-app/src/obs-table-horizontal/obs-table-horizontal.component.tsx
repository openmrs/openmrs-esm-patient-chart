import React, { useCallback, useContext, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { showModal , usePagination, useConfig, formatDatetime, formatDate, formatTime } from '@openmrs/esm-framework';
import {
  DataTable,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  Button,
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
  const obssGroupedByEncounters = uniqueEncounterReferences.map((reference) =>
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
    header: label ?? obss.find((o) => o.conceptUuid === concept)?.code?.text,
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
          encounter: obss[0].encounter.name,
        };

        for (const obs of obss) {
          switch (obs.dataType) {
            case 'Text':
              rowData[obs.conceptUuid] = obs.valueString;
              break;

            case 'Number': {
              const decimalPlaces: number | undefined = config.data.find(
                (ele: any) => ele.concept === obs.conceptUuid,
              )?.decimalPlaces;

              if (obs.valueQuantity?.value % 1 !== 0) {
                rowData[obs.conceptUuid] = obs.valueQuantity?.value.toFixed(decimalPlaces);
              } else {
                rowData[obs.conceptUuid] = obs.valueQuantity?.value;
              }
              break;
            }

            case 'Coded':
              rowData[obs.conceptUuid] = obs.valueCodeableConcept?.coding[0]?.display;
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
    <table className="cds--data-table cds--data-table--sm cds--data-table--zebra">
      <thead>
        <tr>
          <th>{t('dateAndTime', 'Date and time')}</th>
          {tableColumns.map((column) => (
            <th className="cds--table-header-label" key={`obs-horizontal-date-${column.id}-${column.date}`}>
              <div className={styles.headerYear}>{column.date.getFullYear()}</div>
              <div className={styles.headerDate}>{formatDate(column.date, { mode: 'wide', year: false })}</div>
              <div className={styles.headerTime}>{formatTime(column.date)}</div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tableRowLabels.map((label) => (
          <tr key={`obs-horizontal-row-${label.header}`}>
            <td>{label.header}</td>
            {tableColumns.map((column) => (
              <td key={`obs-horizontal-value-${column.id}-${label.key}`}>{column[label.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ObsTableHorizontal;
