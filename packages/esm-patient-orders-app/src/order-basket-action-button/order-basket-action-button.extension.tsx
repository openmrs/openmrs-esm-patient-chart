import React, { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, ShoppingCartIcon, useWorkspaceContext } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit, useOrderBasket } from '@openmrs/esm-patient-common-lib';

const OrderBasketActionButton: React.FC = () => {
  const { t } = useTranslation();
  const { orders } = useOrderBasket();
  const { activeWorkspace } = useWorkspaceContext();
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit('order-basket');

  const isWorkspaceOpen = activeWorkspace?.workspace === 'order-basket';

  const handleClick = () => {
    if (!isWorkspaceOpen) {
      launchOrderBasket();
    }
  };

  const getIcon = (props: ComponentProps<typeof ShoppingCartIcon>) => (
    <span
      onClick={(e) => {
        if (isWorkspaceOpen) {
          e.stopPropagation();
        }
      }}
    >
      <ShoppingCartIcon {...props} />
    </span>
  );

  return (
    <ActionMenuButton
      getIcon={getIcon}
      label={t('orderBasket', 'Order basket')}
      iconDescription={t('medications', 'Medications')}
      handler={handleClick}
      type={'order'}
      tagContent={orders?.length > 0 ? orders.length : null}
    />
  );
};

export default OrderBasketActionButton;
