import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  DataTableSkeleton,
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { showModal, useLayoutType, isDesktop, formatDate } from '@openmrs/esm-framework';
import { getPatientUuidFromUrl, type OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import styles from './individual-results-table.scss';

const IndividualResultsTable = ({ isLoading, parent, subRows, index }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const patientUuid = getPatientUuidFromUrl();

  const headerTitle = t(parent.display);

  const launchResultsDialog = (patientUuid: string, title: string, testUuid: string) => {
    const dispose = showModal('timeline-results-modal', {
      closeDeleteModal: () => dispose(),
      patientUuid,
      testUuid,
      title,
    });
  };

  const tableHeaders = [
    { key: 'testName', header: t('testName', 'Test Name') },
    {
      key: 'value',
      header: t('value', 'Value'),
    },
    { key: 'referenceRange', header: t('referenceRange', 'Reference range') },
  ];

  const tableRows = useMemo(() => {
    const rowData = subRows.flatMap((row, i) => {
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
                onClick={() => launchResultsDialog(patientUuid, row.display, row.conceptUuid)}
              >
                {row.display}
              </span>
            ) : (
              <span className={styles.trendlineLink}>{row.display}</span>
            )}
          </span>
        ),
        value: {
          value: (row.obs[0]?.value ? row.obs[0]?.value : '') + +' ' + (row?.units ? ` ${row?.units}` : ''),
          interpretation: row.obs[0]?.interpretation,
        },
        referenceRange: `${range || '--'} ${units || '--'}`,
      };
    });

    return rowData;
  }, [index, patientUuid, subRows]);

  if (isLoading) return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  if (subRows?.length) {
    return (
      <div>
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
                    kind="ghost"
                    className={styles.viewTimeline}
                    renderIcon={(props) => <ArrowRight size={16} {...props} />}
                    iconDescription="view timeline"
                    onClick={() => launchResultsDialog(patientUuid, headerTitle, subRows[0]?.conceptUuid)}
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
      </div>
    );
  }
};

export default IndividualResultsTable;

export const getClasses = (interpretation: OBSERVATION_INTERPRETATION) => {
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
