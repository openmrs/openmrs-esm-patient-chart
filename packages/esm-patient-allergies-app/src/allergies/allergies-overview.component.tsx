import React from 'react';
import classNames from 'classnames';
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
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useLayoutType, usePagination } from '@openmrs/esm-framework';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  launchPatientWorkspace,
  PatientChartPagination,
} from '@openmrs/esm-patient-common-lib';
import { allergiesCount, patientAllergiesFormWorkspace } from '../constants';
import { useAllergies } from './allergy-intolerance.resource';
import styles from './allergies-overview.scss';

interface AllergiesOverviewProps {
  basePath: string;
  patient: fhir.Patient;
}

const AllergiesOverview: React.FC<AllergiesOverviewProps> = ({ patient }) => {
  const { t } = useTranslation();
  const displayText = t('allergyIntolerances', 'allergy intolerances');
  const headerTitle = t('allergies', 'Allergies');
  const urlLabel = t('seeAll', 'See all');
  const pageUrl = `\${openmrsSpaBase}/patient/${patient.id}/chart/Allergies`;
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';

  const { allergies, isError, isLoading, isValidating } = useAllergies(patient.id);
  const { results: paginatedAllergies, goTo, currentPage } = usePagination(allergies ?? [], allergiesCount);

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
        <DataTable rows={tableRows} headers={tableHeaders} isSortable size={isTablet ? 'lg' : 'sm'} useZebraStyles>
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
          )}
        </DataTable>
        <PatientChartPagination
          currentItems={paginatedAllergies.length}
          onPageNumberChange={({ page }) => goTo(page)}
          pageNumber={currentPage}
          pageSize={allergiesCount}
          dashboardLinkUrl={pageUrl}
          dashboardLinkLabel={urlLabel}
          totalItems={allergies.length}
        />
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchAllergiesForm} />;
};

export default AllergiesOverview;
