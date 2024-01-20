import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Dropdown,
  InlineLoading,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { formatDate, parseDate, useLayoutType } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useConditions } from './conditions.resource';
import { ConditionsActionMenu } from './conditions-action-menu.component';
import { compare } from './utils';
import styles from './conditions-detailed-summary.scss';

function ConditionsDetailedSummary({ patient }) {
  const { t } = useTranslation();
  const displayText = t('conditions', 'Conditions');
  const headerTitle = t('conditions', 'Conditions');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('Active');
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';

  const { conditions, error, isLoading, isValidating } = useConditions(patient.id);

  const filteredConditions = useMemo(() => {
    if (!filter || filter == 'All') {
      return conditions;
    }

    if (filter) {
      return conditions?.filter((condition) => condition.clinicalStatus === filter);
    }

    return conditions;
  }, [filter, conditions]);

  const headers = useMemo(
    () => [
      {
        key: 'display',
        header: t('condition', 'Condition'),
      },
      {
        key: 'onsetDateTime',
        header: t('dateOfOnset', 'Date of onset'),
      },
      {
        key: 'clinicalStatus',
        header: t('status', 'Status'),
      },
    ],
    [t],
  );

  const tableRows = useMemo(() => {
    return filteredConditions?.map((condition) => {
      return {
        ...condition,
        id: condition.id,
        condition: condition.display,
        onsetDateTime: {
          sortKey: condition.onsetDateTime ?? '',
          content: condition.onsetDateTime
            ? formatDate(parseDate(condition.onsetDateTime), { time: false, day: false })
            : '--',
        },
        status: condition.clinicalStatus,
      };
    });
  }, [filteredConditions]);

  const sortRow = (cellA, cellB, { sortDirection, sortStates }) => {
    return sortDirection === sortStates.DESC
      ? compare(cellB.sortKey, cellA.sortKey)
      : compare(cellA.sortKey, cellB.sortKey);
  };

  const launchConditionsForm = useCallback(
    () => launchPatientWorkspace('conditions-form-workspace', { workspaceTitle: 'Record a Condition' }),
    [],
  );

  const handleConditionStatusChange = ({ selectedItem }) => setFilter(selectedItem);

  if (isLoading) return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  if (error) return <ErrorState error={error} headerTitle={headerTitle} />;
  if (conditions?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <div className={styles.rightMostFlexContainer}>
            <div className={styles.filterContainer}>
              <Dropdown
                id="conditionStatusFilter"
                initialSelectedItem="Active"
                label=""
                titleText={t('show', 'Show') + ':'}
                type="inline"
                items={['All', 'Active', 'Inactive']}
                onChange={handleConditionStatusChange}
                size={isTablet ? 'lg' : 'sm'}
              />
            </div>
            <div className={styles.divider}>|</div>
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              iconDescription="Add conditions"
              onClick={launchConditionsForm}
            >
              {t('add', 'Add')}
            </Button>
          </div>
        </CardHeader>
        <DataTable
          rows={tableRows}
          sortRow={sortRow}
          headers={headers}
          isSortable
          size={isTablet ? 'lg' : 'sm'}
          useZebraStyles
          overflowMenuOnHover={isDesktop}
        >
          {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
            <>
              <TableContainer>
                <Table aria-label="conditions summary" {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader
                          className={classNames(styles.productiveHeading01, styles.text02)}
                          {...getHeaderProps({
                            header,
                            isSortable: header.isSortable,
                          })}
                        >
                          {header.header?.content ?? header.header}
                        </TableHeader>
                      ))}
                      <TableHeader />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id} {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                        ))}
                        <TableCell className="cds--table-column-menu">
                          <ConditionsActionMenu patientUuid={patient.id} condition={row} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {rows.length === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noConditionsToDisplay', 'No conditions to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                  </Tile>
                </div>
              ) : null}
            </>
          )}
        </DataTable>
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchConditionsForm} />;
}

export default ConditionsDetailedSummary;
