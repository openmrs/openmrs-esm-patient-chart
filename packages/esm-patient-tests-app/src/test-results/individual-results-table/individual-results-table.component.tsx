import React, { type ComponentProps, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  Button,
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
import { ArrowRightIcon, showModal, useLayoutType, isDesktop, formatDate } from '@openmrs/esm-framework';
import { getPatientUuidFromStore, type OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import { type RowData } from '../filter/filter-types';
import styles from './individual-results-table.scss';

interface IndividualResultsTableProps {
  isLoading: boolean;
  parent: {
    display: string;
  };
  subRows: Array<RowData>;
  index: number;
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

const IndividualResultsTable: React.FC<IndividualResultsTableProps> = ({ isLoading, parent, subRows, index }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const patientUuid = getPatientUuidFromStore();

  const headerTitle = t(parent.display);

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
      subRows.map((row, i) => {
        const { units = '', range = '', obs: values } = row;
        const isString = isNaN(parseFloat(values?.[0]?.value));

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
            value: `${row.obs[0]?.value ?? ''} ${row.units ?? ''}`,
            interpretation: row.obs[0]?.interpretation,
          },
          referenceRange: `${range || '--'} ${units || '--'}`,
        };
      }),
    [index, subRows, launchResultsDialog],
  );

  if (isLoading) return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;

  if (subRows?.length) {
    return (
      <DataTable rows={tableRows} headers={tableHeaders} data-floating-menu-container useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer>
            <div className={styles.cardTitle}>
              <h4 className={styles.resultType}>{headerTitle}</h4>
              <div className={styles.displayFlex}>
                <span className={styles.date}>
                  {subRows[0]?.obs[0]?.obsDatetime
                    ? formatDate(new Date(subRows[0]?.obs[0]?.obsDatetime), { mode: 'standard' })
                    : ''}
                </span>
                <Button
                  className={styles.viewTimeline}
                  iconDescription="view timeline"
                  kind="ghost"
                  renderIcon={(props: ComponentProps<typeof ArrowRightIcon>) => <ArrowRightIcon size={16} {...props} />}
                  onClick={() => launchResultsDialog(headerTitle, subRows[0]?.conceptUuid)}
                  size="sm"
                >
                  {t('viewTimeline', 'View timeline')}
                </Button>
              </div>
            </div>
            <Table className={styles.table} {...getTableProps()} size={isDesktop(layout) ? 'sm' : 'md'}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  return (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) =>
                        cell?.value?.interpretation ? (
                          <TableCell className={classNames(getClasses(cell?.value?.interpretation))} key={cell.id}>
                            <p>{cell?.value?.value ?? cell?.value}</p>
                          </TableCell>
                        ) : (
                          <TableCell key={cell.id}>
                            <p>{cell?.value}</p>
                          </TableCell>
                        ),
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    );
  }
};

export default IndividualResultsTable;
