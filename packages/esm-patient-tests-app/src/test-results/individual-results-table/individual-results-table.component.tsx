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
import styles from './individual-results-table.scss';
import { type GroupedObservation } from '../../types';

interface IndividualResultsTableProps {
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

const IndividualResultsTable: React.FC<IndividualResultsTableProps> = ({ isLoading, subRows, index, title }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const patientUuid = getPatientUuidFromStore();
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';

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
      subRows.entries.map((row, i) => {
        const { units = '', range = '' } = row;
        const isString = isNaN(parseFloat(row.value));

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
            value: `${row.value} ${row.units ?? ''}`,
            interpretation: row?.interpretation,
          },
          referenceRange: `${range || '--'} ${units || '--'}`,
        };
      }),
    [index, subRows, launchResultsDialog],
  );

  if (isLoading) return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;

  if (subRows.entries?.length) {
    return (
      <DataTable rows={tableRows} headers={tableHeaders} data-floating-menu-container useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer>
            <div className={styles.cardTitle}>
              <h4 className={styles.resultType}>{headerTitle}</h4>
              <div className={styles.displayFlex}>
                <span className={styles.date}>{formatDate(new Date(subRows.date), { mode: 'standard' })}</span>
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
            <Table className={styles.table} {...getTableProps()} size={isDesktop ? 'md' : 'sm'}>
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
