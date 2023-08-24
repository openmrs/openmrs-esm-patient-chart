import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from '@carbon/react';
import { ShoppingCart } from '@carbon/react/icons';
import {
  useLaunchWorkspaceRequiringVisit,
  useOrderBasket,
  SiderailActionButton,
} from '@openmrs/esm-patient-common-lib';
import styles from './order-basket-action-button.scss';

const OrderBasketActionButton: React.FC = () => {
  const { t } = useTranslation();
  const { orders } = useOrderBasket();
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit('order-basket');

  return (
    <SiderailActionButton
      getIcon={(props) => (
        <div className={styles.elementContainer}>
          <ShoppingCart {...props} />
          {orders?.length > 0 && <Tag className={styles.countTag}>{orders?.length}</Tag>}
        </div>
      )}
      label={t('orderBasket', 'Order basket')}
      iconDescription={t('medications', 'Medications')}
      handler={launchOrderBasket}
      workspaceMatcher={/order/i}
    />
  );
};

export default OrderBasketActionButton;
