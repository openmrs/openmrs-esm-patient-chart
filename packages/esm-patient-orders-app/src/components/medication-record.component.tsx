import React from 'react';
import { capitalize } from 'lodash-es';
import { InlineLoading, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { formatDate, UserIcon } from '@openmrs/esm-framework';
import { type Order, useDrugOrderByUuid } from '@openmrs/esm-patient-common-lib';
import styles from './medication-record.scss';

interface MedicationRecordProps {
  medication: Order;
}

export default function MedicationRecord({ medication }: MedicationRecordProps) {
  const { t } = useTranslation();
  const { data: drugOrder, isLoading } = useDrugOrderByUuid(medication.uuid);

  if (isLoading) {
    return <InlineLoading description={t('loading', 'Loading') + '...'} />;
  }

  const order = drugOrder ?? medication;

  return (
    <div className={styles.medicationContainer}>
      <div className={styles.startDateColumn}>
        <span>{formatDate(new Date(order.dateActivated))}</span>
        <InfoTooltip orderer={order.orderer?.display ?? '--'} />
      </div>
      <div className={styles.medicationRecord}>
        <p className={styles.bodyLong01}>
          <strong>{capitalize(order.drug?.display)}</strong>{' '}
          {order.drug?.strength && <>&mdash; {order.drug.strength.toLowerCase()}</>}{' '}
          {order.drug?.dosageForm?.display && <>&mdash; {order.drug.dosageForm.display.toLowerCase()}</>}
        </p>
        <p className={styles.bodyLong01}>
          {order.dose != null && (
            <>
              <span className={styles.label01}>{t('dose', 'Dose').toUpperCase()}</span>{' '}
              <span className={styles.dosage}>
                {order.dose} {order.doseUnits?.display?.toLowerCase()}
              </span>{' '}
            </>
          )}
          {order.route?.display && (
            <>
              {order.dose != null && <>&mdash; </>}
              {order.route.display.toLowerCase()}{' '}
            </>
          )}
          {order.frequency?.display && <>&mdash; {order.frequency.display.toLowerCase()}</>}
          {order.duration != null && (
            <>
              {(order.dose != null || order.route?.display || order.frequency?.display) && <> &mdash; </>}
              {t('medicationDurationAndUnit', 'for {{duration}} {{durationUnit}}', {
                duration: order.duration,
                durationUnit: order.durationUnits?.display?.toLowerCase(),
              })}
            </>
          )}{' '}
          {order.numRefills != null && order.numRefills !== 0 && (
            <span>
              {(order.dose != null || order.route?.display || order.frequency?.display || order.duration != null) && (
                <> &mdash; </>
              )}
              <span className={styles.label01}>{t('refills', 'Refills').toUpperCase()}</span> {order.numRefills}
            </span>
          )}
          {order.dosingInstructions && (
            <span>
              {(order.dose != null ||
                order.route?.display ||
                order.frequency?.display ||
                order.duration != null ||
                (order.numRefills != null && order.numRefills !== 0)) && <> &mdash; </>}
              {order.dosingInstructions.toLowerCase()}
            </span>
          )}
        </p>
        <p className={styles.bodyLong01}>
          {order.orderReasonNonCoded ? (
            <span>
              <span className={styles.label01}>{t('indication', 'Indication').toUpperCase()}</span>{' '}
              {order.orderReasonNonCoded}
            </span>
          ) : null}
          {order.orderReason && (
            <span>
              <span className={styles.label01}>{t('indication', 'Indication').toUpperCase()}</span>{' '}
              {order.orderReason?.display}
            </span>
          )}
          {order.orderReasonNonCoded && order.quantity != null ? <> &mdash;</> : null}
          {order.quantity != null ? (
            <span>
              <span className={styles.label01}> {t('quantity', 'Quantity').toUpperCase()}</span> {order.quantity}{' '}
              {order.quantityUnits?.display}
            </span>
          ) : null}
          {order.dateStopped ? (
            <span>
              <span className={styles.label01}> &mdash; {t('endDate', 'End date').toUpperCase()}</span>{' '}
              {formatDate(new Date(order.dateStopped))}
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

function InfoTooltip({ orderer }: { orderer: string }) {
  const { t } = useTranslation();
  return (
    <Toggletip align="top-start">
      <ToggletipButton label={t('ordererInformation', 'Orderer information')}>
        <UserIcon size={16} />
      </ToggletipButton>
      <ToggletipContent>
        <p>{orderer}</p>
      </ToggletipContent>
    </Toggletip>
  );
}
