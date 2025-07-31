import React, { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, ActionMenuButton2, ShoppingCartIcon } from '@openmrs/esm-framework';
import { useStartVisitIfNeeded, useOrderBasket, usePatientChartStore } from '@openmrs/esm-patient-common-lib';

const OrderBasketActionButton: React.FC = () => {
  const { t } = useTranslation();
  const { orders } = useOrderBasket();
  const { patientUuid, patient } = usePatientChartStore();
  const startVisitIfNeeded = useStartVisitIfNeeded();

  return (
    <ActionMenuButton2
      icon={(props: ComponentProps<typeof ShoppingCartIcon>) => <ShoppingCartIcon {...props} />}
      label={t('orderBasket', 'Order basket')}
      tagContent={orders?.length > 0 ? orders?.length : null}
      workspaceToLaunch={{
        workspaceName: 'order-basket',
        groupProps: {
          patientUuid,
          patient,
        },
      }}
      onBeforeWorkspaceLaunch={startVisitIfNeeded}
    />
  );
};

export default OrderBasketActionButton;
