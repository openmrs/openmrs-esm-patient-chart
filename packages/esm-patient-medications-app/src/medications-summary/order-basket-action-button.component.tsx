import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from '@carbon/react';
import { ShoppingCart } from '@carbon/react/icons';
import { useLayoutType, usePatient, useStore } from '@openmrs/esm-framework';
import { useWorkspaces } from '@openmrs/esm-patient-common-lib';
import { getOrderItems, orderBasketStore } from '../medications/order-basket-store';
import styles from './order-basket-action-button.scss';
import { useLaunchOrderBasket } from '../utils/launchOrderBasket';

const OrderBasketActionButton: React.FC = () => {
  const layout = useLayoutType();
  const { t } = useTranslation();
  const { workspaces } = useWorkspaces();
  const { items } = useStore(orderBasketStore);
  const { patientUuid } = usePatient();

  const isActiveWorkspace = workspaces?.[0]?.name?.match(/order-basket/i);

  const patientOrderItems = getOrderItems(items, patientUuid);

  const { launchOrderBasket } = useLaunchOrderBasket(patientUuid);

  if (layout === 'tablet') {
    return (
      <Button
        kind="ghost"
        className={`${styles.container} ${isActiveWorkspace ? styles.active : ''}`}
        role="button"
        tabIndex={0}
        onClick={launchOrderBasket}
      >
        <div className={styles.elementContainer}>
          <ShoppingCart size={16} />{' '}
          {patientOrderItems?.length > 0 && <Tag className={styles.countTag}>{patientOrderItems?.length}</Tag>}
        </div>
        <span>{t('orderBasket', 'Order basket')}</span>
      </Button>
    );
  }

  return (
    <Button
      className={isActiveWorkspace && styles.active}
      kind="ghost"
      size="sm"
      renderIcon={(props) => (
        <div className={styles.elementContainer}>
          <ShoppingCart size={20} {...props} />{' '}
          {patientOrderItems?.length > 0 && <Tag className={styles.countTag}>{patientOrderItems?.length}</Tag>}
        </div>
      )}
      hasIconOnly
      iconDescription={t('medications', 'Medications')}
      enterDelayMs={1000}
      tooltipAlignment="center"
      tooltipPosition="left"
      onClick={launchOrderBasket}
    />
  );
};

export default OrderBasketActionButton;
