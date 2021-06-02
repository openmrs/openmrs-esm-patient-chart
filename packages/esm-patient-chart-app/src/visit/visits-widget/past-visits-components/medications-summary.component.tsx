import React from 'react';
import capitalize from 'lodash-es/capitalize';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Order, getDosage } from '../visit.resource';
import styles from '../visit-detail-overview.scss';

function formatTime(dateTime) {
  return dayjs(dateTime).format('hh:mm');
}

const MedicationSummary = ({ medications }) => {
  const { t } = useTranslation();

  return medications.length > 0 ? (
    medications.map(
      (medication) =>
        medication.order.dose && (
          <>
            <p className={`${styles.bodyLong01} ${styles.medicationBlock}`}>
              <strong>{capitalize(medication.order.drug?.name)}</strong> &mdash; {medication.order.doseUnits?.display}{' '}
              &mdash; {medication.order.route?.display}
              <br />
              <span className={styles.label01}>{t('dose', 'Dose').toUpperCase()}</span>{' '}
              <strong>{getDosage(medication.order.drug?.strength, medication.order.dose).toLowerCase()}</strong> &mdash;{' '}
              {medication.order.frequency?.display} &mdash;{' '}
              {!medication.order.duration
                ? t('orderIndefiniteDuration', 'Indefinite duration')
                : t('orderDurationAndUnit', 'for {duration} {durationUnit}', {
                    duration: medication.order.duration,
                    durationUnit: medication.order.durationUnits?.display,
                  })}
              <br />
              <span className={styles.label01}>{t('refills', 'Refills').toUpperCase()}</span>{' '}
              {medication.order.numRefills}
            </p>
            <p className={styles.caption01} style={{ color: '#525252' }}>
              {formatTime(medication.order.dateActivated)} &middot;{' '}
              {medication.provider && medication.provider.provider.person.display} &middot;{' '}
              {medication.provider && medication.provider.encounterRole.display}
            </p>
          </>
        ),
    )
  ) : (
    <p className={styles.bodyLong01}>No Medications found.</p>
  );
};

export default MedicationSummary;
