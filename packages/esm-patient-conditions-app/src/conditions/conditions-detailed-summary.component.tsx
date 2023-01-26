import React, { useCallback, useMemo, useState } from 'react';
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
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { Condition, useConditions } from './conditions.resource';
import styles from './conditions-detailed-summary.scss';

function ConditionsDetailedSummary({ patient }) {
  const { t } = useTranslation();
  const displayText = t('conditions', 'Conditions');
  const headerTitle = t('conditions', 'Conditions');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('Active');

  const { data: conditions, isError, isLoading, isValidating } = useConditions(patient.id);

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

  const tableRows: Array<Condition> = useMemo(() => {
    return filteredConditions?.map((condition) => {
      return {
        ...condition,
        id: condition.id,
        condition: condition.display,
        onsetDateTime: condition.onsetDateTime
          ? formatDate(parseDate(condition.onsetDateTime), { time: false, day: false })
          : '--',
        status: condition.clinicalStatus,
      };
    });
  }, [filteredConditions]);

  const launchConditionsForm = useCallback(() => launchPatientWorkspace('conditions-form-workspace'), []);

  const handleConditionStatusChange = ({ selectedItem }) => setFilter(selectedItem);

  if (isLoading) return <DataTableSkeleton role="progressbar" />;
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
                initialSelectedItem={t('active', 'Active')}
                label=""
                titleText={t('show', 'Show') + ':'}
                type="inline"
                items={[t('all', 'All'), t('active', 'Active'), t('inactive', 'Inactive')]}
                onChange={handleConditionStatusChange}
                size="sm"
              />
            </div>
            <div className={styles.divider}></div>
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
        <DataTable rows={tableRows} headers={headers} isSortable size="sm" useZebraStyles>
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <>
              <TableContainer>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader
                          className={`${styles.productiveHeading01} ${styles.text02}`}
                          {...getHeaderProps({
                            header,
                            isSortable: header.isSortable,
                          })}
                        >
                          {header.header?.content ?? header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                        ))}
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
