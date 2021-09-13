import React from 'react';
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
import styles from './allergies-overview.scss';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { performPatientAllergySearch, Allergy } from './allergy-intolerance.resource';
import { attach } from '@openmrs/esm-framework';
import { patientAllergiesFormWorkspace } from '../constants';
const allergiesToShowCount = 5;

interface AllergiesOverviewProps {
  basePath: string;
  patient: fhir.Patient;
  showAddAllergy: boolean;
}

const AllergiesOverview: React.FC<AllergiesOverviewProps> = ({ patient, showAddAllergy }) => {
  const { t } = useTranslation();
  const displayText = t('allergyIntolerances', 'allergy intolerances');
  const headerTitle = t('allergies', 'Allergies');

  const [allergies, setAllergies] = React.useState<Array<Allergy>>(null);
  const [error, setError] = React.useState(null);
  const [showAllAllergies, setShowAllAllergies] = React.useState(false);

  React.useEffect(() => {
    if (patient) {
      const sub = performPatientAllergySearch(patient.identifier[0].value).subscribe(
        (allergies) => setAllergies(allergies),
        (err) => setError(err),
      );

      return () => sub.unsubscribe();
    }
  }, [patient]);

  const headers = [
    {
      key: 'display',
      header: t('name', 'Name'),
    },
    {
      key: 'reactions',
      header: t('reactions', 'Reactions'),
    },
  ];

  const toggleShowAllAllergies = () => {
    setShowAllAllergies(!showAllAllergies);
  };

  const launchAllergiesForm = React.useCallback(
    () => attach('patient-chart-workspace-slot', patientAllergiesFormWorkspace),
    [],
  );

  const getRowItems = (rows: Array<Allergy>) => {
    return rows.slice(0, showAllAllergies ? rows.length : allergiesToShowCount).map((row) => ({
      ...row,
      reactions: `${row.reactionManifestations?.join(', ') || ''} ${
        row.reactionSeverity ? `(${row.reactionSeverity})` : ''
      }`,
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
            <DataTable rows={rows} headers={headers} isSortable={true} size="short">
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
                    {!showAllAllergies && allergies?.length > allergiesToShowCount && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <span
                            style={{
                              display: 'inline-block',
                              margin: '0.45rem 0rem',
                            }}>
                            {`${allergiesToShowCount} / ${allergies.length}`} {t('items', 'items')}
                          </span>
                          <Button size="small" kind="ghost" onClick={toggleShowAllAllergies}>
                            {t('seeAll', 'See all')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
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
        <DataTableSkeleton rowCount={allergiesToShowCount} />
      )}
    </>
  );
};

export default AllergiesOverview;
