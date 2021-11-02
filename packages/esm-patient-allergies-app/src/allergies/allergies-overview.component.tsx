import React from 'react';
import Add16 from '@carbon/icons-react/es/add/16';
import {
  DataTableSkeleton,
  DataTable,
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
import styles from './allergies-overview.scss';
import {
  EmptyState,
  ErrorState,
  launchPatientWorkspace,
  PatientChartPagination,
} from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { useAllergies } from './allergy-intolerance.resource';
import { useLayoutType, usePagination } from '@openmrs/esm-framework';
import { allergiesToShowCount, patientAllergiesFormWorkspace } from '../constants';

interface AllergiesOverviewProps {
  basePath: string;
  patient: fhir.Patient;
  showAddAllergy: boolean;
}

const AllergiesOverview: React.FC<AllergiesOverviewProps> = ({ patient, showAddAllergy, basePath }) => {
  const { t } = useTranslation();
  const displayText = t('allergyIntolerances', 'allergy intolerances');
  const headerTitle = t('allergies', 'Allergies');
  const urlLabel = t('seeAll', 'See all');
  const pageUrl = window.spaBase + basePath + '/allergies';
  const isTablet = useLayoutType() === 'tablet';

  const { data: allergies, isError, isLoading, isValidating } = useAllergies(patient.id);
  const { results: paginatedAllergies, goTo, currentPage } = usePagination(allergies ?? [], allergiesToShowCount);

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
    return paginatedAllergies?.map((allergy) => ({
      ...allergy,
      reactions: `${allergy.reactionManifestations?.join(', ') || ''} ${
        allergy.reactionSeverity ? `(${allergy.reactionSeverity})` : ''
      }`,
    }));
  }, [paginatedAllergies]);

  const launchAllergiesForm = React.useCallback(() => launchPatientWorkspace(patientAllergiesFormWorkspace), []);

  if (isLoading) return <DataTableSkeleton role="progressbar" />;
  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
  if (allergies?.length) {
    return (
      <div className={styles.widgetCard}>
        <div className={isTablet ? styles.tabletHeader : styles.desktopHeader}>
          <h4>{headerTitle}</h4>
          <span>{isValidating ? <InlineLoading /> : null}</span>
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
        <PatientChartPagination
          currentItems={paginatedAllergies.length}
          onPageNumberChange={({ page }) => goTo(page)}
          pageNumber={currentPage}
          pageSize={allergiesToShowCount}
          pageUrl={pageUrl}
          totalItems={allergies.length}
          urlLabel={urlLabel}
        />
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchAllergiesForm} />;
};

export default AllergiesOverview;
