import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from '@carbon/react';
import { ShoppingCart } from '@carbon/react/icons';
import { useLayoutType, useStore } from '@openmrs/esm-framework';
import { launchPatientWorkspace, useWorkspaces } from '@openmrs/esm-patient-common-lib';
import { orderBasketStore } from '../medications/order-basket-store';
import styles from './order-basket-action-button.scss';

const OrderBasketActionButton: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { workspaces } = useWorkspaces();
  const { items } = useStore(orderBasketStore);
  const isActive = workspaces.find(({ name }) => name.includes('order-basket'));

  const launchOrdersWorkspace = useCallback(() => launchPatientWorkspace('order-basket-workspace'), []);

  if (layout === 'tablet')
    return (
      <Button
        kind="ghost"
        className={`${styles.container} ${isActive ? styles.active : ''}`}
        role="button"
        tabIndex={0}
        onClick={launchOrdersWorkspace}
      >
        <div className={styles.elementContainer}>
          <ShoppingCart size={20} /> {items?.length > 0 && <Tag className={styles.countTag}>{items?.length}</Tag>}
        </div>
        <span>{t('orderBasket', 'Order Basket')}</span>
      </Button>
    );

  return (
    <>
      <Button
        className={isActive && styles.active}
        kind="ghost"
        renderIcon={(props) => (
          <div className={styles.elementContainer}>
            <ShoppingCart size={20} {...props} />{' '}
            {items?.length > 0 && <Tag className={styles.countTag}>{items?.length}</Tag>}
          </div>
        )}
        hasIconOnly
        iconDescription={t('orders', 'Orders')}
        tooltipAlignment="start"
        tooltipPosition="left"
        onClick={launchOrdersWorkspace}
      />
    </>
  );
};

export default OrderBasketActionButton;
