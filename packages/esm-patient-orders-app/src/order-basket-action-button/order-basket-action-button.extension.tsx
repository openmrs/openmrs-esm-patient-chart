import React, { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, ShoppingCartIcon, useWorkspaces, launchWorkspace } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit, useOrderBasket } from '@openmrs/esm-patient-common-lib';

const OrderBasketActionButton: React.FC = () => {
  const { t } = useTranslation();
  const { orders } = useOrderBasket();
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit('order-basket');
  const { workspaces } = useWorkspaces();
  const orderBasketWorkspaces = workspaces.filter((w) => w.name === 'order-basket');
  const isOrderBasketActive = orderBasketWorkspaces.length > 0;
  const existingOrderBasket = orderBasketWorkspaces[0];

  const handleClick = () => {
    if (isOrderBasketActive) {
      // If order basket is already open, do absolutely nothing
      // This prevents the workspace from being reset to its initial state
      //return;
    } else {
      // If not open, launch it normally
      launchOrderBasket();
    }
  };
  return (
    <ActionMenuButton
      getIcon={(props: ComponentProps<typeof ShoppingCartIcon>) => <ShoppingCartIcon {...props} />}
      label={t('orderBasket', 'Order basket')}
      iconDescription={t('medications', 'Medications')}
      handler={handleClick}
      type={'order'}
      tagContent={orders?.length > 0 ? orders?.length : null}
    />
  );
};

export default OrderBasketActionButton;
