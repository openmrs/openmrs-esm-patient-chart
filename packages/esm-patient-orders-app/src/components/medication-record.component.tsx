import React from 'react';
import capitalize from 'lodash-es/capitalize';
import { Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { formatDate, UserIcon } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type Order } from '@openmrs/esm-patient-common-lib';
import styles from './medication-record.scss';

interface MedicationRecordProps {
  medication: Order;
}

const MedicationRecord: React.FC<MedicationRecordProps> = ({ medication }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.medicationContainer}>
      <div className={styles.startDateColumn}>
        <span>{formatDate(new Date(medication.dateActivated))}</span>
        <InfoTooltip orderer={medication.orderer?.display ?? '--'} />
      </div>
      <div className={styles.medicationRecord}>
        <p className={styles.bodyLong01}>
          <strong>{capitalize(medication.drug?.display)}</strong>{' '}
          {medication.drug?.strength && <>&mdash; {medication.drug?.strength.toLowerCase()}</>}{' '}
          {medication.drug?.dosageForm?.display && <>&mdash; {medication.drug.dosageForm.display.toLowerCase()}</>}
        </p>
        <p className={styles.bodyLong01}>
          <span className={styles.label01}>{t('dose', 'Dose').toUpperCase()}</span>{' '}
          <span className={styles.dosage}>
            {medication.dose} {medication.doseUnits?.display.toLowerCase()}
          </span>{' '}
          {medication.route?.display && <>&mdash; {medication.route?.display.toLowerCase()}</>}{' '}
          {medication.frequency?.display && <>&mdash; {medication.frequency?.display.toLowerCase()}</>} &mdash;{' '}
          {!medication.duration
            ? t('medicationIndefiniteDuration', 'Indefinite duration').toLowerCase()
            : t('medicationDurationAndUnit', 'for {{duration}} {{durationUnit}}', {
                duration: medication.duration,
                durationUnit: medication.durationUnits?.display.toLowerCase(),
              })}{' '}
          {medication.numRefills !== 0 && (
            <span>
              <span className={styles.label01}> &mdash; {t('refills', 'Refills').toUpperCase()}</span>{' '}
              {medication.numRefills}
            </span>
          )}
          {medication.dosingInstructions && <span> &mdash; {medication.dosingInstructions.toLocaleLowerCase()}</span>}
        </p>
        <p className={styles.bodyLong01}>
          {medication.orderReasonNonCoded ? (
            <span>
              <span className={styles.label01}>{t('indication', 'Indication').toUpperCase()}</span>{' '}
              {medication.orderReasonNonCoded}
            </span>
          ) : null}
          {medication.orderReasonNonCoded && medication.quantity && <>&mdash;</>}
          {medication.quantity ? (
            <span>
              <span className={styles.label01}> {t('quantity', 'Quantity').toUpperCase()}</span> {medication.quantity}{' '}
              {medication?.quantityUnits?.display}
            </span>
          ) : null}
          {medication.dateStopped ? (
            <span>
              <span className={styles.label01}> &mdash; {t('endDate', 'End date').toUpperCase()}</span>{' '}
              {formatDate(new Date(medication.dateStopped))}
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
};

function InfoTooltip({ orderer }: { orderer: string }) {
  const { t } = useTranslation();
  return (
    <Toggletip align="top-left">
      <ToggletipButton label={t('ordererInformation', 'Orderer information')}>
        <UserIcon size={16} />
      </ToggletipButton>
      <ToggletipContent>
        <p>{orderer}</p>
      </ToggletipContent>
    </Toggletip>
  );
}

export default MedicationRecord;