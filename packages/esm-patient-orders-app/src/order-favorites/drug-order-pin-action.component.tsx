import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { Pin, PinFilled } from '@carbon/react/icons';
import { usePinToggle } from './usePinToggle';
import type { Drug } from '@openmrs/esm-patient-common-lib';
import styles from './drug-order-pin-action.scss';

interface DrugOrderPinActionProps {
  drug: Drug;
}

const DrugOrderPinAction: React.FC<DrugOrderPinActionProps> = ({ drug }) => {
  const { t } = useTranslation();
  const { isPinned, isSaving, isLoading, isEnabled, toggle } = usePinToggle(drug);

  if (!isEnabled) {
    return null;
  }

  if (isLoading || isSaving) {
    return <InlineLoading className={styles.pinAction} />;
  }

  return (
    <div className={styles.pinAction}>
      {isPinned ? <PinFilled size={16} className={styles.pinIcon} /> : <Pin size={16} className={styles.pinIcon} />}
      <button type="button" className={styles.pinLink} onClick={toggle}>
        {isPinned
          ? t('removeFromPinnedOrders', 'Remove from my pinned orders')
          : t('addToPinnedOrders', 'Add to my pinned orders')}
      </button>
    </div>
  );
};

export default DrugOrderPinAction;
