import React, { type ComponentProps, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, ShoppingCartIcon, useWorkspaces } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit, useOrderBasket } from '@openmrs/esm-patient-common-lib';

const formWorkspaceNames = ['add-lab-order', 'add-drug-order'];

const OrderBasketActionButton: React.FC = () => {
  const { t } = useTranslation();
  const { orders } = useOrderBasket();
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit('order-basket');
  const { workspaces } = useWorkspaces();

  const handleOrderbasketClick = useCallback(() => {
    const isFormWorkspaceActive = workspaces.some((workspace) => formWorkspaceNames.includes(workspace.name));
    if (isFormWorkspaceActive) {
      return; //do nothing
    }

    launchOrderBasket();
  }, [workspaces, launchOrderBasket]);

  return (
    <ActionMenuButton
      getIcon={(props: ComponentProps<typeof ShoppingCartIcon>) => <ShoppingCartIcon {...props} />}
      label={t('orderBasket', 'Order basket')}
      iconDescription={t('medications', 'Medications')}
      handler={handleOrderbasketClick}
      type={'order'}
      tagContent={orders?.length > 0 ? orders?.length : null}
    />
  );
};

export default OrderBasketActionButton;
