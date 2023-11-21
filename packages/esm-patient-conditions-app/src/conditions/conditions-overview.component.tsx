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
import { useConditions } from './conditions.resource';
import styles from './conditions-overview.scss';

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
    () => launchPatientWorkspace('conditions-form-workspace', { workspaceTitle: 'Record a Condition' }),
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

  const {
    results: paginatedConditions,
    goTo,
    currentPage,
  } = usePagination(filteredConditions ?? [], conditionPageSize);

  const tableHeaders = [
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
  ];

  const tableRows = useMemo(() => {
    return paginatedConditions?.map((condition) => ({
      ...condition,
      onsetDateTime: condition.onsetDateTime
        ? formatDate(parseDate(condition.onsetDateTime), { time: false, day: false })
        : '--',
    }));
  }, [paginatedConditions]);

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
          rows={tableRows}
          headers={tableHeaders}
          isSortable
          size={isTablet ? 'lg' : 'sm'}
          useZebraStyles
          overflowMenuOnHover={isDesktop}
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
