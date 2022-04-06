import React, { useCallback } from 'react';
import { launchPatientWorkspace, useWorkspaces } from '@openmrs/esm-patient-common-lib';
import ShoppingCart20 from '@carbon/icons-react/es/shopping--cart/20';
import styles from './order-basket-action-button.scss';
import { Button, Tag } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { orderBasketStore } from '../medications/order-basket-store';
import { useLayoutType, useStore } from '@openmrs/esm-framework';

const OrderBasketActionButton: React.FC = () => {
  const { items } = useStore(orderBasketStore);
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { workspaces } = useWorkspaces();
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
          <ShoppingCart20 /> {items?.length > 0 && <Tag className={styles.countTag}>{items?.length}</Tag>}
        </div>
        <span>{t('orderBasket', 'Order Basket')}</span>
      </Button>
    );

  return (
    <>
      <Button
        className={isActive && styles.active}
        kind="ghost"
        renderIcon={() => (
          <div className={styles.elementContainer}>
            <ShoppingCart20 /> {items?.length > 0 && <Tag className={styles.countTag}>{items?.length}</Tag>}
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
