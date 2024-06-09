import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart } from '@carbon/react/icons';
import { useLaunchWorkspaceRequiringVisit, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { ActionMenuButton } from '@openmrs/esm-framework';

const OrderBasketActionButton: React.FC = () => {
  const { t } = useTranslation();
  const { orders } = useOrderBasket();
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit('order-basket');

  return (
    <ActionMenuButton
      getIcon={(props) => <ShoppingCart {...props} />}
      label={t('orderBasket', 'Order basket')}
      iconDescription={t('medications', 'Medications')}
      handler={launchOrderBasket}
      type={'order'}
      tagContent={orders?.length > 0 ? orders?.length : null}
    />
  );
};

export default OrderBasketActionButton;
