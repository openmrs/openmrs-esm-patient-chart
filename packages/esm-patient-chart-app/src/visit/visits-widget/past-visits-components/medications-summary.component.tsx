import React from 'react';
import capitalize from 'lodash-es/capitalize';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Order, getDosage } from '../visit.resource';
import styles from '../visit-detail-overview.scss';

function formatTime(dateTime) {
  return dayjs(dateTime).format('hh:mm');
}

interface MedicationSummaryProps {
  orders: Array<Order>;
}

const MedicationSummary = ({ orders }) => {
  const { t } = useTranslation();

  return orders.length > 0 ? (
    orders.map(
      (order) =>
        order.dose && (
          <>
            <p className={`${styles.bodyLong01} ${styles.medicationBlock}`}>
              <strong>{capitalize(order.drug?.name)}</strong> &mdash; {order.doseUnits?.display} &mdash;{' '}
              {order.route?.display}
              <br />
              <span className={styles.label01}>{t('dose', 'Dose').toUpperCase()}</span>{' '}
              <strong>{getDosage(order.drug?.strength, order.dose).toLowerCase()}</strong> &mdash;{' '}
              {order.frequency?.display} &mdash;{' '}
              {!order.duration
                ? t('orderIndefiniteDuration', 'Indefinite duration')
                : t('orderDurationAndUnit', 'for {duration} {durationUnit}', {
                    duration: order.duration,
                    durationUnit: order.durationUnits?.display,
                  })}
              <br />
              <span className={styles.label01}>{t('refills', 'Refills').toUpperCase()}</span> {order.numRefills}
            </p>
            <p className={styles.caption01} style={{ color: '#525252' }}>
              {formatTime(order.dateActivated)} &middot; {order.orderer.person?.display}
            </p>
          </>
        ),
    )
  ) : (
    <p className={styles.bodyLong01}>No Medications found.</p>
  );
};

export default MedicationSummary;
