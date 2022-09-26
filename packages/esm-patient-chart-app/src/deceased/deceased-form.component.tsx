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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const state = useMemo(() => ({ patientUuid }), [patientUuid]);
  const [selectedCauseOfDeath, setSelectedCauseOfDeath] = useState('');
  const { conceptAnswers, personUuid, deathDate, isDead, isValidating, isLoading } = usePatientDeceased(patientUuid);
  const [newDeceasedDate, setNewDeceasedDate] = useState<Date>(
    isDead ? new Date(dayjs(deathDate).year(), dayjs(deathDate).month(), dayjs(deathDate).date() - 1) : new Date(),
  );
  //const handleSubmit = useSetDeceased(newDeceasedDate, isDead, personUuid, new AbortController());

  useEffect(() => {
    /*
    setIsLoading(true);
    getPersonfromPatient(patientUuid).then((res) => {
      setPersonUuid(res.uuid);
      setIsDead(res.dead);
      if (res.dead) {
        setDeceasedDate(
          new Date(dayjs(res.deathDate).year(), dayjs(res.deathDate).month(), dayjs(res.deathDate).date() - 1),
        );
      } else {
        setDeceasedDate(new Date());
      }
    });
    getConceptAnswers(new AbortController()).then(({ data }) => {
      const results = data.answers.map((res, i) => ({
        ...res,
        index: i + 1,
      }));
      setConceptAnswers(results);
      setIsLoading(false);
    });
    */
  }, [deathDate, isDead, isValidating]);

  /*
  const handleSubmit = () => {
    useSetDeceased(isDead ? patientPayload : newPatientPayLoad, personUuid, new AbortController())
      .pipe(first())
      .subscribe(
        (response) => {
          if (response.status === 201) {
            closeWorkspace();
            mutate();
            showToast({
              critical: true,
              kind: 'success',
              description: isDead
                ? t('setAliveSuccessfully', 'Patient has been marked alive successfully')
                : t('setDeceasedSuccessfully', 'Patient has been marked dead successfully'),
              title: isDead ? t('setAlive', 'Set Alive') : t('setDead', 'Set Dead'),
            });
          }
        },
        (error) => {
          showNotification({
            title: isDead ? t('setAliveError', 'Error setting Alive') : t('setDeceasedError', 'Error setting Decead'),
            kind: 'error',
            critical: true,
            description: error?.message,
          });
        },
      );
  };

  */

  /** 
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      setIsSubmitting(true);

      useSetDeceased(isDead ? patientPayload : newPatientPayLoad, personUuid, new AbortController())
        .pipe(first())
        .subscribe(
          (response) => {
            if (response.status === 201) {
              closeWorkspace();
              mutate();
              showToast({
                critical: true,
                kind: 'success',
                description: isDead
                  ? t('setAliveSuccessfully', 'Patient has been marked alive successfully')
                  : t('setDeceasedSuccessfully', 'Patient has been marked dead successfully'),
                title: isDead ? t('setAlive', 'Set Alive') : t('setDead', 'Set Dead'),
              });
            }
          },
          (error) => {
            showNotification({
              title: isDead ? t('setAliveError', 'Error setting Alive') : t('setDeceasedError', 'Error setting Decead'),
              kind: 'error',
              critical: true,
              description: error?.message,
            });
          },
        );
    },
    [isDead, patientPayload, personUuid, closeWorkspace, t],
  );
*/
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
            {!conceptAnswers ? (
              <DatePickerSkeleton />
            ) : (
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
            )}
          </div>
        </div>
        <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
          <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button
            //onClick={handleSubmit}
            className={styles.button}
            disabled={!isDead && (isSubmitting || selectedCauseOfDeath === '' || isLoading)}
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
