import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from '@carbon/react';
import { ShoppingCart } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit, useOrderBasket, useWorkspaces } from '@openmrs/esm-patient-common-lib';
import styles from './order-basket-action-button.scss';

const OrderBasketActionButton: React.FC = () => {
  const layout = useLayoutType();
  const { t } = useTranslation();
  const { workspaces } = useWorkspaces();
  const { orders } = useOrderBasket();
  const isActiveWorkspace = workspaces?.[0]?.name?.match(/order-basket/i);
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit('order-basket');

  if (layout === 'tablet') {
    return (
      <Button
        kind="ghost"
        className={`${styles.container} ${isActiveWorkspace ? styles.active : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => launchOrderBasket()}
      >
        <div className={styles.elementContainer}>
          <ShoppingCart size={16} />
          {orders?.length > 0 && <Tag className={styles.countTag}>{orders?.length}</Tag>}
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
          {orders?.length > 0 && <Tag className={styles.countTag}>{orders?.length}</Tag>}
        </div>
      )}
      hasIconOnly
      iconDescription={t('medications', 'Medications')}
      enterDelayMs={1000}
      tooltipAlignment="center"
      tooltipPosition="left"
      onClick={() => launchOrderBasket()}
    />
  );
};

export default OrderBasketActionButton;
