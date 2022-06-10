import React from 'react';
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
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useAllergies } from './allergy-intolerance.resource';
import { patientAllergiesFormWorkspace } from '../constants';
import styles from './allergies-detailed-summary.scss';

interface AllergiesDetailedSummaryProps {
  patient: fhir.Patient;
  showAddAllergyButton: boolean;
}

const AllergiesDetailedSummary: React.FC<AllergiesDetailedSummaryProps> = ({ patient, showAddAllergyButton }) => {
  const { t } = useTranslation();
  const displayText = t('allergyIntolerances', 'allergy intolerances');
  const headerTitle = t('allergies', 'Allergies');
  const { allergies, isError, isLoading, isValidating } = useAllergies(patient.id);

  const launchAllergiesForm = React.useCallback(() => launchPatientWorkspace(patientAllergiesFormWorkspace), []);

  const tableHeaders = [
    { key: 'display', header: t('allergen', 'Allergen') },
    {
      key: 'criticality',
      header: t('severityandReaction', 'Severity and Reaction'),
    },
    {
      key: 'recordedDate',
      header: t('since', 'Since'),
    },
    {
      key: 'lastUpdated',
      header: t('lastUpdated', 'Last updated'),
    },
  ];

  const tableRows = React.useMemo(() => {
    return allergies?.map((allergy) => ({
      ...allergy,
      criticality: {
        content: (
          <div className={styles.allergyDetails}>
            <p className={styles.allergyCriticality}>
              {allergy.criticality === 'high' && (
                <svg className="omrs-icon omrs-margin-right-4" fill="rgba(181, 7, 6, 1)" style={{ height: '1.25rem' }}>
                  <use xlinkHref="#omrs-icon-important-notification" />
                </svg>
              )}
              <span
                className={`${styles.allergySeverity} ${
                  allergy.criticality === 'high' ? styles.productiveHeading02 : styles.bodyShort02
                }`}
              >
                {allergy.criticality}
              </span>
            </p>
            <p>{allergy.reactionManifestations?.join(', ')}</p>
            <p className={styles.note}>{allergy?.note}</p>
          </div>
        ),
      },
      recordedDate: formatDate(parseDate(allergy.recordedDate), { day: false, time: false }) ?? '--',
      lastUpdated: allergy.lastUpdated ? formatDate(parseDate(allergy.lastUpdated), { time: false }) : '--',
    }));
  }, [allergies]);

  if (isLoading) return <DataTableSkeleton role="progressbar" />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (allergies?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          {showAddAllergyButton && (
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              iconDescription="Add allergies"
              onClick={launchAllergiesForm}
            >
              {t('add', 'Add')}
            </Button>
          )}
        </CardHeader>
        <TableContainer>
          <DataTable rows={tableRows} headers={tableHeaders} isSortable={true}>
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
            )}
          </DataTable>
        </TableContainer>
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchAllergiesForm} />;
};

export default AllergiesDetailedSummary;
