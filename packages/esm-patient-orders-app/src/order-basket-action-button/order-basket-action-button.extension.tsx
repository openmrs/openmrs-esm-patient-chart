import React, { type ComponentProps, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, ShoppingCartIcon, useWorkspaces } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit, useOrderBasket } from '@openmrs/esm-patient-common-lib';

const formWorkspaceNames = [
  'add-drug-order',
  'add-lab-order',
  'orderable-concept-workspace',
  'patient-form-entry-workspace',
  'patient-html-form-entry-workspace',
  'test-result-entry-workspace',
  'patient-order-entry-workspace',
];

const OrderBasketActionButton: React.FC = () => {
  const { t } = useTranslation();
  const { orders } = useOrderBasket();
  const launchOrderBasket = useLaunchWorkspaceRequiringVisit('order-basket');
  const { workspaces } = useWorkspaces();
  //check if any of the form workspace are open
  const isFormWorkspaceActive = useMemo(() => {
    return workspaces.some((workspace) => formWorkspaceNames.includes(workspace.name));
  }, [workspaces]);
  const handleOrderbasketClick = () => {
    if (isFormWorkspaceActive) {
      //Do nothing
      return;
    }
    launchOrderBasket();
  };
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
