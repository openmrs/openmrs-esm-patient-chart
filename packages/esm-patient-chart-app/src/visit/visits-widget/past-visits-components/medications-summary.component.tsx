import React from 'react';
import classNames from 'classnames';
import capitalize from 'lodash-es/capitalize';
import { useTranslation } from 'react-i18next';
import type { OrderItem } from '../visit.resource';
import { formatDate, formatTime, parseDate } from '@openmrs/esm-framework';
import styles from '../visit-detail-overview.scss';

interface MedicationSummaryProps {
  medications: Array<OrderItem>;
}

const MedicationSummary: React.FC<MedicationSummaryProps> = ({ medications }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.medicationRecord}>
      {medications.length > 0 ? (
        medications.map(
          (medication, i) =>
            medication?.order?.dose &&
            medication?.order?.orderType?.display === 'Drug Order' && (
              <React.Fragment key={i}>
                <div className={styles.medicationContainer}>
                  <p className={styles.medicationRecord}>
                    <strong>{capitalize(medication?.order?.drug?.display)}</strong> &mdash;{' '}
                    {medication?.order?.drug?.strength?.toLowerCase()}
                    &mdash; {medication?.order?.doseUnits?.display?.toLowerCase()} &mdash;{' '}
                    <span>
                      <span className={styles.label01}> {t('dose', 'Dose').toUpperCase()} </span>{' '}
                    </span>
                    <span className={styles.dosage}>
                      {medication?.order?.dose} {medication?.order?.doseUnits?.display?.toLowerCase()}
                    </span>{' '}
                    &mdash; {medication?.order?.route?.display?.toLowerCase()} &mdash;{' '}
                    {medication?.order?.frequency?.display?.toLowerCase()} &mdash;{' '}
                    {!medication?.order?.duration
                      ? t('orderIndefiniteDuration', 'Indefinite duration')
                      : t('orderDurationAndUnit', 'for {{duration}} {{durationUnit}}', {
                          duration: medication?.order?.duration,
                          durationUnit: medication?.order?.durationUnits?.display?.toLowerCase(),
                        })}
                    {medication?.order?.numRefills !== 0 && (
                      <span>
                        <span className={styles.label01}> &mdash; {t('refills', 'Refills').toUpperCase()}</span>{' '}
                        {medication?.order?.numRefills}
                        {''}
                      </span>
                    )}
                    {medication?.order?.dosingInstructions && (
                      <span> &mdash; {medication?.order?.dosingInstructions?.toLocaleLowerCase()}</span>
                    )}
                    {medication?.order?.orderReasonNonCoded ? (
                      <span>
                        &mdash; <span className={styles.label01}>{t('indication', 'Indication').toUpperCase()}</span>{' '}
                        {medication?.order?.orderReasonNonCoded}
                      </span>
                    ) : null}
                    {medication?.order?.quantity ? (
                      <span>
                        <span className={styles.label01}> &mdash; {t('quantity', 'Quantity').toUpperCase()}</span>{' '}
                        {medication?.order?.quantity}
                      </span>
                    ) : null}
                    {medication?.order?.dateStopped ? (
                      <span className={styles.bodyShort01}>
                        <span className={styles.label01}>
                          {medication?.order?.quantity ? ` — ` : ''} {t('endDate', 'End date').toUpperCase()}
                        </span>{' '}
                        {formatDate(new Date(medication?.order?.dateStopped))}
                      </span>
                    ) : null}
                  </p>
                </div>

                <p className={styles.metadata}>
                  {formatTime(parseDate(medication?.order?.dateActivated))} &middot; {medication?.provider?.name},{' '}
                  {medication?.provider?.role}
                </p>
              </React.Fragment>
            ),
        )
      ) : (
        <p className={classNames(styles.bodyLong01, styles.text02)}>
          {t('noMedicationsFound', 'No medications found')}
        </p>
      )}
    </div>
  );
};

export default MedicationSummary;
