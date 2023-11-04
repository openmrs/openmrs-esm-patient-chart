import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { formatDate, parseDate, useLayoutType } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useAllergies } from './allergy-intolerance.resource';
import { patientAllergiesFormWorkspace } from '../constants';
import styles from './allergies-detailed-summary.scss';

interface AllergiesDetailedSummaryProps {
  patient: fhir.Patient;
}

const AllergiesDetailedSummary: React.FC<AllergiesDetailedSummaryProps> = ({ patient }) => {
  const { t } = useTranslation();
  const displayText = t('allergyIntolerances', 'allergy intolerances');
  const headerTitle = t('allergies', 'Allergies');
  const { allergies, isError, isLoading, isValidating } = useAllergies(patient.id);
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';

  const launchAllergiesForm = React.useCallback(() => launchPatientWorkspace(patientAllergiesFormWorkspace), []);

  const tableHeaders = [
    { key: 'display', header: t('allergen', 'Allergen') },
    {
      key: 'criticality',
      header: t('severityandReaction', 'Severity'),
    },
    { key: 'reaction', header: t('reaction', 'Reaction') },
    {
      key: 'note',
      header: t('onsetDateAndComments', 'Onset date and comments'),
    },
  ];

  const tableRows = React.useMemo(() => {
    return allergies?.map((allergy) => ({
      ...allergy,
      criticality: {
        content: (
          <span className={styles.allergyCriticality}>
            {allergy.criticality === 'high' && (
              <svg className="omrs-icon omrs-margin-right-4" fill="rgba(181, 7, 6, 1)" style={{ height: '1.25rem' }}>
                <use xlinkHref="#omrs-icon-important-notification" />
              </svg>
            )}
            <span className={classNames({ [styles.allergySeverityHigh]: allergy.criticality === 'high' })}>
              {allergy.criticality}
            </span>
          </span>
        ),
      },
      lastUpdated: allergy.lastUpdated ? formatDate(parseDate(allergy.lastUpdated), { time: false }) : '--',
      reaction: allergy.reactionManifestations?.join(', '),
      note: allergy?.note ?? '--',
    }));
  }, [allergies]);

  if (isLoading) return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (allergies?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription="Add allergies"
            onClick={launchAllergiesForm}
          >
            {t('add', 'Add')}
          </Button>
        </CardHeader>
        <DataTable rows={tableRows} headers={tableHeaders} isSortable useZebraStyles size={isTablet ? 'lg' : 'sm'}>
          {({ rows, headers, getHeaderProps, getTableProps }) => (
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
                  </TableRow>
                </TableHead>
                <TableBody data-testid="allergy-table">
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
          )}
        </DataTable>
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchAllergiesForm} />;
};

export default AllergiesDetailedSummary;
