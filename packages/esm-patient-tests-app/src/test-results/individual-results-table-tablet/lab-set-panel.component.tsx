import React, { useMemo } from 'react';
import classNames from 'classnames';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Layer,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { formatDate, isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { formatRangeWithUnits } from '../grouped-timeline/reference-range-helpers';
import { getClass } from './helper';
import type { GroupedObservation } from '../../types';
import styles from './lab-set-panel.scss';

interface LabSetPanelProps {
  panel: GroupedObservation;
  activePanel: GroupedObservation;
  setActivePanel: React.Dispatch<React.SetStateAction<GroupedObservation>>;
}

const LabSetPanel: React.FC<LabSetPanelProps> = ({ panel, activePanel, setActivePanel }) => {
  const { t } = useTranslation();
  const date = new Date(panel.date);
  const layout = useLayoutType();

  const getColumnClass = (columnKey: string) => styles[`col-${columnKey}`];

  const hasRange = panel.entries.some((entry) => entry.range);

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
              id: 'referenceRange',
              key: 'referenceRange',
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
    [t, hasRange],
  );

  const rowsData = useMemo(
    () =>
      hasRange
        ? panel.entries.map((test) => {
            const units = test.units ?? '';
            const range = formatRangeWithUnits(test.range, units);
            return {
              id: test.conceptUuid,
              testName: test.display,
              value: {
                content: <span>{`${test.value} ${units}`}</span>,
              },
              interpretation: test.interpretation,
              referenceRange: range,
            };
          })
        : panel.entries.map((test) => {
            const units = test.units ?? '';
            return {
              id: test.conceptUuid,
              testName: test.display,
              value: {
                content: <span>{`${test.value} ${units}`}</span>,
              },
              interpretation: test.interpretation,
            };
          }),
    [panel, hasRange],
  );

  return (
    <Layer
      className={classNames(styles.labSetPanel, {
        [styles.activePanel]: activePanel?.key === panel.key,
      })}
    >
      <div onClick={() => setActivePanel(panel)} role="button" tabIndex={0}>
        <div className={styles.panelHeader}>
          <h2 className={styles.productiveHeading02}>{panel.key}</h2>
          <p className={styles.subtitleText}>
            {formatDate(date, {
              mode: 'wide',
              time: false,
            })}{' '}
            &bull; {`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`}
          </p>
        </div>
        <DataTable rows={rowsData} headers={headers}>
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <TableContainer>
              <Table
                className={classNames(styles.table, hasRange ? styles.tableWithRange : styles.tableWithoutRange)}
                {...getTableProps()}
                size={isDesktop(layout) ? 'sm' : 'md'}
              >
                <TableHead>
                  <TableRow>
                    {headers.map((header) => {
                      const headerProps = getHeaderProps({ header });
                      return (
                        <TableHeader
                          {...headerProps}
                          className={classNames(headerProps.className, getColumnClass(header.key))}
                        >
                          {header.header}
                        </TableHeader>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, indx) => (
                    <TableRow key={row.id} className={getClass(rowsData[indx]?.interpretation)}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id} className={getColumnClass(cell.info.header)}>
                          {cell?.value?.content ?? cell.value}
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
    </Layer>
  );
};

export default LabSetPanel;
