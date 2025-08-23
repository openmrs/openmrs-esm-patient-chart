import React from 'react';
import { capitalize } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { Tag, Tooltip } from '@carbon/react';
import { formatDate } from '@openmrs/esm-framework';
import type { OrderItem } from '../visit.resource';
import styles from '../visit-detail-overview.scss';

interface MedicationSummaryProps {
  drugOrderTypeConceptUuid: string;
  medications: Array<OrderItem>;
}

const MedicationSummary: React.FC<MedicationSummaryProps> = ({ drugOrderTypeConceptUuid, medications }) => {
  const { t } = useTranslation();

  const isPastMedication = (order: OrderItem['order']) => {
    if (!order) {
      return false;
    }

    return (
      order.action === 'DISCONTINUE' ||
      (order.dateStopped && new Date(order.dateStopped) <= new Date()) ||
      (order.autoExpireDate && new Date(order.autoExpireDate) <= new Date())
    );
  };

  const drugOrders = medications?.filter((medication) => {
    return medication?.order?.orderType?.uuid === drugOrderTypeConceptUuid;
  });

  if (drugOrders.length === 0) {
    return (
      <EmptyState displayText={t('medications__lower', 'medications')} headerTitle={t('medications', 'Medications')} />
    );
  }

  return (
    <div className={styles.medicationRecord}>
      {drugOrders.map(
        (medication, index) =>
          medication?.order?.dose && (
            <React.Fragment key={index}>
              <div className={styles.medicationContainer}>
                <div>
                  <p className={styles.bodyLong01}>
                    <strong>{capitalize(medication?.order?.drug?.display)}</strong>{' '}
                    {medication?.order?.drug?.strength && (
                      <>&mdash; {medication?.order?.drug?.strength?.toLowerCase()}</>
                    )}{' '}
                    {medication?.order?.doseUnits?.display && (
                      <>&mdash; {medication?.order?.doseUnits?.display?.toLowerCase()}</>
                    )}{' '}
                    {isPastMedication(medication.order) && (
                      <Tooltip align="right" label={<>{formatDate(new Date(medication.order.dateStopped))}</>}>
                        <Tag type="gray" className={styles.tag}>
                          {t('discontinued', 'Discontinued')}
                        </Tag>
                      </Tooltip>
                    )}
                  </p>
                  <p className={styles.bodyLong01}>
                    <span className={styles.label01}> {t('dose', 'Dose').toUpperCase()} </span>{' '}
                    <span className={styles.dosage}>
                      {medication?.order?.dose} {medication?.order?.doseUnits?.display?.toLowerCase()}
                    </span>{' '}
                    {medication.order?.route?.display && (
                      <span>&mdash; {medication?.order?.route?.display?.toLowerCase()} &mdash; </span>
                    )}
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
                  </p>
                  <p className={styles.bodyLong01}>
                    {medication?.order?.orderReasonNonCoded ? (
                      <span>
                        <span className={styles.label01}>{t('indication', 'Indication').toUpperCase()}</span>{' '}
                        {medication?.order?.orderReasonNonCoded}
                      </span>
                    ) : null}
                    {medication?.order?.orderReasonNonCoded && medication?.order?.quantity && <>&mdash;</>}
                    {medication?.order?.quantity ? (
                      <span>
                        <span className={styles.label01}> {t('quantity', 'Quantity').toUpperCase()}</span>{' '}
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
              </div>

              <p className={styles.metadata}>
                <div className={styles.startDateColumn}>
                  <span>{formatDate(new Date(medication.order.dateActivated))}</span> &middot;{' '}
                  <span>{medication.order.orderer?.display ?? '--'}</span>
                </div>
              </p>
            </React.Fragment>
          ),
      )}
    </div>
  );
};

export default MedicationSummary;
