import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { attach, createErrorHandler } from '@openmrs/esm-framework';
import { performPatientAllergySearch, Allergy } from './allergy-intolerance.resource';
import Add16 from '@carbon/icons-react/es/add/16';
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
import styles from './allergies-detailed-summary.scss';
import { patientAllergiesFormWorkspace } from '../constants';

interface AllergiesDetailedSummaryProps {
  patient: fhir.Patient;
  showAddAllergy: boolean;
}

const AllergiesDetailedSummary: React.FC<AllergiesDetailedSummaryProps> = ({ patient, showAddAllergy }) => {
  const { t } = useTranslation();
  const displayText = t('allergyIntolerances', 'allergy intolerances');
  const headerTitle = t('allergies', 'Allergies');

  const [allergies, setAllergies] = React.useState<Array<Allergy>>(null);
  const [error, setError] = React.useState(null);

  const launchAllergiesForm = React.useCallback(
    () => attach('patient-chart-workspace-slot', patientAllergiesFormWorkspace),
    [],
  );

  React.useEffect(() => {
    if (patient) {
      const sub = performPatientAllergySearch(patient.identifier[0].value).subscribe(
        (allergies) => setAllergies(allergies),
        (err) => {
          setError(err);
          createErrorHandler();
        },
      );

      return () => sub.unsubscribe();
    }
  }, [patient]);

  const headers = [
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

  const getRowItems = (rows: Array<Allergy>) => {
    return rows.map((row) => ({
      ...row,
      criticality: {
        content: (
          <div className={styles.allergyDetails}>
            <p className={styles.allergyCriticality}>
              {row.criticality === 'high' && (
                <svg className="omrs-icon omrs-margin-right-4" fill="rgba(181, 7, 6, 1)" style={{ height: '1.25rem' }}>
                  <use xlinkHref="#omrs-icon-important-notification" />
                </svg>
              )}
              <span
                className={`${styles.allergySeverity} ${
                  row.criticality === 'high' ? styles.productiveHeading02 : styles.bodyShort02
                }`}>
                {row.criticality}
              </span>
            </p>
            <p>{row.reactionManifestations.join(', ')}</p>
            <p className={styles.note}>{row?.note}</p>
          </div>
        ),
      },
      recordedDate: dayjs(row.recordedDate).format('MMM-YYYY') ?? '-',
      lastUpdated: dayjs(row.lastUpdated).format('DD-MMM-YYYY'),
    }));
  };

  const RenderAllergies: React.FC = () => {
    if (allergies.length) {
      const rows = getRowItems(allergies);
      return (
        <div>
          <div className={styles.allergiesHeader}>
            <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
            {showAddAllergy && (
              <Button kind="ghost" renderIcon={Add16} iconDescription="Add allergies" onClick={launchAllergiesForm}>
                {t('add', 'Add')}
              </Button>
            )}
          </div>
          <TableContainer>
            <DataTable rows={rows} headers={headers} isSortable={true}>
              {({ rows, headers, getHeaderProps, getTableProps }) => (
                <Table {...getTableProps()}>
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
    return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchAllergiesForm} />;
  };

  return (
    <>
      {allergies ? (
        <RenderAllergies />
      ) : error ? (
        <ErrorState error={error} headerTitle={headerTitle} />
      ) : (
        <DataTableSkeleton rowCount={5} />
      )}
    </>
  );
};

export default AllergiesDetailedSummary;
