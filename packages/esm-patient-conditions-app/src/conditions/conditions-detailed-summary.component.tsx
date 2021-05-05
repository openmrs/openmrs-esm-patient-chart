import React from 'react';
import dayjs from 'dayjs';
import capitalize from 'lodash-es/capitalize';
import ConditionsForm from './conditions-form.component';
import styles from './conditions-detailed-summary.css';
import { EmptyState, SummaryCard, openWorkspaceTab } from '@openmrs/esm-patient-common-lib';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { attach, createErrorHandler } from '@openmrs/esm-framework';
import { Condition, performPatientConditionsSearch } from './conditions.resource';

interface ConditionsDetailedSummaryProps {
  basePath: string;
  patient: fhir.Patient;
}

const ConditionsDetailedSummary: React.FC<ConditionsDetailedSummaryProps> = ({ patient, basePath }) => {
  const { t } = useTranslation();
  const path = `${basePath}/details`;
  const displayText = t('conditions', 'Conditions');
  const headerTitle = t('conditions', 'Conditions');
  const [patientConditions, setPatientConditions] = React.useState<Array<Condition>>(null);

  React.useEffect(() => {
    if (patient) {
      const sub = performPatientConditionsSearch(patient.identifier[0].value).subscribe((conditions) => {
        setPatientConditions(conditions);
      }, createErrorHandler());

      return () => sub.unsubscribe();
    }
  }, [patient]);

  const launchConditionsForm = React.useCallback(
    () => attach('patient-chart-workspace-slot', 'conditions-form-workspace'),
    [],
  );

  return (
    <div className="styles.conditionSummary">
      {patientConditions?.length ? (
        <SummaryCard
          name={t('conditions', 'Conditions')}
          styles={{ width: '100%' }}
          addComponent
          showComponent={() => openWorkspaceTab(ConditionsForm, `${t('conditionsForm', 'Conditions form')}`)}>
          <table className={`omrs-type-body-regular ${styles.conditionTable}`}>
            <thead>
              <tr>
                <td>
                  <Trans i18nKey="condition">Condition</Trans>
                </td>
                <td>
                  <Trans i18nKey="onsetDate">Onset date</Trans>
                </td>
                <td>
                  <Trans i18nKey="status">Status</Trans>
                </td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {patientConditions.map((condition) => {
                return (
                  <React.Fragment key={condition.id}>
                    <tr
                      className={`${
                        condition.clinicalStatus === 'active' ? `${styles.active}` : `${styles.inactive}`
                      }`}>
                      <td className="omrs-medium">{condition.display}</td>
                      <td>
                        <div className={`${styles.alignRight}`}>
                          {condition.onsetDateTime ? dayjs(condition.onsetDateTime).format('MMM-YYYY') : '-'}
                        </div>
                      </td>
                      <td>
                        <div className={`${styles.centerItems} ${styles.alignLeft}`}>
                          <span>{capitalize(condition.clinicalStatus)}</span>
                        </div>
                      </td>
                      <td>
                        {
                          <Link to={`${path}/${condition.id}`}>
                            <svg className="omrs-icon" fill="var(--omrs-color-ink-low-contrast)">
                              <use xlinkHref="#omrs-icon-chevron-right" />
                            </svg>
                          </Link>
                        }
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </SummaryCard>
      ) : (
        <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchConditionsForm} />
      )}
    </div>
  );
};

export default ConditionsDetailedSummary;
