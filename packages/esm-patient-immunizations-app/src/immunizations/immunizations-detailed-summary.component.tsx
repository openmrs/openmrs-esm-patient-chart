import React, { type ComponentProps, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  InlineLoading,
  TableExpandHeader,
  TableExpandRow,
  TableContainer,
  TableExpandedRow,
} from '@carbon/react';
import { AddIcon, useConfig, useLayoutType, usePagination, useVisit } from '@openmrs/esm-framework';
import {
  CardHeader,
  EmptyState,
  ErrorState,
  launchPatientWorkspace,
  PatientChartPagination,
} from '@openmrs/esm-patient-common-lib';
import styles from './immunizations-detailed-summary.scss';
import { immunizationFormSub, latestFirst, linkConfiguredSequences } from './utils';
import { orderBy, get } from 'lodash-es';
import SequenceTable from './components/immunizations-sequence-table.component';
import { useImmunizations } from '../hooks/useImmunizations';

interface ImmunizationsDetailedSummaryProps {
  patientUuid: string;
  basePath: string;
  launchStartVisitPrompt: () => void;
}

const ImmunizationsDetailedSummary: React.FC<ImmunizationsDetailedSummaryProps> = ({
  patientUuid,
  launchStartVisitPrompt,
}) => {
  const { t, i18n } = useTranslation();
  const { immunizationsConfig } = useConfig();
  const displayText = t('immunizations__lower', 'immunizations');
  const headerTitle = t('immunizations', 'Immunizations');
  const locale = i18n.language.replace('_', '-');
  const pageUrl = window.getOpenmrsSpaBase() + `patient/${patientUuid}/chart`;
  const urlLabel = t('goToSummary', 'Go to Summary');
  const { currentVisit } = useVisit(patientUuid);
  const isTablet = useLayoutType() === 'tablet';
  const sequenceDefinitions = immunizationsConfig?.sequenceDefinitions;

  const { data: existingImmunizations, isLoading, error, isValidating } = useImmunizations(patientUuid);
  const consolidatedImmunizations = linkConfiguredSequences(existingImmunizations, sequenceDefinitions);

  const launchImmunizationsForm = React.useCallback(() => {
    if (!currentVisit) {
      launchStartVisitPrompt();
      return;
    }
    launchPatientWorkspace('immunization-form-workspace');
  }, [currentVisit, launchStartVisitPrompt]);

  const sortedImmunizations = orderBy(
    consolidatedImmunizations,
    [(immunization) => get(immunization, 'existingDoses.length', 0)],
    ['desc'],
  );

  const sequenceLabels = useMemo(() => {
    if (sequenceDefinitions && sequenceDefinitions.length > 0 && sequenceDefinitions[0].sequences) {
      return sequenceDefinitions[0].sequences.map((seq) => seq.sequenceLabel);
    }
    return [];
  }, [sequenceDefinitions]);

  const tableHeader = useMemo(() => {
    const headers = [{ key: 'vaccine', header: t('vaccine', 'Vaccine') }];

    sequenceLabels.forEach((label) => {
      headers.push({
        key: label.toLowerCase().replace('-', '_'),
        header: t(label, label),
      });
    });

    headers.push({ key: 'add', header: '' });

    return headers;
  }, [t, sequenceLabels]);

  const sequenceMapping = useMemo(() => {
    const mapping = {};
    if (sequenceDefinitions && sequenceDefinitions.length > 0 && sequenceDefinitions[0].sequences) {
      sequenceDefinitions[0].sequences.forEach((seq) => {
        mapping[seq.sequenceLabel] = seq.sequenceNumber;
      });
    }
    mapping['Dose-0'] = 0;
    return mapping;
  }, [sequenceDefinitions]);

  const tableRows = useMemo(
    () =>
      sortedImmunizations?.map((immunization) => {
        const row: any = {
          id: immunization.vaccineUuid,
          vaccine: immunization.vaccineName,
          add: (
            <Button
              size="sm"
              kind="ghost"
              renderIcon={(props: ComponentProps<typeof AddIcon>) => <AddIcon size={16} {...props} />}
              iconDescription="Add"
              hasIconOnly
              onClick={() => {
                immunizationFormSub.next({
                  vaccineUuid: immunization.vaccineUuid,
                  immunizationId: null,
                  vaccinationDate: null,
                  doseNumber: 0,
                  expirationDate: null,
                  lotNumber: null,
                  manufacturer: null,
                });
                launchImmunizationsForm();
              }}
            ></Button>
          ),
        };

        sequenceLabels.forEach((label) => {
          const key = label.toLowerCase().replace('-', '_');
          row[key] = '-';
        });

        if (immunization.existingDoses && immunization.existingDoses.length > 0) {
          immunization.existingDoses.forEach((dose) => {
            let columnLabel;

            if (dose.doseNumber === 0) {
              columnLabel = 'Dose-1';
            } else {
              for (const [label, number] of Object.entries(sequenceMapping)) {
                if (number === dose.doseNumber) {
                  columnLabel = label;
                  break;
                }
              }
            }

            if (columnLabel) {
              const key = columnLabel.toLowerCase().replace('-', '_');
              row[key] = new Date(dose.occurrenceDateTime).toLocaleDateString(locale, { dateStyle: 'medium' });
            }
          });
        }

        return row;
      }),
    [sortedImmunizations, sequenceLabels, sequenceMapping, locale, launchImmunizationsForm],
  );

  const { results: paginatedImmunizations, currentPage, goTo } = usePagination(tableRows, 10);

  if (isLoading || !sortedImmunizations) return <DataTableSkeleton role="progressbar" />;
  if (error) return <ErrorState error={error} headerTitle={headerTitle} />;
  if (sortedImmunizations?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
          <Button
            kind="ghost"
            renderIcon={(props: ComponentProps<typeof AddIcon>) => <AddIcon size={16} {...props} />}
            iconDescription="Add immunizations"
            onClick={launchImmunizationsForm}
          >
            {t('add', 'Add')}
          </Button>
        </CardHeader>

        <DataTable rows={paginatedImmunizations} headers={tableHeader} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
          {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getExpandHeaderProps }) => (
            <TableContainer>
              <Table aria-label="immunizations summary" {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => (
                    <React.Fragment key={row.id}>
                      <TableExpandRow {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableExpandRow>
                      {row.isExpanded ? (
                        <TableExpandedRow colSpan={headers.length + 2}>
                          <SequenceTable
                            immunizationsByVaccine={sortedImmunizations[index]}
                            launchPatientImmunizationForm={launchImmunizationsForm}
                          />
                        </TableExpandedRow>
                      ) : (
                        <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>

        <PatientChartPagination
          totalItems={tableRows?.length}
          pageSize={10}
          onPageNumberChange={({ page }) => goTo(page)}
          pageNumber={currentPage}
          currentItems={paginatedImmunizations?.length}
          dashboardLinkUrl={pageUrl}
          dashboardLinkLabel={urlLabel}
        />
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchImmunizationsForm} />;
};

export default ImmunizationsDetailedSummary;
