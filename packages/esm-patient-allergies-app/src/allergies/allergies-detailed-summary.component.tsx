import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { AddIcon, formatDate, launchWorkspace, parseDate, useLayoutType } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { patientAllergiesFormWorkspace } from '../constants';
import { useAllergies } from './allergy-intolerance.resource';
import { AllergiesActionMenu } from './allergies-action-menu.component';
import styles from './allergies-detailed-summary.scss';

interface AllergiesDetailedSummaryProps {
  patient: fhir.Patient;
}

const AllergiesDetailedSummary: React.FC<AllergiesDetailedSummaryProps> = ({ patient }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { allergies, error, isLoading, isValidating } = useAllergies(patient.id);
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';
  const displayText = t('allergyIntolerances', 'allergy intolerances');
  const headerTitle = t('allergies', 'Allergies');

  const launchAllergiesForm = useCallback(() => launchWorkspace(patientAllergiesFormWorkspace), []);

  const tableHeaders = [
    { key: 'display', header: t('allergen', 'Allergen') },
    {
      key: 'reactionSeverity',
      header: t('severityandReaction', 'Severity'),
    },
    { key: 'reaction', header: t('reaction', 'Reaction') },
    {
      key: 'note',
      header: t('comments', 'Comments'),
    },
  ];

  const tableRows = useMemo(
    () =>
      allergies?.map((allergy) => ({
        ...allergy,
        lastUpdated: allergy.lastUpdated ? formatDate(parseDate(allergy.lastUpdated), { time: false }) : '--',
        note: allergy?.note ?? '--',
        reaction: allergy.reactionManifestations?.sort((a, b) => a.localeCompare(b))?.join(', ') ?? '--',
        reactionSeverity: t(allergy.reactionSeverity) ?? '--',
      })),
    [allergies, t],
  );

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (allergies?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <Button
            kind="ghost"
            renderIcon={(props) => <AddIcon size={16} {...props} />}
            iconDescription="Add allergies"
            onClick={launchAllergiesForm}
          >
            {t('add', 'Add')}
          </Button>
        </CardHeader>
        <DataTable rows={tableRows} headers={tableHeaders} isSortable useZebraStyles size={isTablet ? 'lg' : 'sm'}>
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <TableContainer>
              <Table aria-label="allergies summary" {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
                        className={styles.tableHeader}
                        {...getHeaderProps({
                          header,
                        })}
                      >
                        {header.header}
                      </TableHeader>
                    ))}
                    <TableHeader />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                      ))}
                      <TableCell className="cds--table-column-menu">
                        <AllergiesActionMenu
                          patientUuid={patient.id}
                          allergy={allergies.find((allergy) => allergy.id == row.id)}
                        />
                      </TableCell>
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
