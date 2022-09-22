import { formatDate } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { RowData } from '../filter/filter-types';
import styles from './result-panel.scss';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import { getClass } from './result-panel-helper';

interface LabSetPanelProps {
  heading: string;
  tests: Array<RowData>;
}

const LabSetPanel: React.FC<LabSetPanelProps> = ({ heading, tests }) => {
  const hasData = tests.some((test) => test.hasData);
  const recentObsDateTime = tests?.[0]?.obs?.[0]?.obsDatetime;
  const hasRange = tests.some((test) => test?.range);
  const { t } = useTranslation();

  const date = new Date(recentObsDateTime);

  if (!hasData) {
    return null;
  }

  const headers = useMemo(
    () =>
      hasRange
        ? [
            {
              id: 'testName',
              key: 'testName',
              header: t('testName', 'Test name'),
            },
            {
              id: 'value',
              key: 'value',
              header: t('value', 'Value'),
            },
            {
              id: 'range',
              key: 'range',
              header: t('referenceRange', 'Reference range'),
            },
          ]
        : [
            {
              id: 'testName',
              key: 'testName',
              header: t('testName', 'Test name'),
            },
            {
              id: 'value',
              key: 'value',
              header: t('value', 'Value'),
            },
          ],
    [t],
  );

  const rowsData = useMemo(
    () =>
      hasRange
        ? tests.map((test) => ({
            id: test.flatName,
            testName: test.display,
            value: {
              content: (
                // <span className={getClass(test.obs?.[0]?.interpretation)}>
                <span>{test.obs?.[0]?.value}</span>
                // </span>
              ),
            },
            interpretation: test.obs?.[0]?.interpretation,
            range: test.range,
          }))
        : tests.map((test) => ({
            id: test.flatName,
            testName: test.display,
            value: {
              content: (
                // <span className={getClass(test.obs?.[0]?.interpretation)}>
                <span>{test.obs?.[0]?.value}</span>
                // </span>
              ),
            },
            interpretation: test.obs?.[0]?.interpretation,
          })),
    [tests, hasRange],
  );

  return (
    <div className={styles.labSetPanel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.productiveHeading02}>{heading}</h2>
        <p className={styles.subtitleText}>
          {formatDate(new Date(recentObsDateTime), {
            mode: 'wide',
          })}{' '}
          &bull; {`${date.getHours()}:${date.getMinutes()}`}
        </p>
      </div>
      <DataTable rows={rowsData} headers={headers}>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, indx) => {
                  return (
                    <TableRow key={row.id} className={`${getClass(rowsData[indx]?.interpretation)} check`}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell?.value?.content ?? cell.value}</TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default LabSetPanel;
