import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from '@carbon/react';
import { ShoppingCart } from '@carbon/react/icons';
import { useLayoutType, usePatient, useStore } from '@openmrs/esm-framework';
import { useWorkspaces } from '@openmrs/esm-patient-common-lib';
import { orderBasketStore } from '../medications/order-basket-store';
import styles from './order-basket-action-button.scss';
import { useLaunchOrderBasket } from '../utils/launchOrderBasket';

const OrderBasketActionButton: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { workspaces } = useWorkspaces();
  const { items } = useStore(orderBasketStore);

  const isActive = workspaces.find(({ name }) => name.includes('order-basket'));
  const { patientUuid } = usePatient();

  const patientItems = items.filter((item) => item.patient === patientUuid);
  const { launchOrderBasket } = useLaunchOrderBasket(patientUuid);

  if (layout === 'tablet')
    return (
      <Button
        kind="ghost"
        className={`${styles.container} ${isActive ? styles.active : ''}`}
        role="button"
        tabIndex={0}
        onClick={launchOrderBasket}
      >
        <div className={styles.elementContainer}>
          <ShoppingCart size={20} />{' '}
          {patientItems?.length > 0 && <Tag className={styles.countTag}>{patientItems?.length}</Tag>}
        </div>
        <span>{t('orderBasket', 'Order Basket')}</span>
      </Button>
    );

  return (
    <Button
      className={isActive && styles.active}
      kind="ghost"
      renderIcon={(props) => (
        <div className={styles.elementContainer}>
          <ShoppingCart size={20} {...props} />{' '}
          {patientItems?.length > 0 && <Tag className={styles.countTag}>{patientItems?.length}</Tag>}
        </div>
      )}
      hasIconOnly
      iconDescription={t('orders', 'Orders')}
      tooltipAlignment="end"
      tooltipPosition="bottom"
      onClick={launchOrderBasket}
    />
  );
};

export default OrderBasketActionButton;
