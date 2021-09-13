import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import Button from 'carbon-components-react/es/components/Button';
import DataTableSkeleton from 'carbon-components-react/es/components/DataTableSkeleton';
import DataTable, {
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react/es/components/DataTable';
import Add16 from '@carbon/icons-react/es/add/16';
import styles from './conditions-detailed-summary.scss';
import { attach } from '@openmrs/esm-framework';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { Condition, performPatientConditionsSearch } from './conditions.resource';
import { useConditionsContext } from './conditions.context';
import { capitalize } from 'lodash-es';

const ConditionsDetailedSummary: React.FC = () => {
  const { t } = useTranslation();
  const { patient } = useConditionsContext();
  const displayText = t('conditions', 'Conditions');
  const headerTitle = t('conditions', 'Conditions');
  const [error, setError] = React.useState(null);
  const [conditions, setConditions] = React.useState<Array<Condition>>(null);

  React.useEffect(() => {
    if (patient) {
      const sub = performPatientConditionsSearch(patient.identifier[0].value).subscribe(setConditions, setError);

      return () => sub.unsubscribe();
    }
  }, [patient]);

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

  const RenderConditionsSummary: React.FC = () => {
    if (conditions.length) {
      return (
        <div>
          <div className={styles.conditionsHeader}>
            <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
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

  return (
    <>
      {conditions ? (
        <RenderConditionsSummary />
      ) : error ? (
        <ErrorState error={error} headerTitle={headerTitle} />
      ) : (
        <DataTableSkeleton role="progressbar" />
      )}
    </>
  );
};

export default ConditionsDetailedSummary;
