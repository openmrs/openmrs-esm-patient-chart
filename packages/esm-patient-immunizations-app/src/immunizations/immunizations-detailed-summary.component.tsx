import React, { useEffect, useState } from 'react';
import find from 'lodash-es/find';
import get from 'lodash-es/get';
import map from 'lodash-es/map';
import orderBy from 'lodash-es/orderBy';
import VaccinationRow from './vaccination-row.component';
import styles from './immunizations-detailed-summary.css';
import { SummaryCard } from '@openmrs/esm-patient-common-lib';
import { createErrorHandler, useConfig } from '@openmrs/esm-framework';
import { Trans, useTranslation } from 'react-i18next';
import { mapFromFHIRImmunizationBundle } from './immunization-mapper';
import { getImmunizationsConceptSet, performPatientImmunizationsSearch } from './immunizations.resource';
import {
  ImmunizationData,
  ImmunizationSequenceDefinition,
  ImmunizationWidgetConfigObject,
  OpenmrsConcept,
} from './immunization-domain';

interface ImmunizationsDetailedSummaryProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const ImmunizationsDetailedSummary: React.FC<ImmunizationsDetailedSummaryProps> = ({ patientUuid, patient }) => {
  const config = useConfig();
  const { t } = useTranslation();
  const [allImmunizations, setAllImmunizations] = useState(null);
  const [error, setError] = useState(null);
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
    configuredImmunizations: Array<ImmunizationData>,
    existingImmunizationsForPatient: Array<ImmunizationData>,
  ): Array<ImmunizationData> {
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
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setAllImmunizations([]);
            setError(err);
            createErrorHandler()(err);
          }
        });
      return () => abortController.abort();
    }
  }, [patient, patientUuid, immunizationsConfig]);

  function displayImmunizations() {
    return (
      <SummaryCard name={t('immunizations', 'Immunizations')} className={styles.immunizationDetailedSummaryCard}>
        <table className={`omrs-type-body-regular ${styles.immunizationTable}`}>
          <thead>
            <tr>
              <td>{t('vaccine', 'Vaccine')}</td>
              <td>{t('recentVaccination', 'Recent Vaccination')}</td>
              <td />
            </tr>
          </thead>
          <tbody>
            {allImmunizations &&
              allImmunizations.map((immunizations, i) => {
                return <VaccinationRow key={i} immunization={immunizations} />;
              })}
          </tbody>
        </table>
      </SummaryCard>
    );
  }

  function displayNoImmunizations() {
    return (
      <SummaryCard
        name={t('immunizations', 'Immunizations')}
        styles={{
          width: '100%',
          background: 'var(--omrs-color-bg-low-contrast)',
          border: 'none',
          boxShadow: 'none',
        }}>
        <div className={styles.immunizationMargin}>
          {error != null ? (
            <>
            <p className="omrs-medium">
              <Trans i18nKey="errorCopy">
                Sorry, there was a problem displaying this information. You can try to reload this page, or contact the
                site administrator and quote the error below:
              </Trans>
            </p>
            <p>
              { error.toString() }
            </p>
            </>
          ) : (
            <p className="omrs-medium">
              <Trans i18nKey="noImmunizationsAreConfigured">No immunizations are configured.</Trans>
            </p>
          )}
        </div>
      </SummaryCard>
    );
  }

  return (
    <>
      {allImmunizations && (
        <div className={`${styles.immunizationSummary} immunizationSummary`}>
          {allImmunizations.length > 0 ? displayImmunizations() : displayNoImmunizations()}
        </div>
      )}
    </>
  );
};

export default ImmunizationsDetailedSummary;
