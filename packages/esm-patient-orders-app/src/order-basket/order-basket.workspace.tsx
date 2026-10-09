import React, { useMemo } from 'react';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type OrderBasketWindowProps } from '@openmrs/esm-patient-common-lib';
import OrderBasket from './order-basket.component';
import { createOrderBasketExtensionProps } from './order-basket.utils';

/**
 * This workspace renders the main order basket, which contains the buttons to add a drug order and to add a lab order.
 *
 * It takes the patient and visit from its window props, not from group props, so it can be used
 * both inside and outside the patient chart. Hosts outside the patient chart also supply the names
 * of the order form workspaces they registered; if they supply none, the patient chart's
 * (`add-drug-order`, `add-lab-order`, `orderable-concept-workspace`) are used.
 */
const OrderBasketWorkspace: React.FC<Workspace2DefinitionProps<object, OrderBasketWindowProps, object>> = ({
  windowProps: {
    patientUuid,
    patient,
    visitContext,
    drugOrderWorkspaceName,
    labOrderWorkspaceName,
    generalOrderWorkspaceName,
    onOrderBasketSubmitted,
    visibleOrderPanels,
    showPatientBanner,
  },
  closeWorkspace,
  launchChildWorkspace,
}) => {
  const hasHostWorkspaceNames = Boolean(drugOrderWorkspaceName || labOrderWorkspaceName || generalOrderWorkspaceName);
  const drugOrderWorkspace = hasHostWorkspaceNames ? drugOrderWorkspaceName : 'add-drug-order';
  const labOrderWorkspace = hasHostWorkspaceNames ? labOrderWorkspaceName : 'add-lab-order';
  const generalOrderWorkspace = hasHostWorkspaceNames ? generalOrderWorkspaceName : 'orderable-concept-workspace';

  const orderBasketExtensionProps = useMemo(
    () =>
      createOrderBasketExtensionProps({
        patient,
        drugOrderWorkspaceName: drugOrderWorkspace,
        labOrderWorkspaceName: labOrderWorkspace,
        generalOrderWorkspaceName: generalOrderWorkspace,
        launchChildWorkspace,
        visibleOrderPanels,
      }),
    [launchChildWorkspace, patient, drugOrderWorkspace, labOrderWorkspace, generalOrderWorkspace, visibleOrderPanels],
  );

  return (
    <OrderBasket
      patientUuid={patientUuid}
      patient={patient}
      visitContext={visitContext}
      closeWorkspace={closeWorkspace}
      orderBasketExtensionProps={orderBasketExtensionProps}
      // The patient chart has its own patient header; other apps need the basket to show the patient
      showPatientBanner={showPatientBanner ?? hasHostWorkspaceNames}
      onOrderBasketSubmitted={onOrderBasketSubmitted}
    />
  );
};

export default OrderBasketWorkspace;
