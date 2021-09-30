import React from 'react';
import dayjs from 'dayjs';
import Add16 from '@carbon/icons-react/es/add/16';
import styles from './conditions-detailed-summary.scss';
import capitalize from 'lodash-es/capitalize';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  Button,
  InlineLoading,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react';
import { attach } from '@openmrs/esm-framework';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { Condition, useConditions } from './conditions.resource';
import { useConditionsContext } from './conditions.context';

const ConditionsDetailedSummary: React.FC = () => {
  const { t } = useTranslation();
  const { patient } = useConditionsContext();
  const displayText = t('conditions', 'Conditions');
  const headerTitle = t('conditions', 'Conditions');
  const { data: conditions, isError, isLoading, isValidating } = useConditions(patient.id);

  const headers = React.useMemo(
    () => [
      {
        key: 'condition',
        header: t('condition', 'Condition'),
      },
      {
        key: 'onsetDateTime',
        header: t('since', 'Since'),
      },
      {
        key: 'status',
        header: t('status', 'Status'),
      },
    ],
    [t],
  );

  const tableRows: Array<Condition> = React.useMemo(() => {
    return conditions?.map((condition) => {
      return {
        ...condition,
        id: condition.id,
        condition: condition.display,
        onsetDateTime: dayjs(condition.onsetDateTime).format('MMM-YYYY'),
        status: capitalize(condition.clinicalStatus),
      };
    });
  }, [conditions]);

  const launchConditionsForm = React.useCallback(
    () => attach('patient-chart-workspace-slot', 'conditions-form-workspace'),
    [],
  );

  if (isLoading) return <DataTableSkeleton role="progressbar" />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (conditions?.length) {
    return (
      <div className={styles.widgetCard}>
        <div className={styles.conditionsHeader}>
          <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <Button kind="ghost" renderIcon={Add16} iconDescription="Add conditions" onClick={launchConditionsForm}>
            {t('add', 'Add')}
          </Button>
        </div>
        <TableContainer>
          <DataTable rows={tableRows} headers={headers} isSortable={true} size="short">
            {({ rows, headers, getHeaderProps, getTableProps }) => (
              <Table {...getTableProps()} useZebraStyles>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        className={`${styles.productiveHeading01} ${styles.text02}`}
                        {...getHeaderProps({
                          header,
                          isSortable: header.isSortable,
                        })}>
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
            )}
          </DataTable>
        </TableContainer>
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchConditionsForm} />;
};

export default ConditionsDetailedSummary;
