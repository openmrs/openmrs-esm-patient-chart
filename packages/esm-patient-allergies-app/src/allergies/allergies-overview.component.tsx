import React from 'react';
import Add16 from '@carbon/icons-react/es/add/16';
import {
  DataTableSkeleton,
  DataTable,
  Button,
  Table,
  TableCell,
  TableContainer,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react';
import styles from './allergies-overview.scss';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { useAllergies } from './allergy-intolerance.resource';
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

  const [showAllAllergies, setShowAllAllergies] = React.useState(false);
  const { data: allergies, isError, isLoading } = useAllergies(patient.id);

  const tableHeaders = [
    {
      key: 'display',
      header: t('name', 'Name'),
    },
    {
      key: 'reactions',
      header: t('reactions', 'Reactions'),
    },
  ];

  const tableRows = React.useMemo(() => {
    return allergies?.map((allergy) => ({
      ...allergy,
      reactions: `${allergy.reactionManifestations?.join(', ') || ''} ${
        allergy.reactionSeverity ? `(${allergy.reactionSeverity})` : ''
      }`,
    }));
  }, [allergies]);

  const toggleShowAllAllergies = () => {
    setShowAllAllergies(!showAllAllergies);
  };

  const launchAllergiesForm = React.useCallback(
    () => attach('patient-chart-workspace-slot', patientAllergiesFormWorkspace),
    [],
  );

  if (isLoading) return <DataTableSkeleton role="progressbar" />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (allergies?.length) {
    return (
      <div className={styles.widgetCard}>
        <div className={styles.allergiesHeader}>
          <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
          {showAddAllergy && (
            <Button kind="ghost" renderIcon={Add16} iconDescription="Add allergies" onClick={launchAllergiesForm}>
              {t('add', 'Add')}
            </Button>
          )}
        </div>
        <TableContainer>
          <DataTable rows={tableRows} headers={tableHeaders} isSortable={true} size="short">
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

export default AllergiesOverview;
