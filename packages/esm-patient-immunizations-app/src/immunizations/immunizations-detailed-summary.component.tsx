import React, { useEffect, useState } from 'react';
import find from 'lodash-es/find';
import get from 'lodash-es/get';
import map from 'lodash-es/map';
import orderBy from 'lodash-es/orderBy';
import styles from './immunizations-detailed-summary.scss';
import { ErrorState, openWorkspaceTab, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import { useConfig, usePagination } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { mapFromFHIRImmunizationBundle } from './immunization-mapper';
import { getImmunizationsConceptSet, performPatientImmunizationsSearch } from './immunizations.resource';
import {
  ImmunizationData,
  ImmunizationSequenceDefinition,
  ImmunizationWidgetConfigObject,
  OpenmrsConcept,
} from './immunization-domain';
import first from 'lodash-es/first';
import isEmpty from 'lodash-es/isEmpty';
import dayjs from 'dayjs';
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
import InnerTable from './immunizations-detailed-summary-inner-table';
import { Immunization } from '../types';

interface ImmunizationsDetailedSummaryProps {
  patient: fhir.Patient;
  patientUuid: string;
}

enum StateTypes {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  ERROR = 'error',
}
interface ActionType {
  type: 'pending' | 'resolved' | 'error';
}

const tableStatusReducer = (state: StateTypes, action: ActionType) => {
  switch (action.type) {
    case 'pending':
      return StateTypes.PENDING;
    case 'resolved':
      return StateTypes.RESOLVED;
    case 'error':
      return StateTypes.ERROR;
    default:
      return StateTypes.PENDING;
  }
};

const ImmunizationsDetailedSummary: React.FC<ImmunizationsDetailedSummaryProps> = ({ patientUuid, patient }) => {
  const config = useConfig();
  const { t } = useTranslation();
  const [allImmunizations, setAllImmunizations] = useState<Array<Immunization>>([]);
  const [error, setError] = useState(null);
  const [status, dispatch] = React.useReducer(tableStatusReducer, StateTypes.PENDING);
  const immunizationsConfig: ImmunizationWidgetConfigObject = config.immunizationsConfig;

  function findConfiguredSequences(configuredSequences: Array<ImmunizationSequenceDefinition>) {
    return (immunizationsConceptSet: OpenmrsConcept): Array<ImmunizationData> => {
      const immunizationConcepts: Array<OpenmrsConcept> = immunizationsConceptSet?.setMembers;
      return map(immunizationConcepts, (immunizationConcept) => {
        const immunizationDataFromConfig: ImmunizationData = {
          vaccineName: immunizationConcept.display,
          vaccineUuid: immunizationConcept.uuid,
          existingDoses: [],
        };

        const matchingSequenceDef = find(
          configuredSequences,
          (sequencesDef) => sequencesDef.vaccineConceptUuid === immunizationConcept.uuid,
        );
        immunizationDataFromConfig.sequences = matchingSequenceDef?.sequences;
        return immunizationDataFromConfig;
      });
    };
  }

  const findExistingDoses = function (
    configuredImmunizations: Array<Immunization>,
    existingImmunizationsForPatient: Array<Immunization>,
  ): Array<Immunization> {
    return map(configuredImmunizations, (immunizationFromConfig) => {
      const matchingExistingImmunization = find(
        existingImmunizationsForPatient,
        (existingImmunization) => existingImmunization.vaccineUuid === immunizationFromConfig.vaccineUuid,
      );
      if (matchingExistingImmunization) {
        immunizationFromConfig.existingDoses = matchingExistingImmunization.existingDoses;
      }
      return immunizationFromConfig;
    });
  };

  allImmunizations.map((im) => im.existingDoses);

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
          dispatch({ type: 'resolved' });
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setAllImmunizations([]);
            setError(err);
            dispatch({ type: 'error' });
          }
        });
      return () => abortController.abort();
    }
  }, [patient, patientUuid, immunizationsConfig]);

  const addPatientVaccine = React.useCallback(
    (vaccineName: string, vaccineUuid: string, sequences: any) => {
      const formHeader = t('immunizationForm', 'Immunization Form');
      openWorkspaceTab(ImmunizationsForm, formHeader, {
        vaccineName: vaccineName,
        vaccineUuid: vaccineUuid,
        sequences: sequences,
      });
    },
    [t],
  );

  const tableHeader = React.useMemo(
    () => [
      { key: 'vaccine', header: t('vaccine', 'Vaccine') },
      { key: 'recentVaccination', header: t('recentVaccination', 'Recent Vaccination') },
      { key: 'add', header: '' },
    ],
    [t],
  );

  const tableRows = React.useMemo(
    () =>
      allImmunizations?.map((immunization) => {
        return {
          id: immunization.vaccineUuid,
          vaccine: immunization.vaccineName,
          recentVaccination:
            isEmpty(immunization.sequences) && !isEmpty(immunization.existingDoses)
              ? `${t('singleDoseOn', 'Single Dose on')} ${dayjs(
                  first<any>(
                    immunization.existingDoses.sort(
                      (a: any, b: any) =>
                        new Date(b.occurrenceDateTime).getTime() - new Date(a.occurrenceDateTime).getTime(),
                    ),
                  )?.occurrenceDateTime,
                ).format('DD-MMM-YYYY')}`
              : !isEmpty(immunization.existingDoses)
              ? `${first<any>(immunization?.sequences)?.sequenceLabel} on ${dayjs(
                  first<any>(
                    immunization.existingDoses.sort(
                      (a: any, b: any) =>
                        new Date(b.occurrenceDateTime).getTime() - new Date(a.occurrenceDateTime).getTime(),
                    ),
                  )?.occurrenceDateTime,
                ).format('DD-MMM-YYYY')} `
              : '',
          add: (
            <Button
              kind="ghost"
              renderIcon={Add16}
              iconDescription="Add"
              onClick={() =>
                addPatientVaccine(immunization.vaccineName, immunization.vaccineUuid, immunization.sequences)
              }></Button>
          ),
        };
      }),
    [addPatientVaccine, allImmunizations, t],
  );

  const { results, currentPage, goTo } = usePagination(tableRows, 10);

  const immunizationTitle = t('Immunizations');

  return (
    <>
      {status === StateTypes.PENDING && <DataTableSkeleton />}
      {status === StateTypes.RESOLVED && (
        <>
          <div className="immunization">
            <div className={styles.immunizationsHeader}>
              <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{immunizationTitle}</h4>
            </div>
            <div className="immunizationTable">
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
                          {rows.length > 0 && row.isExpanded && (
                            <TableExpandedRow colSpan={headers.length + 1}>
                              {<InnerTable immunizations={allImmunizations[index]} patientUuid={patientUuid} />}
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
          </div>
        </>
      )}
      {status === StateTypes.ERROR && <ErrorState headerTitle={t('Immunization Widget Error')} error={error} />}
    </>
  );
};

export default ImmunizationsDetailedSummary;
