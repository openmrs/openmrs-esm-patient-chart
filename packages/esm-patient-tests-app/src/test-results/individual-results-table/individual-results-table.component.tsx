import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { formatRangeWithUnits } from '../grouped-timeline/reference-range-helpers';
import {
  DataTable,
  DataTableSkeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { showModal, useLayoutType, formatDate, parseDate } from '@openmrs/esm-framework';
import { type OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import { type GroupedObservation } from '../../types';
import styles from './individual-results-table.scss';

interface IndividualResultsTableProps {
  patientUuid;
  isLoading: boolean;
  subRows: GroupedObservation;
  index: number;
  title: string;
}

const getClasses = (interpretation: OBSERVATION_INTERPRETATION) => {
  switch (interpretation) {
    case 'OFF_SCALE_HIGH':
      return styles['off-scale-high'];

    case 'CRITICALLY_HIGH':
      return styles['critically-high'];

    case 'HIGH':
      return styles['high'];

    case 'OFF_SCALE_LOW':
      return styles['off-scale-low'];

    case 'CRITICALLY_LOW':
      return styles['critically-low'];

    case 'LOW':
      return styles['low'];

    case 'NORMAL':
    default:
      return '';
  }
};

const IndividualResultsTable: React.FC<IndividualResultsTableProps> = ({
  patientUuid,
  isLoading,
  subRows,
  index,
  title,
}) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';

  const getColumnClass = (columnKey: string) => styles[`col-${columnKey}`];

  const headerTitle = t(title);

  const launchResultsDialog = useCallback(
    (title: string, testUuid: string) => {
      const dispose = showModal('timeline-results-modal', {
        closeDeleteModal: () => dispose(),
        patientUuid,
        testUuid,
        title,
      });
    },
    [patientUuid],
  );

  const tableHeaders = useMemo(() => {
    return [
      { key: 'testName', header: t('testName', 'Test Name') },
      {
        key: 'value',
        header: t('value', 'Value'),
      },
      { key: 'referenceRange', header: t('referenceRange', 'Reference range') },
    ];
  }, [t]);

  const tableRows = useMemo(
    () =>
      subRows?.entries.length &&
      subRows.entries.map((row, i) => {
        // Use observation-level range/units if available, otherwise fallback to node-level
        // MappedObservation has range and units fields, but they may come from node-level
        const displayRange = row.range ?? '';
        const displayUnits = row.units ?? '';
        const isString = isNaN(parseFloat(row.value));

        const referenceRangeDisplay = formatRangeWithUnits(displayRange, displayUnits);

        return {
          ...row,
          id: `${i}-${index}`,
          testName: (
            <span className={styles['trendline-link']}>
              {!isString ? (
                <span
                  className={styles['trendline-link-view']}
                  onClick={() => launchResultsDialog(row.display, row.conceptUuid)}
                >
                  {row.display}
                </span>
              ) : (
                <span className={styles.trendlineLink}>{row.display}</span>
              )}
            </span>
          ),
          value: {
            value: `${row.value} ${displayUnits}`,
            interpretation: row?.interpretation,
          },
          referenceRange: referenceRangeDisplay,
        };
      }),
    [index, subRows, launchResultsDialog],
  );

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  }

  if (subRows.entries?.length) {
    return (
      <DataTable rows={tableRows} headers={tableHeaders} data-floating-menu-container useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer>
            <div className={styles.cardTitle}>
              <h4 className={styles.resultType}>{headerTitle}</h4>
              <div className={styles.displayFlex}>
                <span className={styles.date}>
                  {formatDate(parseDate(subRows.date), { mode: 'standard', time: false })}
                </span>
              </div>
            </div>
            <Table className={styles.table} {...getTableProps()} size={isDesktop ? 'md' : 'sm'}>
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
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) =>
                      cell?.value?.interpretation ? (
                        <TableCell
                          key={cell.id}
                          className={classNames(
                            getClasses(cell?.value?.interpretation),
                            getColumnClass(cell.info.header),
                          )}
                        >
                          <p>{cell?.value?.value ?? cell?.value}</p>
                        </TableCell>
                      ) : (
                        <TableCell key={cell.id} className={getColumnClass(cell.info.header)}>
                          <p>{cell?.value}</p>
                        </TableCell>
                      ),
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    );
  }
};

export default IndividualResultsTable;
