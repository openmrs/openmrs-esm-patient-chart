import React, { useEffect, useState, useMemo } from 'react';
import get from 'lodash-es/get';
import orderBy from 'lodash-es/orderBy';
import styles from './immunizations-detailed-summary.scss';
import { ErrorState, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { attach, useConfig, usePagination } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { mapFromFHIRImmunizationBundle } from './immunization-mapper';
import { getImmunizationsConceptSet, performPatientImmunizationsSearch } from './immunizations.resource';
import first from 'lodash-es/first';
import isEmpty from 'lodash-es/isEmpty';
import DataTable, {
  Table,
  TableHead,
  TableRow,
  TableExpandHeader,
  TableHeader,
  TableBody,
  TableExpandRow,
  TableCell,
  TableExpandedRow,
} from 'carbon-components-react/es/components/DataTable';
import Add16 from '@carbon/icons-react/es/add/16';
import ImmunizationsForm from './immunizations-form.component';
import Button from 'carbon-components-react/es/components/Button';
import DataTableSkeleton from 'carbon-components-react/es/components/DataTableSkeleton';
import SequenceTable from './immunizations-sequence-table';
import { ExistingDoses, Immunization, Sequence } from '../types';
import { findConfiguredSequences, findExistingDoses, latestFirst } from './utils';
import { immunizationFormSub } from './immunization-utils';

interface ImmunizationsDetailedSummaryProps {
  patient: fhir.Patient;
  patientUuid: string;
}

enum StateTypes {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  ERROR = 'error',
}
const ImmunizationsDetailedSummary: React.FC<ImmunizationsDetailedSummaryProps> = ({ patientUuid, patient }) => {
  const { immunizationsConfig } = useConfig();
  const { t, i18n } = useTranslation();
  const [allImmunizations, setAllImmunizations] = useState<Array<Immunization>>([]);
  const [error, setError] = useState(null);
  const locale = i18n.language.replace('_', '-');
  const [status, setStatus] = useState(StateTypes.PENDING);

  useEffect(() => {
    const abortController = new AbortController();

    if (patient) {
      const searchTerm = immunizationsConfig?.vaccinesConceptSet;
      const configuredImmunizations = getImmunizationsConceptSet(searchTerm, abortController).then(
        findConfiguredSequences(immunizationsConfig?.sequenceDefinitions),
      );

      const existingImmunizationsForPatient = performPatientImmunizationsSearch(
        patient.identifier[0].value,
        patientUuid,
        abortController,
      ).then(mapFromFHIRImmunizationBundle);

      Promise.all([configuredImmunizations, existingImmunizationsForPatient])
        .then(([configuredImmunizations, existingImmunizationsForPatient]) => {
          const consolidatedImmunizations = findExistingDoses(
            configuredImmunizations,
            existingImmunizationsForPatient || [],
          );
          const sortedImmunizationsForPatient = orderBy(
            consolidatedImmunizations,
            [(immunization) => get(immunization, 'existingDoses.length', 0)],
            ['desc'],
          );
          setError(null);
          setAllImmunizations(sortedImmunizationsForPatient);
          setStatus(StateTypes.RESOLVED);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setAllImmunizations([]);
            setError(err);
            setStatus(StateTypes.ERROR);
          }
        });
      return () => abortController.abort();
    }
  }, [patient, patientUuid, immunizationsConfig]);

  const launchImmunizationForm = React.useCallback(
    () => attach('patient-chart-workspace-slot', 'immunization-form-workspace'),
    [],
  );

  const tableHeader = useMemo(
    () => [
      { key: 'vaccine', header: t('vaccine', 'Vaccine') },
      { key: 'recentVaccination', header: t('recentVaccination', 'Recent Vaccination') },
      { key: 'add', header: '' },
    ],
    [t],
  );
  const tableRows = useMemo(
    () =>
      allImmunizations?.map((immunization) => {
        const occurrenceDate =
          isEmpty(immunization.sequences) && !isEmpty(immunization.existingDoses)
            ? `${t('singleDoseOn', 'Single Dose on')} ${new Date(
                first<ExistingDoses>(immunization.existingDoses.sort(latestFirst))?.occurrenceDateTime,
              ).toLocaleDateString(locale, { dateStyle: 'medium' })}`
            : !isEmpty(immunization.existingDoses)
            ? `${first<Sequence>(immunization?.sequences)?.sequenceLabel} on ${new Date(
                first<ExistingDoses>(immunization.existingDoses.sort(latestFirst))?.occurrenceDateTime,
              ).toLocaleDateString(locale, { dateStyle: 'medium' })} `
            : '';
        return {
          id: immunization.vaccineUuid,
          vaccine: immunization.vaccineName,
          recentVaccination: occurrenceDate,
          add: (
            <Button
              kind="ghost"
              renderIcon={Add16}
              iconDescription="Add"
              onClick={() => {
                immunizationFormSub.next({
                  vaccineName: immunization.vaccineName,
                  vaccineUuid: immunization.vaccineUuid,
                  sequences: immunization?.sequences,
                  existingDoses: immunization?.existingDoses,
                  immunizationObsUuid: immunization?.immunizationObsUuid,
                  manufacturer: immunization.manufacturer,
                  lotNumber: immunization.lotNumber,
                  expirationDate: immunization.expirationDate,
                  currentDose: {
                    sequenceLabel: immunization.sequenceLabel,
                    sequenceNumber: immunization.sequenceNumber,
                  },
                  vaccinationDate: immunization.occurrenceDateTime,
                  formChanged: immunization.formChanged,
                });
                launchImmunizationForm();
              }}></Button>
          ),
        };
      }),
    [allImmunizations, t, locale, launchImmunizationForm],
  );

  const { results, currentPage, goTo } = usePagination(tableRows, 10);

  return (
    <>
      {status === StateTypes.PENDING && <DataTableSkeleton />}
      {status === StateTypes.RESOLVED && (
        <div>
          <div className={styles.immunizationsHeader}>
            <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{t('immunizations', 'Immunizations')}</h4>
          </div>

          <DataTable rows={results} headers={tableHeader}>
            {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
              <Table {...getTableProps()} useZebraStyles>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
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
                      {row.isExpanded && (
                        <TableExpandedRow colSpan={headers.length + 1}>
                          {<SequenceTable immunizations={allImmunizations[index]} patientUuid={patientUuid} />}
                        </TableExpandedRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            )}
          </DataTable>
          <PatientChartPagination
            totalItems={tableRows?.length}
            pageSize={10}
            onPageNumberChange={({ page }) => goTo(page)}
            pageNumber={currentPage}
            pageUrl={null}
            currentItems={results?.length}
          />
        </div>
      )}
      {status === StateTypes.ERROR && <ErrorState headerTitle={t('Immunization Widget Error')} error={error} />}
    </>
  );
};

export default ImmunizationsDetailedSummary;
