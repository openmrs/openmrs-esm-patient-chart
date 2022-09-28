import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
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
import { DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { ExtensionSlot, useLayoutType, showNotification, showToast } from '@openmrs/esm-framework';
import styles from './deceased-form.scss';
import { useTranslation } from 'react-i18next';
import { useSetDeceased, usePatientDeceased } from './deceased.resource';
import BaseConceptAnswer from './base-concept-answer.component';

const MarkPatientDeceasedForm: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const state = useMemo(() => ({ patientUuid }), [patientUuid]);
  const [selectedCauseOfDeath, setSelectedCauseOfDeath] = useState('');
  const { conceptAnswers, personUuid, deathDate, isDead, isLoading } = usePatientDeceased(patientUuid);
  const [newDeceasedDate, setNewDeceasedDate] = useState<Date>(
    isDead ? new Date(dayjs(deathDate).year(), dayjs(deathDate).month(), dayjs(deathDate).date() - 1) : new Date(),
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSetDeceased(newDeceasedDate, isDead, personUuid, selectedCauseOfDeath, new AbortController())
      .then((response) => {
        if (response.ok) {
          closeWorkspace();
          showToast({
            kind: 'success',
            description: isDead
              ? t('setAliveSuccessfully', 'Patient has been marked alive successfully')
              : t('setDeceasedSuccessfully', 'Patient has been marked dead successfully'),
          });
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

  return (
    <Form className={styles.form}>
      <div>
        <div>
          {isTablet && (
            <Row className={styles.headerGridRow}>
              <ExtensionSlot extensionSlotName="visit-form-header-slot" className={styles.dataGridRow} state={state} />
            </Row>
          )}
          <div className={styles.container}>
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
            onClick={handleSubmit}
            className={styles.button}
            disabled={!isDead && (selectedCauseOfDeath === '' || isLoading)}
            kind="primary"
            type="submit"
          >
            {isDead ? t('setAlive', 'Set Alive') : t('setDeceased', 'Set Deceased')}
          </Button>
        </ButtonSet>
      </div>
    </Form>
  );
};

export default MarkPatientDeceasedForm;
