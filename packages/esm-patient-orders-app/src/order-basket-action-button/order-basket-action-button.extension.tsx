import React, { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, ShoppingCartIcon } from '@openmrs/esm-framework';
import {
  useLaunchWorkspaceRequiringVisit,
  useOrderBasket,
  usePatientChartStore,
} from '@openmrs/esm-patient-common-lib';

/**
 * This extension uses the patient chart store and MUST only be mounted within the patient chart
 */
const OrderBasketActionButton: React.FC = () => {
  const { t } = useTranslation();
  const { patient } = usePatientChartStore();
  const { orders } = useOrderBasket(patient);
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit('order-basket');

  return (
    <ActionMenuButton
      getIcon={(props: ComponentProps<typeof ShoppingCartIcon>) => <ShoppingCartIcon {...props} />}
      label={t('orderBasket', 'Order basket')}
      iconDescription={t('medications', 'Medications')}
      handler={launchOrderBasket}
      type={'order'}
      tagContent={orders?.length > 0 ? orders?.length : null}
    />
  );
};

export default OrderBasketActionButton;
