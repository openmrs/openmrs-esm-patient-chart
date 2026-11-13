import React, { useMemo } from 'react';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import {
  getPatientAndVisitProps,
  type OrderBasketWindowProps,
  type SharedWorkspaceGroupProps,
  useShowPatientBanner,
} from '@openmrs/esm-patient-common-lib';
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
const OrderBasketWorkspace: React.FC<
  Workspace2DefinitionProps<object, OrderBasketWindowProps, SharedWorkspaceGroupProps>
> = ({ windowProps, closeWorkspace, launchChildWorkspace, groupProps }) => {
  const { patient, patientUuid, visitContext } = getPatientAndVisitProps(windowProps, undefined, groupProps);
  const {
    drugOrderWorkspaceName,
    labOrderWorkspaceName,
    generalOrderWorkspaceName,
    onOrderBasketSubmitted,
    visibleOrderPanels,
  } = windowProps ?? {};
  const shouldShowPatientBanner = useShowPatientBanner(groupProps);
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
      showPatientBanner={shouldShowPatientBanner}
      onOrderBasketSubmitted={onOrderBasketSubmitted}
    />
  );
};

export default OrderBasketWorkspace;
