import React, { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, ShoppingCartIcon } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit, useOrderBasket } from '@openmrs/esm-patient-common-lib';

interface OrderBasketActionButtonProps {
  patientUuid: string;
  patient: fhir.Patient;
}

/**
 * This extension uses the patient chart store and MUST only be mounted within the patient chart
 */
const OrderBasketActionButton: React.FC<OrderBasketActionButtonProps> = ({ patientUuid, patient }) => {
  const { t } = useTranslation();
  const { orders } = useOrderBasket(patient);
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit(patientUuid, 'order-basket');

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
