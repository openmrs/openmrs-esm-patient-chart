import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import AllergyForm from './allergy-form.component';
import styles from './allergies-detailed-summary.css';
import { EmptyState, SummaryCard, openWorkspaceTab } from '@openmrs/esm-patient-common-lib';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createErrorHandler } from '@openmrs/esm-framework';
import { performPatientAllergySearch, Allergy } from './allergy-intolerance.resource';

interface AllergiesDetailedSummaryProps {
  patient: fhir.Patient;
  showAddAllergy: boolean;
}

export default function AllergiesDetailedSummary({ patient, showAddAllergy }: AllergiesDetailedSummaryProps) {
  const [patientAllergies, setPatientAllergies] = useState<Array<Allergy>>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (patient) {
      const sub = performPatientAllergySearch(patient.identifier[0].value).subscribe((allergies) => {
        setPatientAllergies(allergies);
      }, createErrorHandler());

      return () => sub.unsubscribe();
    }
  }, [patient]);

  return (
    <>
      {patientAllergies?.length ? (
        <SummaryCard
          name={t('allergies', 'Allergies')}
          styles={{ width: '100%' }}
          addComponent={showAddAllergy}
          showComponent={() =>
            openWorkspaceTab(AllergyForm, `${t('allergiesForm', 'Allergies Form')}`, {
              allergyUuid: null,
              setAllergies: setPatientAllergies,
              allergies: patientAllergies,
            })
          }>
          <table className={`omrs-type-body-regular ${styles.allergyTable}`}>
            <thead>
              <tr>
                <td>{t('allergen', 'Allergen')}</td>
                <td>
                  <div className={styles.centerItems}>
                    {t('severityandReaction', 'Severity & Reaction')}
                    <svg className="omrs-icon" fill="rgba(0, 0, 0, 0.54)">
                      <use xlinkHref="#omrs-icon-arrow-downward" />
                    </svg>
                  </div>
                </td>
                <td>{t('since', 'Since')}</td>
                <td>{t('updated', 'Updated')}</td>
              </tr>
            </thead>
            <tbody>
              {patientAllergies.map((allergy) => {
                return (
                  <React.Fragment key={allergy?.id}>
                    <tr className={`${allergy?.criticality === 'high' ? `${styles.high}` : `${styles.low}`}`}>
                      <td className="omrs-medium">{allergy?.display}</td>
                      <td>
                        <div
                          className={`${styles.centerItems} ${styles.allergySeverity} ${
                            allergy?.criticality === 'high' ? `omrs-bold` : ``
                          }`}
                          style={{ textTransform: 'uppercase' }}>
                          {allergy?.criticality === 'high' && (
                            <svg
                              className="omrs-icon omrs-margin-right-4"
                              fill="rgba(181, 7, 6, 1)"
                              style={{ height: '1.833rem' }}>
                              <use xlinkHref="#omrs-icon-important-notification" />
                            </svg>
                          )}
                          {allergy?.criticality}
                        </div>
                      </td>
                      <td>{dayjs(allergy?.recordedDate).format('MMM-YYYY') ?? '-'}</td>
                      <td>
                        <div className={`${styles.centerItems} ${styles.alignRight}`}>
                          <span>{dayjs(allergy?.lastUpdated).format('DD-MMM-YYYY')}</span>
                          <Link to={`/details/${allergy?.id}`}>
                            <svg className="omrs-icon" fill="rgba(0, 0, 0, 0.54)">
                              <use xlinkHref="#omrs-icon-chevron-right" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td style={{ textAlign: 'left' }}>{allergy?.reactionManifestations?.join(', ')}</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td colSpan={3}>
                        <span className={styles.allergyComment}>
                          <span style={{ textAlign: 'left' }}>{allergy?.note}</span>
                        </span>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </SummaryCard>
      ) : (
        <EmptyState
          displayText={t('allergyIntolerances', 'allergy intolerances')}
          headerTitle={t('allergies', 'Allergies')}
          launchForm={() =>
            openWorkspaceTab(AllergyForm, `${t('allergiesForm', 'Allergies Form')}`, {
              allergyUuid: null,
              setAllergies: setPatientAllergies,
              allergies: patientAllergies,
            })
          }
        />
      )}
    </>
  );
}
