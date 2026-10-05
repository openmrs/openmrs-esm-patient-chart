import React, { useCallback } from 'react';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type DrugOrderBasketItem, type OrderBasketWindowProps } from '@openmrs/esm-patient-common-lib';
import AddDrugOrder from './add-drug-order.component';

export interface AddDrugOrderWorkspaceProps {
  /**
   * Optional. If provided, the form edits this order. Note that this order could either
   * be an already submitted order that the user wants to modify, or a NEW pending order in
   * the order basket. To distinguish the two, check order.action.
   */
  order?: DrugOrderBasketItem;

  /**
   * This field should only be supplied for an existing order saved to the backend
   */
  orderToEditOrdererUuid?: string;
}

/**
 * This workspace displays the drug order form for:
 * 1. adding a new drug order
 * 2. editing a pending (un-submitted) drug order in the order basket
 * 3. editing an existing (submitted) order
 *
 * On form save, it either saves the order in the order basket (case 1 and 2)
 * or directly submits the modified order to the server (case 3).
 *
 * It takes the patient and visit from its window props, not from group props, so it can be used
 * both inside and outside the patient chart.
 */
export default function AddDrugOrderWorkspace({
  workspaceProps: { order, orderToEditOrdererUuid },
  windowProps: { patient, patientUuid, visitContext, allergyFormWorkspaceName },
  closeWorkspace,
  launchChildWorkspace,
}: Workspace2DefinitionProps<AddDrugOrderWorkspaceProps, OrderBasketWindowProps, object>) {
  // When the host registers an allergy form workspace in this window, launch it as a child so the
  // "+" allergy affordance opens the form in the host's workspace group. Without one (as in the
  // patient chart), the allergy list launches the chart's own allergy form itself.
  const launchAllergyForm = useCallback(
    () => launchChildWorkspace(allergyFormWorkspaceName, { formContext: 'creating' }),
    [allergyFormWorkspaceName, launchChildWorkspace],
  );

  return (
    <AddDrugOrder
      initialOrder={order}
      orderToEditOrdererUuid={orderToEditOrdererUuid}
      patient={patient}
      patientUuid={patientUuid}
      visitContext={visitContext}
      closeWorkspace={closeWorkspace}
      launchAllergyForm={allergyFormWorkspaceName ? launchAllergyForm : undefined}
    />
  );
}
