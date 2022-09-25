import React, { useCallback, useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { Button, ButtonSet, DatePicker, DatePickerInput, Form, Row, DatePickerSkeleton } from '@carbon/react';
import { DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import {
  ExtensionSlot,
  useLayoutType,
  toOmrsIsoString,
  toDateObjectStrict,
  showNotification,
  showToast,
} from '@openmrs/esm-framework';
import styles from './deceased-form.scss';
import { useTranslation } from 'react-i18next';
import { setDeceased, usePatientDeceased, useSetDeceased } from './deceased.resource';
import BaseConceptAnswer from './base-concept-answer.component';
import { first } from 'rxjs/operators';

const MarkPatientDeceasedForm: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [selectedCauseOfDeath, setSelectedCauseOfDeath] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const state = useMemo(() => ({ patientUuid }), [patientUuid]);
  const [newDeceasedDate, setNewDeceasedDate] = useState<Date>();
  const { conceptAnswers, personUuid, deathDate, isDead, isLoading } = usePatientDeceased(patientUuid);
  const handleSubmit = useSetDeceased(newDeceasedDate, isDead, personUuid, new AbortController());

  useEffect(() => {
    if (!isLoading) {
      setNewDeceasedDate(
        isDead ? new Date(dayjs(deathDate).year(), dayjs(deathDate).month(), dayjs(deathDate).date() - 1) : new Date(),
      );
    }
  }, [deathDate, isDead, isLoading]);

  return (
    <Form className={styles.form}>
      {isLoading ? (
        <DatePickerSkeleton />
      ) : (
        <div>
          <div>
            {isTablet && (
              <Row className={styles.headerGridRow}>
                <ExtensionSlot
                  extensionSlotName="visit-form-header-slot"
                  className={styles.dataGridRow}
                  state={state}
                />
              </Row>
            )}
            <div className={styles.container}>
              <section>
                <div className={styles.sectionTitle}>{t('dateOfDeath', 'Date of Death')}</div>
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
              </section>
              <section>
                {!isDead && <div className={styles.sectionTitle}>{t('causeOfDeath', 'Cause of death')}</div>}
                <BaseConceptAnswer
                  onChange={(answer) => {
                    setSelectedCauseOfDeath(answer);
                  }}
                  conceptAnswers={conceptAnswers}
                  isPatientDead={isDead}
                />
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
              disabled={!isDead && (isSubmitting || selectedCauseOfDeath === '' || isLoading)}
              kind="primary"
              type="submit"
            >
              {isDead ? t('setAlive', 'Set Alive') : t('setDeceased', 'Set Deceased')}
            </Button>
          </ButtonSet>
        </div>
      )}
    </Form>
  );
};

export default MarkPatientDeceasedForm;
