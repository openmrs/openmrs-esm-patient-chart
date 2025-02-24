import React, { useMemo } from 'react';
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

  const medicationDetails = useMemo(() => {
    return [
      { label: t('dose', 'Dose'), value: `${medication.dose} ${medication.doseUnits?.display?.toLowerCase()}` },
      { label: t('route', 'Route'), value: medication.route?.display?.toLowerCase() },
      { label: t('frequency', 'Frequency'), value: medication.frequency?.display?.toLowerCase() },
      {
        label: t('duration', 'Duration'),
        value: medication.duration
          ? t('medicationDurationAndUnit', 'for {{duration}} {{durationUnit}}', {
              duration: medication.duration,
              durationUnit: medication.durationUnits?.display.toLowerCase(),
            })
          : t('medicationIndefiniteDuration', 'Indefinite duration').toLowerCase(),
      },
      medication.numRefills !== 0 && { label: t('refills', 'Refills'), value: medication.numRefills },
      medication.dosingInstructions && {
        label: t('instructions', 'Instructions'),
        value: medication.dosingInstructions.toLowerCase(),
      },
      medication.orderReasonNonCoded && { label: t('indication', 'Indication'), value: medication.orderReasonNonCoded },
      medication.quantity && {
        label: t('quantity', 'Quantity'),
        value: `${medication.quantity} ${medication.quantityUnits?.display}`,
      },
      medication.dateStopped && {
        label: t('endDate', 'End date'),
        value: formatDate(new Date(medication.dateStopped)),
      },
    ].filter(Boolean);
  }, [medication, t]);

  return (
    <div className={styles.medicationContainer}>
      <div className={styles.startDateColumn}>
        <span>{formatDate(new Date(medication.dateActivated))}</span>
        <InfoTooltip orderer={medication.orderer?.display ?? '--'} />
      </div>

      <div className={styles.medicationRecord}>
        <p className={styles.bodyLong01}>
          <strong>{capitalize(medication.drug?.display)}</strong>
          {medication.drug?.strength && <>&mdash; {medication.drug.strength.toLowerCase()}</>}
          {medication.drug?.dosageForm?.display && <>&mdash; {medication.drug.dosageForm.display.toLowerCase()}</>}
        </p>

        <MedicationDetails details={medicationDetails} />
      </div>
    </div>
  );
};

const MedicationDetails: React.FC<{ details: { label: string; value: string | number }[] }> = ({ details }) => {
  return (
    <p className={styles.bodyLong01}>
      {details.map(({ label, value }, index) => (
        <span key={label}>
          <span className={styles.label01}>{label.toUpperCase()}</span> — {value}
          {index !== details.length - 1 && ' '}
        </span>
      ))}
    </p>
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
