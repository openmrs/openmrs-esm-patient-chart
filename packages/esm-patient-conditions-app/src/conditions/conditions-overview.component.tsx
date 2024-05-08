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
import {
  formatDate,
  parseDate,
  isDesktop as isDesktopLayout,
  useLayoutType,
  usePagination,
  useConfig,
} from '@openmrs/esm-framework';
import {
  EmptyState,
  ErrorState,
  PatientChartPagination,
  launchPatientWorkspace,
  CardHeader,
} from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from '../config-schema';
import { ConditionsActionMenu } from './conditions-action-menu.component';
import { type Condition, useConditions, useConditionsSorting } from './conditions.resource';
import styles from './conditions-overview.scss';

interface ConditionTableRow extends Condition {
  id: string;
  condition: string;
  abatementDateTime: string;
  onsetDateTimeRender: string;
}

interface ConditionTableHeader {
  key: 'display' | 'onsetDateTimeRender' | 'status';
  header: string;
  isSortable: true;
  sortFunc: (valueA: ConditionTableRow, valueB: ConditionTableRow) => number;
}

interface ConditionsOverviewProps {
  patientUuid: string;
}

const ConditionsOverview: React.FC<ConditionsOverviewProps> = ({ patientUuid }) => {
  const { conditionPageSize } = useConfig<ConfigObject>();
  const { t } = useTranslation();
  const displayText = t('conditions', 'Conditions');
  const headerTitle = t('conditions', 'Conditions');
  const urlLabel = t('seeAll', 'See all');
  const pageUrl = `\${openmrsSpaBase}/patient/${patientUuid}/chart/Conditions`;
  const layout = useLayoutType();
  const isDesktop = isDesktopLayout(layout);
  const isTablet = !isDesktop;

  const { conditions, isError, isLoading, isValidating } = useConditions(patientUuid);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('Active');
  const launchConditionsForm = useCallback(
    () =>
      launchPatientWorkspace('conditions-form-workspace', {
        formContext: 'creating',
      }),
    [],
  );

  const filteredConditions = useMemo(() => {
    if (!filter || filter == 'All') {
      return conditions;
    }

    if (filter) {
      return conditions?.filter((condition) => condition.clinicalStatus === filter);
    }

    return conditions;
  }, [filter, conditions]);

  const headers: Array<ConditionTableHeader> = useMemo(
    () => [
      {
        key: 'display',
        header: t('condition', 'Condition'),
        isSortable: true,
        sortFunc: (valueA, valueB) => valueA.display?.localeCompare(valueB.display),
      },
      {
        key: 'onsetDateTimeRender',
        header: t('dateOfOnset', 'Date of onset'),
        isSortable: true,
        sortFunc: (valueA, valueB) =>
          valueA.onsetDateTime && valueB.onsetDateTime
            ? new Date(valueA.onsetDateTime).getTime() - new Date(valueB.onsetDateTime).getTime()
            : 0,
      },
      {
        key: 'status',
        header: t('status', 'Status'),
        isSortable: true,
        sortFunc: (valueA, valueB) => valueA.clinicalStatus?.localeCompare(valueB.clinicalStatus),
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
        abatementDateTime: condition.abatementDateTime,
        onsetDateTimeRender: condition.onsetDateTime
          ? formatDate(parseDate(condition.onsetDateTime), { time: false, day: false })
          : '--',
        status: condition.clinicalStatus,
      };
    });
  }, [filteredConditions]);

  const { sortedRows, sortRow } = useConditionsSorting(headers, tableRows);

  const { results: paginatedConditions, goTo, currentPage } = usePagination(sortedRows, conditionPageSize);

  const handleConditionStatusChange = ({ selectedItem }) => setFilter(selectedItem);

  if (isLoading) return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (conditions?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <div className={styles.rightMostFlexContainer}>
            <div className={styles.filterContainer}>
              <Dropdown
                id="conditionStatusFilter"
                initialSelectedItem={'Active'}
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
          aria-label="conditions overview"
          rows={paginatedConditions}
          headers={headers}
          isSortable
          size={isTablet ? 'lg' : 'sm'}
          useZebraStyles
          overflowMenuOnHover={isDesktop}
          sortRow={sortRow}
        >
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <>
              <TableContainer>
                <Table {...getTableProps()}>
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
                      <TableRow key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                        ))}
                        <TableCell className="cds--table-column-menu">
                          <ConditionsActionMenu condition={row} />
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
        <PatientChartPagination
          currentItems={paginatedConditions.length}
          onPageNumberChange={({ page }) => goTo(page)}
          pageNumber={currentPage}
          pageSize={conditionPageSize}
          totalItems={filteredConditions.length}
          dashboardLinkUrl={pageUrl}
          dashboardLinkLabel={urlLabel}
        />
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchConditionsForm} />;
};

export default ConditionsOverview;
