import React, { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton2, ShoppingCartIcon } from '@openmrs/esm-framework';
import {
  useActionMenuButtonLaunchProps,
  useOrderBasket,
  type PatientChartWorkspaceActionButtonProps,
} from '@openmrs/esm-patient-common-lib';

/**
 * This extension uses the patient chart store and MUST only be mounted within the patient chart
 */
const OrderBasketActionButton: React.FC<PatientChartWorkspaceActionButtonProps> = (props) => {
  const { groupProps } = props;
  const { t } = useTranslation();
  const { orders } = useOrderBasket(groupProps.patient);
  const launchProps = useActionMenuButtonLaunchProps(groupProps, 'order-basket');

  return (
    <ActionMenuButton2
      icon={(props: ComponentProps<typeof ShoppingCartIcon>) => <ShoppingCartIcon {...props} />}
      label={t('orderBasket', 'Order basket')}
      tagContent={orders?.length > 0 ? orders?.length : null}
      {...launchProps}
    />
  );
};

export default OrderBasketActionButton;
