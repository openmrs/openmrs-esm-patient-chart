import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import {
  Button,
  ButtonSet,
  DatePicker,
  DatePickerInput,
  Form,
  Row,
  DatePickerSkeleton,
  DataTableSkeleton,
} from '@carbon/react';
import { WarningFilled } from '@carbon/react/icons';
import { DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import {
  ExtensionSlot,
  useLayoutType,
  showNotification,
  showToast,
  showModal,
  fhirBaseUrl,
} from '@openmrs/esm-framework';

import { markPatientDeceased, usePatientDeceased } from './deceased.resource';
import BaseConceptAnswer from './base-concept-answer.component';

import styles from './deceased-form.scss';

const MarkPatientDeceasedForm: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace }) => {
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();
  const isTablet = useLayoutType() === 'tablet';
  const state = useMemo(() => ({ patientUuid }), [patientUuid]);
  const [selectedCauseOfDeath, setSelectedCauseOfDeath] = useState('');
  const { conceptAnswers, personUuid, deathDate, isDead, isLoading, refetchPatient } = usePatientDeceased(patientUuid);
  const [newDeceasedDate, setNewDeceasedDate] = useState<Date>(
    isDead ? new Date(dayjs(deathDate).year(), dayjs(deathDate).month(), dayjs(deathDate).date() - 1) : new Date(),
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    markPatientDeceased(newDeceasedDate, personUuid, selectedCauseOfDeath, new AbortController())
      .then((response) => {
        if (response.ok) {
          showToast({
            critical: true,
            kind: 'success',
            title: t('confirmDeceased', 'Confirm Deceased'),
            description: t('setDeceasedSuccessfully', 'Patient has been marked dead successfully'),
          });
          refetchPatient();
          mutate(`${fhirBaseUrl}/patient/${patientUuid}`);
          closeWorkspace();
        }
      })
      .catch((error) => {
        showNotification({
          title: t('setDeceasedError', 'Error marking patient deceased'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      });
  };

  const onSaveClick = () => {
    const dispose = showModal('confirm-deceased-dialog', {
      closeDialog: () => dispose(),
      handleSubmit,
    });
  };

  return (
    <Form className={styles.form}>
      <div>
        {isTablet && (
          <Row className={styles.headerGridRow}>
            <ExtensionSlot extensionSlotName="visit-form-header-slot" className={styles.dataGridRow} state={state} />
          </Row>
        )}
        <div className={styles.container}>
          <span className={styles.warningContainer}>
            <WarningFilled size={20} title={'WarningFilled'} aria-label="Warning" className={styles.warningIcon} />
            <span className={styles.warningText}>
              {t(
                'markingPatientDeceasedInfoText',
                'Marking the patient as deceased will end any active visits for this patient',
              )}
            </span>
          </span>
          <section>
            <div className={styles.sectionTitle}>{t('dateOfDeath', 'Date of Death')}</div>
            {!conceptAnswers ? (
              <DatePickerSkeleton />
            ) : (
              <DatePicker
                dateFormat="d/m/Y"
                datePickerType="single"
                id="deceasedDate"
                light={isTablet}
                style={{ width: '100%', paddingBottom: '1rem' }}
                maxDate={new Date().toISOString()}
                onChange={([date]) => setNewDeceasedDate(date)}
                value={newDeceasedDate}
              >
                <DatePickerInput
                  id="deceasedDateInput"
                  style={{ width: '100%' }}
                  disabled={isDead}
                  labelText={t('date', 'Date')}
                  placeholder="dd/mm/yyyy"
                />
              </DatePicker>
            )}
          </section>
          <section>
            {!isDead && <div className={styles.sectionTitle}>{t('causeOfDeath', 'Cause of death')}</div>}
            {!conceptAnswers ? (
              <div>
                <DataTableSkeleton columnCount={1} showToolbar={false} showHeader={false} rowCount={10} />
              </div>
            ) : (
              <BaseConceptAnswer
                onChange={(answer) => {
                  setSelectedCauseOfDeath(answer);
                }}
                conceptAnswers={conceptAnswers}
                isPatientDead={isDead}
              />
            )}
          </section>
        </div>
      </div>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button
          onClick={onSaveClick}
          className={styles.button}
          disabled={selectedCauseOfDeath === '' || isLoading}
          kind="primary"
        >
          {t('setDeceased', 'Set Deceased')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default MarkPatientDeceasedForm;
