import React, { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, ShoppingCartIcon, useWorkspaces } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit, useOrderBasket } from '@openmrs/esm-patient-common-lib';

const OrderBasketActionButton: React.FC = () => {
  const { t } = useTranslation();
  const { orders } = useOrderBasket();
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit('order-basket');
  const { currentWorkspace } = useWorkspaces();

  const isOrderBasketActive = currentWorkspace?.workspace === 'order-basket';

  const handleClick = () => {
    if (!isOrderBasketActive) {
      launchOrderBasket();
    }
  };

  return (
    <ActionMenuButton
      getIcon={(props: ComponentProps<typeof ShoppingCartIcon>) => <ShoppingCartIcon {...props} />}
      label={t('orderBasket', 'Order basket')}
      iconDescription={t('medications', 'Medications')}
      handler={handleClick}
      type="order"
      tagContent={orders?.length > 0 ? orders.length : null}
      disabled={isOrderBasketActive}
    />
  );
};

export default OrderBasketActionButton;
